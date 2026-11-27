import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";

import { Icons } from "@/lib/icons";
import { api } from "@/api/client";
import { clearSessionToken } from "@/lib/api";
import Ideas from "@/screens/Ideas";
import Login from "@/screens/Login";
import Register from "@/screens/Register";
import Admin from "@/screens/Admin";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2 rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

// The app's menu, drawn around every screen except the ones routed outside it below.
function AppShellLayout() {
  const navigate = useNavigate();

  // AC-013 / NFR-003: logging out revokes the session token server-side, then clears
  // it from this device either way, so the user can no longer perform actions that
  // require login without logging in again.
  async function handleLogout() {
    try {
      await api.POST("/auth/logout");
    } catch {
      // The session is still cleared locally below: a failed call to the server
      // must not leave the user looking logged in on their own device.
    }
    clearSessionToken();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div className="flex items-center gap-6 px-6 py-2">
          <p
            className="shrink-0 text-sm font-semibold"
            style={{ fontFamily: "var(--brand-font-heading)" }}
          >
            {"Idea Board"}
          </p>
          <nav aria-label="App menu" className="flex flex-wrap items-center gap-1">
            <NavLink to="/ideas" className={navLinkClass}>
              <Icons.Home size={16} />
              {"Ideas"}
            </NavLink>
            <NavLink to="/admin" className={navLinkClass}>
              <Icons.Settings size={16} />
              {"Admin"}
            </NavLink>
            <button
              type="button"
              data-testid="log-out-btn"
              onClick={handleLogout}
              className={navLinkClass({ isActive: false })}
            >
              <Icons.User size={16} />
              {"Log out"}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/ideas" replace />} />
    </Routes>
  );
}
