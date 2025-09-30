import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faStore,
  faUsers,
  faBullhorn,
  faUserCircle,
  faBars,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/layout.css";

import logo from "../assets/img/logo.png";

function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Config menu
  const menus = {
    admin: [
      { to: "/", icon: faTachometerAlt, label: "Dashboard" },
      { to: "/store-map", icon: faMapMarkedAlt, label: "Store Map" },
      { to: "/stores", icon: faStore, label: "Stores" },
      { to: "/users", icon: faUsers, label: "Users" },
      { to: "/staffs", icon: faUsers, label: "Staffs" },
      { to: "/campaigns", icon: faBullhorn, label: "Campaigns" },
    ],
    staff: [
      { to: "/", icon: faTachometerAlt, label: "Dashboard" },
      { to: "/store-map", icon: faMapMarkedAlt, label: "Store Map" },
    ],
  };

  // Xác định navLinks theo role
  const role = user?.role;
  let navLinks = [];
  if (role === "admin") {
    navLinks = menus.admin;
  } else if (role === "staff" || role === "parttime") {
    navLinks = menus.staff;
  }

  return (
    <div className={`layout-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" />
          <h2>My Dashboard</h2>
        </div>

        <ul className="sidebar-menu">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeSidebar}
              >
                <FontAwesomeIcon icon={link.icon} className="icon" />
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
            <span>Hi, {user?.full_name || "Guest"}</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar (mobile) */}
        <div className="topbar mobile-only">
          <button className="btn-toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="topbar-actions">
            <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
            <span>Hi, {user?.full_name || "Guest"}</span>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {/* Page Body */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
