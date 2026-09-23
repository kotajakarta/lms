import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MessageSquare,
  Calendar,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { LanguageSwitcher } from './LanguageSwitcher.js';

export const StudentTopNavbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to library or discussion search
    navigate(`/siswa/library?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Resolve dynamic breadcrumb / page context
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/siswa/analitik')) {
      return {
        badge: 'Studio Arsitektur 04',
        title: t('nav.analytics'),
        isLive: true,
      };
    }
    if (path.startsWith('/siswa/dashboard')) {
      return {
        badge: 'Kurikulum & Silabus',
        title: t('nav.syllabus'),
        isLive: false,
      };
    }
    if (path.startsWith('/siswa/library')) {
      return {
        badge: 'Vault Digital',
        title: t('nav.library'),
        isLive: false,
      };
    }
    if (path.startsWith('/siswa/diskusi')) {
      return {
        badge: 'Forum Komunitas',
        title: t('nav.messages'),
        isLive: true,
      };
    }
    if (path.startsWith('/siswa/calendar')) {
      return {
        badge: 'Jadwal Kelas',
        title: t('nav.calendar'),
        isLive: false,
      };
    }
    if (path.startsWith('/siswa/profile')) {
      return {
        badge: 'Akun Pengguna',
        title: t('student_profile.title', 'Profil & Keamanan'),
        isLive: false,
      };
    }
    return {
      badge: 'Portal Siswa',
      title: 'Skillzone LMS',
      isLive: false,
    };
  };

  const pageInfo = getPageInfo();

  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  return (
    <header className="h-16 w-full px-4 sm:px-6 flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-stone-200/80 shrink-0 z-30 select-none">
      {/* Left: Dynamic Cohort / Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          {pageInfo.isLive && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary truncate max-w-[140px] sm:max-w-none">
            {pageInfo.badge}
          </span>
        </div>
        <span className="text-stone-300 hidden sm:inline">/</span>
        <span className="text-xs font-semibold text-on-surface truncate hidden sm:inline">
          {pageInfo.title}
        </span>
      </div>

      {/* Right: Quick Search, Language Switcher, Action Shortcuts & Interactive User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Input */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, silabus..."
              className="h-8.5 w-44 lg:w-56 pl-8.5 pr-3 text-xs bg-surface-container-low rounded-full border border-stone-200/80 text-on-surface placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary transition-all"
            />
          </div>
        </form>

        {/* Quick Navigation Icons */}
        <div className="flex items-center gap-1">
          <Link
            to="/siswa/diskusi"
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-stone-500 hover:text-on-surface hover:bg-stone-100 transition-colors"
            title={t('nav.messages')}
          >
            <MessageSquare size={16} />
          </Link>
          <Link
            to="/siswa/calendar"
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-stone-500 hover:text-on-surface hover:bg-stone-100 transition-colors"
            title={t('nav.calendar')}
          >
            <Calendar size={16} />
          </Link>
        </div>

        {/* Language Switcher */}
        <div className="hidden sm:block">
          <LanguageSwitcher variant="light" />
        </div>

        {/* User Profile Button with Floating Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              isDropdownOpen
                ? 'bg-stone-100 border-stone-300 shadow-xs ring-2 ring-secondary/20'
                : 'bg-surface-container-low hover:bg-stone-100 border-stone-200/80 shadow-2xs'
            }`}
          >
            {/* Avatar Pill */}
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px] font-bold shadow-xs shrink-0">
              {getInitials(user?.nama)}
            </div>

            {/* User Name & Chevron */}
            <div className="hidden sm:flex flex-col text-left max-w-[110px] lg:max-w-[140px]">
              <span className="text-xs font-semibold text-on-surface truncate leading-tight">
                {user?.nama || 'Siswa'}
              </span>
              <span className="text-[10px] text-stone-400 capitalize truncate leading-tight">
                {user?.role || 'Siswa'}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`text-stone-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-on-surface' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200/90 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {getInitials(user?.nama)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-on-surface truncate">
                    {user?.nama || 'Siswa'}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">
                    {user?.email || 'siswa@lms.com'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-secondary-container text-secondary">
                      {user?.role || 'Siswa'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                      <Sparkles size={10} />
                      Aktif
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/siswa/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-on-surface hover:bg-stone-50 transition-colors font-medium cursor-pointer"
                >
                  <User size={15} className="text-secondary shrink-0" />
                  <div className="flex flex-col">
                    <span>{t('student_profile.tab_profile', 'Profil Saya')}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      Detail identitas & informasi akun
                    </span>
                  </div>
                </Link>

                <Link
                  to="/siswa/profile?tab=security"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-on-surface hover:bg-stone-50 transition-colors font-medium cursor-pointer"
                >
                  <KeyRound size={15} className="text-amber-600 shrink-0" />
                  <div className="flex flex-col">
                    <span>{t('student_profile.password_title', 'Ganti Kata Sandi')}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      Reset & kelola keamanan sandi
                    </span>
                  </div>
                </Link>

                <Link
                  to="/siswa/diskusi"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-on-surface hover:bg-stone-50 transition-colors font-medium cursor-pointer"
                >
                  <MessageSquare size={15} className="text-blue-600 shrink-0" />
                  <div className="flex flex-col">
                    <span>Forum & Konsultasi</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      Tanya pengajar & rekan kelas
                    </span>
                  </div>
                </Link>
              </div>

              {/* Logout Action */}
              <div className="pt-1.5 mt-1 border-t border-stone-100 px-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span>{t('common.logout', 'Keluar dari Akun')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentTopNavbar;
