import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Department } from '../src/models/Department.js';
import { User } from '../src/models/User.js';
import { Employee } from '../src/models/Employee.js';
import { LeaveBalance } from '../src/models/LeaveBalance.js';
import { LeaveRequest } from '../src/models/LeaveRequest.js';
import { Attendance } from '../src/models/Attendance.js';
import { seedDemoData, DEMO_DEPARTMENTS, DEMO_EMPLOYEES, DEMO_LEAVE_TEMPLATES } from '../src/scripts/seedDemoData.js';

test('StaffSync Demo Data Seeder Unit Tests', async (t) => {
  const origDeptFindOne = Department.findOne;
  const origDeptFind = Department.find;
  const origUserFindOne = User.findOne;
  const origEmpFindOne = Employee.findOne;
  const origEmpFind = Employee.find;
  const origBalFindOne = LeaveBalance.findOne;
  const origLeaveFindOne = LeaveRequest.findOne;
  const origAttFindOne = Attendance.findOne;

  t.afterEach(() => {
    Department.findOne = origDeptFindOne;
    Department.find = origDeptFind;
    User.findOne = origUserFindOne;
    Employee.findOne = origEmpFindOne;
    Employee.find = origEmpFind;
    LeaveBalance.findOne = origBalFindOne;
    LeaveRequest.findOne = origLeaveFindOne;
    Attendance.findOne = origAttFindOne;
  });

  await t.test('1. Validates canonical demo data templates integrity', () => {
    assert.equal(DEMO_DEPARTMENTS.length, 6, 'Contains 6 structured departments');
    assert.equal(DEMO_EMPLOYEES.length >= 30, true, 'Contains 30+ synthetic employee definitions');
    assert.equal(DEMO_LEAVE_TEMPLATES.length >= 8, true, 'Contains diverse leave templates');

    // Verify all employee department codes match defined departments
    const deptCodes = new Set(DEMO_DEPARTMENTS.map((d) => d.code));
    for (const emp of DEMO_EMPLOYEES) {
      assert.equal(deptCodes.has(emp.departmentCode), true, `Employee ${emp.employeeCode} has valid department code`);
    }

    // Verify unique employee codes and emails
    const codes = new Set();
    const emails = new Set();
    for (const emp of DEMO_EMPLOYEES) {
      assert.equal(codes.has(emp.employeeCode), false, `Unique employee code ${emp.employeeCode}`);
      assert.equal(emails.has(emp.email), false, `Unique email ${emp.email}`);
      codes.add(emp.employeeCode);
      emails.add(emp.email);
    }
  });

  await t.test('2. Dry-run mode reports planned operations without writing to MongoDB', async () => {
    const mockDept = { _id: new mongoose.Types.ObjectId(), code: 'ENG', name: 'Engineering' };
    Department.findOne = () => Promise.resolve(mockDept);
    Department.find = () => Promise.resolve([mockDept]);
    User.findOne = () => Promise.resolve(null);
    Employee.findOne = () => Promise.resolve(null);
    Employee.find = () => Promise.resolve([]);
    LeaveBalance.findOne = () => Promise.resolve(null);
    LeaveRequest.findOne = () => Promise.resolve(null);
    Attendance.findOne = () => Promise.resolve(null);

    const stats = await seedDemoData({ dryRun: true, skipConnect: true });

    assert.equal(stats.departments.existing >= 1, true);
    assert.equal(stats.employees.created >= 30, true);
    assert.equal(stats.attendances.created > 0, true);
    assert.equal(stats.leaveRequests.created > 0, true);
  });

  await t.test('3. Idempotent: Reuses existing records when all demo records already exist', async () => {
    const mockDept = { _id: new mongoose.Types.ObjectId(), code: 'ENG', name: 'Engineering' };
    const mockUser = { _id: new mongoose.Types.ObjectId(), email: 'jane@staffsync.internal' };
    const mockEmp = { _id: new mongoose.Types.ObjectId(), employeeCode: 'EMP-1003', status: 'ACTIVE' };
    const mockBalance = { _id: new mongoose.Types.ObjectId(), year: 2026 };
    const mockLeave = { _id: new mongoose.Types.ObjectId(), status: 'PENDING' };
    const mockAttendance = { _id: new mongoose.Types.ObjectId(), status: 'PRESENT' };

    Department.findOne = () => Promise.resolve(mockDept);
    Department.find = () => Promise.resolve([mockDept]);
    User.findOne = () => Promise.resolve(mockUser);
    Employee.findOne = () => Promise.resolve(mockEmp);
    Employee.find = () => Promise.resolve([mockEmp]);
    LeaveBalance.findOne = () => Promise.resolve(mockBalance);
    LeaveRequest.findOne = () => Promise.resolve(mockLeave);
    Attendance.findOne = () => Promise.resolve(mockAttendance);

    const stats = await seedDemoData({ dryRun: true, skipConnect: true });

    assert.equal(stats.departments.created, 0, 'No departments created when all exist');
    assert.equal(stats.users.created, 0, 'No users created when all exist');
    assert.equal(stats.employees.created, 0, 'No employees created when all exist');
    assert.equal(stats.leaveBalances.created, 0, 'No balances created when all exist');
    assert.equal(stats.leaveRequests.created, 0, 'No leave requests created when all exist');
    assert.equal(stats.attendances.created, 0, 'No attendance records created when all exist');
  });
});

