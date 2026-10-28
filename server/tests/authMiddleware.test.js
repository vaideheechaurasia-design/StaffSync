import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { User, USER_ROLES } from '../src/models/User.js';
import { verifyToken, protect, requireRole, restrictTo } from '../src/middlewares/authMiddleware.js';
import { signToken, AUTH_COOKIE_NAME } from '../src/utils/tokenUtils.js';
import { config } from '../src/config/env.js';

/**
 * Helper to generate Express mock request, response, and next callback.
 */
function createMockReqRes({ cookies = {}, headers = {}, user = null, body = {}, query = {} } = {}) {
  const req = {
    cookies,
    headers,
    user,
    body,
    query
  };

  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };

  let nextCalled = false;
  let nextError = null;

  const next = (err) => {
    nextCalled = true;
    if (err) {
      nextError = err;
    }
  };

  return {
    req,
    res,
    next,
    wasNextCalled: () => nextCalled,
    getNextError: () => nextError
  };
}

/**
 * Helper to wrap mock user in a Mongoose query-like chain with .select()
 */
function createQueryMock(returnValue) {
  return {
    select: () => Promise.resolve(returnValue),
    then: (resolve, reject) => Promise.resolve(returnValue).then(resolve, reject)
  };
}

test('StaffSync Authentication & RBAC Middleware', async (t) => {
  const sampleUserId = '654c1f9b8c2d1e001a111111';
  const validPayload = {
    userId: sampleUserId,
    role: USER_ROLES.EMPLOYEE,
    email: 'employee@staffsync.internal'
  };

  await t.test('aliases protect to verifyToken and restrictTo to requireRole', () => {
    assert.equal(protect, verifyToken);
    assert.equal(restrictTo, requireRole);
  });

  await t.test('verifyToken: rejects when token is missing completely (HTTP 401)', async () => {
    const { req, res, next, wasNextCalled } = createMockReqRes();

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false, 'next() should not be called');
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.statusCode, 401);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /Authentication required/i);
  });

  await t.test('verifyToken: rejects unsupported authorization header scheme (HTTP 401)', async () => {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      headers: { authorization: 'Basic dXNlcjpwYXNz' }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.error, 'Unauthorized');
  });

  await t.test('verifyToken: rejects empty Bearer token header (HTTP 401)', async () => {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      headers: { authorization: 'Bearer ' }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.error, 'Unauthorized');
  });

  await t.test('verifyToken: authenticates successfully via valid cookie token', async () => {
    const token = signToken(validPayload);
    const mockUser = {
      _id: sampleUserId,
      id: sampleUserId,
      name: 'Test Employee',
      email: 'employee@staffsync.internal',
      role: USER_ROLES.EMPLOYEE,
      isActive: true,
      changedPasswordAfter: () => false
    };

    t.mock.method(User, 'findById', () => createQueryMock(mockUser));

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: token }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), true, 'next() must be called on successful authentication');
    assert.ok(req.user, 'req.user must be attached');
    assert.equal(req.user.email, 'employee@staffsync.internal');
    assert.equal(req.user.role, USER_ROLES.EMPLOYEE);
  });

  await t.test('verifyToken: authenticates successfully via valid Bearer authorization header', async () => {
    const token = signToken(validPayload);
    const mockUser = {
      _id: sampleUserId,
      id: sampleUserId,
      name: 'Test Employee',
      email: 'employee@staffsync.internal',
      role: USER_ROLES.EMPLOYEE,
      isActive: true,
      changedPasswordAfter: () => false
    };

    t.mock.method(User, 'findById', () => createQueryMock(mockUser));

    const { req, res, next, wasNextCalled } = createMockReqRes({
      headers: { authorization: `Bearer ${token}` }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), true);
    assert.ok(req.user);
    assert.equal(req.user.role, USER_ROLES.EMPLOYEE);
  });

  await t.test('verifyToken: rejects token signed with an invalid signature or secret (HTTP 401)', async () => {
    const foreignSecret = 'this-is-an-alternate-secret-key-32-chars-long';
    const forgedToken = jwt.sign(validPayload, foreignSecret, { expiresIn: '1h' });

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: forgedToken }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /Invalid or malformed/i);
    assert.equal(res.jsonData.stack, undefined, 'Stack trace must not be exposed');
    assert.equal(JSON.stringify(res.jsonData).includes(forgedToken), false, 'Token string must not be exposed');
  });

  await t.test('verifyToken: rejects expired token (HTTP 401)', async () => {
    const expiredToken = signToken(validPayload, { expiresIn: '-10s' });

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: expiredToken }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /expired/i);
  });

  await t.test('verifyToken: rejects completely malformed token string (HTTP 401)', async () => {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: 'not-a-valid-jwt-token-string' }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /Invalid or malformed/i);
  });

  await t.test('verifyToken: rejects when user no longer exists in database (HTTP 401)', async () => {
    const token = signToken(validPayload);

    t.mock.method(User, 'findById', () => createQueryMock(null));

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: token }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /no longer exists/i);
  });

  await t.test('verifyToken: rejects deactivated / inactive user account (HTTP 401)', async () => {
    const token = signToken(validPayload);
    const inactiveUser = {
      _id: sampleUserId,
      id: sampleUserId,
      name: 'Deactivated User',
      email: 'deactivated@staffsync.internal',
      role: USER_ROLES.EMPLOYEE,
      isActive: false
    };

    t.mock.method(User, 'findById', () => createQueryMock(inactiveUser));

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: token }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /deactivated/i);
  });

  await t.test('verifyToken: rejects when password changed after token issuance (HTTP 401)', async () => {
    const token = signToken(validPayload);
    const passwordChangedUser = {
      _id: sampleUserId,
      id: sampleUserId,
      email: 'changed@staffsync.internal',
      role: USER_ROLES.EMPLOYEE,
      isActive: true,
      changedPasswordAfter: (iat) => true // Password was changed after token issued
    };

    t.mock.method(User, 'findById', () => createQueryMock(passwordChangedUser));

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: token }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /changed password/i);
  });

  await t.test('verifyToken: ensures password hash is never exposed on req.user', async () => {
    const token = signToken(validPayload);
    const userWithPassword = {
      _id: sampleUserId,
      id: sampleUserId,
      name: 'Safe User',
      email: 'safe@staffsync.internal',
      role: USER_ROLES.EMPLOYEE,
      isActive: true,
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
      changedPasswordAfter: () => false
    };

    t.mock.method(User, 'findById', () => createQueryMock(userWithPassword));

    const { req, res, next, wasNextCalled } = createMockReqRes({
      cookies: { [AUTH_COOKIE_NAME]: token }
    });

    await verifyToken(req, res, next);

    assert.equal(wasNextCalled(), true);
    assert.equal(req.user.password, undefined, 'req.user.password must be stripped/undefined');
  });

  await t.test('requireRole: allows authorized roles for HR_ADMIN, MANAGER, and EMPLOYEE', () => {
    // HR_ADMIN check
    const hrAdminReq = { user: { role: USER_ROLES.HR_ADMIN } };
    const hrAdminRes = {};
    let hrAdminNextCalled = false;
    requireRole(USER_ROLES.HR_ADMIN)(hrAdminReq, hrAdminRes, () => {
      hrAdminNextCalled = true;
    });
    assert.equal(hrAdminNextCalled, true, 'HR_ADMIN must pass HR_ADMIN role check');

    // MANAGER check
    const managerReq = { user: { role: USER_ROLES.MANAGER } };
    const managerRes = {};
    let managerNextCalled = false;
    requireRole(USER_ROLES.MANAGER)(managerReq, managerRes, () => {
      managerNextCalled = true;
    });
    assert.equal(managerNextCalled, true, 'MANAGER must pass MANAGER role check');

    // EMPLOYEE check
    const employeeReq = { user: { role: USER_ROLES.EMPLOYEE } };
    const employeeRes = {};
    let employeeNextCalled = false;
    requireRole(USER_ROLES.EMPLOYEE)(employeeReq, employeeRes, () => {
      employeeNextCalled = true;
    });
    assert.equal(employeeNextCalled, true, 'EMPLOYEE must pass EMPLOYEE role check');

    // Multi-role check with array and rest params
    let multiNextCalled = false;
    requireRole(USER_ROLES.HR_ADMIN, USER_ROLES.MANAGER)(managerReq, managerRes, () => {
      multiNextCalled = true;
    });
    assert.equal(multiNextCalled, true, 'MANAGER must pass multi-role check allowing HR_ADMIN and MANAGER');
  });

  await t.test('requireRole: rejects unauthorized role with HTTP 403 Forbidden', () => {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      user: { role: USER_ROLES.EMPLOYEE },
      // Attempt client spoofing via body and query parameters
      body: { role: USER_ROLES.HR_ADMIN },
      query: { role: USER_ROLES.HR_ADMIN }
    });

    const guard = requireRole(USER_ROLES.HR_ADMIN);
    guard(req, res, next);

    assert.equal(wasNextCalled(), false, 'next() should not be called for unauthorized role');
    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.statusCode, 403);
    assert.equal(res.jsonData.error, 'Forbidden');
    assert.match(res.jsonData.message, /Access denied|permission/i);
    assert.equal(res.jsonData.stack, undefined);
  });

  await t.test('requireRole: rejects unauthenticated request with HTTP 401 Unauthorized', () => {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      user: null
    });

    const guard = requireRole(USER_ROLES.HR_ADMIN);
    guard(req, res, next);

    assert.equal(wasNextCalled(), false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.statusCode, 401);
    assert.equal(res.jsonData.error, 'Unauthorized');
    assert.match(res.jsonData.message, /Authentication required/i);
  });
});
