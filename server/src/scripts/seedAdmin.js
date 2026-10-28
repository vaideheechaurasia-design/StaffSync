import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User, USER_ROLES } from '../models/User.js';

/**
 * Parses CLI arguments like --email=... or --password=...
 */
function parseCliArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, ...values] = arg.slice(2).split('=');
      args[key] = values.join('=');
    }
  }
  return args;
}

/**
 * Seeds the initial HR_ADMIN administrator account idempotently.
 *
 * @param {Object} [options={}]
 * @param {string} [options.name] - Administrator full name
 * @param {string} [options.email] - Administrator email address
 * @param {string} [options.password] - Plaintext password (min 8 chars)
 * @param {boolean} [options.skipDisconnect=false] - Whether to keep MongoDB connected (useful in tests)
 * @param {boolean} [options.skipConnect=false] - Whether to skip database connection (useful in unit tests)
 * @returns {Promise<Object>} The created or existing administrator user document
 */
export async function seedAdmin(options = {}) {
  const cliArgs = parseCliArgs();
  const isProduction = process.env.NODE_ENV === 'production';

  const name = (options.name || cliArgs.name || process.env.ADMIN_NAME || 'StaffSync Administrator').trim();
  const email = (options.email || cliArgs.email || process.env.ADMIN_EMAIL || 'admin@staffsync.internal').trim();

  // Determine password safely:
  // In production, an explicit ADMIN_PASSWORD environment variable (or explicit option/CLI argument) is mandatory.
  // The publicly documented development fallback ('AdminPassword123!') is strictly prohibited in production.
  const rawPassword = options.password || cliArgs.password || process.env.ADMIN_PASSWORD;

  if (isProduction) {
    if (!rawPassword || typeof rawPassword !== 'string' || rawPassword.trim().length === 0) {
      throw new Error('ADMIN_PASSWORD environment variable is required in production to provision an administrator.');
    }
    if (rawPassword === 'AdminPassword123!') {
      throw new Error('The default development password cannot be used in production. Please set a secure, unique ADMIN_PASSWORD.');
    }
  }

  const password = rawPassword || 'AdminPassword123!';

  // 1. Validate inputs strictly
  if (!name || name.length === 0) {
    throw new Error('Admin name is required and cannot be empty.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error(`Invalid email address: "${email}". Please provide a valid email.`);
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Administrator password must be at least 8 characters long.');
  }

  const normalizedEmail = email.toLowerCase();

  try {
    // 2. Ensure database is connected unless explicitly skipped (e.g. in unit tests)
    if (!options.skipConnect && mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // 3. Check for existing administrator with this email
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log(`ℹ️  Administrator account already exists for "${normalizedEmail}".`);
      console.log(`   Role: ${existingAdmin.role} | Active: ${existingAdmin.isActive}`);
      console.log('   Preserved existing credentials without overwriting.');
      return existingAdmin;
    }

    // 4. Create new HR_ADMIN account
    const newAdmin = await User.create({
      name,
      email: normalizedEmail,
      password, // Pre-save hook automatically hashes this password with bcrypt
      role: USER_ROLES.HR_ADMIN,
      isActive: true
    });

    console.log(`✅ Successfully provisioned initial HR_ADMIN account.`);
    console.log(`   Name:  ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role:  ${newAdmin.role}`);
    console.log('   Password hash is cryptographically secured with bcrypt.');

    return newAdmin;
  } catch (err) {
    console.error(`❌ Admin provisioning failed: ${err.message}`);
    throw err;
  } finally {
    if (!options.skipDisconnect && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed cleanly.');
    }
  }
}

// Run as standalone CLI script when executed directly
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && fileURLToPath(`file://${process.argv[1]}`) === currentFilePath) {
  seedAdmin()
    .then(() => {
      console.log('✨ Seed script completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed error:', err.message);
      process.exit(1);
    });
}
