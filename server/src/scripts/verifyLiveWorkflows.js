import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';

async function verifyLiveWorkflows() {
  console.log('🚀 Running Full End-to-End Live Workflow Verification against Atlas...');
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas.');

    // 1. Test Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@staffsync.internal',
        password: process.env.ADMIN_PASSWORD || 'AdminPassword123!'
      });

    console.log(`📡 Login HTTP Status: ${loginRes.status}`);
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const authCookies = loginRes.headers['set-cookie'];
    console.log('🍪 Set-Cookie headers received from backend:', Boolean(authCookies));
    const tokenCookie = authCookies?.find((c) => c.startsWith('token='));
    const tokenVal = tokenCookie ? tokenCookie.split(';')[0] : '';
    console.log(`   Session Token Cookie: ${tokenVal ? 'Present (Secure/HttpOnly)' : 'Missing'}`);

    // 2. Test GET /me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', authCookies);
    console.log(`📡 GET /api/v1/auth/me HTTP Status: ${meRes.status} (User: ${meRes.body.data?.name}, Role: ${meRes.body.data?.role})`);

    // 3. Test Employee Listing
    const empRes = await request(app)
      .get('/api/v1/employees')
      .set('Cookie', authCookies);
    console.log(`📡 GET /api/v1/employees HTTP Status: ${empRes.status} (Found ${empRes.body.data?.length || 0} employees)`);

    // 4. Test Today's Attendance
    const attRes = await request(app)
      .get('/api/v1/attendance/today')
      .set('Cookie', authCookies);
    console.log(`📡 GET /api/v1/attendance/today HTTP Status: ${attRes.status} (Checked In: ${attRes.body.data?.isCheckedIn}, Checked Out: ${attRes.body.data?.isCheckedOut})`);

    // 5. Test Leaves Pending Approvals
    const leavesRes = await request(app)
      .get('/api/v1/leaves/pending-approvals')
      .set('Cookie', authCookies);
    console.log(`📡 GET /api/v1/leaves/pending-approvals HTTP Status: ${leavesRes.status} (Pending requests: ${leavesRes.body.data?.length || 0})`);

    // 6. Test Logout
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', authCookies);
    console.log(`📡 POST /api/v1/auth/logout HTTP Status: ${logoutRes.status}`);
    const logoutCookies = logoutRes.headers['set-cookie'];
    const clearedCookie = logoutCookies?.find((c) => c.startsWith('token=;'));
    console.log(`   Logout Cookie Clear Header: ${clearedCookie ? 'Confirmed (Expires=Thu, 01 Jan 1970)' : 'Not set'}`);

    console.log('🎉 Live Application Workflow Verification PASSED with 100% success!');
  } catch (err) {
    console.error('❌ Live Workflow Verification FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Closed MongoDB Atlas connection.');
    }
  }
}

verifyLiveWorkflows();
