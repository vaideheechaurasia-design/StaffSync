import test from 'node:test';
import assert from 'node:assert/strict';
import { getConnectionStatus, connectDB } from '../src/config/db.js';

test('StaffSync Database - Connection Module', async (t) => {
  await t.test('getConnectionStatus returns structured status object', () => {
    const status = getConnectionStatus();
    assert.equal(typeof status, 'object');
    assert.ok(
      ['disconnected', 'connected', 'connecting', 'disconnecting'].includes(status.status),
      `Status must be a known readyState, got: ${status.status}`
    );
    assert.equal(typeof status.message, 'string');
    assert.ok(status.message.length > 0);
  });

  await t.test('connectDB throws descriptive error when URI is omitted', async () => {
    await assert.rejects(
      async () => {
        await connectDB('');
      },
      {
        name: 'Error',
        message: /MongoDB connection string is missing/
      }
    );
  });

  await t.test('connectDB fails cleanly with invalid URI without hanging or exposing secrets', async () => {
    const fakeUri = 'mongodb://fakeuser:fakepassword@127.0.0.1:27018/testdb';

    await assert.rejects(
      async () => {
        // Run with 0 retries and 500ms timeout for fast unit test execution
        await connectDB(fakeUri, { serverSelectionTimeoutMS: 500 }, 0, 100);
      },
      (err) => {
        assert.ok(err instanceof Error);
        // Ensure credentials were not leaked into the thrown error message
        assert.ok(!err.message.includes('fakepassword'));
        return true;
      }
    );
  });
});

