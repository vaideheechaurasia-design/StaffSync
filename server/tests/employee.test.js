import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { User, USER_ROLES } from '../src/models/User.js';
import { Employee, EMPLOYEE_STATUSES } from '../src/models/Employee.js';
import { Department } from '../src/models/Department.js';
import { signToken, AUTH_COOKIE_NAME } from '../src/utils/tokenUtils.js';

function createQueryMock(returnValue) {
  return {
    populate: () => createQueryMock(returnValue),
    sort: () => createQueryMock(returnValue),
    select: () => Promise.resolve(returnValue),
    then: (resolve, reject) => Promise.resolve(returnValue).then(resolve, reject)
  };
}

test('StaffSync Employee Management API (/api/v1/employees)', async (t) => {
  const adminId = '654c1f9b8c2d1e001a111111';
  const employeeUserId = '654c1f9b8c2d1e001a222222';
  const deptId = '654c1f9b8c2d1e001a333333';
  const empRecordId = '654c1f9b8c2d1e001a444444';

  const adminToken = signToken({
    userId: adminId,
    email: 'admin@staffsync.internal',
    role: USER_ROLES.HR_ADMIN
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

  const mockEmpUser = {
    _id: employeeUserId,
    id: employeeUserId,
    name: 'Jane Doe',
    email: 'employee@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    isActive: true,
    changedPasswordAfter: () => false
  };

  const mockDept = {
    _id: deptId,
    id: deptId,
    name: 'Engineering',
    code: 'ENG',
    isActive: true
  };

  const mockEmployeeRecord = {
    _id: empRecordId,
    id: empRecordId,
    userId: employeeUserId,
    employeeCode: 'EMP-1003',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1 (555) 234-5678',
    departmentId: mockDept,
    designation: 'Software Engineer',
    employmentType: 'FULL_TIME',
    status: EMPLOYEE_STATUSES.ACTIVE,
    save: async () => true
  };

  await t.test('GET /api/v1/employees: rejects unauthenticated requests (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/employees');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Unauthorized');
  });

  await t.test('GET /api/v1/employees: returns list of employees for authenticated user (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));
    t.mock.method(Employee, 'find', () => createQueryMock([mockEmployeeRecord]));

    const res = await request(app)
      .get('/api/v1/employees')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(Array.isArray(res.body.data), true);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].employeeCode, 'EMP-1003');
  });

  await t.test('POST /api/v1/employees: rejects non-admin role with HTTP 403 Forbidden', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockEmpUser));

    const res = await request(app)
      .post('/api/v1/employees')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${employeeToken}`])
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@staffsync.internal',
        employeeCode: 'EMP-1005',
        designation: 'DevOps Engineer'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error, 'Forbidden');
  });

  await t.test('POST /api/v1/employees: rejects missing required fields (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));

    const res = await request(app)
      .post('/api/v1/employees')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({
        firstName: 'Alice'
        // Missing lastName, email, employeeCode, designation
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /required fields/i);
  });

  await t.test('POST /api/v1/employees: rejects duplicate employee code (HTTP 400)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Employee, 'findOne', async () => mockEmployeeRecord);

    const res = await request(app)
      .post('/api/v1/employees')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@staffsync.internal',
        employeeCode: 'EMP-1003', // Matches existing
        designation: 'DevOps Engineer',
        departmentId: deptId
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already assigned/i);
  });

  await t.test('POST /api/v1/employees: successfully onboards employee and creates user account (HTTP 201)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Employee, 'findOne', async () => null);
    t.mock.method(User, 'findOne', async () => null);
    t.mock.method(Department, 'findById', async () => mockDept);
    t.mock.method(Department, 'findOne', async () => mockDept);

    let createdUser = null;
    t.mock.method(User, 'create', async (payload) => {
      createdUser = { _id: '654c1f9b8c2d1e001a555555', ...payload };
      return createdUser;
    });

    let createdEmployee = null;
    t.mock.method(Employee, 'create', async (payload) => {
      createdEmployee = {
        _id: '654c1f9b8c2d1e001a666666',
        ...payload
      };
      return createdEmployee;
    });

    t.mock.method(Employee, 'findById', () => createQueryMock({
      _id: '654c1f9b8c2d1e001a666666',
      employeeCode: 'EMP-1008',
      firstName: 'Alice',
      lastName: 'Smith',
      designation: 'DevOps Engineer',
      userId: { email: 'alice@staffsync.internal', role: 'EMPLOYEE' },
      departmentId: mockDept
    }));

    const res = await request(app)
      .post('/api/v1/employees')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@staffsync.internal',
        employeeCode: 'EMP-1008',
        designation: 'DevOps Engineer',
        departmentId: deptId
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /onboarded successfully/i);
    assert.equal(res.body.data.employeeCode, 'EMP-1008');
  });

  await t.test('GET /api/v1/employees/:id: returns 404 for non-existent employee', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Employee, 'findOne', () => createQueryMock(null));

    const res = await request(app)
      .get('/api/v1/employees/non-existent-id')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`]);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not found/i);
  });

  await t.test('GET /api/v1/employees/:id: returns employee record by ID (HTTP 200)', async () => {
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Employee, 'findOne', () => createQueryMock(mockEmployeeRecord));

    const res = await request(app)
      .get(`/api/v1/employees/${empRecordId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.employeeCode, 'EMP-1003');
  });

  await t.test('PUT /api/v1/employees/:id: updates employee details (HTTP 200)', async () => {
    const updatedEmployee = { ...mockEmployeeRecord, designation: 'Senior Software Engineer' };
    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Employee, 'findById', (id) => {
      // First call in controller finds employee to update, second call returns populated
      return createQueryMock(updatedEmployee);
    });
    t.mock.method(User, 'findByIdAndUpdate', async () => true);

    const res = await request(app)
      .put(`/api/v1/employees/${empRecordId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`])
      .send({ designation: 'Senior Software Engineer' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /updated successfully/i);
  });

  await t.test('DELETE /api/v1/employees/:id: deactivates employee (HTTP 200)', async () => {
    const employeeToDeactivate = {
      ...mockEmployeeRecord,
      save: async () => true
    };

    t.mock.method(User, 'findById', () => createQueryMock(mockAdminUser));
    t.mock.method(Employee, 'findById', async () => employeeToDeactivate);
    t.mock.method(User, 'findByIdAndUpdate', async () => true);

    const res = await request(app)
      .delete(`/api/v1/employees/${empRecordId}`)
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${adminToken}`]);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /deactivated successfully/i);
    assert.equal(employeeToDeactivate.status, EMPLOYEE_STATUSES.INACTIVE);
  });
});
