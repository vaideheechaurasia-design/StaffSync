import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Route Guards
import ProtectedRoute from './components/guards/ProtectedRoute.jsx';

// Pages
import LandingPage from './pages/landing/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import UnauthorizedPage from './pages/auth/UnauthorizedPage.jsx';
import NotFoundPage from './pages/notFound/NotFoundPage.jsx';

// Dashboards
import DashboardRouter from './pages/dashboard/DashboardRouter.jsx';
import HRDashboard from './pages/dashboard/HRDashboard.jsx';
import ManagerDashboard from './pages/dashboard/ManagerDashboard.jsx';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard.jsx';

// Feature Modules
import EmployeeDirectory from './pages/employees/EmployeeDirectory.jsx';
import EmployeeProfile from './pages/employees/EmployeeProfile.jsx';
import CreateEmployee from './pages/employees/CreateEmployee.jsx';
import DepartmentList from './pages/departments/DepartmentList.jsx';

// Attendance
import AttendanceLog from './pages/attendance/AttendanceLog.jsx';
import TeamAttendance from './pages/attendance/TeamAttendance.jsx';
import AdminAttendance from './pages/attendance/AdminAttendance.jsx';

// Leaves
import LeaveCenter from './pages/leaves/LeaveCenter.jsx';
import ApplyLeave from './pages/leaves/ApplyLeave.jsx';
import LeaveApprovals from './pages/leaves/LeaveApprovals.jsx';

// Announcements & Training
import AnnouncementFeed from './pages/announcements/AnnouncementFeed.jsx';
import ManageAnnouncements from './pages/announcements/ManageAnnouncements.jsx';
import TrainingCatalog from './pages/training/TrainingCatalog.jsx';
import ManageTraining from './pages/training/ManageTraining.jsx';

// Operations
import NotificationsCenter from './pages/notifications/NotificationsCenter.jsx';
import HRReports from './pages/reports/HRReports.jsx';
import ProfileSettings from './pages/profile/ProfileSettings.jsx';

export const App = () => {
  return (
    <Routes>
      {/* 1. Public Marketing Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* 2. Unauthenticated Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* 3. Authenticated Application Shell Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Smart Role-Based Router */}
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Dedicated Role Dashboards */}
        <Route
          path="/dashboard/hr"
          element={
            <ProtectedRoute allowedRoles={['HR_ADMIN']}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/employee" element={<EmployeeDashboard />} />

        {/* Employees Module */}
        <Route path="/employees" element={<EmployeeDirectory />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route
          path="/employees/create"
          element={
            <ProtectedRoute allowedRoles={['HR_ADMIN']}>
              <CreateEmployee />
            </ProtectedRoute>
          }
        />

        {/* Departments Module */}
        <Route path="/departments" element={<DepartmentList />} />

        {/* Attendance Module */}
        <Route path="/attendance" element={<AttendanceLog />} />
        <Route
          path="/attendance/team"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <TeamAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/admin"
          element={
            <ProtectedRoute allowedRoles={['HR_ADMIN']}>
              <AdminAttendance />
            </ProtectedRoute>
          }
        />

        {/* Leaves Module */}
        <Route path="/leaves" element={<LeaveCenter />} />
        <Route path="/leaves/apply" element={<ApplyLeave />} />
        <Route
          path="/leaves/approvals"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <LeaveApprovals />
            </ProtectedRoute>
          }
        />

        {/* Announcements Module */}
        <Route path="/announcements" element={<AnnouncementFeed />} />
        <Route
          path="/announcements/manage"
          element={
            <ProtectedRoute allowedRoles={['HR_ADMIN']}>
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />

        {/* Training Module */}
        <Route path="/training" element={<TrainingCatalog />} />
        <Route
          path="/training/manage"
          element={
            <ProtectedRoute allowedRoles={['HR_ADMIN']}>
              <ManageTraining />
            </ProtectedRoute>
          }
        />

        {/* Miscellaneous Operations */}
        <Route path="/notifications" element={<NotificationsCenter />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['HR_ADMIN']}>
              <HRReports />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfileSettings />} />

        {/* Access Restriction Screen */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 404 Fallback within shell */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;

