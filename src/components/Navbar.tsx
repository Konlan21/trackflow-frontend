import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  PanelLeft,
  Bot,
  PlusCircle,
  Calendar,
  ChevronRight
} from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenModal?: () => void;
}

export default function Navbar({
  onMenuClick,
  collapsed,
  setCollapsed,
  onOpenModal
}: NavbarProps) {
  const location = useLocation();

  // Helper function to render breadcrumb labels
  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Dashboard";
      case "/budgets":
        return "Budgets";
      case "/goals":
        return "Goals";
      case "/analytics":
        return "Analytics";
      case "/ai-chat":
        return "AI Advisor";
      case "/profile":
        return "Profile Settings";
      default:
        return "Overview";
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      {/* LEFT: Sidebar Toggles & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden lg:flex p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors items-center"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block mx-1" />

        {/* Dynamic Page Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Platform</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* CENTER: Date/Period Context Filter */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100/80 border border-slate-200/60 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
        <span>This Month</span>
      </div>

      {/* RIGHT: Quick Action, AI Chat & Profile Link */}
      <div className="flex items-center gap-3">
        {/* Quick Add Entry Trigger (Optional) */}
        {onOpenModal && (
          <button
            onClick={onOpenModal}
            className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-200/60"
          >
            <PlusCircle className="h-4 w-4 text-indigo-600" />
            <span>New Entry</span>
          </button>
        )}

        {/* Top Header AI Chat Shortcut */}
        <Link
          to="/ai-chat"
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all hover:shadow-indigo-300"
        >
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">AI Chat</span>
        </Link>

        <div className="h-8 w-[1px] bg-slate-200 mx-1" />

        {/* Profile Link -> Navigates to /profile */}
        <Link
          to="/profile"
          title="Go to Profile"
          className="flex items-center gap-3 pl-1 p-1 rounded-xl hover:bg-slate-100 transition-colors group"
        >
          <div className="h-9 w-9 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            JD
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              John Doe
            </p>
            <p className="text-[11px] text-slate-400">Pro Member</p>
          </div>
        </Link>
      </div>
    </header>
  );
}