import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Check,
  MoreHorizontal,
  Play,
  Search,
  Send,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { getStudentOverview } from "../../services/studentOverview.js";
import { api } from "../../services/api.js";
import type {
  StudentCourse,
  StudentMaterial,
} from "../../services/studentOverview.js";

const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;

export const SyllabusDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const overviewQuery = useQuery({
    queryKey: ["student", "overview"],
    queryFn: getStudentOverview,
  });
  const courses = overviewQuery.data?.courses || [];
  const [courseId, setCourseId] = useState<number | null>(null);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [searchParams] = useSearchParams();
  const requestedCourseId = Number(searchParams.get("courseId"));

  const selectedCourse =
    courses.find((course) => course.id === courseId) || courses[0];
  const selectedMaterial =
    selectedCourse?.materials.find((material) => material.id === materialId) ||
    selectedCourse?.materials[0];
  useEffect(() => {
    if (
      requestedCourseId &&
      courses.some((course) => course.id === requestedCourseId)
    ) {
      setCourseId(requestedCourseId);
      setMaterialId(null);
    }
  }, [requestedCourseId, courses]);
  const visibleCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase()),
  );
  const selectCourse = (course: StudentCourse) => {
    setCourseId(course.id);
    setMaterialId(course.materials[0]?.id || null);
  };
  const selectMaterial = (material: StudentMaterial) => {
    setMaterialId(material.id);
  };
  const progressMutation = useMutation({
    mutationFn: (completed: boolean) =>
      api.post(`/student/materials/${selectedMaterial?.id}/progress`, {
        completed,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["student", "overview"] }),
  });
  const chatMutation = useMutation({
    mutationFn: () =>
      api.post("/student/discussions", {
        course_id: selectedCourse?.id,
        judul: `Diskusi ${selectedMaterial?.title || "kursus"}`,
        isi: chatMessage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "overview"] });
      setChatMessage("");
    },
  });
  const youtubeEmbedUrl =
    selectedMaterial?.type === "gdrive_video" && selectedMaterial.url
      ? selectedMaterial.url
          .replace("watch?v=", "embed/")
          .replace("youtu.be/", "www.youtube.com/embed/")
      : null;

  return (
    <div className="flex flex-col gap-5 p-3 md:p-6 lg:p-7 xl:flex-row">
      <section className="flex w-full shrink-0 flex-col gap-4 xl:w-[350px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium tracking-wide text-stone-500">
              Hello, {user?.nama || "Siswa"}
            </span>
            <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-zinc-900">
              Kursus
              <br />
              Saya
            </h1>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/50 bg-white text-zinc-700 shadow-sm"
            title="More options"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
        <label className="relative block">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            size={16}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses"
            className="w-full rounded-full border border-stone-200/60 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-400/20"
          />
        </label>
        <article className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-md border border-slate-700/60">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">
              Kursus aktif
            </p>
            <h2 className="mt-2 text-xl font-bold leading-tight text-white">
              {selectedCourse?.title || "Belum ada kursus"}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">
              {selectedCourse?.description ||
                "Kursus yang dibuat admin akan muncul di sini."}
            </p>
          </div>
          <div className="relative z-10 mt-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-400">Materi</p>
              <p className="text-2xl font-bold text-white">
                {selectedCourse?.materials.length || 0}
              </p>
              <p className="mt-2 text-[10px] text-slate-400">Progress</p>
              <p className="text-2xl font-bold text-white">
                {selectedCourse?.progress || 0}%
              </p>
            </div>
            <div className="h-28 w-32 rounded-[28px] border border-white/15 bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-slate-800/80 shadow-lg" />
          </div>
        </article>
        <div className="flex max-h-[330px] flex-col gap-2.5 overflow-y-auto pr-1">
          {visibleCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => selectCourse(course)}
              className={`flex items-center gap-3 rounded-2xl p-2.5 text-left transition ${selectedCourse?.id === course.id ? "bg-white shadow-sm ring-1 ring-blue-600/30 border border-blue-100" : "bg-slate-100/80 hover:bg-white border border-transparent"}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <BookOpen size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs text-slate-900">
                  {course.title}
                </strong>
                <small className="block truncate text-[10px] text-slate-500">
                  {course.materials.length} materi · {course.progress}% progress
                </small>
              </span>
              <ChevronRight size={15} className="text-slate-400" />
            </button>
          ))}
          {!visibleCourses.length && (
            <p className="rounded-2xl bg-white border border-slate-200/80 p-5 text-center text-xs text-slate-500">
              Belum ada kursus.
            </p>
          )}
        </div>
      </section>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          <section
            className={`relative flex w-full flex-col overflow-hidden rounded-[32px] bg-slate-900 border border-slate-800 text-white shadow-md lg:col-span-8 ${selectedMaterial?.type === "pdf" ? "min-h-[620px] md:min-h-[760px]" : "min-h-[420px] md:min-h-[540px]"}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(59,130,246,.22),transparent_38%),linear-gradient(135deg,#0f172a_10%,#1e293b_55%,#0f172a)] opacity-95" />
            <div className="relative z-10 flex items-start justify-between p-6 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                  {selectedCourse?.title || "Learning player"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {selectedMaterial?.title ||
                    "Pilih materi untuk mulai belajar"}
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  {selectedMaterial
                    ? `${selectedMaterial.type} · ${formatDuration(selectedMaterial.durationMinutes)}`
                    : "Data materi berasal dari panel admin"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    selectedMaterial &&
                    progressMutation.mutate(!selectedMaterial.completed)
                  }
                  disabled={!selectedMaterial || progressMutation.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold backdrop-blur transition ${selectedMaterial?.completed ? "bg-emerald-500 text-white shadow-sm" : "bg-white/15 text-white hover:bg-white/25 border border-white/20"}`}
                >
                  <Check size={12} />
                  {selectedMaterial?.completed ? "Selesai" : "Tandai selesai"}
                </button>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold backdrop-blur text-slate-200 border border-white/20">
                  {selectedCourse?.progress || 0}% complete
                </span>
              </div>
            </div>
            <div
              className={`relative z-10 min-h-0 flex-1 px-5 pb-3 ${selectedMaterial?.type === "pdf" ? "min-h-[500px] md:min-h-[630px]" : "min-h-[250px]"}`}
            >
              {selectedMaterial?.type === "pdf" && selectedMaterial.url ? (
                <iframe
                  title={`PDF ${selectedMaterial.title}`}
                  src={selectedMaterial.url}
                  className="h-full min-h-[500px] w-full rounded-2xl bg-white md:min-h-[630px]"
                />
              ) : (selectedMaterial?.type === "video" ||
                  selectedMaterial?.type === "upload_video") &&
                selectedMaterial.url ? (
                <video
                  key={selectedMaterial.url}
                  src={selectedMaterial.url}
                  controls
                  className="aspect-video h-auto max-h-[500px] w-full rounded-2xl bg-black object-contain"
                />
              ) : selectedMaterial?.type === "gdrive_video" &&
                youtubeEmbedUrl ? (
                <iframe
                  title={`Video ${selectedMaterial.title}`}
                  src={youtubeEmbedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video h-auto max-h-[500px] w-full rounded-2xl bg-black"
                />
              ) : (
                <div className="flex h-full min-h-[250px] items-center justify-center rounded-2xl bg-black/20 text-sm text-white/70">
                  Materi ini belum memiliki file atau URL.
                </div>
              )}
            </div>
            <div className="relative z-10 flex items-center gap-3 p-6 pt-3">
              <button className="text-white/80" title="Previous">
                <SkipBack size={18} />
              </button>
              <Play size={16} fill="currentColor" className="text-white/80" />
              <button className="text-white/80" title="Next">
                <SkipForward size={18} />
              </button>
              <div className="h-1 flex-1 rounded-full bg-white/25">
                <div className="h-full w-0 rounded-full bg-white" />
              </div>
              <span className="text-[11px] text-white/80">
                {formatDuration(selectedMaterial?.durationMinutes || 0)}
              </span>
            </div>
          </section>
          <section className="rounded-[32px] bg-white border border-slate-200/90 p-5 shadow-sm lg:col-span-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Materi kursus
                </h3>
                <p className="text-[11px] text-slate-500">Urutan pembelajaran</p>
              </div>
              <FileText size={18} className="text-slate-600" />
            </div>
            <div className="mt-4 flex max-h-[620px] flex-col gap-2 overflow-y-auto pr-1">
              {selectedCourse?.materials.map((material, index) => (
                <button
                  key={material.id}
                  onClick={() => selectMaterial(material)}
                  className={`flex items-center justify-between rounded-2xl p-3 text-left transition ${selectedMaterial?.id === material.id ? "border border-blue-200 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-500/20" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${selectedMaterial?.id === material.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {material.type === "pdf" ? (
                        <FileText size={14} />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-xs text-slate-900">
                        {index + 1}. {material.title}
                      </strong>
                      <small className="block truncate text-[10px] text-slate-500">
                        {material.type === "pdf" ? "PDF" : "Video"}
                      </small>
                    </span>
                    {material.completed && (
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                        title="Selesai"
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="ml-2 shrink-0 text-[10px] font-medium text-slate-500">
                    {formatDuration(material.durationMinutes)}
                  </span>
                </button>
              ))}
              {!selectedCourse?.materials.length && (
                <p className="py-8 text-center text-xs text-slate-500">
                  Belum ada materi.
                </p>
              )}
            </div>
          </section>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4">
          <section className="flex min-h-[300px] flex-col rounded-[32px] border border-slate-200/90 bg-white p-5 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Course Chat</h3>
                <p className="text-[11px] text-slate-500">
                  {selectedCourse?.discussions.length || 0} recent topics
                </p>
              </div>
              <button className="text-slate-500 hover:text-slate-700" title="Course discussion">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
              {selectedCourse?.discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="rounded-2xl bg-slate-50 border border-slate-100/90 px-3.5 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs text-slate-900">
                      {discussion.title}
                    </strong>
                    <span className="text-[10px] text-slate-400">
                      {discussion.replyCount} replies
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-600">
                    {discussion.content}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {discussion.author} · {discussion.authorRole}
                  </p>
                </div>
              ))}
              {!selectedCourse?.discussions.length && (
                <p className="py-8 text-center text-xs text-slate-400">
                  Belum ada diskusi untuk kursus ini.
                </p>
              )}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (chatMessage.trim() && selectedCourse) chatMutation.mutate();
              }}
              className="flex items-center gap-2 border-t border-slate-100 pt-3"
            >
              <input
                value={chatMessage}
                onChange={(event) => setChatMessage(event.target.value)}
                placeholder="Tulis pesan ke course chat..."
                className="min-w-0 flex-1 rounded-full bg-slate-50 border border-slate-200/80 px-4 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                disabled={chatMutation.isPending || !selectedCourse}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-sm shadow-blue-600/20"
                title="Kirim pesan"
              >
                <Send size={14} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SyllabusDashboardPage;
