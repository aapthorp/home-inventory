import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/items", label: "Items" },
  { to: "/locations", label: "Locations" },
  { to: "/categories", label: "Categories" },
  { to: "/collections", label: "Collections" },
  { to: "/settings", label: "Settings" },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-title">Home Inventory</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " sidebar-link-active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
