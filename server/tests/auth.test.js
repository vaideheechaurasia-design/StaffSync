import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { User, USER_ROLES } from '../src/models/User.js';
import { signToken, AUTH_COOKIE_NAME } from '../src/utils/tokenUtils.js';

/**
 * Helper to wrap mock user in a chainable query mock compatible with .select()
 */
function createQueryMock(returnValue) {
  return {
    select: () => Promise.resolve(returnValue),
    then: (resolve, reject) => Promise.resolve(returnValue).then(resolve, reject)
  };
}

test('StaffSync Authentication Controller & Endpoints (/api/v1/auth)', async (t) => {
  const sampleUserId = '654c1f9b8c2d1e001a111111';
  const sampleEmail = 'jane.doe@staffsync.internal';
  const samplePassword = 'StrongPassword123!';

  const createMockDbUser = (overrides = {}) => ({
    _id: sampleUserId,
    id: sampleUserId,
    name: 'Jane Doe',
    email: sampleEmail,
    role: USER_ROLES.EMPLOYEE,
    isActive: true,
    lastLogin: null,
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
    comparePassword: async (candidate) => candidate === samplePassword,
    changedPasswordAfter: () => false,
    save: async () => true,
    toJSON() {
      const obj = { ...this };
      delete obj.password;
      delete obj.__v;
      return obj;
    },
    ...overrides
  });

  await t.test('POST /api/v1/auth/login: successfully logs in with valid credentials', async () => {
    const mockUser = createMockDbUser();
    t.mock.method(User, 'findOne', () => createQueryMock(mockUser));

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sampleEmail, password: samplePassword });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.statusCode, 200);
    assert.match(res.body.message, /Login successful/i);
    assert.ok(res.body.data.user, 'Must return user data');
    assert.equal(res.body.data.user.email, sampleEmail);
    assert.equal(res.body.data.user.role, USER_ROLES.EMPLOYEE);
    assert.equal(res.body.data.user.password, undefined, 'Password hash must never be returned');
    assert.ok(res.body.data.token, 'Must return JWT token string');

    // Verify Set-Cookie header is attached
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Response must include Set-Cookie header');
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    assert.ok(cookieHeader.includes(`${AUTH_COOKIE_NAME}=`), 'Cookie header must contain token cookie');
    assert.ok(cookieHeader.includes('HttpOnly'), 'Cookie must have HttpOnly flag');
  });

  await t.test('POST /api/v1/auth/login: rejects missing email or missing password (HTTP 400)', async () => {
    // Missing email
    const resNoEmail = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: samplePassword });
    assert.equal(resNoEmail.status, 400);
    assert.equal(resNoEmail.body.success, false);
    assert.equal(resNoEmail.body.error, 'Bad Request');

    // Missing password
    const resNoPass = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sampleEmail });
    assert.equal(resNoPass.status, 400);
    assert.equal(resNoPass.body.success, false);

    // Empty strings
    const resEmpty = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: '   ', password: '   ' });
    assert.equal(resEmpty.status, 400);
    assert.equal(resEmpty.body.success, false);

    // Empty body
    const resEmptyBody = await request(app)
      .post('/api/v1/auth/login')
      .send({});
    assert.equal(resEmptyBody.status, 400);
    assert.equal(resEmptyBody.body.success, false);
  });

  await t.test('POST /api/v1/auth/login: rejects invalid email with generic 401 Unauthorized', async () => {
    // User not found in database
    t.mock.method(User, 'findOne', () => createQueryMock(null));

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@staffsync.internal', password: samplePassword });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Unauthorized');
    assert.match(res.body.message, /Invalid email or password/i);
  });

  await t.test('POST /api/v1/auth/login: rejects incorrect password with generic 401 Unauthorized', async () => {
    const mockUser = createMockDbUser();
    t.mock.method(User, 'findOne', () => createQueryMock(mockUser));

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sampleEmail, password: 'WrongPassword999!' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Unauthorized');
    assert.match(res.body.message, /Invalid email or password/i);
  });

  await t.test('POST /api/v1/auth/login: rejects inactive / deactivated account (HTTP 403 Forbidden)', async () => {
    const inactiveUser = createMockDbUser({ isActive: false });
    t.mock.method(User, 'findOne', () => createQueryMock(inactiveUser));

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sampleEmail, password: samplePassword });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Forbidden');
    assert.match(res.body.message, /deactivated/i);
  });

  await t.test('POST /api/v1/auth/login: ignores client attempts to override role during login', async () => {
    const mockUser = createMockDbUser({ role: USER_ROLES.EMPLOYEE });
    t.mock.method(User, 'findOne', () => createQueryMock(mockUser));

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: sampleEmail,
        password: samplePassword,
        role: USER_ROLES.HR_ADMIN // Client attempt to escalate privileges
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.role, USER_ROLES.EMPLOYEE, 'Role must remain verified database role');
  });

  await t.test('POST /api/v1/auth/logout: clears authentication cookie without requiring an active session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send();

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.statusCode, 200);
    assert.match(res.body.message, /Logged out successfully/i);

    // Verify Set-Cookie header clears the cookie
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Must set cookie clearing header');
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    assert.ok(
      cookieHeader.includes('Expires=Thu, 01 Jan 1970') || cookieHeader.includes('Max-Age=0'),
      'Cookie must be expired immediately'
    );
  });

  await t.test('GET /api/v1/auth/me: rejects unauthenticated request (HTTP 401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Unauthorized');
  });

  await t.test('GET /api/v1/auth/me: returns authenticated user profile via session cookie', async () => {
    const mockUser = createMockDbUser();
    t.mock.method(User, 'findById', () => createQueryMock(mockUser));

    const token = signToken({
      userId: sampleUserId,
      email: sampleEmail,
      role: USER_ROLES.EMPLOYEE
    });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${token}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.statusCode, 200);
    assert.ok(res.body.data.user);
    assert.equal(res.body.data.user.email, sampleEmail);
    assert.equal(res.body.data.user.role, USER_ROLES.EMPLOYEE);
    assert.equal(res.body.data.user.password, undefined, 'Password hash must never be returned');
  });

  await t.test('GET /api/v1/auth/me: returns authenticated user profile via Bearer authorization header', async () => {
    const mockUser = createMockDbUser();
    t.mock.method(User, 'findById', () => createQueryMock(mockUser));

    const token = signToken({
      userId: sampleUserId,
      email: sampleEmail,
      role: USER_ROLES.EMPLOYEE
    });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.user);
    assert.equal(res.body.data.user.email, sampleEmail);
  });

  await t.test('POST /api/v1/auth/login: handles unexpected database error safely (HTTP 500)', async () => {
    t.mock.method(User, 'findOne', () => {
      throw new Error('Database connection failed unexpectedly');
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sampleEmail, password: samplePassword });

    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.statusCode, 500);
  });
});
