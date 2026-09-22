import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';
import { api } from '../../services/api.js';

interface Discussion { id: number; judul: string; isi?: string | null; created_at: string; course: { id: number; judul: string }; user: { nama: string; role: string }; balasan: Array<{ id: number; isi: string; created_at: string; user: { nama: string; role: string } }>; }

export const DiscussionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reply, setReply] = useState<Record<number, string>>({});
  const discussionsQuery = useQuery({ queryKey: ['student', 'discussions'], queryFn: async () => (await api.get<Discussion[]>('/student/discussions')).data });
  const coursesQuery = useQuery({ queryKey: ['student', 'overview'], queryFn: async () => (await api.get<{ courses: Array<{ id: number; title: string }> }>('/student/overview')).data });
  const [courseId, setCourseId] = useState('');
  const createMutation = useMutation({ mutationFn: () => api.post('/student/discussions', { course_id: Number(courseId), judul: title, isi: content }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['student', 'discussions'] }); setTitle(''); setContent(''); }, });
  const replyMutation = useMutation({ mutationFn: ({ topicId, isi }: { topicId: number; isi: string }) => api.post('/student/discussion-replies', { topic_id: topicId, isi }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['student', 'discussions'] }); setReply({}); } });
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-slate-50/50 min-h-full">
      <header className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Forum kursus
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Diskusi saya
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tanya dan balas topik dari kursus yang Anda ikuti.
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (courseId && title.trim() && content.trim())
            createMutation.mutate();
        }}
        className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs"
      >
        <h2 className="font-bold text-slate-900">Buat topik baru</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            required
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Pilih kursus</option>
            {coursesQuery.data?.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Judul diskusi"
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <textarea
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Tulis pertanyaan atau pembahasan..."
          className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <button
          disabled={createMutation.isPending}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50"
        >
          <Send size={14} />
          Publikasikan
        </button>
      </form>

      <section className="space-y-3">
        {discussionsQuery.data?.map((discussion) => (
          <article
            key={discussion.id}
            className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {discussion.course.judul}
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {discussion.judul}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {discussion.user.nama} ·{' '}
                  {new Date(discussion.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <MessageCircle className="text-blue-600" size={20} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {discussion.isi}
            </p>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              {discussion.balasan.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-50 border border-slate-100 p-3"
                >
                  <p className="text-xs font-bold text-slate-800">
                    {item.user.nama}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{item.isi}</p>
                </div>
              ))}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (reply[discussion.id]?.trim())
                    replyMutation.mutate({
                      topicId: discussion.id,
                      isi: reply[discussion.id],
                    });
                }}
                className="flex gap-2"
              >
                <input
                  value={reply[discussion.id] || ''}
                  onChange={(event) =>
                    setReply({ ...reply, [discussion.id]: event.target.value })
                  }
                  placeholder="Balas diskusi"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  className="rounded-full bg-blue-600 hover:bg-blue-700 p-2 text-white shadow-sm shadow-blue-600/20 transition-colors"
                  title="Kirim balasan"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>

      {!discussionsQuery.isLoading && !discussionsQuery.data?.length && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center text-sm text-slate-500">
          Belum ada diskusi di kursus Anda.
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;
