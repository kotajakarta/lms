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
    {
      label: "Total pengguna",
      value: totalUsers,
      detail: `${students} siswa terdaftar`,
      icon: Users,
      color: "bg-[#0052cc]/10 text-[#0052cc]",
    },
    {
      label: "Pengelola sistem",
      value: admins,
      detail: "Admin & superadmin",
      icon: Activity,
      color: "bg-[#00bfff]/15 text-[#007acc]",
    },
    {
      label: "Wilayah aktif",
      value: (wilayah as CountedItem[] | undefined)?.length ?? 0,
      detail: "Area operasional",
      icon: MapPinned,
      color: "bg-[#4caf50]/15 text-[#2e7d32]",
    },
    {
      label: "Cabang & jurusan",
      value: `${(cabang as CountedItem[] | undefined)?.length ?? 0} / ${(departments as CountedItem[] | undefined)?.length ?? 0}`,
      detail: "Struktur organisasi",
      icon: Building2,
      color: "bg-[#ff9800]/15 text-[#e65100]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Enterprise Dark Welcome Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-slate-900 border border-slate-800 px-6 py-8 text-white shadow-xl isolate sm:px-10 sm:py-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,82,204,.35),transparent_50%),linear-gradient(135deg,#0f172a_10%,#1e293b_60%,#0f172a)] opacity-95 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00bfff]">
            Overview · Ruang Kendali
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Selamat datang di ruang kendali.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Pantau kesehatan organisasi, kelola akses pengguna, dan jaga struktur LMS tetap siap dipakai.
          </p>
        </div>
        <div className="absolute -right-8 -top-16 h-64 w-64 rounded-full border-[32px] border-[#0052cc]/15 pointer-events-none" />
        <GraduationCap
          className="absolute bottom-6 right-8 hidden text-[#0052cc]/40 sm:block pointer-events-none"
          size={58}
          strokeWidth={1.5}
        />
      </section>

      {hasError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Sebagian data belum dapat dimuat. Periksa koneksi API atau hak akses admin.
        </div>
      )}

      {/* Metrics Row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, color }) => (
          <article
            key={label}
            className="rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}
              >
                <Icon size={20} />
              </span>
              <ArrowUpRight size={17} className="text-slate-300" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {isLoading ? "..." : value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

      {/* Analytics & Master Data Readiness */}
      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <article className="rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0052cc]">
                Distribusi akses
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Peran pengguna</h3>
            </div>
            <Users className="text-[#0052cc]" size={20} />
          </div>
          <div className="mt-6 space-y-4">
            {["siswa", "admin", "superadmin"].map((role) => {
              const count =
                (users as UsersResponse | undefined)?.data.filter(
                  (item) => item.role === role
                ).length ?? 0;
              const percent = totalUsers
                ? Math.round((count / totalUsers) * 100)
                : 0;
              const barColor =
                role === "siswa"
                  ? "bg-[#0052cc]"
                  : role === "admin"
                  ? "bg-[#00bfff]"
                  : "bg-[#4caf50]";
              return (
                <div key={role}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold capitalize text-slate-700">
                      {role}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {count} · {percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0052cc]">
            Struktur organisasi
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Kesiapan master data</h3>
          <div className="mt-5 space-y-2.5">
            {(departments as CountedItem[] | undefined)?.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-[#0052cc]" />
                  {String(item.nama_jurusan)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {item._count?.users ?? 0} pengguna
                </span>
              </div>
            ))}
          </div>
          {!(departments as CountedItem[] | undefined)?.length && (
            <p className="mt-6 text-xs text-slate-500">
              Belum ada department yang tersedia.
            </p>
          )}
        </article>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
