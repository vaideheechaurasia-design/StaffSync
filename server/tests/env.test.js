import test from 'node:test';
import assert from 'node:assert/strict';
import { config, maskMongoUri, validateEnv, validateJwtSecret } from '../src/config/env.js';

test('StaffSync Configuration - Environment Module', async (t) => {
  await t.test('config object exposes required fields with valid defaults', () => {
    assert.equal(typeof config.env, 'string');
    assert.equal(typeof config.port, 'number');
    assert.ok(config.port > 0, 'Port must be a positive number');
    assert.equal(typeof config.clientUrl, 'string');
    assert.equal(typeof config.mongoUri, 'string');
    assert.equal(config.mongoUri, config.mongodbUri, 'mongoUri and mongodbUri should be identical');
    assert.equal(typeof config.jwtSecret, 'string');
    assert.ok(config.jwtSecret.length >= 32, 'jwtSecret must be at least 32 characters');
    assert.equal(config.jwtExpiresIn, '8h');
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

  await t.test('validateJwtSecret validates secret strength correctly', () => {
    // Valid 32-char secret
    const strongSecret = 'a'.repeat(32);
    assert.equal(validateJwtSecret(strongSecret, true), true);

    // Short secret in production fails
    assert.throws(
      () => validateJwtSecret('short-secret-123', true),
      /at least 32 characters long in production/i
    );

    // Empty secret fails in all environments
    assert.throws(
      () => validateJwtSecret('', false),
      /JWT_SECRET is required and cannot be empty/i
    );
  });
});
