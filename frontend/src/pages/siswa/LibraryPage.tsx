import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Search } from 'lucide-react';
import { getStudentOverview } from '../../services/studentOverview.js';

export const LibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'pdf' | 'video'>('all');
  const overviewQuery = useQuery({ queryKey: ['student', 'overview'], queryFn: getStudentOverview });
  const assets = useMemo(() => (overviewQuery.data?.courses || []).flatMap((course) => course.materials.map((material) => ({ ...material, courseTitle: course.title }))).filter((material) => (type === 'all' || (type === 'pdf' ? material.type === 'pdf' : material.type !== 'pdf')) && `${material.title} ${material.courseTitle}`.toLowerCase().includes(search.toLowerCase())), [overviewQuery.data?.courses, search, type]);
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-full">
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Materi terdaftar
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Library saya
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            File dan video dari kursus yang Anda ikuti.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 border border-slate-200/60">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari materi"
            className="w-48 bg-transparent text-xs outline-none text-slate-800 placeholder:text-slate-400"
          />
        </label>
      </header>

      <div className="flex gap-2">
        <button
          onClick={() => setType('all')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${type === 'all' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'}`}
        >
          Semua
        </button>
        <button
          onClick={() => setType('pdf')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${type === 'pdf' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'}`}
        >
          PDF
        </button>
        <button
          onClick={() => setType('video')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${type === 'video' ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'}`}
        >
          Video
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <article
            key={asset.id}
            className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FileText size={18} />
                </span>
                <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                  {asset.type}
                </span>
              </div>
              <h2 className="mt-4 font-bold text-slate-900 text-base">
                {asset.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {asset.courseTitle} · {asset.durationMinutes} menit
              </p>
              {asset.description && (
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                  {asset.description}
                </p>
              )}
            </div>
            {asset.url && (
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors w-fit shadow-xs"
              >
                <Download size={14} />
                Buka materi
              </a>
            )}
          </article>
        ))}
      </section>

      {!overviewQuery.isLoading && !assets.length && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center text-sm text-slate-500">
          Belum ada materi yang cocok.
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
