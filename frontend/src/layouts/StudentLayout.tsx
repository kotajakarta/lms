import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import {
  LayoutGrid,
  BookOpen,
  User,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";

export const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const studentName = user?.nama || "Anna";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/siswa/analitik",
      icon: <LayoutGrid size={18} />,
      isActive:
        location.pathname === "/siswa/analitik" ||
        location.pathname === "/siswa" ||
        location.pathname === "/siswa/",
    },
    {
      label: "Courses",
      path: "/siswa/dashboard",
      icon: <BookOpen size={18} />,
      isActive:
        location.pathname === "/siswa/dashboard" ||
        location.pathname === "/siswa/dashboard/",
    },
    {
      label: "Library",
      path: "/siswa/library",
      icon: <User size={18} />,
      isActive: location.pathname === "/siswa/library",
    },
    {
      label: "Messages",
      path: "/siswa/diskusi",
      icon: <MessageSquare size={18} />,
      badge: "8",
      isActive: location.pathname === "/siswa/diskusi",
    },
    // {
    //   label: "Analytics",
    //   path: "/siswa/analitik",
    //   icon: <BarChart2 size={18} />,
    //   isActive: false,
    // },
    // {
    //   label: "Payments",
    //   path: "/siswa/library",
    //   icon: <CreditCard size={18} />,
    //   isActive: false,
    // },
  ];

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-100 flex flex-col xl:flex-row p-3 sm:p-4 lg:p-5 gap-4 lg:gap-5 text-slate-900 font-sans select-none">
      {/* Left Dark Enterprise Sidebar with rounded corners on all sides */}
      <aside className="w-full xl:w-[220px] 2xl:w-[230px] h-full max-h-full bg-slate-900 text-slate-100 rounded-[24px] sm:rounded-[28px] flex flex-col justify-between p-5 sm:p-6 shrink-0 z-20 shadow-xl border border-slate-800 overflow-hidden">
        <div>
          {/* Logo Skillzone with Enterprise Cobalt Accent */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 flex items-center justify-center text-blue-400 shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              skillzone
            </span>
          </div>

          {/* Navigation links */}
          <nav className="flex xl:flex-col gap-1.5 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 hide-scrollbar">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-900/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={item.isActive ? "text-white" : "text-slate-400"}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Settings and Support */}
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-1 mt-6 xl:mt-0">
          <button
            type="button"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all text-left"
          >
            <HelpCircle size={18} />
            <span>Support</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all w-full text-left"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs text-slate-800">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">
                    {studentName}
                  </p>
                  <p className="text-slate-500 text-[10px] truncate">
                    {user?.email || "student@lms.com"}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition font-medium flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Content Outlet Area */}
      <div className="flex-1 h-full max-h-full flex flex-col overflow-y-auto rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white shadow-xs hide-scrollbar">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
