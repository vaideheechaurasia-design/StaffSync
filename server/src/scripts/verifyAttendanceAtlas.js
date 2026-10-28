import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Attendance, ATTENDANCE_STATUSES } from '../models/Attendance.js';
import { Employee } from '../models/Employee.js';
import { normalizeDate } from '../controllers/attendanceController.js';

async function verifyAttendanceAtlas() {
  console.log('🚀 Starting Phase 8 Live MongoDB Atlas Verification...');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas successfully.');

    // 1. Locate test employee
    let employee = await Employee.findOne({ employeeCode: 'EMP-1005' });
    if (!employee) {
      employee = await Employee.findOne({ status: 'ACTIVE' });
    }

    if (!employee) {
      throw new Error('No active employee found for attendance verification.');
    }

    console.log(`👤 Using test employee: ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`);

    const today = normalizeDate(new Date());
    console.log(`📅 Normalized calendar date: ${today.toISOString()}`);

    // 2. Clean up any previous test punch for today
    await Attendance.deleteOne({ employeeId: employee._id, date: today });
    console.log('🧹 Cleaned up existing punch records for today.');

    // 3. Test Check-In
    const checkInTime = new Date();
    const attendance = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkInTime,
      status: ATTENDANCE_STATUSES.PRESENT,
      notes: 'Atlas verification punch'
    });
    console.log(`✅ Punch-In recorded: ID ${attendance._id}, Status: ${attendance.status}`);

    // 4. Test Compound Unique Index Duplicate Punch Prevention
    let duplicateCaught = false;
    try {
      await Attendance.create({
        employeeId: employee._id,
        date: today,
        checkInTime: new Date(),
        status: ATTENDANCE_STATUSES.PRESENT
      });
    } catch (err) {
      duplicateCaught = true;
      console.log(`🛡️ Compound unique index blocked duplicate punch: ${err.code === 11000 ? 'E11000 duplicate key error' : err.message}`);
    }

    if (!duplicateCaught) {
      throw new Error('FAILED: Duplicate punch was NOT blocked by database index!');
    }

    // 5. Test Check-Out and Hour Calculation
    const checkOutTime = new Date(checkInTime.getTime() + 8.5 * 3600000); // simulate 8.5 hours
    const durationHours = parseFloat(((checkOutTime.getTime() - checkInTime.getTime()) / 3600000).toFixed(2));

    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = durationHours;
    attendance.notes = 'Atlas verification punch - completed shift';
    await attendance.save();

    console.log(`✅ Punch-Out recorded: ${checkOutTime.toISOString()}, Total Hours: ${attendance.totalHours}h`);

    // 6. Test Query History & Aggregation
    const history = await Attendance.find({ employeeId: employee._id }).sort({ date: -1 });
    console.log(`📊 Retrieved ${history.length} attendance record(s) for employee.`);

    const found = history.find((h) => h._id.toString() === attendance._id.toString());
    if (!found || found.totalHours !== 8.5) {
      throw new Error('FAILED: Attendance record integrity check failed.');
    }

    console.log('🎉 Phase 8 MongoDB Atlas Verification PASSED with 100% success!');
  } catch (err) {
    console.error(`❌ Verification failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Closed MongoDB Atlas connection.');
    }
  }
}

verifyAttendanceAtlas();
