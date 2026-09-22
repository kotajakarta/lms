import React from 'react';
import { useQueries } from '@tanstack/react-query';
import { Activity, ArrowUpRight, Building2, GraduationCap, MapPinned, Users } from 'lucide-react';
import { api } from '../../services/api.js';

interface UsersResponse { data: Array<{ role: string; created_at?: string | null }>; meta: { total: number }; }
interface CountedItem { id: number; [key: string]: unknown; _count?: { users?: number; cabang?: number; course_departments?: number }; }

const fetchUsers = async () => (await api.get<UsersResponse>('/users?limit=100')).data;
const fetchMaster = async (resource: string) => (await api.get<CountedItem[]>(`/master/${resource}`)).data;

export const AdminDashboardPage: React.FC = () => {
  const results = useQueries({ queries: [
    { queryKey: ['admin', 'users'], queryFn: fetchUsers },
    { queryKey: ['admin', 'wilayah'], queryFn: () => fetchMaster('wilayah') },
    { queryKey: ['admin', 'cabang'], queryFn: () => fetchMaster('cabang') },
    { queryKey: ['admin', 'departments'], queryFn: () => fetchMaster('departments') },
  ] });
  const [users, wilayah, cabang, departments] = results.map((result) => result.data);
  const isLoading = results.some((result) => result.isLoading);
  const hasError = results.some((result) => result.isError);
  const totalUsers = (users as UsersResponse | undefined)?.meta.total ?? 0;
  const students = (users as UsersResponse | undefined)?.data.filter((item) => item.role === 'siswa').length ?? 0;
  const admins = totalUsers - students;

  const metrics = [
    { label: 'Total pengguna', value: totalUsers, detail: `${students} siswa terdaftar`, icon: Users, color: 'bg-[#dff0ee] text-[#27635e]' },
    { label: 'Pengelola sistem', value: admins, detail: 'Admin & superadmin', icon: Activity, color: 'bg-[#fce4dc] text-[#a34e3b]' },
    { label: 'Wilayah aktif', value: (wilayah as CountedItem[] | undefined)?.length ?? 0, detail: 'Area operasional', icon: MapPinned, color: 'bg-[#e6ddf5] text-[#69518d]' },
    { label: 'Cabang & jurusan', value: `${(cabang as CountedItem[] | undefined)?.length ?? 0} / ${(departments as CountedItem[] | undefined)?.length ?? 0}`, detail: 'Struktur organisasi', icon: Building2, color: 'bg-[#e8efc8] text-[#58701c]' },
  ];

  return <div className="mx-auto max-w-[1400px] space-y-8">
    <section className="relative overflow-hidden rounded-[28px] bg-[#173e3c] px-6 py-8 text-white shadow-xl shadow-[#173e3c]/10 sm:px-10 sm:py-10"><div className="relative z-10 max-w-2xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d5f36d]">Overview / 22 September 2026</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Selamat datang di ruang kendali.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#b9d2cd]">Pantau kesehatan organisasi, kelola akses pengguna, dan jaga struktur LMS tetap siap dipakai.</p></div><div className="absolute -right-8 -top-16 h-64 w-64 rounded-full border-[34px] border-[#d5f36d]/15" /><GraduationCap className="absolute bottom-8 right-10 hidden text-[#d5f36d]/80 sm:block" size={58} strokeWidth={1.5} /></section>

    {hasError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Sebagian data belum dapat dimuat. Periksa koneksi API atau hak akses admin.</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}><Icon size={21} /></span><ArrowUpRight size={17} className="text-slate-300" /></div><p className="mt-6 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{isLoading ? '...' : value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>)}</section>

    <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><article className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b8883]">Distribusi akses</p><h3 className="mt-2 text-xl font-bold">Peran pengguna</h3></div><Users className="text-[#2d6d65]" size={21} /></div><div className="mt-7 space-y-5">{['siswa', 'admin', 'superadmin'].map((role) => { const count = (users as UsersResponse | undefined)?.data.filter((item) => item.role === role).length ?? 0; const percent = totalUsers ? Math.round((count / totalUsers) * 100) : 0; return <div key={role}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold capitalize text-slate-700">{role}</span><span className="text-slate-500">{count} · {percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${role === 'siswa' ? 'bg-[#2d6d65]' : role === 'admin' ? 'bg-[#e9a18d]' : 'bg-[#b8a0da]'}`} style={{ width: `${percent}%` }} /></div></div>; })}</div></article><article className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b8883]">Struktur organisasi</p><h3 className="mt-2 text-xl font-bold">Kesiapan master data</h3><div className="mt-6 space-y-3">{(departments as CountedItem[] | undefined)?.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#f5f8f7] px-4 py-3"><span className="flex items-center gap-3 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-[#d5f36d]" />{String(item.nama_jurusan)}</span><span className="text-xs text-slate-500">{item._count?.users ?? 0} pengguna</span></div>)}</div>{!(departments as CountedItem[] | undefined)?.length && <p className="mt-6 text-sm text-slate-500">Belum ada department yang tersedia.</p>}</article></section>
  </div>;
};

export default AdminDashboardPage;
