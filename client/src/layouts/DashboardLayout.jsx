import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import Footer from '../components/layout/Footer.jsx';

export const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsMobileOpen((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="d-flex flex-grow-1">
        {/* Role-scoped Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-grow-1 p-3 p-md-4"
          style={{ minWidth: 0 }}
        >
          <div className="container-fluid p-0" style={{ maxWidth: '1400px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;

