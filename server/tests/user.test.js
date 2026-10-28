import test from 'node:test';
import assert from 'node:assert/strict';
import User, { USER_ROLES, VALID_ROLES } from '../src/models/User.js';

test('StaffSync User Model - Schema Validation & Security Unit Tests', async (t) => {
  await t.test('creates valid user instance and passes validation', async () => {
    const user = new User({
      name: 'Jane Doe',
      email: 'jane.doe@staffsync.internal',
      password: 'StrongPassword123!'
    });

    await assert.doesNotReject(async () => {
      await user.validate();
    }, 'Valid user should not produce validation errors');

    assert.equal(user.name, 'Jane Doe');
    assert.equal(user.email, 'jane.doe@staffsync.internal');
    assert.equal(user.role, USER_ROLES.EMPLOYEE, 'Default role must be EMPLOYEE');
    assert.equal(user.isActive, true, 'Default isActive must be true');
  });

  await t.test('normalizes email address by trimming and converting to lowercase', () => {
    const user = new User({
      name: 'John Smith',
      email: '  JOHN.SMITH@StaffSync.Internal  ',
      password: 'StrongPassword123!'
    });

    assert.equal(user.email, 'john.smith@staffsync.internal');
  });

  await t.test('rejects invalid email formats', async () => {
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@missingusername.com',
      'missingdomain@.com',
      'missingat.com'
    ];

    for (const email of invalidEmails) {
      const user = new User({
        name: 'Invalid Email User',
        email,
        password: 'Password123!'
      });

      await assert.rejects(
        async () => {
          await user.validate();
        },
        (err) => {
          assert.ok(err.errors.email, `Expected email validation error for "${email}"`);
          assert.match(err.errors.email.message, /valid email address/i);
          return true;
        }
      );
    }
  });

  await t.test('requires mandatory fields: name, email, and password', async () => {
    const user = new User({});

    await assert.rejects(
      async () => {
        await user.validate();
      },
      (err) => {
        assert.ok(err.errors.name, 'Name is required');
        assert.ok(err.errors.email, 'Email is required');
        assert.ok(err.errors.password, 'Password is required');
        return true;
      }
    );
  });

  await t.test('rejects passwords shorter than 8 characters', async () => {
    const shortPasswords = ['123', 'short', 'seven_7'];

    for (const password of shortPasswords) {
      const user = new User({
        name: 'Short Password User',
        email: 'shortpass@example.com',
        password
      });

      await assert.rejects(
        async () => {
          await user.validate();
        },
        (err) => {
          assert.ok(err.errors.password);
          assert.match(err.errors.password.message, /at least 8 characters/i);
          return true;
        }
      );
    }
  });

  await t.test('accepts approved system roles and rejects invalid roles', async () => {
    for (const role of VALID_ROLES) {
      const user = new User({
        name: 'Role User',
        email: `${role.toLowerCase()}@example.com`,
        password: 'Password123!',
        role
      });
      await assert.doesNotReject(async () => {
        await user.validate();
      }, `Role "${role}" must be valid`);
      assert.equal(user.role, role);
    }

    const invalidUser = new User({
      name: 'Hacker User',
      email: 'hacker@example.com',
      password: 'Password123!',
      role: 'SUPER_ADMIN'
    });

    await assert.rejects(
      async () => {
        await invalidUser.validate();
      },
      (err) => {
        assert.ok(err.errors.role);
        assert.match(err.errors.role.message, /not a valid system role/i);
        return true;
      }
    );
  });

  await t.test('pre-save hook hashes password with bcrypt before saving', async () => {
    const rawPassword = 'MySecretPassword2026!';
    const user = new User({
      name: 'Hashing Test User',
      email: 'hash@example.com',
      password: rawPassword
    });

    assert.equal(user.password, rawPassword, 'Password is raw before pre-save hook');
    await user.schema.s.hooks.execPre('save', user, []);

    assert.notEqual(user.password, rawPassword, 'Password must be hashed after pre-save hook');
    assert.match(user.password, /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, 'Password must match bcrypt hash pattern');
  });

  await t.test('comparePassword returns true for correct password and false for incorrect password', async () => {
    const rawPassword = 'VerificationPassword99!';
    const user = new User({
      name: 'Auth Test User',
      email: 'auth.test@example.com',
      password: rawPassword
    });

    await user.schema.s.hooks.execPre('save', user, []);

    const isMatch = await user.comparePassword(rawPassword);
    assert.equal(isMatch, true, 'comparePassword must return true for matching password');

    const isWrongMatch = await user.comparePassword('WrongGuessPassword123!');
    assert.equal(isWrongMatch, false, 'comparePassword must return false for incorrect password');

    const emptyMatch = await user.comparePassword('');
    assert.equal(emptyMatch, false, 'comparePassword must return false for empty candidate password');
  });

  await t.test('password is not rehashed when unrelated fields are modified', async () => {
    const user = new User({
      name: 'Original Name',
      email: 'rehash.test@example.com',
      password: 'InitialPassword123!'
    });

    await user.schema.s.hooks.execPre('save', user, []);
    const initialHash = user.password;

    // Simulate unmodified password state after retrieval
    user.name = 'Updated Name';
    user.$locals = user.$locals || {};
    user.markModified('name');
    user.unmarkModified('password');

    await user.schema.s.hooks.execPre('save', user, []);
    assert.equal(user.password, initialHash, 'Hash must remain identical when password is not modified');
  });

  await t.test('serialization (toJSON and toObject) strips password hash for security', async () => {
    const user = new User({
      name: 'Safe Serialization User',
      email: 'safe@example.com',
      password: 'SecretPassword123!'
    });

    await user.schema.s.hooks.execPre('save', user, []);

    const json = user.toJSON();
    assert.equal('password' in json, false, 'toJSON must not include password property');
    assert.equal('__v' in json, false, 'toJSON must strip __v internal version key');

    const stringified = JSON.stringify(user);
    assert.ok(!stringified.includes('SecretPassword123!'), 'JSON stringify must not leak raw password');
    assert.ok(!stringified.includes(user.password), 'JSON stringify must not leak hashed password');

    const obj = user.toObject();
    assert.equal('password' in obj, false, 'toObject must not include password property');
  });

  await t.test('schema projection security sets select: false on password field', () => {
    const passwordOptions = User.schema.path('password').options;
    assert.equal(passwordOptions.select, false, 'Password field must specify select: false');
  });

  await t.test('changedPasswordAfter properly calculates timestamp validity', () => {
    const user = new User({
      name: 'Timestamp User',
      email: 'time@example.com',
      password: 'Password123!'
    });

    // When passwordChangedAt is not set, returns false
    assert.equal(user.changedPasswordAfter(1730000000), false);

    // Set passwordChangedAt to specific date
    user.passwordChangedAt = new Date('2026-10-29T12:00:00Z');
    const changeTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);

    // Token issued BEFORE password change (1 hour before) -> should return true (invalid token)
    assert.equal(user.changedPasswordAfter(changeTimestamp - 3600), true);

    // Token issued AFTER password change (1 hour after) -> should return false (valid token)
    assert.equal(user.changedPasswordAfter(changeTimestamp + 3600), false);
  });
});
