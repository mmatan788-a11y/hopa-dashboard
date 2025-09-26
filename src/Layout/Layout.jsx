import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

const Layout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Add the routes where you don't want the sidebar (e.g. login, register)
  const hideSidebarRoutes = ["/", "/login", "/register"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className="flex h-screen">
      {!hideSidebar && (
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <Sidebar onToggle={handleSidebarToggle} onLogout={onLogout} />
        </div>
      )}

      <div
        className={`w-full flex flex-col transition-all duration-300 ${
          hideSidebar ? "" : sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;