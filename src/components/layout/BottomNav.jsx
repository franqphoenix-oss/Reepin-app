import { useLocation, useNavigate } from "react-router-dom";

import "../components-css/BottomNav.css";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: "Home",
      icon: "⌂",
      path: "/dashboard",
    },
    {
      label: "Orders",
      icon: "▣",
      path: "/orders",
    },
    {
      label: "Follow-ups",
      icon: "◷",
      path: "/follow-ups",
    },
    {
      label: "Customers",
      icon: "♙",
      path: "/customers",
    },
    {
      label: "Settings",
      icon: "⚙",
      path: "/settings",
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
