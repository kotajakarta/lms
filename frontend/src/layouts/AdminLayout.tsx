import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore.js";
import { LanguageSwitcher } from "../components/LanguageSwitcher.js";
import {
  LayoutGrid,
  BookOpen,
  FileText,
  Users,
  Building2,
  HelpCircle,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const adminName = user?.nama || "Administrator";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: t("nav.dashboard"),
      path: "/admin/dashboard",
      icon: <LayoutGrid size={18} />,
      isActive:
        location.pathname === "/admin/dashboard" ||
        location.pathname === "/admin" ||
        location.pathname === "/admin/",
    },
    {
      label: t("nav.courses"),
      path: "/admin/courses",
      icon: <BookOpen size={18} />,
      isActive: location.pathname.startsWith("/admin/courses"),
    },
    {
      label: t("nav.materials"),
      path: "/admin/materials",
      icon: <FileText size={18} />,
      isActive: location.pathname.startsWith("/admin/materials"),
    },
    {
      label: t("nav.users"),
      path: "/admin/users",
      icon: <Users size={18} />,
      isActive: location.pathname.startsWith("/admin/users"),
    },
    {
      label: t("nav.master_data"),
      path: "/admin/master-data",
      icon: <Building2 size={18} />,
      isActive: location.pathname.startsWith("/admin/master-data"),
    },
  ];

  const visibleNavItems = navItems.filter(
    ({ path }) => user?.role !== "instruktur" || path === "/admin/courses"
  );

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#ece8e1] flex flex-col xl:flex-row p-3 sm:p-4 lg:p-5 gap-4 lg:gap-5 text-slate-900 font-sans select-none">
      {/* Left Dark Enterprise Sidebar with rounded corners on all sides */}
      <aside className="w-full xl:w-[220px] 2xl:w-[230px] h-full max-h-full bg-[#18191e] text-stone-100 rounded-[24px] sm:rounded-[28px] flex flex-col justify-between p-5 sm:p-6 shrink-0 z-20 shadow-2xl border border-white/10 overflow-hidden">
        <div>
          {/* Logo Skillzone with Enterprise Cobalt Accent */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 flex items-center justify-center text-[#0052cc] shrink-0">
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
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                skillzone
              </span>
              <span className="rounded-md bg-white/10 border border-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#60a5fa]">
                Admin
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex xl:flex-col gap-1.5 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 hide-scrollbar">
            {visibleNavItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.isActive
                    ? "bg-[#0052cc] hover:bg-[#0047b3] text-white shadow-sm shadow-[#0052cc]/30 font-semibold"
                    : "text-stone-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={item.isActive ? "text-white" : "text-stone-400"}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Settings, Language, and Support */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2 mt-6 xl:mt-0">
          <LanguageSwitcher variant="dark" />

          <Link
            to="/siswa/dashboard"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all text-left"
            title="Lihat Tampilan Siswa"
          >
            <ShieldCheck size={18} />
            <span>Mode Siswa</span>
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all text-left"
          >
            <HelpCircle size={18} />
            <span>{t("common.support")}</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all w-full text-left"
            >
              <Settings size={18} />
              <span>{t("common.settings")}</span>
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs text-slate-800">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">
                    {adminName}
                  </p>
                  <p className="text-slate-500 text-[10px] truncate">
                    {user?.email || "admin@lms.com"}
                  </p>
                  <span className="inline-block mt-1 bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                    {user?.role || "admin"}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 text-[#f44336] hover:bg-[#f44336]/10 rounded-xl transition font-medium flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    {t("common.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Content Outlet Area */}
      <div className="flex-1 h-full max-h-full flex flex-col overflow-y-auto rounded-[24px] sm:rounded-[28px] border border-slate-200/90 bg-white shadow-xs hide-scrollbar">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-5 py-3.5 sm:px-8 sm:py-4 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0052cc]">
              Skillzone · Admin Studio
            </p>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Administrasi LMS
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900">{adminName}</p>
              <p className="text-[10px] uppercase font-semibold text-slate-400">
                {user?.role || "admin"} workspace
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0052cc] text-xs font-bold text-white shadow-sm ring-2 ring-slate-100">
              {(adminName || "A").slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50/50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
