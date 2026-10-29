import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../src/middlewares/rateLimitMiddleware.js';

describe('StaffSync Rate Limiter Middleware Unit Tests', () => {
  it('allows requests within the configured threshold and sets rate limit headers', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 3,
      enforceInTest: true
    });

    const headers = {};
    const res = {
      setHeader: (name, value) => {
        headers[name] = value;
      },
      status: () => res,
      json: () => res
    };

    let nextCalled = false;
    const req = { ip: '192.168.1.10', headers: {} };

    // Request 1: allowed
    limiter(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(headers['X-RateLimit-Limit'], 3);
    assert.strictEqual(headers['X-RateLimit-Remaining'], 2);

    // Request 2: allowed
    nextCalled = false;
    limiter(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(headers['X-RateLimit-Remaining'], 1);
  });

  it('rejects requests with HTTP 429 when max threshold is exceeded', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 2,
      enforceInTest: true,
      message: 'Threshold exceeded'
    });

    const headers = {};
    let statusCode = null;
    let jsonResponse = null;

    const res = {
      setHeader: (name, value) => {
        headers[name] = value;
      },
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        jsonResponse = data;
        return res;
      }
    };

    const req = { ip: '192.168.1.20', headers: {} };

    // 1st request
    limiter(req, res, () => {});
    // 2nd request
    limiter(req, res, () => {});
    // 3rd request: should be blocked
    let nextCalled = false;
    limiter(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 429);
    assert.strictEqual(jsonResponse.success, false);
    assert.strictEqual(jsonResponse.statusCode, 429);
    assert.strictEqual(jsonResponse.error, 'TooManyRequests');
    assert.ok(headers['Retry-After'] >= 1);
  });

  it('maintains independent rate limit counters for different client IP addresses', () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 1,
      enforceInTest: true
    });

    const headers = {};
    const res = {
      setHeader: (name, value) => { headers[name] = value; },
      status: () => res,
      json: () => res
    };

    let nextA = false;
    let nextB = false;

    // IP A hits limit
    limiter({ ip: '10.0.0.1', headers: {} }, res, () => { nextA = true; });
    assert.strictEqual(nextA, true);

    // IP B should still be allowed
    limiter({ ip: '10.0.0.2', headers: {} }, res, () => { nextB = true; });
    assert.strictEqual(nextB, true);
  });
});

