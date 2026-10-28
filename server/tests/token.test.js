import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import {
  signToken,
  verifyToken,
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE
} from '../src/utils/tokenUtils.js';
import { config } from '../src/config/env.js';

test('StaffSync Token Utilities - JWT & Cookie Infrastructure', async (t) => {
  const samplePayload = {
    userId: '654c1f9b8c2d1e001a111111',
    role: 'HR_ADMIN',
    email: 'admin@staffsync.internal'
  };

  await t.test('successfully signs and verifies a valid JWT payload', () => {
    const token = signToken(samplePayload);
    assert.equal(typeof token, 'string');
    assert.ok(token.split('.').length === 3, 'JWT must contain header, payload, and signature');

    const decoded = verifyToken(token);
    assert.equal(decoded.userId, samplePayload.userId);
    assert.equal(decoded.role, samplePayload.role);
    assert.equal(decoded.email, samplePayload.email);
    assert.ok(decoded.iat, 'Token must contain issued-at (iat) claim');
    assert.ok(decoded.exp, 'Token must contain expiration (exp) claim');
  });

  await t.test('rejects expired tokens cleanly', () => {
    // Generate token that expired 10 seconds ago
    const expiredToken = signToken(samplePayload, { expiresIn: '-10s' });

    assert.throws(
      () => {
        verifyToken(expiredToken);
      },
      (err) => {
        assert.equal(err.name, 'TokenExpiredError');
        assert.match(err.message, /jwt expired/i);
        return true;
      }
    );
  });

  await t.test('rejects tokens signed with an invalid signature or different secret', () => {
    const tamperedToken = jwt.sign(samplePayload, 'different_unauthorized_secret_key_12345');

    assert.throws(
      () => {
        verifyToken(tamperedToken);
      },
      (err) => {
        assert.equal(err.name, 'JsonWebTokenError');
        assert.match(err.message, /invalid signature/i);
        return true;
      }
    );
  });

  await t.test('rejects malformed token strings', () => {
    const malformedTokens = [
      'not.a.valid.jwt',
      'invalid-string',
      '',
      null,
      undefined
    ];

    for (const token of malformedTokens) {
      assert.throws(
        () => {
          verifyToken(token);
        },
        /required|jwt malformed|invalid token/i
      );
    }
  });

  await t.test('rejects invalid or empty payload when signing', () => {
    assert.throws(() => signToken(null), /payload must be a non-empty object/i);
    assert.throws(() => signToken('string-payload'), /payload must be a non-empty object/i);
    assert.throws(() => signToken([]), /payload must be a non-empty object/i);
  });

  await t.test('getAuthCookieOptions returns strict security attributes', () => {
    const options = getAuthCookieOptions();

    assert.equal(options.httpOnly, true, 'Cookie must be HttpOnly to block XSS theft');
    assert.equal(options.path, '/', 'Cookie path must be root');
    assert.equal(options.maxAge, AUTH_COOKIE_MAX_AGE, 'Cookie maxAge must match 8-hour session lifetime');
    assert.equal(options.secure, config.isProduction, 'Secure flag must match production state');
    assert.equal(options.sameSite, config.isProduction ? 'none' : 'lax');
  });

  await t.test('setAuthCookie attaches cookie to Express response object with correct options', () => {
    const cookiesSet = [];
    const mockRes = {
      cookie(name, val, opts) {
        cookiesSet.push({ name, val, opts });
      }
    };

    const dummyToken = 'header.payload.signature';
    const returnedOptions = setAuthCookie(mockRes, dummyToken);

    assert.equal(cookiesSet.length, 1);
    assert.equal(cookiesSet[0].name, AUTH_COOKIE_NAME);
    assert.equal(cookiesSet[0].val, dummyToken);
    assert.equal(cookiesSet[0].opts.httpOnly, true);
    assert.equal(cookiesSet[0].opts.maxAge, AUTH_COOKIE_MAX_AGE);
    assert.equal(returnedOptions.httpOnly, true);
  });

  await t.test('clearAuthCookie clears cookie with matching security attributes and immediate expiration', () => {
    const cookiesSet = [];
    const mockRes = {
      cookie(name, val, opts) {
        cookiesSet.push({ name, val, opts });
      }
    };

    const returnedOptions = clearAuthCookie(mockRes);

    assert.equal(cookiesSet.length, 1);
    assert.equal(cookiesSet[0].name, AUTH_COOKIE_NAME);
    assert.equal(cookiesSet[0].val, '', 'Cleared cookie value must be empty string');
    assert.equal(cookiesSet[0].opts.httpOnly, true, 'Cleared cookie must preserve HttpOnly');
    assert.equal(cookiesSet[0].opts.path, '/', 'Cleared cookie path must match root');
    assert.equal(cookiesSet[0].opts.maxAge, 0, 'maxAge must be 0 for immediate invalidation');
    assert.equal(cookiesSet[0].opts.expires.getTime(), 0, 'expires date must be epoch 0');
    assert.equal(returnedOptions.maxAge, 0);
  });

  await t.test('setAuthCookie and clearAuthCookie reject invalid response objects', () => {
    assert.throws(() => setAuthCookie(null, 'token'), /valid Express response object/i);
    assert.throws(() => clearAuthCookie({}), /valid Express response object/i);
  });
});
