import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Building2, FileText, LayoutDashboard, LogOut, Menu, ShieldCheck, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

const navItems = [
  { path: '/admin/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { path: '/admin/courses', label: 'Kursus', icon: BookOpen },
  { path: '/admin/materials', label: 'Materi', icon: FileText },
  { path: '/admin/users', label: 'Pengguna', icon: Users },
  { path: '/admin/master-data', label: 'Master organisasi', icon: Building2 },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#b7aec9] p-2 text-on-surface sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[92vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-[36px] border border-white/60 bg-[#fcf9f3] shadow-2xl sm:rounded-[42px] xl:flex-row">
        <aside className="z-40 flex w-full shrink-0 items-center justify-between border-b border-stone-200/60 bg-[#f6f3ed]/80 px-4 py-3 shadow-sm backdrop-blur-xl xl:w-20 xl:flex-col xl:border-b-0 xl:border-r xl:px-0 xl:py-6">
          <Link to="/admin/dashboard" className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/40 bg-white text-zinc-800 shadow-sm transition-transform hover:rotate-12" title="Admin Workspace"><ShieldCheck size={22} /></Link>
          <nav className="flex items-center gap-2 xl:flex-col xl:gap-3">{navItems.filter(({ path }) => user?.role !== 'instruktur' || path === '/admin/courses').map(({ path, label, icon: Icon }) => { const active = location.pathname === path; return <Link key={path} to={path} onClick={() => setMobileOpen(false)} title={label} className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${active ? 'scale-105 bg-[#1c1d22] text-white shadow-lg shadow-black/15' : 'text-zinc-600 hover:bg-black/5 hover:text-zinc-900'}`}><Icon size={20} /></Link>; })}</nav>
          <div className="flex items-center gap-3 xl:flex-col xl:gap-4"><button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition hover:bg-black/5 hover:text-zinc-900" title="Keluar"><LogOut size={19} /></button><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efb8a9] font-bold text-[#512b2a]" title={user?.nama || 'Administrator'}>{user?.nama?.charAt(0).toUpperCase() || 'A'}</span></div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="absolute right-4 top-4 hidden rounded-lg p-2 text-zinc-600" aria-label="Buka menu"><Menu size={20} /></button>
        </aside>
        <div className="flex max-h-[92vh] min-w-0 flex-1 flex-col overflow-y-auto">
          <header className="flex items-center justify-between px-5 pb-2 pt-6 sm:px-8 sm:pt-8"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#77767b]">UZDEM · Admin studio</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">Administrasi LMS</h1></div><div className="hidden items-center gap-2 text-right sm:flex"><div><p className="text-sm font-bold text-zinc-900">{user?.nama || 'Administrator'}</p><p className="text-xs capitalize text-stone-500">{user?.role || 'admin'} workspace</p></div><BarChart3 className="text-[#615a77]" size={23} /></div></header>
          <main className="p-5 sm:p-8"><Outlet /></main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
