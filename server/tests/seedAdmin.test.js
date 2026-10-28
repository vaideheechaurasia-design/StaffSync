import test from 'node:test';
import assert from 'node:assert/strict';
import { User, USER_ROLES } from '../src/models/User.js';
import { seedAdmin } from '../src/scripts/seedAdmin.js';

test('StaffSync Admin Provisioning Seed Script (seedAdmin)', async (t) => {
  await t.test('rejects passwords shorter than 8 characters', async () => {
    await assert.rejects(
      async () => {
        await seedAdmin({
          name: 'Admin Test',
          email: 'admin@staffsync.internal',
          password: 'short',
          skipConnect: true,
          skipDisconnect: true
        });
      },
      (err) => {
        assert.match(err.message, /at least 8 characters/i);
        return true;
      }
    );
  });

  await t.test('rejects invalid email formats', async () => {
    await assert.rejects(
      async () => {
        await seedAdmin({
          name: 'Admin Test',
          email: 'not-an-email',
          password: 'ValidPassword123!',
          skipConnect: true,
          skipDisconnect: true
        });
      },
      (err) => {
        assert.match(err.message, /Invalid email address/i);
        return true;
      }
    );
  });

  await t.test('creates new HR_ADMIN when account does not exist', async () => {
    let createdPayload = null;

    t.mock.method(User, 'findOne', async () => null);
    t.mock.method(User, 'create', async (payload) => {
      createdPayload = payload;
      return {
        _id: '654c1f9b8c2d1e001a999999',
        ...payload
      };
    });

    const result = await seedAdmin({
      name: 'Eleanor Vance',
      email: 'ADMIN@StaffSync.Internal ',
      password: 'SecureAdminPassword123!',
      skipConnect: true,
      skipDisconnect: true
    });

    assert.ok(result);
    assert.equal(createdPayload.role, USER_ROLES.HR_ADMIN);
    assert.equal(createdPayload.email, 'admin@staffsync.internal', 'Email must be normalized to lowercase and trimmed');
    assert.equal(createdPayload.isActive, true);
    assert.equal(createdPayload.name, 'Eleanor Vance');
  });

  await t.test('idempotent: preserves existing account when admin already exists', async () => {
    const existingAdmin = {
      _id: '654c1f9b8c2d1e001a111111',
      name: 'Existing Admin',
      email: 'admin@staffsync.internal',
      role: USER_ROLES.HR_ADMIN,
      isActive: true,
      password: '$2a$10$existingHashThatMustNotBeOverwritten'
    };

    let createCalled = false;
    t.mock.method(User, 'findOne', async () => existingAdmin);
    t.mock.method(User, 'create', async () => {
      createCalled = true;
    });

    const result = await seedAdmin({
      name: 'New Name Attempt',
      email: 'admin@staffsync.internal',
      password: 'DifferentPassword123!',
      skipConnect: true,
      skipDisconnect: true
    });

    assert.equal(result._id, existingAdmin._id);
    assert.equal(result.role, USER_ROLES.HR_ADMIN);
    assert.equal(createCalled, false, 'User.create must not be called when admin already exists');
  });

  await t.test('production: refuses to seed without explicit ADMIN_PASSWORD', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalPass = process.env.ADMIN_PASSWORD;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ADMIN_PASSWORD;

      await assert.rejects(
        async () => {
          await seedAdmin({
            name: 'Prod Admin',
            email: 'admin@staffsync.internal',
            skipConnect: true,
            skipDisconnect: true
          });
        },
        (err) => {
          assert.match(err.message, /ADMIN_PASSWORD environment variable is required in production/i);
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalPass !== undefined) process.env.ADMIN_PASSWORD = originalPass;
    }
  });

  await t.test('production: rejects default development password in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';

      await assert.rejects(
        async () => {
          await seedAdmin({
            name: 'Prod Admin',
            email: 'admin@staffsync.internal',
            password: 'AdminPassword123!',
            skipConnect: true,
            skipDisconnect: true
          });
        },
        (err) => {
          assert.match(err.message, /default development password cannot be used in production/i);
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
