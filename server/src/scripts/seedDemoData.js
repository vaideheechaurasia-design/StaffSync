import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Department } from '../models/Department.js';
import { User, USER_ROLES } from '../models/User.js';
import { Employee, EMPLOYMENT_TYPES, EMPLOYEE_STATUSES } from '../models/Employee.js';
import { Attendance, ATTENDANCE_STATUSES } from '../models/Attendance.js';
import { LeaveRequest, LEAVE_TYPES, LEAVE_STATUSES } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { normalizeDate } from '../controllers/attendanceController.js';

dotenv.config();

/**
 * Parses CLI arguments like --dry-run or --verbose
 */
function parseCliArgs() {
  const args = { dryRun: false, verbose: false };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry-run') args.dryRun = true;
    if (arg === '--verbose') args.verbose = true;
  }
  return args;
}

// -------------------------------------------------------------
// CANONICAL DEMO SPECIFICATION (Reconstructed from Phase 4 & Master Upgrade)
// -------------------------------------------------------------

export const DEMO_DEPARTMENTS = [
  {
    code: 'ENG',
    name: 'Engineering',
    description: 'Software engineering, quality assurance, and platform infrastructure.',
    managerEmail: 'marcus@staffsync.internal'
  },
  {
    code: 'HR',
    name: 'Human Resources',
    description: 'Talent acquisition, employee relations, and compliance.',
    managerEmail: 'eleanor@staffsync.internal'
  },
  {
    code: 'MKT',
    name: 'Sales & Marketing',
    description: 'Enterprise accounts, product marketing, and client growth.',
    managerEmail: 'sophia.rossi@staffsync.internal'
  },
  {
    code: 'OPS',
    name: 'Operations',
    description: 'Internal logistics, corporate facilities, and security.',
    managerEmail: 'nathan.drake@staffsync.internal'
  },
  {
    code: 'FIN',
    name: 'Finance & Accounting',
    description: 'Corporate treasury, financial planning, and audit compliance.',
    managerEmail: 'ananya.sharma@staffsync.internal'
  },
  {
    code: 'IT',
    name: 'Information Technology',
    description: 'Cloud infrastructure, cybersecurity, and corporate helpdesk.',
    managerEmail: 'vikram.malhotra@staffsync.internal'
  }
];

