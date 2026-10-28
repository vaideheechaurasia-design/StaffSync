import test from 'node:test';
import assert from 'node:assert/strict';
import { config, maskMongoUri, validateEnv } from '../src/config/env.js';

test('StaffSync Configuration - Environment Module', async (t) => {
  await t.test('config object exposes required fields with valid defaults', () => {
    assert.equal(typeof config.env, 'string');
    assert.equal(typeof config.port, 'number');
    assert.ok(config.port > 0, 'Port must be a positive number');
    assert.equal(typeof config.clientUrl, 'string');
    assert.equal(typeof config.mongoUri, 'string');
    assert.equal(config.mongoUri, config.mongodbUri, 'mongoUri and mongodbUri should be identical');
    assert.equal(typeof config.isProduction, 'boolean');
    assert.equal(typeof config.isDevelopment, 'boolean');
  });

  await t.test('maskMongoUri safely masks credentials', () => {
    const rawUri = 'mongodb+srv://adminUser:superSecretPassword123@cluster0.mongodb.net/staffsync?retryWrites=true';
    const masked = maskMongoUri(rawUri);

    assert.ok(!masked.includes('adminUser'), 'Masked URI must not contain username');
    assert.ok(!masked.includes('superSecretPassword123'), 'Masked URI must not contain password');
    assert.ok(masked.includes('cluster0.mongodb.net'), 'Masked URI should preserve host');
    assert.equal(masked, 'mongodb+srv://*****:*****@cluster0.mongodb.net/staffsync?retryWrites=true');
  });

  await t.test('maskMongoUri handles null or empty inputs gracefully', () => {
    assert.equal(maskMongoUri(null), 'not_configured');
    assert.equal(maskMongoUri(''), 'not_configured');
    assert.equal(maskMongoUri(undefined), 'not_configured');
  });

  await t.test('validateEnv passes under standard development environment', () => {
    assert.doesNotThrow(() => {
      validateEnv();
    });
  });
});

