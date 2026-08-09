import { NavLink } from "react-router-dom";
import { Wallet, Sparkles, LogOut, LayoutDashboard, PiggyBank, Target, BarChart3, Bot, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai-chat", label: "AI Chat", icon: Bot },
];

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            TrackFlow
          </span>
          <span className="ml-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" /> AI Powered
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to="/profile"
            title="Profile"
            className={({ isActive }) =>
              `h-9 w-9 rounded-full flex items-center justify-center border border-slate-200 transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`
            }
          >
            <UserCircle className="h-5 w-5" />
          </NavLink>
          <button
            onClick={logout}
            title="Log out"
            className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}