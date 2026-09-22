import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { api } from '../../services/api.js';
import { AdminCoursesPage } from './AdminCoursesPage.js';
import { AdminMaterialsPanel } from './AdminMaterialsPanel.js';

interface Course {
  id: number;
  judul: string;
  _count: { materials: number };
}

export const AdminCoursesWorkspacePage: React.FC = () => {
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses', 'preview'],
    queryFn: async () => (await api.get<Course[]>('/courses')).data,
  });

  return (
    <>
      <AdminCoursesPage />
      <section className="mx-auto mt-6 max-w-[1400px] rounded-3xl border border-[#eee9df] bg-[#f6f3ed] p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Pratinjau pembelajaran</h3>
            <p className="mt-1 text-xs text-stone-500">Lihat kursus dan materi seperti tampilan siswa.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {coursesQuery.data?.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => setPreviewCourse(course)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-[#e4dbfe] hover:text-[#49435f]"
              >
                <BookOpen size={14} />
                {course.judul} ({course._count.materials})
              </button>
            ))}
          </div>
        </div>
      </section>
      {previewCourse && (
        <AdminMaterialsPanel
          courseId={previewCourse.id}
          courseTitle={previewCourse.judul}
          onClose={() => setPreviewCourse(null)}
        />
      )}
    </>
  );
};

export default AdminCoursesWorkspacePage;
