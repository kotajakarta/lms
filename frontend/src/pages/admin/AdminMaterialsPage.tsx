import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { AdminMaterialsPanel } from './AdminMaterialsPanel.js';

interface Course { id: number; judul: string; _count: { materials: number } }

export const AdminMaterialsPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const coursesQuery = useQuery({ queryKey: ['admin', 'courses'], queryFn: async () => (await api.get<Course[]>('/courses')).data });
  return <div className="mx-auto max-w-[1200px] space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#615a77]">Learning studio</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Materi pembelajaran</h2><p className="mt-1 text-sm text-stone-500">Pilih kursus untuk mengunggah PDF, video, atau menambahkan URL YouTube.</p></div><section className="rounded-3xl border border-[#eee9df] bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-bold text-zinc-900">Pilih kursus</h3><p className="mt-1 text-xs text-stone-500">Materi akan tampil otomatis di ruang belajar siswa yang terdaftar.</p></div><span className="rounded-full bg-[#e8efc8] px-3 py-1 text-[10px] font-bold text-[#58701c]">Admin &amp; Superadmin</span></div><div className="grid gap-3 sm:grid-cols-2">{coursesQuery.isLoading ? <p className="text-sm text-stone-500">Memuat kursus...</p> : coursesQuery.data?.map((course) => <button key={course.id} onClick={() => setSelectedCourse(course)} className="group flex items-center justify-between rounded-2xl border border-[#eee9df] bg-[#f6f3ed] p-4 text-left transition hover:border-[#e4dbfe] hover:bg-[#e4dbfe]/60"><span className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#615a77]"><BookOpen size={18} /></span><span className="min-w-0"><strong className="block truncate text-sm text-zinc-800">{course.judul}</strong><small className="text-xs text-stone-500">{course._count.materials} materi tersimpan</small></span></span><ChevronRight className="shrink-0 text-stone-400 transition group-hover:translate-x-1" size={18} /></button>)}{!coursesQuery.isLoading && !coursesQuery.data?.length && <p className="text-sm text-stone-500">Belum ada kursus. Buat kursus terlebih dahulu.</p>}</div></section>{selectedCourse && <AdminMaterialsPanel courseId={selectedCourse.id} courseTitle={selectedCourse.judul} onClose={() => setSelectedCourse(null)} />}</div>;
};

export default AdminMaterialsPage;
