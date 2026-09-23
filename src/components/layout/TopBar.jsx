import { useNavigate } from "react-router-dom";

import { useApp } from "../../context/useApp";
import { getProfileInitials } from "../../utils/profile";

import "../components-css/TopBar.css";

const TopBar = () => {
  const navigate = useNavigate();
  const { settings } = useApp();

  const profileInitials = getProfileInitials(settings.profile?.name);

  return (
    <header className="top-bar">
      <div className="brand">
        <div className="brand-icon">R</div>
        <span>Reepin</span>
      </div>

      <div className="top-bar-actions">
        <button
          type="button"
          className="profile-button"
          aria-label="Open settings"
          onClick={() => navigate("/settings")}
        >
          {profileInitials}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
