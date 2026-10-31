import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

test('StaffSync API Server - Health & Readiness Check Endpoints', async (t) => {
  await t.test('GET /api/v1/health returns HTTP 200 (liveness probe)', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.statusCode, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.message, 'StaffSync service is operational.');
    assert.ok(typeof res.body.timestamp === 'string');

    // Security validation: verify no sensitive infrastructure or hostnames are leaked
    assert.equal(res.body.host, undefined);
    assert.equal(res.body.name, undefined);
    assert.equal(res.body.database, undefined);
    assert.equal(res.body.environment, undefined);
    assert.equal(res.body.data, undefined);
  });

  await t.test('GET /api/health returns HTTP 200 (backward compatibility liveness route)', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'healthy');
  });

  await t.test('GET /api/v1/health/ready returns HTTP 200 when MongoDB is connected', async () => {
    const originalReadyState = mongoose.connection.readyState;
    // Simulate active database connection
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    try {
      const res = await request(app).get('/api/v1/health/ready');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.statusCode, 200);
      assert.equal(res.body.status, 'ready');
      assert.equal(res.body.message, 'StaffSync database is connected and ready.');
      assert.ok(typeof res.body.timestamp === 'string');

      // Security check
      assert.equal(res.body.host, undefined);
      assert.equal(res.body.name, undefined);
      assert.equal(res.body.database, undefined);
      assert.equal(res.body.data, undefined);
    } finally {
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    }
  });

  await t.test('GET /api/v1/health/ready returns HTTP 503 when MongoDB is disconnected', async () => {
    const originalReadyState = mongoose.connection.readyState;
    // Simulate disconnected database connection
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    try {
      const res = await request(app).get('/api/v1/health/ready');
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.statusCode, 503);
      assert.equal(res.body.status, 'not_ready');
      assert.equal(res.body.message, 'StaffSync database is disconnected.');
      assert.ok(typeof res.body.timestamp === 'string');

      // Security check
      assert.equal(res.body.host, undefined);
      assert.equal(res.body.name, undefined);
      assert.equal(res.body.database, undefined);
      assert.equal(res.body.data, undefined);
    } finally {
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    }
  });

  await t.test('GET /api/health/ready returns HTTP 200/503 (backward compatibility readiness route)', async () => {
    const res = await request(app).get('/api/health/ready');
    assert.ok([200, 503].includes(res.status));
    assert.ok(['ready', 'not_ready'].includes(res.body.status));
  });

  await t.test('GET /non-existent-route returns 404 JSON response', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint-xyz');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.statusCode, 404);
  });
});
