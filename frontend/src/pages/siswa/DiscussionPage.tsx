import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  ArrowLeft,
  Clock,
  X,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';

interface DiscussionReply {
  id: number;
  isi: string;
  created_at: string;
  user: {
    nama: string;
    role: string;
  };
}

interface Discussion {
  id: number;
  judul: string;
  isi?: string | null;
  created_at: string;
  course: {
    id: number;
    judul: string;
  };
  user: {
    nama: string;
    role: string;
  };
  balasan: DiscussionReply[];
}

export const DiscussionPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Queries
  const discussionsQuery = useQuery({
    queryKey: ['student', 'discussions'],
    queryFn: async () => (await api.get<Discussion[]>('/student/discussions')).data,
  });

  const coursesQuery = useQuery({
    queryKey: ['student', 'overview'],
    queryFn: async () =>
      (await api.get<{ courses: Array<{ id: number; title: string }> }>('/student/overview')).data,
  });

  // State
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for new topic
  const [newCourseId, setNewCourseId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Reply state for currently selected topic
  const [replyText, setReplyText] = useState('');

  // Mutations
  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/student/discussions', {
        course_id: Number(newCourseId),
        judul: newTitle.trim(),
        isi: newContent.trim(),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['student', 'discussions'] });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewContent('');
      if (res.data?.id) {
        setSelectedTopicId(res.data.id);
      }
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ topicId, isi }: { topicId: number; isi: string }) =>
      api.post('/student/discussion-replies', { topic_id: topicId, isi }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'discussions'] });
      setReplyText('');
    },
  });

  const discussions = useMemo(
    () => discussionsQuery.data || [],
    [discussionsQuery.data]
  );
  const courses = useMemo(
    () => coursesQuery.data?.courses || [],
    [coursesQuery.data?.courses]
  );

  // Filtered discussions list
  const filteredDiscussions = useMemo(() => {
    return discussions.filter((item) => {
      const matchCourse =
        selectedCourseFilter === 'all' || item.course.id === selectedCourseFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.judul.toLowerCase().includes(q) ||
        (item.isi && item.isi.toLowerCase().includes(q)) ||
        item.course.judul.toLowerCase().includes(q) ||
        item.user.nama.toLowerCase().includes(q);
      return matchCourse && matchSearch;
    });
  }, [discussions, selectedCourseFilter, searchQuery]);

  // Selected topic resolution (fall back to first available if none selected on desktop)
  const activeTopic = useMemo(() => {
    if (selectedTopicId) {
      const found = discussions.find((d) => d.id === selectedTopicId);
      if (found) return found;
    }
    return filteredDiscussions[0] || null;
  }, [discussions, selectedTopicId, filteredDiscussions]);

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(i18n.language.startsWith('en') ? 'en-US' : 'id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !replyText.trim() || replyMutation.isPending) return;
    replyMutation.mutate({
      topicId: activeTopic.id,
      isi: replyText.trim(),
    });
  };

  return (
    <div className="flex flex-col h-full min-h-full bg-surface text-on-surface font-sans">
      {/* Top Header Bar */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-stone-200/80 bg-white/70 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-7xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                {t('student_discussion.tag')}
              </span>
              <span className="text-xs text-outline-variant">·</span>
              <span className="text-xs text-outline font-medium">
                {t('student_discussion.topics_count', { count: discussions.length })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-0.5">
              {t('student_discussion.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[260px] flex-1 sm:flex-initial">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('student_discussion.search_discussions')}
                className="w-full h-9 pl-9 pr-8 text-xs bg-surface-container-low rounded-full border border-stone-200/80 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Create Topic Button */}
            <button
              type="button"
              onClick={() => {
                if (courses.length > 0 && !newCourseId) {
                  setNewCourseId(String(courses[0].id));
                }
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-stone-900 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>{t('student_discussion.create_new')}</span>
            </button>
          </div>
        </div>

        {/* Course Filter Bar (Segmented Control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-3 max-w-7xl mx-auto w-full">
          <button
            type="button"
            onClick={() => setSelectedCourseFilter('all')}
            className={`h-7 px-3 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              selectedCourseFilter === 'all'
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-stone-200/60'
            }`}
          >
            <span>{t('student_discussion.filter_all')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCourseFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-200/80 text-stone-600'
              }`}
            >
              {discussions.length}
            </span>
          </button>

          {courses.map((course) => {
            const topicCount = discussions.filter((d) => d.course.id === course.id).length;
            const isSelected = selectedCourseFilter === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseFilter(course.id)}
                className={`h-7 px-3 rounded-full text-xs font-medium cursor-pointer transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-stone-200/60'
                }`}
              >
                <span>{course.title}</span>
                {topicCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-200/80 text-stone-600'
                    }`}
                  >
                    {topicCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Dual-Pane Master-Detail Area */}
      <main className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-5 gap-4">
        {/* Left Pane: Topic List (Hidden on mobile if a topic is active and user is viewing thread) */}
        <section
          className={`flex-col bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden w-full lg:w-[380px] xl:w-[420px] shrink-0 ${
            selectedTopicId && activeTopic ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* List Sub-header */}
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-surface-container-lowest">
            <span className="text-xs font-semibold text-on-surface">
              {t('student_discussion.thread_details')}
            </span>
            <span className="text-[11px] text-outline">
              {filteredDiscussions.length}{' '}
              {filteredDiscussions.length === 1 ? 'topik' : 'topik'}
            </span>
          </div>

          {/* Discussion List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-1.5 space-y-1">
            {discussionsQuery.isLoading ? (
              <div className="p-8 text-center text-xs text-outline">
                <div className="inline-block animate-spin w-5 h-5 border-2 border-secondary border-t-transparent rounded-full mb-2" />
                <p>Memuat diskusi...</p>
              </div>
            ) : filteredDiscussions.length === 0 ? (
              <div className="p-8 text-center text-xs text-outline space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-outline-variant/60" />
                <p className="font-semibold text-on-surface-variant">
                  {t('student_discussion.no_discussions')}
                </p>
                <p className="text-[11px] max-w-[220px] mx-auto text-outline">
                  {t('student_discussion.no_discussions_hint')}
                </p>
              </div>
            ) : (
              filteredDiscussions.map((topic) => {
                const isSelected = activeTopic?.id === topic.id;
                const replyCount = topic.balasan?.length || 0;
                const isInstructor =
                  topic.user.role === 'instruktur' || topic.user.role === 'admin';

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-secondary-container/40 border border-secondary-container ring-1 ring-secondary/20'
                        : 'hover:bg-surface-container-low border border-transparent'
                    }`}
                  >
                    {/* Course Kicker & Replies badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary truncate max-w-[240px]">
                        {topic.course.judul}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-outline shrink-0">
                        <MessageSquare size={12} className="text-secondary/80" />
                        <span>{replyCount}</span>
                      </div>
                    </div>

                    {/* Topic Title */}
                    <h3 className="text-xs sm:text-sm font-semibold text-on-surface line-clamp-1 leading-snug">
                      {topic.judul}
                    </h3>

                    {/* Body Snippet */}
                    {topic.isi && (
                      <p className="text-[11px] text-on-surface-variant/80 line-clamp-2 leading-relaxed">
                        {topic.isi}
                      </p>
                    )}

                    {/* Footer Metadata */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100/60 text-[10px] text-outline">
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            isInstructor
                              ? 'bg-secondary text-on-secondary'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {getInitials(topic.user.nama)}
                        </div>
                        <span className="truncate font-medium text-on-surface-variant">
                          {topic.user.nama}
                        </span>
                        {isInstructor && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-secondary-container text-secondary font-bold">
                            {t('student_discussion.instructor_badge')}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0">{formatDate(topic.created_at)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right Pane: Thread Reading & Reply View */}
        <section
          className={`flex-1 flex-col bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden ${
            !activeTopic && !selectedTopicId
              ? 'hidden lg:flex items-center justify-center'
              : selectedTopicId || activeTopic
              ? 'flex'
              : 'hidden lg:flex'
          }`}
        >
          {activeTopic ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Active Thread Header */}
              <div className="px-5 py-4 border-b border-stone-100 bg-surface-container-lowest shrink-0">
                {/* Mobile Back Button */}
                <div className="flex items-center justify-between mb-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedTopicId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>{t('student_discussion.back_to_list')}</span>
                  </button>
                  <span className="text-[10px] uppercase font-bold text-outline">
                    {activeTopic.course.judul}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="hidden lg:inline-block text-[11px] font-bold uppercase tracking-wider text-secondary mb-1">
                      {activeTopic.course.judul}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                      {activeTopic.judul}
                    </h2>
                  </div>
                </div>

                {/* Author Info Bar */}
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs shrink-0 border border-secondary/30">
                    {getInitials(activeTopic.user.nama)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {activeTopic.user.nama}
                      </span>
                      {activeTopic.user.role === 'instruktur' ||
                      activeTopic.user.role === 'admin' ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary-container text-secondary font-bold">
                          {t('student_discussion.instructor_badge')}
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium">
                          {t('student_discussion.student_badge')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-outline flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} />
                      <span>{formatDate(activeTopic.created_at)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Thread Content & Replies Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-surface/30">
                {/* Topic Question / Main Post */}
                <div className="p-4 rounded-xl bg-white border border-stone-200/70 shadow-2xs">
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                    {activeTopic.isi || '(Tidak ada deskripsi tambahan)'}
                  </p>
                </div>

                {/* Replies Divider */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-on-surface tracking-wide uppercase">
                    {t('student_discussion.replies_count', {
                      count: activeTopic.balasan?.length || 0,
                    })}
                  </span>
                  <div className="flex-1 h-px bg-stone-200/80" />
                </div>

                {/* Replies Feed */}
                {activeTopic.balasan && activeTopic.balasan.length > 0 ? (
                  <div className="space-y-3">
                    {activeTopic.balasan.map((reply) => {
                      const isReplyInstructor =
                        reply.user.role === 'instruktur' || reply.user.role === 'admin';
                      return (
                        <div
                          key={reply.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isReplyInstructor
                              ? 'bg-secondary-container/20 border-secondary-container/70 shadow-2xs'
                              : 'bg-white border-stone-200/70 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isReplyInstructor
                                    ? 'bg-secondary text-on-secondary'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {getInitials(reply.user.nama)}
                              </div>
                              <span className="text-xs font-bold text-on-surface">
                                {reply.user.nama}
                              </span>
                              {isReplyInstructor && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary-container text-secondary font-bold">
                                  {t('student_discussion.instructor_badge')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-outline">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed pl-8 whitespace-pre-wrap">
                            {reply.isi}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-outline space-y-1">
                    <p className="font-medium text-on-surface-variant">Belum ada balasan</p>
                    <p className="text-[11px]">
                      Berikan tanggapan pertama untuk membantu rekan atau mendiskusikan topik ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Quick Reply Composer */}
              <div className="p-3 sm:p-4 bg-white border-t border-stone-200/80 shrink-0">
                <form onSubmit={handleSendReply} className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {getInitials(currentUser?.nama)}
                    </div>
                    <div className="relative flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSendReply(e);
                          }
                        }}
                        placeholder={t('student_discussion.reply_placeholder')}
                        rows={2}
                        className="w-full text-xs p-3 rounded-xl bg-surface-container-low border border-stone-200/80 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary resize-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-9.5">
                    <span className="text-[10px] text-outline hidden sm:inline">
                      {t('student_discussion.press_enter_hint')}
                    </span>
                    <button
                      type="submit"
                      disabled={!replyText.trim() || replyMutation.isPending}
                      className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer ml-auto"
                    >
                      <Send size={13} />
                      <span>
                        {replyMutation.isPending
                          ? t('student_discussion.replying')
                          : t('student_discussion.reply_btn')}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-outline space-y-3 m-auto max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-secondary">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-sm font-bold text-on-surface">
                {t('student_discussion.title')}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t('student_discussion.select_topic_prompt')}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Create Topic Modal Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Plus size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    {t('student_discussion.create_new')}
                  </h3>
                  <p className="text-[11px] text-outline">
                    Bagikan pertanyaan atau diskusikan konsep materi kursus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-stone-100 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newCourseId && newTitle.trim() && newContent.trim()) {
                  createMutation.mutate();
                }
              }}
              className="p-6 space-y-4"
            >
              {/* Select Course */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  {t('student_discussion.select_course')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary cursor-pointer"
                >
                  <option value="">-- {t('student_discussion.select_course')} --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Judul Pertanyaan / Diskusi <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('student_discussion.title_placeholder')}
                  className="w-full h-10 px-3.5 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Uraian Pertanyaan & Konteks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={t('student_discussion.content_placeholder')}
                  className="w-full p-3.5 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-outline hover:text-on-surface cursor-pointer"
                >
                  {t('student_discussion.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    !newCourseId ||
                    !newTitle.trim() ||
                    !newContent.trim()
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-stone-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  <Send size={13} />
                  <span>
                    {createMutation.isPending
                      ? t('student_discussion.posting')
                      : t('student_discussion.post_btn')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;