export const DEMO_EMPLOYEES = [
  // --- Engineering ---
  {
    employeeCode: 'EMP-1002',
    firstName: 'Marcus',
    lastName: 'Brody',
    email: 'marcus@staffsync.internal',
    role: USER_ROLES.MANAGER,
    designation: 'Engineering Team Lead & Lead Architect',
    departmentCode: 'ENG',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-01-15'
  },
  {
    employeeCode: 'EMP-1003',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Senior Full Stack Engineer',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-03-01'
  },
  {
    employeeCode: 'EMP-1011',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Principal Frontend Architect',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-04-10'
  },
  {
    employeeCode: 'EMP-1012',
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'DevOps & Site Reliability Engineer',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-05-20'
  },
  {
    employeeCode: 'EMP-1013',
    firstName: 'Chen',
    lastName: 'Wei',
    email: 'chen.wei@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Staff Backend Engineer',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-06-15'
  },
  {
    employeeCode: 'EMP-1014',
    firstName: 'Fatima',
    lastName: 'Al-Mansoor',
    email: 'fatima.mansoor@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'QA Automation Lead',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-07-01'
  },
  {
    employeeCode: 'EMP-1015',
    firstName: 'Lucas',
    lastName: 'Silva',
    email: 'lucas.silva@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Cloud Platform Engineer',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-08-15'
  },
  {
    employeeCode: 'EMP-1016',
    firstName: 'Aisha',
    lastName: 'Bello',
    email: 'aisha.bello@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Mobile Applications Engineer',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-09-01'
  },
  {
    employeeCode: 'EMP-1006',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    email: 'arthur@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Former Principal Consultant',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.INACTIVE,
    employmentType: EMPLOYMENT_TYPES.CONTRACT,
    dateOfJoining: '2024-02-01'
  },
  {
    employeeCode: 'EMP-1017',
    firstName: 'Carlos',
    lastName: 'Gomez',
    email: 'carlos.gomez@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Software Engineering Intern',
    departmentCode: 'ENG',
    managerEmail: 'marcus@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.INTERN,
    dateOfJoining: '2026-01-10'
  },

  // --- Human Resources ---
  {
    employeeCode: 'EMP-1001',
    firstName: 'Eleanor',
    lastName: 'Vance',
    email: 'eleanor@staffsync.internal',
    role: USER_ROLES.HR_ADMIN,
    designation: 'Director of Human Resources',
    departmentCode: 'HR',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2024-11-01'
  },
  {
    employeeCode: 'EMP-1018',
    firstName: 'Rachel',
    lastName: 'Green',
    email: 'rachel.green@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Senior Talent Acquisition Specialist',
    departmentCode: 'HR',
    managerEmail: 'eleanor@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-02-15'
  },
  {
    employeeCode: 'EMP-1019',
    firstName: 'Mateo',
    lastName: 'Hernandez',
    email: 'mateo.hernandez@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'HR Operations & People Partner',
    departmentCode: 'HR',
    managerEmail: 'eleanor@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-05-10'
  },
  {
    employeeCode: 'EMP-1020',
    firstName: 'Sunita',
    lastName: 'Rao',
    email: 'sunita.rao@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Compensation & Benefits Lead',
    departmentCode: 'HR',
    managerEmail: 'eleanor@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-07-20'
  },

  // --- Sales & Marketing ---
  {
    employeeCode: 'EMP-1007',
    firstName: 'Sophia',
    lastName: 'Rossi',
    email: 'sophia.rossi@staffsync.internal',
    role: USER_ROLES.MANAGER,
    designation: 'Head of Sales & Marketing',
    departmentCode: 'MKT',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-01-10'
  },
  {
    employeeCode: 'EMP-1004',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Senior Product Marketing Specialist',
    departmentCode: 'MKT',
    managerEmail: 'sophia.rossi@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-03-15'
  },
  {
    employeeCode: 'EMP-1021',
    firstName: 'Liam',
    lastName: "O'Connor",
    email: 'liam.oconnor@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Enterprise Account Executive',
    departmentCode: 'MKT',
    managerEmail: 'sophia.rossi@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-04-01'
  },
  {
    employeeCode: 'EMP-1022',
    firstName: 'Maya',
    lastName: 'Lin',
    email: 'maya.lin@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Digital Marketing & Growth Lead',
    departmentCode: 'MKT',
    managerEmail: 'sophia.rossi@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-06-01'
  },
  {
    employeeCode: 'EMP-1023',
    firstName: 'Tariq',
    lastName: 'Mansour',
    email: 'tariq.mansour@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Client Success Manager',
    departmentCode: 'MKT',
    managerEmail: 'sophia.rossi@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-08-01'
  },
  {
    employeeCode: 'EMP-1024',
    firstName: 'Chloe',
    lastName: 'Bennett',
    email: 'chloe.bennett@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Brand & Communications Strategist',
    departmentCode: 'MKT',
    managerEmail: 'sophia.rossi@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-09-15'
  },

  // --- Operations ---
  {
    employeeCode: 'EMP-1008',
    firstName: 'Nathan',
    lastName: 'Drake',
    email: 'nathan.drake@staffsync.internal',
    role: USER_ROLES.MANAGER,
    designation: 'Senior Director of Operations',
    departmentCode: 'OPS',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2024-12-01'
  },
  {
    employeeCode: 'EMP-1025',
    firstName: 'Kevin',
    lastName: 'Vance',
    email: 'kevin.vance@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Facilities & Workplace Coordinator',
    departmentCode: 'OPS',
    managerEmail: 'nathan.drake@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-03-20'
  },
  {
    employeeCode: 'EMP-1026',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Logistics & Supply Chain Specialist',
    departmentCode: 'OPS',
    managerEmail: 'nathan.drake@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-05-15'
  },
  {
    employeeCode: 'EMP-1027',
    firstName: 'Samuel',
    lastName: 'Jackson',
    email: 'samuel.jackson@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Business Operations Analyst',
    departmentCode: 'OPS',
    managerEmail: 'nathan.drake@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-07-10'
  },

  // --- Finance & Accounting ---
  {
    employeeCode: 'EMP-1010',
    firstName: 'Ananya',
    lastName: 'Sharma',
    email: 'ananya.sharma@staffsync.internal',
    role: USER_ROLES.MANAGER,
    designation: 'Finance Director & Controller',
    departmentCode: 'FIN',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-01-05'
  },
  {
    employeeCode: 'EMP-1028',
    firstName: 'Patrick',
    lastName: 'Meyer',
    email: 'patrick.meyer@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Senior Financial Analyst',
    departmentCode: 'FIN',
    managerEmail: 'ananya.sharma@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-03-01'
  },
  {
    employeeCode: 'EMP-1029',
    firstName: 'Isabella',
    lastName: 'Santos',
    email: 'isabella.santos@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Payroll & Compliance Specialist',
    departmentCode: 'FIN',
    managerEmail: 'ananya.sharma@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-04-15'
  },
  {
    employeeCode: 'EMP-1030',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Internal Audit Lead',
    departmentCode: 'FIN',
    managerEmail: 'ananya.sharma@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-06-20'
  },
  {
    employeeCode: 'EMP-1031',
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'neha.gupta@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Billing & Corporate Accounts Specialist',
    departmentCode: 'FIN',
    managerEmail: 'ananya.sharma@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-09-01'
  },

  // --- Information Technology ---
  {
    employeeCode: 'EMP-1009',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    email: 'vikram.malhotra@staffsync.internal',
    role: USER_ROLES.MANAGER,
    designation: 'IT Infrastructure Lead',
    departmentCode: 'IT',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-01-12'
  },
  {
    employeeCode: 'EMP-1032',
    firstName: 'Daniel',
    lastName: 'Park',
    email: 'daniel.park@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Cybersecurity Operations Analyst',
    departmentCode: 'IT',
    managerEmail: 'vikram.malhotra@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-02-28'
  },
  {
    employeeCode: 'EMP-1033',
    firstName: 'Olivia',
    lastName: 'Taylor',
    email: 'olivia.taylor@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Senior Systems Administrator',
    departmentCode: 'IT',
    managerEmail: 'vikram.malhotra@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-04-12'
  },
  {
    employeeCode: 'EMP-1034',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'IT Support & User Operations Lead',
    departmentCode: 'IT',
    managerEmail: 'vikram.malhotra@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-06-05'
  },
  {
    employeeCode: 'EMP-1035',
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace.hopper@staffsync.internal',
    role: USER_ROLES.EMPLOYEE,
    designation: 'Network & Cloud Security Specialist',
    departmentCode: 'IT',
    managerEmail: 'vikram.malhotra@staffsync.internal',
    status: EMPLOYEE_STATUSES.ACTIVE,
    employmentType: EMPLOYMENT_TYPES.FULL_TIME,
    dateOfJoining: '2025-08-20'
  }
];

