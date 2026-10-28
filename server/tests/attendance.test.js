import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { User, USER_ROLES } from '../src/models/User.js';
import { Employee, EMPLOYEE_STATUSES } from '../src/models/Employee.js';
import { Attendance, ATTENDANCE_STATUSES } from '../src/models/Attendance.js';
import { Department } from '../src/models/Department.js';
import { signToken, AUTH_COOKIE_NAME } from '../src/utils/tokenUtils.js';

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

test('StaffSync Attendance Management API (/api/v1/attendance)', async (t) => {
  const adminId = '654c1f9b8c2d1e001a111111';
  const managerUserId = '654c1f9b8c2d1e001a222222';
  const employeeUserId = '654c1f9b8c2d1e001a333333';
  const deptId = '654c1f9b8c2d1e001a444444';
  const empRecordId = '654c1f9b8c2d1e001a555555';
  const managerEmpRecordId = '654c1f9b8c2d1e001a666666';
  const attendanceRecordId = '654c1f9b8c2d1e001a777777';

  const adminToken = signToken({
    userId: adminId,
    email: 'admin@staffsync.internal',
    role: USER_ROLES.HR_ADMIN
  });

  const managerToken = signToken({
    userId: managerUserId,
    email: 'manager@staffsync.internal',
    role: USER_ROLES.MANAGER
  });

  const employeeToken = signToken({
    userId: employeeUserId,
    email: 'employee@staffsync.internal',
    role: USER_ROLES.EMPLOYEE
  });

  const mockAdminUser = {
    _id: adminId,
    id: adminId,
    name: 'Eleanor Vance',
    email: 'admin@staffsync.internal',
    role: USER_ROLES.HR_ADMIN,
    isActive: true,
    changedPasswordAfter: () => false
  };

  const mockManagerUser = {
    _id: managerUserId,
    id: managerUserId,
    name: 'Marcus Brody',
    email: 'manager@staffsync.internal',
    role: USER_ROLES.MANAGER,
    isActive: true,
    changedPasswordAfter: () => false
  };

  const mockEmpUser = {
    _id: employeeUserId,
    id: employeeUserId,
    name: 'Jane Doe',
    email: 'employee@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    isActive: true,
    changedPasswordAfter: () => false
  };

  const mockEmployeeRecord = {
    _id: empRecordId,
    id: empRecordId,
    userId: employeeUserId,
    employeeCode: 'EMP-1003',
    firstName: 'Jane',
    lastName: 'Doe',
    departmentId: deptId,
    designation: 'Software Engineer',
    employmentType: 'FULL_TIME',
    status: EMPLOYEE_STATUSES.ACTIVE
  };

  const mockManagerRecord = {
    _id: managerEmpRecordId,
    id: managerEmpRecordId,
    userId: managerUserId,
    employeeCode: 'EMP-1002',
    firstName: 'Marcus',
    lastName: 'Brody',
    departmentId: deptId,
    designation: 'Engineering Manager',
    employmentType: 'FULL_TIME',
    status: EMPLOYEE_STATUSES.ACTIVE
  };

  // 1. Authentication guards
  await t.test('GET /api/v1/attendance/today: rejects unauthenticated request (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/attendance/today');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Unauthorized');
  });

  // 2. Check-in operations
  await t.test('POST /api/v1/attendance/check-in: successful clock in (HTTP 201)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);
    t.mock.method(Attendance, 'findOne', async () => null);

    const createdRecord = {
      _id: attendanceRecordId,
      employeeId: empRecordId,
      date: new Date('2026-10-29T00:00:00.000Z'),
      checkInTime: new Date('2026-10-29T09:05:00.000Z'),
      status: ATTENDANCE_STATUSES.PRESENT
    };
    t.mock.method(Attendance, 'create', async () => createdRecord);

    const res = await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({ notes: 'On-site workstation' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Checked in successfully.');
    assert.equal(res.body.data.status, ATTENDANCE_STATUSES.PRESENT);
  });

  await t.test('POST /api/v1/attendance/check-in: rejects double punch on same day (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const existingAttendance = {
      _id: attendanceRecordId,
      employeeId: empRecordId,
      date: new Date('2026-10-29T00:00:00.000Z'),
      checkInTime: new Date('2026-10-29T09:00:00.000Z'),
      status: ATTENDANCE_STATUSES.PRESENT
    };
    t.mock.method(Attendance, 'findOne', async () => existingAttendance);

    const res = await request(app)
      .post('/api/v1/attendance/check-in')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already clocked in/i);
  });

  // 3. Check-out operations
  await t.test('POST /api/v1/attendance/check-out: rejects check-out without check-in (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);
    t.mock.method(Attendance, 'findOne', async () => null);

    const res = await request(app)
      .post('/api/v1/attendance/check-out')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /no check-in record found/i);
  });

  await t.test('POST /api/v1/attendance/check-out: successful check out and working duration calculation (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const activeRecord = {
      _id: attendanceRecordId,
      employeeId: empRecordId,
      date: new Date('2026-10-29T00:00:00.000Z'),
      checkInTime: new Date(Date.now() - 8.5 * 3600 * 1000), // 8.5 hours ago
      checkOutTime: null,
      totalHours: 0,
      status: ATTENDANCE_STATUSES.PRESENT,
      save: async function () {
        return this;
      }
    };
    t.mock.method(Attendance, 'findOne', async () => activeRecord);

    const res = await request(app)
      .post('/api/v1/attendance/check-out')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Checked out successfully.');
    assert.ok(res.body.data.totalHours >= 8);
    assert.ok(res.body.data.checkOutTime);
  });

  await t.test('POST /api/v1/attendance/check-out: rejects duplicate check-out (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const alreadyCheckedOut = {
      _id: attendanceRecordId,
      employeeId: empRecordId,
      date: new Date('2026-10-29T00:00:00.000Z'),
      checkInTime: new Date('2026-10-29T09:00:00.000Z'),
      checkOutTime: new Date('2026-10-29T17:30:00.000Z'),
      totalHours: 8.5,
      status: ATTENDANCE_STATUSES.PRESENT
    };
    t.mock.method(Attendance, 'findOne', async () => alreadyCheckedOut);

    const res = await request(app)
      .post('/api/v1/attendance/check-out')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already clocked out/i);
  });

  // 4. Today Status & Personal History
  await t.test('GET /api/v1/attendance/today: returns current day status (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const todayRecord = {
      _id: attendanceRecordId,
      checkInTime: new Date('2026-10-29T09:00:00.000Z'),
      checkOutTime: null,
      status: ATTENDANCE_STATUSES.PRESENT
    };
    t.mock.method(Attendance, 'findOne', async () => todayRecord);

    const res = await request(app)
      .get('/api/v1/attendance/today')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.isCheckedIn, true);
    assert.equal(res.body.data.isCheckedOut, false);
  });

  await t.test('GET /api/v1/attendance/my-history: returns records and monthly summary metrics (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const mockHistory = [
      {
        _id: 'rec1',
        date: new Date('2026-10-28T00:00:00.000Z'),
        checkInTime: new Date('2026-10-28T09:05:00.000Z'),
        checkOutTime: new Date('2026-10-28T17:35:00.000Z'),
        totalHours: 8.5,
        status: ATTENDANCE_STATUSES.PRESENT
      },
      {
        _id: 'rec2',
        date: new Date('2026-10-27T00:00:00.000Z'),
        checkInTime: new Date('2026-10-27T09:45:00.000Z'),
        checkOutTime: new Date('2026-10-27T18:00:00.000Z'),
        totalHours: 8.25,
        status: ATTENDANCE_STATUSES.LATE
      }
    ];

    t.mock.method(Attendance, 'find', () => createQueryMock(mockHistory));

    const res = await request(app)
      .get('/api/v1/attendance/my-history?month=10&year=2026')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.summary.totalDays, 2);
    assert.equal(res.body.summary.presentCount, 1);
    assert.equal(res.body.summary.lateCount, 1);
    assert.equal(res.body.summary.totalWorkingHours, 16.75);
  });

  // 5. Manager Team Attendance & Role RBAC
  await t.test('GET /api/v1/attendance/team: rejects unauthorized EMPLOYEE role (HTTP 403 Forbidden)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));

    const res = await request(app)
      .get('/api/v1/attendance/team')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Forbidden');
  });

  await t.test('GET /api/v1/attendance/team: permits MANAGER role and returns team roster (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockManagerUser));
    t.mock.method(Employee, 'findOne', async () => mockManagerRecord);
    t.mock.method(Employee, 'find', () => createQueryMock([mockEmployeeRecord]));
    t.mock.method(Attendance, 'find', () => createQueryMock([]));

    const res = await request(app)
      .get('/api/v1/attendance/team')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].status, 'NOT_PUNCHED');
  });

  // 6. Admin Overview and Manual Operations
  await t.test('GET /api/v1/attendance: rejects non-admin with HTTP 403 Forbidden', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));

    const res = await request(app)
      .get('/api/v1/attendance')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Forbidden');
  });

  await t.test('GET /api/v1/attendance: permits HR_ADMIN and returns paginated records (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Attendance, 'find', () => createQueryMock([{ _id: attendanceRecordId, status: 'PRESENT' }]));
    t.mock.method(Attendance, 'countDocuments', async () => 1);

    const res = await request(app)
      .get('/api/v1/attendance?page=1&limit=10')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data.length, 1);
  });

  await t.test('POST /api/v1/attendance/manual: admin creates valid record (HTTP 201)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Attendance, 'findOne', async () => null);

    const manualRecord = {
      _id: attendanceRecordId,
      employeeId: empRecordId,
      date: new Date('2026-10-25T00:00:00.000Z'),
      checkInTime: new Date('2026-10-25T09:00:00.000Z'),
      checkOutTime: new Date('2026-10-25T17:00:00.000Z'),
      totalHours: 8.0,
      status: ATTENDANCE_STATUSES.PRESENT
    };
    t.mock.method(Attendance, 'create', async () => manualRecord);

    const res = await request(app)
      .post('/api/v1/attendance/manual')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({
        employeeId: empRecordId,
        date: '2026-10-25',
        checkInTime: '2026-10-25T09:00:00.000Z',
        checkOutTime: '2026-10-25T17:00:00.000Z',
        status: 'PRESENT'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Attendance record created successfully.');
  });

  await t.test('PUT /api/v1/attendance/:id: admin updates record and recalculates hours (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));

    const existingRecord = {
      _id: attendanceRecordId,
      employeeId: empRecordId,
      checkInTime: new Date('2026-10-25T09:00:00.000Z'),
      checkOutTime: new Date('2026-10-25T13:00:00.000Z'),
      totalHours: 4.0,
      status: ATTENDANCE_STATUSES.HALF_DAY,
      save: async function () {
        return this;
      }
    };
    t.mock.method(Attendance, 'findById', async () => existingRecord);

    const res = await request(app)
      .put(`/api/v1/attendance/${attendanceRecordId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({
        checkOutTime: '2026-10-25T17:30:00.000Z',
        status: ATTENDANCE_STATUSES.PRESENT,
        notes: 'Adjusted by HR'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, ATTENDANCE_STATUSES.PRESENT);
    assert.equal(res.body.data.totalHours, 8.5);
  });
});
