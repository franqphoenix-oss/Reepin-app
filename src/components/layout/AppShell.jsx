import { Outlet } from "react-router-dom";

import "../components-css/AppShell.css";

import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

function AppShell() {
  return (
    <div className="app-shell">
      <TopBar />

      <main className="app-content">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

export default AppShell;
