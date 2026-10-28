import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('StaffSync API Server - Health Check Endpoints', async (t) => {
  await t.test('GET /api/v1/health returns 200 and structured health status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(['healthy', 'degraded'].includes(res.body.status));
    assert.equal(typeof res.body.data.uptimeSeconds, 'number');
    assert.equal(typeof res.body.data.database, 'object');
    assert.ok(
      ['connected', 'disconnected', 'connecting', 'disconnecting'].includes(res.body.data.database.status),
      `Database status must be valid state, got: ${res.body.data.database.status}`
    );
    assert.equal(typeof res.body.data.database.message, 'string');
    assert.ok(res.body.data.services.database.includes('Phase 5'));
  });

  await t.test('GET /api/health returns 200 (backward compatibility route)', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(typeof res.body.data.database, 'object');
  });

  await t.test('GET /non-existent-route returns 404 JSON response', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint-xyz');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.statusCode, 404);
  });
});