export const DEMO_LEAVE_TEMPLATES = [
  // 5 Pending Leaves (Visible in Action Center and Approvals queue)
  {
    employeeCode: 'EMP-1003', // Jane Doe (ENG)
    leaveType: LEAVE_TYPES.ANNUAL,
    startDate: '2026-11-03',
    endDate: '2026-11-06',
    totalDays: 4,
    reason: 'Annual family holiday planned in advance during sprint lull.',
    status: LEAVE_STATUSES.PENDING
  },
  {
    employeeCode: 'EMP-1018', // Rachel Green (HR)
    leaveType: LEAVE_TYPES.CASUAL,
    startDate: '2026-11-02',
    endDate: '2026-11-02',
    totalDays: 1,
    reason: 'Personal relocation and home apartment inspection.',
    status: LEAVE_STATUSES.PENDING
  },
  {
    employeeCode: 'EMP-1021', // Liam O'Connor (MKT)
    leaveType: LEAVE_TYPES.SICK,
    startDate: '2026-11-02',
    endDate: '2026-11-03',
    totalDays: 2,
    reason: 'Scheduled dental surgery and recommended postoperative rest.',
    status: LEAVE_STATUSES.PENDING
  },
  {
    employeeCode: 'EMP-1028', // Patrick Meyer (FIN)
    leaveType: LEAVE_TYPES.ANNUAL,
    startDate: '2026-11-10',
    endDate: '2026-11-13',
    totalDays: 4,
    reason: 'Attending brother’s wedding ceremony and family gathering.',
    status: LEAVE_STATUSES.PENDING
  },
  {
    employeeCode: 'EMP-1032', // Daniel Park (IT)
    leaveType: LEAVE_TYPES.CASUAL,
    startDate: '2026-11-06',
    endDate: '2026-11-06',
    totalDays: 1,
    reason: 'Attending regional cybersecurity symposium.',
    status: LEAVE_STATUSES.PENDING
  },

  // 2 Approved Leaves overlapping Today (2026-10-30) -> Displays Approved Leave = 2
  {
    employeeCode: 'EMP-1015', // Lucas Silva (ENG)
    leaveType: LEAVE_TYPES.CASUAL,
    startDate: '2026-10-30',
    endDate: '2026-10-30',
    totalDays: 1,
    reason: 'Urgent family personal affairs.',
    status: LEAVE_STATUSES.APPROVED,
    reviewComment: 'Approved by engineering management.'
  },
  {
    employeeCode: 'EMP-1023', // Tariq Mansour (MKT)
    leaveType: LEAVE_TYPES.ANNUAL,
    startDate: '2026-10-29',
    endDate: '2026-10-30',
    totalDays: 2,
    reason: 'Scheduled end-of-month personal leave.',
    status: LEAVE_STATUSES.APPROVED,
    reviewComment: 'Approved by marketing lead.'
  },

  // 2 Historical Approved Leaves in October
  {
    employeeCode: 'EMP-1012', // Priya Patel (ENG)
    leaveType: LEAVE_TYPES.SICK,
    startDate: '2026-10-20',
    endDate: '2026-10-21',
    totalDays: 2,
    reason: 'Seasonal viral flu and doctor recommended bed rest.',
    status: LEAVE_STATUSES.APPROVED,
    reviewComment: 'Medical certificate reviewed and verified.'
  },
  {
    employeeCode: 'EMP-1029', // Isabella Santos (FIN)
    leaveType: LEAVE_TYPES.CASUAL,
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    totalDays: 1,
    reason: 'Family appointment.',
    status: LEAVE_STATUSES.APPROVED,
    reviewComment: 'Approved.'
  },

  // 2 Rejected Leaves (Demonstrates complete workflow history)
  {
    employeeCode: 'EMP-1016', // Aisha Bello (ENG)
    leaveType: LEAVE_TYPES.ANNUAL,
    startDate: '2026-10-28',
    endDate: '2026-10-30',
    totalDays: 3,
    reason: 'Vacation request.',
    status: LEAVE_STATUSES.REJECTED,
    reviewComment: 'Sprint release cutoff week; kindly reschedule for following cycle.'
  },
  {
    employeeCode: 'EMP-1026', // Elena Rostova (OPS)
    leaveType: LEAVE_TYPES.CASUAL,
    startDate: '2026-10-27',
    endDate: '2026-10-27',
    totalDays: 1,
    reason: 'Personal day.',
    status: LEAVE_STATUSES.REJECTED,
    reviewComment: 'Department inventory audit scheduled on this date.'
  }
];

