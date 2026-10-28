import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { User, USER_ROLES } from '../src/models/User.js';
import { Employee, EMPLOYEE_STATUSES } from '../src/models/Employee.js';
import { LeaveRequest, LEAVE_TYPES, LEAVE_STATUSES } from '../src/models/LeaveRequest.js';
import { LeaveBalance } from '../src/models/LeaveBalance.js';
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

test('StaffSync Leave Management API (/api/v1/leaves)', async (t) => {
  const adminId = '654c1f9b8c2d1e001a111111';
  const managerUserId = '654c1f9b8c2d1e001a222222';
  const employeeUserId = '654c1f9b8c2d1e001a333333';
  const otherEmployeeUserId = '654c1f9b8c2d1e001a444444';

  const deptId = '654c1f9b8c2d1e001a555555';
  const otherDeptId = '654c1f9b8c2d1e001a666666';

  const empRecordId = '654c1f9b8c2d1e001a777777';
  const managerEmpRecordId = '654c1f9b8c2d1e001a888888';
  const otherEmpRecordId = '654c1f9b8c2d1e001a999999';

  const leaveRequestId = '654c1f9b8c2d1e001aaaaaaa';

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

  const otherEmployeeToken = signToken({
    userId: otherEmployeeUserId,
    email: 'other@staffsync.internal',
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

  const mockOtherEmpUser = {
    _id: otherEmployeeUserId,
    id: otherEmployeeUserId,
    name: 'Alice Cooper',
    email: 'other@staffsync.internal',
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
    managerId: managerEmpRecordId,
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

  const mockOtherEmployeeRecord = {
    _id: otherEmpRecordId,
    id: otherEmpRecordId,
    userId: otherEmployeeUserId,
    employeeCode: 'EMP-1009',
    firstName: 'Alice',
    lastName: 'Cooper',
    departmentId: otherDeptId, // different department!
    managerId: '654c1f9b8c2d1e001abbbbbb',
    designation: 'Marketing Specialist',
    employmentType: 'FULL_TIME',
    status: EMPLOYEE_STATUSES.ACTIVE
  };

  const mockBalance = {
    _id: 'balance1',
    employeeId: empRecordId,
    year: 2026,
    annual: { quota: 15, used: 2 },
    casual: { quota: 10, used: 1 },
    sick: { quota: 10, used: 0 },
    unpaid: { used: 0 },
    save: async function () {
      return this;
    }
  };

  // 1. Authentication guards
  await t.test('POST /api/v1/leaves: rejects unauthenticated requests (HTTP 401)', async () => {
    const res = await request(app).post('/api/v1/leaves').send({});
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Unauthorized');
  });

  // 2. Submission validation
  await t.test('POST /api/v1/leaves: rejects invalid date ranges where endDate < startDate (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({
        leaveType: 'ANNUAL',
        startDate: '2026-11-15',
        endDate: '2026-11-10', // End before start
        reason: 'Family event'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /earlier than start date/i);
  });

  await t.test('POST /api/v1/leaves: rejects short reason with HTTP 400 Bad Request', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({
        leaveType: 'ANNUAL',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        reason: 'bad' // < 5 chars
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /at least 5 characters/i);
  });

  await t.test('POST /api/v1/leaves: successfully submits valid application (HTTP 201)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);
    t.mock.method(LeaveBalance, 'findOne', async () => mockBalance);
    t.mock.method(LeaveRequest, 'findOne', async () => null); // no overlap

    const createdLeave = {
      _id: leaveRequestId,
      employeeId: empRecordId,
      leaveType: 'ANNUAL',
      startDate: new Date('2026-11-10T00:00:00.000Z'),
      endDate: new Date('2026-11-12T00:00:00.000Z'),
      totalDays: 3,
      reason: 'Family vacation and personal travel.',
      status: LEAVE_STATUSES.PENDING
    };
    t.mock.method(LeaveRequest, 'create', async () => createdLeave);

    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({
        leaveType: 'ANNUAL',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        totalDays: 3,
        reason: 'Family vacation and personal travel.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, LEAVE_STATUSES.PENDING);
    assert.equal(res.body.data.totalDays, 3);
  });

  await t.test('POST /api/v1/leaves: rejects overlapping active leave request (HTTP 409 Conflict)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);
    t.mock.method(LeaveBalance, 'findOne', async () => mockBalance);

    const existingOverlapping = {
      _id: 'existing1',
      employeeId: empRecordId,
      startDate: new Date('2026-11-09T00:00:00.000Z'),
      endDate: new Date('2026-11-14T00:00:00.000Z'),
      status: LEAVE_STATUSES.PENDING
    };
    t.mock.method(LeaveRequest, 'findOne', async () => existingOverlapping);

    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({
        leaveType: 'ANNUAL',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        reason: 'Overlapping request test'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /overlapping/i);
  });

  // 3. Employee self-service
  await t.test('GET /api/v1/leaves/my-requests: returns personal leave applications (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);
    t.mock.method(LeaveRequest, 'find', () => createQueryMock([{ _id: leaveRequestId, leaveType: 'ANNUAL' }]));
    t.mock.method(LeaveBalance, 'findOne', async () => mockBalance);

    const res = await request(app)
      .get('/api/v1/leaves/my-requests')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
    assert.ok(res.body.balance);
  });

  await t.test('GET /api/v1/leaves/:id: prevents employee from viewing another person’s request (HTTP 403 Forbidden)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockOtherEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockOtherEmployeeRecord);

    const mockOtherLeave = {
      _id: leaveRequestId,
      employeeId: { _id: empRecordId }, // Belongs to Jane Doe
      leaveType: 'ANNUAL',
      status: 'PENDING'
    };
    t.mock.method(LeaveRequest, 'findById', () => createQueryMock(mockOtherLeave));

    const res = await request(app)
      .get(`/api/v1/leaves/${leaveRequestId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${otherEmployeeToken}`]);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not authorized/i);
  });

  // 4. Approval RBAC and Scope
  await t.test('PATCH /api/v1/leaves/:id/status: rejects regular EMPLOYEE role with HTTP 403 Forbidden', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));

    const res = await request(app)
      .patch(`/api/v1/leaves/${leaveRequestId}/status`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({ status: 'APPROVED' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Forbidden');
  });

  await t.test('PATCH /api/v1/leaves/:id/status: prevents self-approval by manager (HTTP 403 Forbidden)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockManagerUser));

    const pendingManagerLeave = {
      _id: leaveRequestId,
      employeeId: managerEmpRecordId, // The applicant IS the manager!
      status: LEAVE_STATUSES.PENDING
    };
    t.mock.method(LeaveRequest, 'findById', async () => pendingManagerLeave);
    t.mock.method(Employee, 'findById', async () => mockManagerRecord);

    const res = await request(app)
      .patch(`/api/v1/leaves/${leaveRequestId}/status`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
      .send({ status: 'APPROVED' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /self-approval is strictly prohibited/i);
  });

  await t.test('PATCH /api/v1/leaves/:id/status: prevents manager from reviewing employee outside scope (HTTP 403)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockManagerUser));
    t.mock.method(Employee, 'findOne', async () => mockManagerRecord); // Manager in deptId

    const foreignLeave = {
      _id: leaveRequestId,
      employeeId: otherEmpRecordId, // Employee in otherDeptId
      status: LEAVE_STATUSES.PENDING
    };
    t.mock.method(LeaveRequest, 'findById', async () => foreignLeave);
    t.mock.method(Employee, 'findById', async () => mockOtherEmployeeRecord);

    const res = await request(app)
      .patch(`/api/v1/leaves/${leaveRequestId}/status`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
      .send({ status: 'APPROVED' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /managerial scope/i);
  });

  // 5. Successful Decisioning
  await t.test('PATCH /api/v1/leaves/:id/status: rejects REJECTED status without mandatory comment (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));

    const res = await request(app)
      .patch(`/api/v1/leaves/${leaveRequestId}/status`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({ status: 'REJECTED' }); // Missing reviewComment

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /rejection comment/i);
  });

  await t.test('PATCH /api/v1/leaves/:id/status: manager successfully approves subordinate leave (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockManagerUser));
    t.mock.method(Employee, 'findOne', async () => mockManagerRecord);
    t.mock.method(Employee, 'findById', async () => mockEmployeeRecord); // Jane Doe is in Marcus's department
    t.mock.method(LeaveBalance, 'findOne', async () => mockBalance);

    const pendingLeave = {
      _id: leaveRequestId,
      employeeId: empRecordId,
      leaveType: 'ANNUAL',
      startDate: new Date('2026-11-10T00:00:00.000Z'),
      totalDays: 3,
      status: LEAVE_STATUSES.PENDING,
      save: async function () {
        return this;
      }
    };
    t.mock.method(LeaveRequest, 'findById', async () => pendingLeave);

    const res = await request(app)
      .patch(`/api/v1/leaves/${leaveRequestId}/status`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${managerToken}`])
      .send({ status: 'APPROVED', reviewComment: 'Approved. Hand off tasks.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'APPROVED');
  });

  await t.test('PATCH /api/v1/leaves/:id/status: rejects duplicate or repeated reviews (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));

    const alreadyApprovedLeave = {
      _id: leaveRequestId,
      employeeId: empRecordId,
      status: LEAVE_STATUSES.APPROVED // Already reviewed!
    };
    t.mock.method(LeaveRequest, 'findById', async () => alreadyApprovedLeave);

    const res = await request(app)
      .patch(`/api/v1/leaves/${leaveRequestId}/status`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({ status: 'REJECTED', reviewComment: 'Changed mind' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already been reviewed/i);
  });

  // 6. Cancellation operations
  await t.test('DELETE /api/v1/leaves/:id: applicant successfully cancels pending leave (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const pendingLeave = {
      _id: leaveRequestId,
      employeeId: empRecordId,
      status: LEAVE_STATUSES.PENDING,
      save: async function () {
        return this;
      }
    };
    t.mock.method(LeaveRequest, 'findById', async () => pendingLeave);

    const res = await request(app)
      .delete(`/api/v1/leaves/${leaveRequestId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, LEAVE_STATUSES.CANCELLED);
  });

  await t.test('DELETE /api/v1/leaves/:id: rejects cancellation of already approved leave (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const approvedLeave = {
      _id: leaveRequestId,
      employeeId: empRecordId,
      status: LEAVE_STATUSES.APPROVED
    };
    t.mock.method(LeaveRequest, 'findById', async () => approvedLeave);

    const res = await request(app)
      .delete(`/api/v1/leaves/${leaveRequestId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /only pending leave applications can be cancelled/i);
  });
});
