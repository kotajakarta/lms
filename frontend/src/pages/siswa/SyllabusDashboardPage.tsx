import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  VolumeX,
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

const formatSeconds = (totalSeconds: number) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const COURSE_PALETTES = [
  { bg: "bg-[#fadad1]", icon: "✏️" },
  { bg: "bg-[#cbe9e3]", icon: "🖥️" },
  { bg: "bg-[#dad3eb]", icon: "🖌️" },
  { bg: "bg-[#f7d6cd]", icon: "💬" },
  { bg: "bg-[#d5e4f7]", icon: "📐" },
];

export const SyllabusDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const overviewQuery = useQuery({
    queryKey: ["student", "overview"],
    queryFn: getStudentOverview,
  });
  const courses = React.useMemo(
    () => overviewQuery.data?.courses || [],
    [overviewQuery.data?.courses],
  );
  const [courseId, setCourseId] = useState<number | null>(null);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [chatMessage, setChatMessage] = useState("");
  const [materialTab, setMaterialTab] = useState<"all" | "video" | "pdf">("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCourseId = Number(searchParams.get("courseId"));
  const requestedMaterialId = Number(searchParams.get("materialId"));

  // Video Player state and ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const selectedCourse =
    courses.find((course) => course.id === courseId) || courses[0];
  const selectedMaterial =
    selectedCourse?.materials.find((material) => material.id === materialId) ||
    selectedCourse?.materials[0];

  const lastRequestedRef = useRef<{ courseId: number | null; materialId: number | null }>({
    courseId: null,
    materialId: null,
  });

  useEffect(() => {
    if (courses.length > 0) {
      if (
        requestedCourseId &&
        courses.some((course) => course.id === requestedCourseId)
      ) {
        if (
          lastRequestedRef.current.courseId !== requestedCourseId ||
          lastRequestedRef.current.materialId !== requestedMaterialId
        ) {
          lastRequestedRef.current = {
            courseId: requestedCourseId,
            materialId: requestedMaterialId || null,
          };
          setCourseId(requestedCourseId);
          if (requestedMaterialId) {
            const courseObj = courses.find((c) => c.id === requestedCourseId);
            if (courseObj?.materials.some((m) => m.id === requestedMaterialId)) {
              setMaterialId(requestedMaterialId);
            } else {
              setMaterialId(courseObj?.materials[0]?.id || null);
            }
          } else {
            const courseObj = courses.find((c) => c.id === requestedCourseId);
            setMaterialId(courseObj?.materials[0]?.id || null);
          }
        }
      } else if (requestedMaterialId) {
        const foundCourse = courses.find((c) =>
          c.materials.some((m) => m.id === requestedMaterialId)
        );
        if (foundCourse) {
          setCourseId(foundCourse.id);
          setMaterialId(requestedMaterialId);
        }
      }
    }
  }, [requestedCourseId, requestedMaterialId, courses]);

  const prevMaterialIdRef = useRef(selectedMaterial?.id);
  useEffect(() => {
    if (prevMaterialIdRef.current !== selectedMaterial?.id) {
      prevMaterialIdRef.current = selectedMaterial?.id;
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [selectedMaterial?.id]);

  const selectCourse = (course: StudentCourse) => {
    setCourseId(course.id);
    const firstMaterial = course.materials[0]?.id || null;
    setMaterialId(firstMaterial);
    setSearchParams(
      firstMaterial
        ? { courseId: String(course.id), materialId: String(firstMaterial) }
        : { courseId: String(course.id) }
    );
  };

  const selectMaterial = (material: StudentMaterial) => {
    setMaterialId(material.id);
    if (selectedCourse) {
      setSearchParams({
        courseId: String(selectedCourse.id),
        materialId: String(material.id),
      });
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.description || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (courseFilter === "in_progress") return course.progress < 100;
    if (courseFilter === "completed") return course.progress === 100;
    return true;
  });

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

  // Material sequence navigation
  const currentMaterialIndex =
    selectedCourse?.materials.findIndex((m) => m.id === selectedMaterial?.id) ??
    -1;
  const hasPrev = currentMaterialIndex > 0;
  const hasNext = Boolean(
    selectedCourse &&
      currentMaterialIndex >= 0 &&
      currentMaterialIndex < selectedCourse.materials.length - 1,
  );

  const handlePrevMaterial = () => {
    if (hasPrev && selectedCourse) {
      selectMaterial(selectedCourse.materials[currentMaterialIndex - 1]);
    }
  };

  const handleNextMaterial = () => {
    if (hasNext && selectedCourse) {
      selectMaterial(selectedCourse.materials[currentMaterialIndex + 1]);
    }
  };

  // Video control functions
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(
      0,
      Math.min(duration || 1000, videoRef.current.currentTime + seconds),
    );
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const materials = selectedCourse?.materials;
  const filteredMaterials = React.useMemo(() => {
    if (!materials) return [];
    if (materialTab === "video") return materials.filter((m) => m.type !== "pdf");
    if (materialTab === "pdf") return materials.filter((m) => m.type === "pdf");
    return materials;
  }, [materials, materialTab]);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="flex flex-col gap-5 p-3 md:p-6 lg:p-7 xl:flex-row bg-surface min-h-full">
      {/* Left Content Column (Mirrored from code.html: your custom syllabus) */}
      <section
        className="w-full xl:w-[350px] shrink-0 flex flex-col gap-4 overflow-hidden"
        data-purpose="custom-syllabus-column"
      >
        {/* Top Title & More Actions Header */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <span className="text-xs font-medium text-stone-500 tracking-wide">
              {t('student_dashboard.hello', { name: user?.nama || 'Siswa' })}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-tight mt-0.5">
              {t('student_dashboard.custom_syllabus')}
            </h1>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-zinc-700 shadow-xs hover:bg-stone-50 border border-stone-200/50"
            title="Options"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-stone-200/60 rounded-full py-2.5 pl-5 pr-12 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/20"
            placeholder={t('student_dashboard.search_placeholder')}
          />
          <button
            type="button"
            aria-label="Cari"
            className="absolute right-1.5 top-1.5 w-8 h-8 rounded-full bg-[#1c1d22] text-white flex items-center justify-center hover:bg-black transition"
          >
            <svg
              className="w-3.5 h-3.5 stroke-current fill-none stroke-[2.2]"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCourseFilter("all");
            }}
            className="w-9 h-9 shrink-0 rounded-full bg-white border border-stone-200/60 flex items-center justify-center text-zinc-600 hover:bg-stone-50 shadow-2xs"
            title="Reset"
          >
            <svg
              className="w-4 h-4 stroke-current fill-none stroke-[2]"
              viewBox="0 0 24 24"
            >
              <line x1="4" x2="20" y1="7" y2="7" />
              <line x1="7" x2="17" y1="12" y2="12" />
              <line x1="10" x2="14" y1="17" y2="17" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCourseFilter("all")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition whitespace-nowrap ${
              courseFilter === "all"
                ? "bg-[#1c1d22] text-white shadow-xs"
                : "bg-stone-200/70 text-zinc-700 hover:bg-stone-300/70"
            }`}
          >
            <span>{t('student_dashboard.filter_all')} ({courses.length})</span>
            {courseFilter === "all" && (
              <span className="text-[10px] text-zinc-300">✓</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCourseFilter("in_progress")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition whitespace-nowrap ${
              courseFilter === "in_progress"
                ? "bg-[#1c1d22] text-white shadow-xs"
                : "bg-stone-200/70 text-zinc-700 hover:bg-stone-300/70"
            }`}
          >
            <span>{t('student_dashboard.filter_in_progress')}</span>
            {courseFilter === "in_progress" && (
              <span className="text-[10px] text-zinc-300">✓</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCourseFilter("completed")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition whitespace-nowrap ${
              courseFilter === "completed"
                ? "bg-[#1c1d22] text-white shadow-xs"
                : "bg-stone-200/70 text-zinc-700 hover:bg-stone-300/70"
            }`}
          >
            <span>{t('student_dashboard.filter_completed')}</span>
            {courseFilter === "completed" && (
              <span className="text-[10px] text-zinc-300">✓</span>
            )}
          </button>
        </div>

        {/* Featured Course Card (Compact Modern Professional) */}
        <article
          className="bg-gradient-to-br from-[#c8b7ea] via-[#bfb0e3] to-[#ad9cdc] rounded-[22px] p-3.5 text-zinc-900 relative overflow-hidden shadow-xs border border-white/60"
          data-purpose="featured-syllabus-card"
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="min-w-0 pr-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/70 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-purple-950 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-700 animate-pulse" />
                {t('student_analytics.active_courses')}
              </div>
              <h2 className="font-extrabold text-base leading-snug truncate mt-1 text-zinc-900">
                {selectedCourse?.title || t('student_dashboard.select_course')}
              </h2>
              <p className="text-[11px] text-zinc-700/90 leading-tight mt-0.5 max-w-[210px] truncate">
                {selectedCourse?.description ||
                  "Visualization, transformation, and analysis of shapes in space."}
              </p>
            </div>
            {courses.length > 1 && (
              <div className="relative group/courseDropdown shrink-0">
                <button
                  type="button"
                  aria-label={t('student_dashboard.select_course')}
                  className="w-6 h-6 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-zinc-800 hover:bg-white/80 transition"
                  title={t('student_dashboard.switch_course')}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
                <div className="absolute right-0 top-7 z-30 hidden group-hover/courseDropdown:flex flex-col bg-white rounded-xl shadow-lg border border-stone-200/80 p-1.5 min-w-[200px]">
                  <div className="text-[10px] font-semibold text-stone-400 px-2 py-1 uppercase tracking-wider">
                    {t('student_dashboard.switch_course')}
                  </div>
                  {courses.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCourse(c)}
                      className={`text-left text-xs px-2 py-1.5 rounded-lg truncate transition ${
                        selectedCourse?.id === c.id
                          ? "bg-stone-100 font-bold text-zinc-900"
                          : "text-zinc-700 hover:bg-stone-50"
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metrics & Visual */}
          <div className="flex items-center justify-between mt-3 relative z-10">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-white/70 shadow-2xs">
              <div className="text-center px-1">
                <div className="text-[9px] font-semibold uppercase text-purple-900/70 leading-none">
                  {t('student_dashboard.pages')}
                </div>
                <div className="text-xs font-bold text-zinc-900 mt-0.5 leading-none">
                  {selectedCourse?.materials.filter((m) => m.type === "pdf").length || 0}
                </div>
              </div>
              <div className="w-px h-5 bg-purple-300/70" />
              <div className="text-center px-1">
                <div className="text-[9px] font-semibold uppercase text-purple-900/70 leading-none">
                  {t('student_dashboard.videos')}
                </div>
                <div className="text-xs font-bold text-zinc-900 mt-0.5 leading-none">
                  {selectedCourse?.materials.filter((m) => m.type !== "pdf").length || 0}
                </div>
              </div>
              <div className="w-px h-5 bg-purple-300/70" />
              <div className="text-center px-1">
                <div className="text-[9px] font-semibold uppercase text-purple-900/70 leading-none">
                  {t('student_dashboard.duration')}
                </div>
                <div className="text-xs font-bold text-zinc-900 mt-0.5 leading-none">
                  {(
                    (selectedCourse?.materials.reduce(
                      (acc, m) => acc + (m.durationMinutes || 15),
                      0
                    ) || 90) / 60
                  ).toFixed(1)}h
                </div>
              </div>
            </div>

            {/* Abstract 3D Spheres Graphics - compact refined */}
            <div className="w-24 h-12 relative pointer-events-none">
              <div className="absolute right-0 bottom-0 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700/30 to-pink-400/25 blur-xs" />
              <div className="absolute right-1 bottom-0 w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-700 shadow-md opacity-90" />
              <div className="absolute right-8 bottom-1 w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 shadow-xs" />
              <div className="absolute right-2 top-0 w-7 h-7 rounded-full bg-gradient-to-tr from-violet-300 via-purple-200 to-pink-200 border border-white/70 backdrop-blur-md opacity-80" />
            </div>
          </div>
        </article>

        {/* Course List (with top and left padding for visible border/ring) */}
        <div
          className="flex flex-col gap-2.5 overflow-y-auto max-h-[350px] pt-2 pb-2 pl-2 pr-2 -mr-1"
          data-purpose="course-list"
        >
          {filteredCourses.map((course, idx) => {
            const palette = COURSE_PALETTES[idx % COURSE_PALETTES.length];
            const isCurrent = selectedCourse?.id === course.id;
            return (
              <div
                key={course.id}
                onClick={() => selectCourse(course)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl ${palette.bg} hover:brightness-95 cursor-pointer transition ${
                  isCurrent ? "ring-2 ring-zinc-900 shadow-sm" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                  {palette.icon}
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-zinc-900 truncate">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-zinc-600 truncate">
                    {course.materials.length} {t('student_dashboard.materials_progress', { progress: course.progress })}
                  </p>
                </div>
                {course.progress === 100 ? (
                  <span
                    className="w-5 h-5 rounded-full bg-[#1c1d22] text-white flex items-center justify-center text-[10px] shrink-0 font-bold"
                    title={t('student_dashboard.completed_status')}
                  >
                    ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-zinc-700 shrink-0 px-2 py-0.5 rounded-full bg-white/70 shadow-2xs">
                    {course.progress}%
                  </span>
                )}
              </div>
            );
          })}
          {!filteredCourses.length && (
            <p className="rounded-2xl bg-stone-100 p-5 text-center text-xs text-stone-500 border border-stone-200/60">
              {search
                ? t('student_dashboard.empty_search')
                : t('student_dashboard.no_courses')}
            </p>
          )}
        </div>
      </section>

      {/* Main Column: Player and Materials */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          {/* PLAYER SECTION (Widened to lg:col-span-9, Height reduced by 1cm ~38px) */}
          <section
            ref={playerContainerRef}
            className={`relative flex w-full flex-col overflow-hidden rounded-[32px] bg-black text-white shadow-md lg:col-span-9 isolate [transform:translateZ(0)] group ${
              selectedMaterial?.type === "pdf"
                ? "min-h-[580px] md:min-h-[700px]"
                : "min-h-[380px] md:min-h-[440px]"
            }`}
            data-purpose="video-player"
          >
            {/* Gradient Overlays (mirrored from code.html line 280) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85 pointer-events-none z-10" />

            {/* Video Top Header Bar (code.html lines 281-293 with Tombol Selesai tetap ada) */}
            <div className="absolute top-4 sm:top-5 inset-x-4 sm:inset-x-6 flex items-start justify-between text-white z-20">
              <div className="min-w-0 pr-2">
                <h2 className="text-lg sm:text-2xl font-semibold tracking-tight leading-snug drop-shadow-sm truncate">
                  {selectedMaterial?.title || t('student_dashboard.subtitle')}
                </h2>
                <p className="text-xs text-white/80 font-normal mt-0.5 truncate">
                  {selectedCourse?.title || t('nav.courses')} •{" "}
                  {selectedMaterial?.type === "pdf"
                    ? t('student_dashboard.pdf_document')
                    : `${t('student_dashboard.materials_count')} ${currentMaterialIndex + 1}`}
                  {selectedMaterial?.durationMinutes
                    ? ` • ${formatDuration(selectedMaterial.durationMinutes)}`
                    : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Tombol selesai tetap ada */}
                <button
                  type="button"
                  onClick={() =>
                    selectedMaterial &&
                    progressMutation.mutate(!selectedMaterial.completed)
                  }
                  disabled={!selectedMaterial || progressMutation.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition shadow-sm ${
                    selectedMaterial?.completed
                      ? "bg-[#4caf50] hover:bg-[#43a047] text-white"
                      : "bg-white/20 hover:bg-white/30 text-white border border-white/20"
                  }`}
                  title={t('student_dashboard.mark_completed')}
                >
                  <Check size={13} strokeWidth={2.5} />
                  {selectedMaterial?.completed ? t('student_dashboard.completed_status') : t('student_dashboard.mark_completed')}
                </button>

                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {selectedCourse?.progress || 0}%
                </span>
              </div>
            </div>

            {/* MEDIA CONTAINER (Cegah download file/video: no download toolbar/icon, context menu prevented) */}
            <div
              onContextMenu={(e) => e.preventDefault()}
              className={`relative z-0 flex-1 w-full bg-black flex items-center justify-center select-none ${
                selectedMaterial?.type === "pdf"
                  ? "pt-16 pb-14 min-h-[500px] md:min-h-[620px]"
                  : "min-h-[380px] md:min-h-[440px]"
              }`}
            >
              {selectedMaterial?.type === "pdf" && selectedMaterial.url ? (
                <iframe
                  title={`PDF ${selectedMaterial.title}`}
                  src={`${selectedMaterial.url}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="h-full min-h-[480px] md:min-h-[600px] w-full bg-white border-0"
                />
              ) : (selectedMaterial?.type === "video" ||
                  selectedMaterial?.type === "upload_video" ||
                  (!selectedMaterial?.type && selectedMaterial?.url)) &&
                selectedMaterial?.url ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    key={selectedMaterial.url}
                    src={selectedMaterial.url}
                    controls={false}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                      }
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      if (!selectedMaterial?.completed) {
                        progressMutation.mutate(true);
                      }
                    }}
                    onClick={togglePlay}
                    className="w-full aspect-video max-h-[440px] bg-black object-contain cursor-pointer"
                  />
                  {/* Center Play Overlay Icon when paused */}
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md text-white shadow-xl transition-transform hover:scale-110 active:scale-95 z-20 border border-white/20"
                      title="Putar video"
                    >
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </button>
                  )}
                </div>
              ) : selectedMaterial?.type === "gdrive_video" && youtubeEmbedUrl ? (
                <div className="w-full aspect-video max-h-[440px] bg-black">
                  <iframe
                    title={`Video ${selectedMaterial.title}`}
                    src={youtubeEmbedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="flex h-full min-h-[300px] w-full items-center justify-center text-xs sm:text-sm text-slate-300">
                  Materi ini belum memiliki berkas media aktif.
                </div>
              )}
            </div>

            {/* Video Bottom Controls Bar (100% like code.html lines 295-347) */}
            <div className="absolute bottom-3.5 sm:bottom-4 inset-x-4 sm:inset-x-6 z-20 flex items-center gap-2 sm:gap-3 text-white">
              {/* 15s Rewind */}
              {selectedMaterial?.type !== "pdf" && (
                <button
                  type="button"
                  onClick={() => skipSeconds(-15)}
                  className="text-white/90 hover:text-white transition flex items-center justify-center w-7 h-7 shrink-0"
                  title="Mundur 15 detik"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <text fill="currentColor" fontSize="7" fontWeight="bold" stroke="none" textAnchor="middle" x="12" y="15">15</text>
                  </svg>
                </button>
              )}

              {/* Play/Pause Button */}
              {selectedMaterial?.type !== "pdf" && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition shrink-0 active:scale-95"
                  title={isPlaying ? "Jeda (Pause)" : "Putar (Play)"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <svg className="w-4 h-4 fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
              )}

              {/* 15s Forward */}
              {selectedMaterial?.type !== "pdf" && (
                <button
                  type="button"
                  onClick={() => skipSeconds(15)}
                  className="text-white/90 hover:text-white transition flex items-center justify-center w-7 h-7 shrink-0"
                  title="Maju 15 detik"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <text fill="currentColor" fontSize="7" fontWeight="bold" stroke="none" textAnchor="middle" x="12" y="15">15</text>
                  </svg>
                </button>
              )}

              {/* Time Indicator */}
              <span className="text-[11px] font-medium tracking-wide text-white/90 ml-1 select-none shrink-0 whitespace-nowrap">
                {selectedMaterial?.type !== "pdf"
                  ? `${formatSeconds(currentTime)} / ${formatSeconds(duration || (selectedMaterial?.durationMinutes ? selectedMaterial.durationMinutes * 60 : 0))}`
                  : `Materi ${currentMaterialIndex + 1} dari ${selectedCourse?.materials.length || 0}`}
              </span>

              {/* Scrubbing Progress Bar */}
              {selectedMaterial?.type !== "pdf" ? (
                <div
                  onClick={handleProgressBarClick}
                  className="flex-1 mx-2 relative h-1 bg-white/30 rounded-full cursor-pointer group/bar flex items-center"
                  title="Geser waktu"
                >
                  <div
                    className="h-full bg-white rounded-full relative transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-sm"></span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 mx-2" />
              )}

              {/* Previous & Next Material Sequence */}
              <button
                type="button"
                onClick={handlePrevMaterial}
                disabled={!hasPrev}
                className="text-white/80 hover:text-white disabled:opacity-30 transition flex items-center justify-center w-7 h-7 shrink-0"
                title="Materi Sebelumnya"
              >
                <SkipBack size={15} />
              </button>

              <button
                type="button"
                onClick={handleNextMaterial}
                disabled={!hasNext}
                className="text-white/80 hover:text-white disabled:opacity-30 transition flex items-center justify-center w-7 h-7 shrink-0"
                title="Materi Berikutnya"
              >
                <SkipForward size={15} />
              </button>

              {/* Volume / Mute Button */}
              {selectedMaterial?.type !== "pdf" && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition flex items-center justify-center w-7 h-7 shrink-0"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  )}
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition flex items-center justify-center w-7 h-7 shrink-0"
                title="Layar Penuh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="18" rx="3" width="18" x="3" y="3"></rect>
                </svg>
              </button>
            </div>
          </section>

          {/* COURSE PLAYLIST / DAFTAR MATERI (Lebar dikecilkan ke lg:col-span-3 & Latar gradien sesuai request) */}
          <section
            className="rounded-[32px] bg-gradient-to-br from-[#c8b7ea] via-[#bfb0e3] to-[#ad9cdc] border border-white/60 p-4 sm:p-5 shadow-sm text-zinc-900 lg:col-span-3 flex flex-col justify-between"
            data-purpose="lecture-playlist"
          >
            <div>
              {/* Playlist Header */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-1">
                  <h3 className="font-bold text-zinc-900 text-sm truncate">
                    {selectedCourse?.title || "Materi Kursus"}
                  </h3>
                  <p className="text-[11px] text-zinc-700 font-medium">
                    {selectedCourse?.materials.length || 0} Materi Pembelajaran
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/40 flex items-center justify-center text-zinc-800 shrink-0 shadow-2xs">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Segment Tabs (Semua / Videos / PDF) */}
              <div className="flex items-center gap-1 my-3 bg-white/30 p-1 rounded-full text-[11px]">
                <button
                  type="button"
                  onClick={() => setMaterialTab("all")}
                  className={`flex-1 py-1 rounded-full font-semibold transition ${
                    materialTab === "all"
                      ? "bg-[#1c1d22] text-white shadow-xs"
                      : "text-zinc-700 hover:bg-white/40"
                  }`}
                >
                  {t('student_dashboard.tab_all')}
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialTab("video")}
                  className={`flex-1 py-1 rounded-full font-semibold transition ${
                    materialTab === "video"
                      ? "bg-[#1c1d22] text-white shadow-xs"
                      : "text-zinc-700 hover:bg-white/40"
                  }`}
                >
                  {t('student_dashboard.tab_videos')}
                </button>
                <button
                  type="button"
                  onClick={() => setMaterialTab("pdf")}
                  className={`flex-1 py-1 rounded-full font-semibold transition ${
                    materialTab === "pdf"
                      ? "bg-[#1c1d22] text-white shadow-xs"
                      : "text-zinc-700 hover:bg-white/40"
                  }`}
                >
                  {t('student_dashboard.tab_pdf')}
                </button>
              </div>

              {/* Video / Material Item Rows */}
              <div
                className="flex flex-col gap-2 overflow-y-auto max-h-[340px] pr-1"
                data-purpose="playlist-items"
              >
                {filteredMaterials.map((material, index) => {
                  const isSelected = selectedMaterial?.id === material.id;
                  return (
                    <div
                      key={material.id}
                      onClick={() => selectMaterial(material)}
                      className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition ${
                        isSelected
                          ? "bg-white/90 border border-white/90 shadow-xs"
                          : "hover:bg-white/40 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                            isSelected
                              ? "bg-[#1c1d22] text-white"
                              : "bg-white/60 text-zinc-800"
                          }`}
                        >
                          {material.type === "pdf" ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : isSelected && isPlaying ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <svg className="w-3 h-3 fill-current translate-x-0.5" viewBox="0 0 24 24">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          )}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-zinc-900" : "text-zinc-800"
                            }`}
                          >
                            {index + 1}. {material.title}
                          </h4>
                          <p className="text-[10px] text-zinc-600 truncate">
                            {material.type === "pdf" ? t('student_dashboard.pdf_document') : t('student_dashboard.video_lecture')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {material.completed && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                        <span
                          className={`text-[10px] shrink-0 font-medium ${
                            isSelected ? "font-bold text-zinc-900" : "text-zinc-700"
                          }`}
                        >
                          {formatDuration(material.durationMinutes)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!filteredMaterials.length && (
                  <p className="py-8 text-center text-xs text-zinc-600">
                    {t('student_dashboard.no_materials')}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* BOTTOM SECTION: COURSE CHAT (Mirrored from code.html lines 352-444) */}
        <div className="grid flex-1 grid-cols-1 gap-4">
          <section
            className="bg-white rounded-[32px] p-5 flex flex-col justify-between shadow-sm border border-stone-200/50"
            data-purpose="course-chat"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div>
                <h3 className="font-bold text-zinc-900 text-sm">{t('student_dashboard.course_chat')}</h3>
                <p className="text-[11px] text-zinc-400">
                  {selectedCourse?.discussions.length || 0} {t('student_dashboard.chat_topics')} · {selectedCourse?.title}
                </p>
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-zinc-600 flex items-center justify-center transition"
                title="Expand Chat"
              >
                <svg
                  className="w-3.5 h-3.5 stroke-current stroke-[2] fill-none"
                  viewBox="0 0 24 24"
                >
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" x2="14" y1="3" y2="10"></line>
                  <line x1="3" x2="10" y1="21" y2="14"></line>
                </svg>
              </button>
            </div>

            {/* Chat Conversation List */}
            <div
              className="flex flex-col gap-3 py-3 overflow-y-auto text-xs max-h-[300px]"
              data-purpose="chat-messages"
            >
              {selectedCourse?.discussions && selectedCourse.discussions.length > 0 ? (
                selectedCourse.discussions.map((discussion, idx) => {
                  const isCurrentUser =
                    discussion.author === user?.nama ||
                    discussion.authorRole?.toLowerCase() === "siswa";
                  return isCurrentUser ? (
                    /* Message from Student (Right Aligned like code.html line 378) */
                    <div
                      key={discussion.id || idx}
                      className="flex flex-col items-end self-end max-w-[82%]"
                    >
                      <div className="bg-[#eeeae2] text-zinc-800 px-3.5 py-2 rounded-2xl rounded-tr-sm text-[11px] leading-relaxed">
                        <strong className="block text-[10px] text-zinc-500 mb-0.5">
                          {discussion.title}
                        </strong>
                        {discussion.content}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400">
                        <span className="inline-flex items-center bg-stone-100 rounded-full px-1.5 py-0.5 text-[9px] border border-stone-200/50">
                          👍 <span className="text-[10px] ml-0.5 font-medium text-zinc-600">1</span>
                        </span>
                        <span className="flex items-center gap-0.5">
                          👁️ {discussion.replyCount || 1}
                        </span>
                        <span>{discussion.author}</span>
                      </div>
                    </div>
                  ) : (
                    /* Message from Instructor/Other (Left Aligned like code.html line 371) */
                    <div
                      key={discussion.id || idx}
                      className="flex items-start gap-2.5 max-w-[85%]"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {discussion.author ? discussion.author[0].toUpperCase() : "I"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-[11px] text-zinc-900">
                            {discussion.author}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            ({discussion.authorRole || "Instructor"})
                          </span>
                        </div>
                        <div className="bg-stone-100/90 text-zinc-700 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed">
                          <strong className="block text-[10px] text-zinc-800 mb-0.5">
                            {discussion.title}
                          </strong>
                          {discussion.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Default welcoming messages if no discussions yet */
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      I
                    </div>
                    <div className="bg-stone-100/90 text-zinc-700 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-[11px] leading-relaxed">
                      {t('student_dashboard.welcome_chat')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input Bar (code.html lines 401-442) */}
            <div className="space-y-2 pt-1 border-t border-stone-100">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (chatMessage.trim() && selectedCourse) {
                    chatMutation.mutate();
                  }
                }}
                className="relative flex items-center"
              >
                <input
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  placeholder={t('student_dashboard.type_message')}
                  className="w-full bg-stone-100/90 border-0 rounded-full py-2.5 pl-4 pr-11 text-xs text-zinc-700 placeholder-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none"
                />
                <button
                  type="submit"
                  disabled={chatMutation.isPending || !selectedCourse || !chatMessage.trim()}
                  className="absolute right-1.5 w-7 h-7 rounded-full bg-[#1c1d22] text-white flex items-center justify-center hover:bg-black transition disabled:opacity-40"
                  title={t('student_dashboard.send_message')}
                >
                  <svg
                    className="w-3 h-3 stroke-current fill-none stroke-[2] translate-x-0.5"
                    viewBox="0 0 24 24"
                  >
                    <line x1="22" x2="11" y1="2" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>

              {/* Chat Quick Actions (Files, Images, Audio, +) */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setChatMessage((prev) =>
                      prev ? `${prev} [Berkas Dokumen]` : "[Berkas Dokumen] "
                    )
                  }
                  className="flex-1 py-1.5 px-3 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 text-[11px] font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition"
                >
                  <svg
                    className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  {t('student_dashboard.files')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setChatMessage((prev) =>
                      prev ? `${prev} [Lampiran Gambar]` : "[Lampiran Gambar] "
                    )
                  }
                  className="flex-1 py-1.5 px-3 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 text-[11px] font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition"
                >
                  <svg
                    className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <rect height="18" rx="2" ry="2" width="18" x="3" y="3"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  {t('student_dashboard.images')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setChatMessage((prev) =>
                      prev ? `${prev} [Catatan Audio]` : "[Catatan Audio] "
                    )
                  }
                  className="flex-1 py-1.5 px-3 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 text-[11px] font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition"
                >
                  <svg
                    className="w-3.5 h-3.5 stroke-current fill-none stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" x2="12" y1="1" y2="23"></line>
                    <line x1="17" x2="17" y1="5" y2="19"></line>
                    <line x1="7" x2="7" y1="5" y2="19"></line>
                    <line x1="2" x2="2" y1="9" y2="15"></line>
                    <line x1="22" x2="22" y1="9" y2="15"></line>
                  </svg>
                  {t('student_dashboard.audio')}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setChatMessage((prev) =>
                      prev ? `${prev} #tanya` : "#tanya "
                    )
                  }
                  className="w-7 h-7 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 text-zinc-600 flex items-center justify-center text-xs font-bold transition"
                  title={t('student_dashboard.add_tag')}
                >
                  +
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SyllabusDashboardPage;
