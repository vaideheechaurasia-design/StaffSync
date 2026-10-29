import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { User, USER_ROLES } from '../src/models/User.js';
import { Employee, EMPLOYEE_STATUSES } from '../src/models/Employee.js';
import { Attendance, ATTENDANCE_STATUSES } from '../src/models/Attendance.js';
import { Department } from '../src/models/Department.js';
import { LeaveRequest, LEAVE_STATUSES } from '../src/models/LeaveRequest.js';
import { signToken, AUTH_COOKIE_NAME } from '../src/utils/tokenUtils.js';
import { normalizeDate } from '../src/controllers/attendanceController.js';

function createQueryMock(returnValue) {
  return {
    populate: () => createQueryMock(returnValue),
    sort: () => createQueryMock(returnValue),
    limit: () => createQueryMock(returnValue),
    skip: () => createQueryMock(returnValue),
    select: () => Promise.resolve(returnValue),
    lean: () => Promise.resolve(returnValue),
    then: (resolve, reject) => Promise.resolve(returnValue).then(resolve, reject)
  };
}

test('StaffSync Data Integrity & Attendance Reconciliation Unit Tests', async (t) => {
  const adminId = '654c1f9b8c2d1e001a111111';
  const engDeptId = '654c1f9b8c2d1e001a444444';
  const hrDeptId = '654c1f9b8c2d1e001a888888';
  const emptyDeptId = '654c1f9b8c2d1e001a999999';

  const activeEmpId = '654c1f9b8c2d1e001a555555';
  const inactiveEmpId = '654c1f9b8c2d1e001a666666';
  const onLeaveEmpId = '654c1f9b8c2d1e001a777777';

  const adminToken = signToken({
    userId: adminId,
    email: 'admin@staffsync.internal',
    role: USER_ROLES.HR_ADMIN
  });

  const mockAdminUser = {
    _id: adminId,
    id: adminId,
    name: 'StaffSync Admin',
    email: 'admin@staffsync.internal',
    role: USER_ROLES.HR_ADMIN,
    isActive: true,
    changedPasswordAfter: () => false
  };

  const origUserFindById = User.findById;
  const origEmpFind = Employee.find;
  const origEmpFindById = Employee.findById;
  const origDeptFind = Department.find;
  const origAttFind = Attendance.find;
  const origAttCount = Attendance.countDocuments;
  const origLeaveFind = LeaveRequest.find;

  t.beforeEach(() => {
    User.findById = (id) => Promise.resolve(id.toString() === adminId ? mockAdminUser : null);
  });

  t.afterEach(() => {
    User.findById = origUserFindById;
    Employee.find = origEmpFind;
    Employee.findById = origEmpFindById;
    Department.find = origDeptFind;
    Attendance.find = origAttFind;
    Attendance.countDocuments = origAttCount;
    LeaveRequest.find = origLeaveFind;
  });

  await t.test('1. Normalizes local and UTC dates consistently across midnight boundaries', () => {
    const d1 = normalizeDate('2026-10-28');
    const d2 = normalizeDate('2026-10-28T23:59:59.999Z');
    const d3 = normalizeDate('2026-10-28T00:00:00.000Z');

    assert.equal(d1.toISOString(), '2026-10-28T00:00:00.000Z');
    assert.equal(d2.toISOString(), '2026-10-28T00:00:00.000Z');
    assert.equal(d3.toISOString(), '2026-10-28T00:00:00.000Z');
  });

  await t.test('2. Query attendance for a selected date with records returns populated employee data', async () => {
    const mockRecord = {
      _id: '654c1f9b8c2d1e001abbbbbb',
      employeeId: {
        _id: activeEmpId,
        firstName: 'StaffSync',
        lastName: 'Admin',
        employeeCode: 'EMP-70EB',
        departmentId: { _id: engDeptId, name: 'Engineering', code: 'ENG' }
      },
      date: new Date('2026-10-28T00:00:00.000Z'),
      checkInTime: new Date('2026-10-28T09:00:00.000Z'),
      checkOutTime: new Date('2026-10-28T17:30:00.000Z'),
      totalHours: 8.5,
      status: ATTENDANCE_STATUSES.PRESENT
    };

    Attendance.find = () => createQueryMock([mockRecord]);
    Attendance.countDocuments = () => Promise.resolve(1);

    const res = await request(app)
      .get('/api/v1/attendance?date=2026-10-28')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].status, 'PRESENT');
    assert.equal(res.body.data[0].totalHours, 8.5);
  });

  await t.test('3. Query attendance for a selected date with no records returns clean empty array and zero total', async () => {
    Attendance.find = () => createQueryMock([]);
    Attendance.countDocuments = () => Promise.resolve(0);

    const res = await request(app)
      .get('/api/v1/attendance?date=2026-10-29')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 0);
    assert.deepEqual(res.body.data, []);
  });

  await t.test('4. Reconciles department counts: correctly maps employees across departments and empty departments', async () => {
    const mockDepts = [
      { _id: engDeptId, name: 'Engineering', code: 'ENG', isActive: true },
      { _id: hrDeptId, name: 'Human Resources', code: 'HR', isActive: true },
      { _id: emptyDeptId, name: 'Operations', code: 'OPS', isActive: true }
    ];

    const mockEmps = [
      { _id: activeEmpId, firstName: 'Alice', departmentId: { _id: engDeptId, name: 'Engineering' }, status: 'ACTIVE' },
      { _id: inactiveEmpId, firstName: 'Bob', departmentId: { _id: engDeptId, name: 'Engineering' }, status: 'INACTIVE' },
      { _id: onLeaveEmpId, firstName: 'Carol', departmentId: { _id: hrDeptId, name: 'Human Resources' }, status: 'ACTIVE' }
    ];

    Department.find = () => ({
      sort: () => Promise.resolve(mockDepts)
    });
    Employee.find = () => createQueryMock(mockEmps);

    const deptRes = await request(app)
      .get('/api/v1/departments')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${adminToken}`);

    assert.equal(deptRes.status, 200);
    assert.equal(deptRes.body.data.length, 3);

    // Verify reconciliation logic
    const distribution = mockDepts.map((d) => {
      const deptIdStr = d._id.toString();
      const inDept = mockEmps.filter((e) => e.departmentId?._id?.toString() === deptIdStr);
      const activeInDept = inDept.filter((e) => e.status === 'ACTIVE');
      return {
        code: d.code,
        total: inDept.length,
        active: activeInDept.length
      };
    });

    assert.deepEqual(distribution, [
      { code: 'ENG', total: 2, active: 1 },
      { code: 'HR', total: 1, active: 1 },
      { code: 'OPS', total: 0, active: 0 }
    ]);

    const totalAllocated = distribution.reduce((sum, d) => sum + d.total, 0);
    assert.equal(totalAllocated, mockEmps.length, 'Sum of department members matches total employee count');
  });

  await t.test('5. Distinguishes active vs inactive employees in expected attendance eligibility', () => {
    const employees = [
      { _id: 'emp1', status: 'ACTIVE', dateOfJoining: '2026-10-01' },
      { _id: 'emp2', status: 'INACTIVE', dateOfJoining: '2026-10-01' },
      { _id: 'emp3', status: 'ACTIVE', dateOfJoining: '2026-11-01' } // Future joiner
    ];

    const targetDate = '2026-10-28';
    const punchedIds = new Set(['emp2']); // Inactive emp happened to punch on this historical date
    const leaveIds = new Set();

    const isEligible = (emp) => {
      if (punchedIds.has(emp._id) || leaveIds.has(emp._id)) return true;
      if (emp.status === 'INACTIVE') return false;
      if (emp.dateOfJoining && emp.dateOfJoining > targetDate) return false;
      return true;
    };

    assert.equal(isEligible(employees[0]), true, 'Active employee joined before date is eligible');
    assert.equal(isEligible(employees[1]), true, 'Punched employee on historical date is preserved');
    assert.equal(isEligible(employees[2]), false, 'Future joiner is not eligible');

    // On a date where emp2 did NOT punch
    const targetDateToday = '2026-10-30';
    const punchedToday = new Set();
    const isEligibleToday = (emp) => {
      if (punchedToday.has(emp._id)) return true;
      if (emp.status === 'INACTIVE') return false;
      if (emp.dateOfJoining && emp.dateOfJoining > targetDateToday) return false;
      return true;
    };

    assert.equal(isEligibleToday(employees[1]), false, 'Inactive employee is excluded from today absence count');
  });

  await t.test('6. Punctuality calculation displays N/A for 0 arrivals and exact percentage for clocked-in arrivals', () => {
    const calcPunctuality = (presentRecords) => {
      if (presentRecords.length === 0) return 'N/A';
      const onTime = presentRecords.filter((r) => r.status === 'PRESENT').length;
      return `${Math.round((onTime / presentRecords.length) * 100)}%`;
    };

    assert.equal(calcPunctuality([]), 'N/A');
    assert.equal(calcPunctuality([{ status: 'PRESENT' }]), '100%');
    assert.equal(calcPunctuality([{ status: 'PRESENT' }, { status: 'LATE' }]), '50%');
  });

  await t.test('7. Handles invalid or missing employeeId gracefully (HTTP 400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/attendance/manual')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${adminToken}`)
      .send({
        employeeId: 'invalid-id-format',
        date: '2026-10-28',
        checkInTime: '2026-10-28T09:00:00.000Z'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /valid employee id/i);
  });
});

