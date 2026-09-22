import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Search } from 'lucide-react';
import { getStudentOverview } from '../../services/studentOverview.js';

export const CalendarPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const overviewQuery = useQuery({ queryKey: ['student', 'overview'], queryFn: getStudentOverview });
  const events = useMemo(() => (overviewQuery.data?.events || []).filter((event) => `${event.title} ${event.courseTitle || ''}`.toLowerCase().includes(search.toLowerCase())), [overviewQuery.data?.events, search]);
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-full">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Jadwal pembelajaran
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Kalender saya
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Event kursus yang terhubung dari jadwal admin.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 border border-slate-200/60">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari event"
            className="w-48 bg-transparent text-xs outline-none text-slate-800 placeholder:text-slate-400"
          />
        </label>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <CalendarDays size={18} />
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                {event.type}
              </span>
            </div>
            <h2 className="mt-4 font-bold text-slate-900 text-base">
              {event.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {event.courseTitle || 'Kursus'}
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-700">
              {new Date(event.start).toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
            {event.description && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {event.description}
              </p>
            )}
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Buka tautan acara &rarr;
              </a>
            )}
          </article>
        ))}
      </section>

      {!overviewQuery.isLoading && !events.length && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center text-sm text-slate-500">
          Belum ada jadwal untuk kursus yang diikuti.
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