/**
 * Main Idempotent Demo Seeder
 *
 * @param {Object} [options={}]
 * @param {boolean} [options.dryRun=false]
 * @param {boolean} [options.skipConnect=false]
 * @returns {Promise<Object>} Statistics summary
 */
export async function seedDemoData(options = {}) {
  const cliArgs = parseCliArgs();
  const dryRun = options.dryRun !== undefined ? options.dryRun : cliArgs.dryRun;

  console.log('================================================================');
  console.log('  StaffSync HRMS — Idempotent Demo Dataset Provisioning Engine');
  console.log(`  Mode: ${dryRun ? '🔍 DRY RUN (Simulation Only)' : '⚡ LIVE RESTORATION & SYNC'}`);
  console.log('================================================================');

  if (!options.skipConnect && mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const dbName = mongoose.connection.name || 'staffsync';
  console.log(`Connected to MongoDB Atlas database: "${dbName}"\n`);

  const stats = {
    departments: { existing: 0, created: 0 },
    users: { existing: 0, created: 0 },
    employees: { existing: 0, created: 0 },
    leaveBalances: { existing: 0, created: 0 },
    leaveRequests: { existing: 0, created: 0 },
    attendances: { existing: 0, created: 0 }
  };

  const defaultPassword = 'StaffSyncDemo2026!';
  const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10);

  // -------------------------------------------------------------
  // STEP 1: DEPARTMENTS
  // -------------------------------------------------------------
  console.log('--- Step 1: Departments Synchronization ---');
  const departmentMap = new Map(); // code -> doc

  for (const deptData of DEMO_DEPARTMENTS) {
    let existing = await Department.findOne({ code: deptData.code });
    if (existing) {
      stats.departments.existing++;
      departmentMap.set(deptData.code, existing);
    } else {
      stats.departments.created++;
      if (!dryRun) {
        existing = await Department.create({
          name: deptData.name,
          code: deptData.code,
          description: deptData.description,
          isActive: true
        });
      } else {
        existing = { _id: new mongoose.Types.ObjectId(), ...deptData };
      }
      departmentMap.set(deptData.code, existing);
    }
  }

  // Also cache any other pre-existing departments in Atlas
  const allDepts = await Department.find();
  for (const d of allDepts) {
    if (!departmentMap.has(d.code)) {
      departmentMap.set(d.code, d);
    }
  }

  console.log(`Departments: ${stats.departments.existing} reused/found, ${stats.departments.created} missing to insert.`);

  // -------------------------------------------------------------
  // STEP 2: USERS & EMPLOYEES
  // -------------------------------------------------------------
  console.log('\n--- Step 2: Users & Personnel Profiles Synchronization ---');
  const userMap = new Map(); // email -> user doc
  const employeeMap = new Map(); // employeeCode -> emp doc

  for (const empData of DEMO_EMPLOYEES) {
    const email = empData.email.toLowerCase();
    let user = await User.findOne({ email });

    if (user) {
      stats.users.existing++;
      userMap.set(email, user);
    } else {
      stats.users.created++;
      if (!dryRun) {
        user = await User.create({
          name: `${empData.firstName} ${empData.lastName}`,
          email,
          password: defaultPassword, // Pre-save hook hashes with bcrypt
          role: empData.role || USER_ROLES.EMPLOYEE,
          isActive: empData.status === EMPLOYEE_STATUSES.ACTIVE
        });
      } else {
        user = { _id: new mongoose.Types.ObjectId(), email, role: empData.role };
      }
      userMap.set(email, user);
    }

    const deptDoc = departmentMap.get(empData.departmentCode);
    if (!deptDoc) {
      throw new Error(`Department with code "${empData.departmentCode}" could not be resolved for employee ${empData.employeeCode}.`);
    }

    let employee = await Employee.findOne({ employeeCode: empData.employeeCode });

    if (employee) {
      stats.employees.existing++;
      employeeMap.set(empData.employeeCode, employee);
    } else {
      stats.employees.created++;
      if (!dryRun) {
        employee = await Employee.create({
          userId: user._id,
          employeeCode: empData.employeeCode,
          firstName: empData.firstName,
          lastName: empData.lastName,
          phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: deptDoc._id,
          designation: empData.designation,
          dateOfJoining: new Date(empData.dateOfJoining || '2025-01-15'),
          employmentType: empData.employmentType || EMPLOYMENT_TYPES.FULL_TIME,
          status: empData.status || EMPLOYEE_STATUSES.ACTIVE,
          address: {
            street: '100 Innovation Way',
            city: 'Metro City',
            state: 'CA',
            zipCode: '94016',
            country: 'USA'
          },
          emergencyContact: {
            name: `${empData.firstName} Contact`,
            relationship: 'Family',
            phone: '+1 (555) 000-1111'
          }
        });
      } else {
        employee = { _id: new mongoose.Types.ObjectId(), employeeCode: empData.employeeCode, ...empData };
      }
      employeeMap.set(empData.employeeCode, employee);
    }
  }

  // Also cache any pre-existing employees in Atlas (e.g. Sarah Connor EMP-1005, StaffSync Admin EMP-70EB)
  const allExistingEmps = await Employee.find();
  for (const emp of allExistingEmps) {
    if (!employeeMap.has(emp.employeeCode)) {
      employeeMap.set(emp.employeeCode, emp);
    }
  }

  console.log(`Users: ${stats.users.existing} reused, ${stats.users.created} missing to insert.`);
  console.log(`Employees: ${stats.employees.existing} reused, ${stats.employees.created} missing to insert.`);

  // -------------------------------------------------------------
  // STEP 3: ESTABLISH REPORTING MANAGERS & DEPARTMENT HEADS
  // -------------------------------------------------------------
  console.log('\n--- Step 3: Organizational Hierarchy & Leadership Links ---');
  if (!dryRun) {
    // Link department managers
    for (const deptData of DEMO_DEPARTMENTS) {
      if (deptData.managerEmail) {
        const mgrUser = userMap.get(deptData.managerEmail.toLowerCase());
        if (mgrUser) {
          const mgrEmp = await Employee.findOne({ userId: mgrUser._id });
          if (mgrEmp) {
            await Department.updateOne(
              { code: deptData.code },
              { $set: { managerId: mgrEmp._id } }
            );
          }
        }
      }
    }

    // Link employee reporting managers
    for (const empData of DEMO_EMPLOYEES) {
      if (empData.managerEmail) {
        const mgrUser = userMap.get(empData.managerEmail.toLowerCase());
        if (mgrUser) {
          const mgrEmp = await Employee.findOne({ userId: mgrUser._id });
          if (mgrEmp) {
            await Employee.updateOne(
              { employeeCode: empData.employeeCode },
              { $set: { managerId: mgrEmp._id } }
            );
          }
        }
      }
    }
    console.log('Department leadership and reporting manager relationships established.');
  } else {
    console.log('[DRY RUN] Would link 6 department managers and employee reporting structures.');
  }

  // -------------------------------------------------------------
  // STEP 4: LEAVE BALANCES FOR YEAR 2026
  // -------------------------------------------------------------
  console.log('\n--- Step 4: Leave Balances Initialization ---');
  for (const [, emp] of employeeMap.entries()) {
    let balance = await LeaveBalance.findOne({ employeeId: emp._id, year: 2026 });
    if (balance) {
      stats.leaveBalances.existing++;
    } else {
      stats.leaveBalances.created++;
      if (!dryRun) {
        await LeaveBalance.create({
          employeeId: emp._id,
          year: 2026,
          annual: { quota: 15, used: 0 },
          casual: { quota: 10, used: 0 },
          sick: { quota: 10, used: 0 }
        });
      }
    }
  }
  console.log(`Leave Balances: ${stats.leaveBalances.existing} found, ${stats.leaveBalances.created} missing to create.`);

  // -------------------------------------------------------------
  // STEP 5: LEAVE REQUESTS
  // -------------------------------------------------------------
  console.log('\n--- Step 5: Leave Applications Synchronization ---');
  for (const template of DEMO_LEAVE_TEMPLATES) {
    const emp = employeeMap.get(template.employeeCode);
    if (!emp) continue;

    const startDate = normalizeDate(template.startDate);
    const endDate = normalizeDate(template.endDate);

    let existing = await LeaveRequest.findOne({
      employeeId: emp._id,
      startDate,
      leaveType: template.leaveType
    });

    if (existing) {
      stats.leaveRequests.existing++;
    } else {
      stats.leaveRequests.created++;
      if (!dryRun) {
        let reviewerUser = null;
        if (template.status !== LEAVE_STATUSES.PENDING) {
          reviewerUser = await User.findOne({ role: USER_ROLES.HR_ADMIN });
        }

        await LeaveRequest.create({
          employeeId: emp._id,
          leaveType: template.leaveType,
          startDate,
          endDate,
          totalDays: template.totalDays,
          reason: template.reason,
          status: template.status,
          reviewComment: template.reviewComment,
          reviewedBy: reviewerUser ? reviewerUser._id : undefined,
          reviewedAt: template.status !== LEAVE_STATUSES.PENDING ? new Date() : undefined
        });
      }
    }
  }
  console.log(`Leave Requests: ${stats.leaveRequests.existing} found, ${stats.leaveRequests.created} missing to insert.`);

  // -------------------------------------------------------------
  // STEP 6: ATTENDANCE RECORDS (Past dates & Today)
  // -------------------------------------------------------------
  console.log('\n--- Step 6: Attendance Logs & Real-Time Presence ---');

  // We seed attendance for:
  // - 2026-10-28 (Historical completed shifts)
  // - 2026-10-29 (Historical completed shifts)
  // - 2026-10-30 (Today: 16 completed shifts, 8 active on floor, 4 late, 1 half-day, 2 on leave, 8 absent)

  const activeEmployeesList = Array.from(employeeMap.values()).filter(
    (e) => e.status === EMPLOYEE_STATUSES.ACTIVE
  );

  const datesToSeed = ['2026-10-28', '2026-10-29', '2026-10-30'];

  for (const dateStr of datesToSeed) {
    const normDate = normalizeDate(dateStr);
    const isToday = dateStr === '2026-10-30';

    for (let i = 0; i < activeEmployeesList.length; i++) {
      const emp = activeEmployeesList[i];

      // On leave employees check: Lucas Silva (EMP-1015) and Tariq Mansour (EMP-1023) on 2026-10-30
      if (isToday && (emp.employeeCode === 'EMP-1015' || emp.employeeCode === 'EMP-1023')) {
        continue; // On authorized leave today, no punch record
      }

      // Preserve unpunched absent group (e.g. last 8 employees in list)
      if (isToday && i >= 24) {
        continue; // Unclocked / pending shift arrivals
      }

      // Check if attendance already exists
      const existing = await Attendance.findOne({ employeeId: emp._id, date: normDate });
      if (existing) {
        stats.attendances.existing++;
        continue;
      }

      stats.attendances.created++;
      if (dryRun) continue;

      let status = ATTENDANCE_STATUSES.PRESENT;
      let inHour = 9;
      let inMinute = 0;
      let outHour = 17;
      let outMinute = 30;
      let isStillWorking = false;

      // Realistic variation
      if (i % 6 === 0) {
        // Late arrival
        status = ATTENDANCE_STATUSES.LATE;
        inHour = 9;
        inMinute = 40 + (i % 15);
      } else if (i === 7) {
        // Half day
        status = ATTENDANCE_STATUSES.HALF_DAY;
        outHour = 13;
        outMinute = 0;
      }

      if (isToday && i >= 16) {
        // Currently active on floor (checked in today, not yet checked out)
        isStillWorking = true;
      }

      const checkInTime = new Date(normDate.getTime() + (inHour * 3600 + inMinute * 60) * 1000);
      const checkOutTime = isStillWorking
        ? null
        : new Date(normDate.getTime() + (outHour * 3600 + outMinute * 60) * 1000);

      const totalHours = checkOutTime
        ? parseFloat(((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 3600)).toFixed(2))
        : 0;

      await Attendance.create({
        employeeId: emp._id,
        date: normDate,
        checkInTime,
        checkOutTime,
        totalHours,
        status,
        notes: isStillWorking ? 'Currently active on floor' : 'Shift logged successfully'
      });
    }
  }

  console.log(`Attendance Records: ${stats.attendances.existing} found, ${stats.attendances.created} missing to insert.`);

  console.log('\n================================================================');
  console.log('  Demo Data Provisioning Complete');
  console.log(`  Target Database: ${dbName}`);
  console.log(`  Departments:     ${stats.departments.existing + stats.departments.created} total`);
  console.log(`  Employees:       ${stats.employees.existing + stats.employees.created} total (${Array.from(employeeMap.values()).filter(e => e.status === EMPLOYEE_STATUSES.ACTIVE).length} Active)`);
  console.log(`  Leave Requests:  ${stats.leaveRequests.existing + stats.leaveRequests.created} total`);
  console.log(`  Attendance Logs: ${stats.attendances.existing + stats.attendances.created} total`);
  console.log('================================================================\n');

  if (!options.skipConnect) {
    await mongoose.disconnect();
  }

  return stats;
}

// Execute standalone CLI invocation
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err.message);
      process.exit(1);
    });
}
