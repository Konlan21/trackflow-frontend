import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Budgets from "./Pages/Budgets/Budgets";
import Goals from "./Pages/Goals/Goals";
import Analytics from "./Pages/Analytics/Analytics";
import AIChat from "./Pages/AIChat/AIChat";
import Profile from "./Pages/Profile/Profile";
import {
  LayoutDashboard,
  Wallet,
  Target,
  BarChart3,
  Bot,
  User,
  LogOut,
  Sparkles,
  X
} from "lucide-react";

// --- SIDEBAR COMPONENT ---
interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
}

function Sidebar({ mobileOpen, setMobileOpen, collapsed }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Budgets", href: "/budgets", icon: Wallet },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "AI Advisor", href: "/ai-chat", icon: Bot, badge: "AI" },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 h-screen bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-64"} w-64 shrink-0`}
      >
        <div
          className={`flex items-center h-16 border-b border-slate-800 shrink-0 transition-all ${
            collapsed ? "lg:justify-center px-4" : "justify-between px-6"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">
                TrackFlow
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                title={collapsed ? item.name : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  collapsed ? "lg:justify-center px-2" : "px-3.5"
                } ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                {!collapsed && <span className="flex-1 whitespace-nowrap">{item.name}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 shrink-0">
          <button
            onClick={logout}
            title={collapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors ${
              collapsed ? "lg:justify-center px-2" : "px-3.5"
            }`}
            type="button"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// --- PROTECTED LAYOUT WRAPPER ---
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex w-full antialiased">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="flex-1 w-full p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

// --- MAIN APP ROUTER ---
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedLayout>
                <Budgets />
              </ProtectedLayout>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedLayout>
                <Goals />
              </ProtectedLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedLayout>
                <Analytics />
              </ProtectedLayout>
            }
          />
          <Route
            path="/ai-chat"
            element={
              <ProtectedLayout>
                <AIChat />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}