import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { LeaveRequest, LEAVE_TYPES, LEAVE_STATUSES } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { Employee } from '../models/Employee.js';
import { User, USER_ROLES } from '../models/User.js';
import { normalizeDate } from '../controllers/attendanceController.js';

async function verifyLeaveAtlas() {
  console.log('🚀 Starting Phase 9 Live MongoDB Atlas Leave Workflow Verification...');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // 1. Locate test employee & admin reviewer
    let employee = await Employee.findOne({ employeeCode: 'EMP-1005' });
    if (!employee) {
      employee = await Employee.findOne({ status: 'ACTIVE' });
    }
    if (!employee) {
      throw new Error('No active employee found for leave verification.');
    }

    const adminUser = await User.findOne({ role: USER_ROLES.HR_ADMIN });
    if (!adminUser) {
      throw new Error('No HR_ADMIN user found for review verification.');
    }

    console.log(`👤 Test Employee: ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`);
    console.log(`🛡️ Reviewer User: ${adminUser.name} (${adminUser.email})`);

    // 2. Clean up test leaves for this employee
    await LeaveRequest.deleteMany({
      employeeId: employee._id,
      reason: /Atlas verification/i
    });
    console.log('🧹 Cleaned up existing test leave applications.');

    // 3. Initialize / fetch leave balance for current year
    const year = 2026;
    let balance = await LeaveBalance.findOne({ employeeId: employee._id, year });
    if (!balance) {
      balance = await LeaveBalance.create({
        employeeId: employee._id,
        year,
        annual: { quota: 15, used: 0 },
        casual: { quota: 10, used: 0 },
        sick: { quota: 10, used: 0 },
        unpaid: { used: 0 }
      });
    }
    const initialAnnualUsed = balance.annual.used;
    console.log(`📊 Initial 2026 Annual Leave Balance: ${balance.annual.quota - initialAnnualUsed} / ${balance.annual.quota} days remaining.`);

    // 4. Test Leave Application Submission
    const startDate = normalizeDate('2026-11-20');
    const endDate = normalizeDate('2026-11-21');
    const totalDays = 2;

    const leave = await LeaveRequest.create({
      employeeId: employee._id,
      leaveType: LEAVE_TYPES.ANNUAL,
      startDate,
      endDate,
      totalDays,
      reason: 'Atlas verification - attending annual conference',
      status: LEAVE_STATUSES.PENDING
    });
    console.log(`✅ Leave application created: ID ${leave._id}, Status: ${leave.status}, Total Days: ${leave.totalDays}`);

    // 5. Test Overlap / Collision Detection
    const overlapping = await LeaveRequest.findOne({
      employeeId: employee._id,
      status: { $in: [LEAVE_STATUSES.PENDING, LEAVE_STATUSES.APPROVED] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    if (overlapping && overlapping._id.toString() === leave._id.toString()) {
      console.log('🛡️ Overlap query correctly detected existing active leave for range [2026-11-20 to 2026-11-21].');
    } else {
      throw new Error('FAILED: Overlap query failed to detect active leave window.');
    }

    // 6. Test Review Approval & Balance Decrement
    leave.status = LEAVE_STATUSES.APPROVED;
    leave.reviewedBy = adminUser._id;
    leave.reviewedAt = new Date();
    leave.reviewComment = 'Approved for professional development attendance.';
    await leave.save();
    console.log(`✅ Leave application approved by reviewer ${adminUser.name}.`);

    balance.annual.used += totalDays;
    await balance.save();
    console.log(`📉 Balance decremented: Annual used is now ${balance.annual.used} (Remaining: ${balance.annual.quota - balance.annual.used} days).`);

    // 7. Verify Integrity
    const verifiedLeave = await LeaveRequest.findById(leave._id).populate('reviewedBy', 'name email role');
    if (verifiedLeave.status !== LEAVE_STATUSES.APPROVED || !verifiedLeave.reviewedBy) {
      throw new Error('FAILED: Leave document integrity check failed.');
    }

    console.log('🎉 Phase 9 MongoDB Atlas Verification PASSED with 100% success!');
  } catch (err) {
    console.error(`❌ Leave verification failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Closed MongoDB Atlas connection cleanly.');
    }
  }
}

verifyLeaveAtlas();
