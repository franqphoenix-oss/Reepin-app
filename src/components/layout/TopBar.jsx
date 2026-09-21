import "../components-css/TopBar.css";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <header className="top-bar">
      <div className="brand">
        <div className="brand-icon">R</div>
        <span>Reepin</span>
      </div>

      <div className="top-bar-actions">
        <button className="icon-button" aria-label="Notifications">
          ♧
        </button>

        <button
          className="profile-button"
          aria-label="Profile"
          onClick={() => navigate("/settings")}
        >
          FP
        </button>
      </div>
    </header>
  );
};

export default TopBar;
