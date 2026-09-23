import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentOverview } from "../../services/studentOverview.js";

const fallbackThumbnails = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA-xUf3tCCtZ7oYtJYFH8du9DGyGs-qGmVj2yrWt7J96m-sTpYale92Naj-SXctYaFpHDryzhfHSZXSs5C8E82xDHwY0gp6Dg87O3vck6E4UW4iw_V9fxon6d9-ClhkrPrdmjpeIwtlSL6utxdx9fW_8Y-8mJ_8ZsRadnGZEsnGxCsVxoMPXnUcni3e5_AuBFHZU8Y8o0hNm9ANTnsBotRA4PEaR7sW3zugXyGLhe6o9ahJrEo_hx7S",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbm2JOKxBc4Mqsc-MZfAxBIj9GHvUIPzcEOPUjl0omb35gjSmp-b3ugZTrPPnjsfKQjoGILcM4zE5TeQUEyw1FIlzD9RmgKLaw1yBI64OmobudDr8fgmxZxW4tBd7I2UGliUWTyqFiJ6BXWYVjJJyqAW8qmx2iuh3CBCOaDm3LFVyByfUiID5projKbdjYltedQ0l0UWbVUHIZ7tNGgc6H-51aXA8oYIWxWZTPGBUXtOUfCgl8m0A3",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCVepaxLtD7vVEZnYa-l8FRNciWf6Yjr8DMgnzefR9lrMaRMYnKTgUiwfeG7fCWSvRyJq0igVruoc7ADvVJDgprkkTgRSpQizN5rn77dYM52tH_AG6fABJXN_RmRpY8jPWEYRK8G3mApiiol1ee5XCEeU-CssKkCEu1YJa5pibKM21LpPBv8Jquxh0K4UpYVi0nFzF_UxmWB9AVO7s6CjeTtodWcKEMEDIDgdKT8j07384Fj7U8KROC",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCCIc7XpFJab4XwIraM6YZQminV-iDOqwVzrLbBGieg9l5zyo2DBRf1dh6noBtoP5qP6YWN9h3JnN2VmziueCWHJdBXZg_X5diBqLAr_x2r7aH1JBWvaAtWeFqQmBc0MdnirffxIrT7IIzFoXXLvSJT64Vx7Z8_k3J71VVRRAt4-3Vk8xSh1MtYgXjBFY1qN4Up885S7Cv3bCDEOa0oHHL19Vk_ycUXOgScjWTQ4CcUD-r4-isqnM-f",
];

const folderColorVariants = [
  {
    avatar: "bg-tertiary-fixed text-on-tertiary-fixed",
    icon: "architecture",
  },
  {
    avatar: "bg-secondary-fixed text-on-secondary-fixed",
    icon: "polyline",
  },
  {
    avatar: "bg-surface-container-highest text-on-surface",
    icon: "texture",
  },
  {
    avatar: "bg-secondary-fixed-dim text-on-secondary-fixed",
    icon: "menu_book",
  },
];

export const LibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "pdf" | "video" | "completed"
  >("all");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"popularity" | "newest" | "duration">(
    "popularity"
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isCleaningCache, setIsCleaningCache] = useState(false);

  const overviewQuery = useQuery({
    queryKey: ["student", "overview"],
    queryFn: getStudentOverview,
  });

  const overview = overviewQuery.data;
  const user = overview?.user;
  const courses = useMemo(() => overview?.courses || [], [overview?.courses]);
  const analytics = overview?.analytics;

  // Flatten all materials with associated course info
  const allMaterials = useMemo(() => {
    return courses.flatMap((course, courseIdx) =>
      course.materials.map((material, materialIdx) => ({
        ...material,
        courseId: course.id,
        courseTitle: course.title,
        instructor: course.instructor || "Tim Pengajar",
        thumbnail:
          course.thumbnail && course.thumbnail !== "default.jpg"
            ? course.thumbnail
            : fallbackThumbnails[(courseIdx + materialIdx) % fallbackThumbnails.length],
      }))
    );
  }, [courses]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return allMaterials
      .filter((item) => {
        // Course filter
        if (selectedCourseId && item.courseId !== selectedCourseId) {
          return false;
        }
        // Type filter
        if (filterType === "pdf" && item.type !== "pdf") return false;
        if (filterType === "video" && item.type === "pdf") return false;
        if (filterType === "completed" && !item.completed) return false;

        // Search filter
        if (search.trim()) {
          const query = search.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchCourse = item.courseTitle.toLowerCase().includes(query);
          const matchDesc = (item.description || "").toLowerCase().includes(query);
          return matchTitle || matchCourse || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "duration") {
          return (b.durationMinutes || 0) - (a.durationMinutes || 0);
        }
        if (sortBy === "newest") {
          return b.id - a.id;
        }
        // Popularity default sort
        return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
      });
  }, [allMaterials, filterType, selectedCourseId, search, sortBy]);

  // Counts for filters
  const pdfCount = useMemo(
    () => allMaterials.filter((m) => m.type === "pdf").length,
    [allMaterials]
  );
  const videoCount = useMemo(
    () => allMaterials.filter((m) => m.type !== "pdf").length,
    [allMaterials]
  );
  const completedCount = useMemo(
    () => allMaterials.filter((m) => m.completed).length,
    [allMaterials]
  );

  // Storage and calculation statistics
  const totalCount = allMaterials.length;
  const progressPercent = analytics?.averageProgress ?? 68;
  const videoPercent = totalCount ? Math.round((videoCount / totalCount) * 60) : 48;
  const pdfPercent = totalCount ? Math.round((pdfCount / totalCount) * 30) : 15;
  const otherPercent = Math.max(5, 100 - videoPercent - pdfPercent);

  // Copy license code handler
  const licenseCode = `RH8-STU${user?.id || "04"}-98XX`;
  const handleCopyCode = () => {
    navigator.clipboard?.writeText?.(licenseCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clean cache handler
  const handleCleanCache = async () => {
    setIsCleaningCache(true);
    await queryClient.invalidateQueries({ queryKey: ["student", "overview"] });
    setTimeout(() => setIsCleaningCache(false), 600);
  };

  return (
    <div className="w-full bg-surface text-on-surface p-4 sm:p-6 lg:p-7 space-y-6">
      {/* Top Spatial Bar / Canvas Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
              Vault Repository • Master Node
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {user?.department?.nama_jurusan || "Arch & Urban Studio 04"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary">
            {t('student_library.title')}
          </h1>
        </div>

        {/* Live Status & Global Asset Controls */}
        <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low shadow-xs border border-surface-container-high/60">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs font-semibold text-on-surface-variant">
              Sync: LMS Cloud v2.4 (Live)
            </span>
          </div>

          <Link
            to="/siswa/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-semibold shadow-md hover:bg-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            <span>{t('student_analytics.continue_learning')}</span>
          </Link>

          <button
            type="button"
            onClick={handleCleanCache}
            title={t('student_library.refresh_sync')}
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors shadow-xs border border-surface-container-high/60"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isCleaningCache ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Primary Asymmetric Bento Architecture (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* ==================== LEFT BENTO COLUMN (COL 1-4) ==================== */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Studio Digital Vault Hero Bento Card (Lilac Tint) */}
          <div className="bg-secondary-container text-on-secondary-fixed rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            {/* Decorative subtle background SVG lines */}
            <svg
              className="absolute -right-8 -bottom-8 w-56 h-56 text-secondary/20 pointer-events-none"
              fill="none"
              viewBox="0 0 160 160"
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <polygon
                fill="none"
                points="80,18 142,126 18,126"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                stroke="currentColor"
                strokeWidth="1"
                x1="80"
                x2="80"
                y1="18"
                y2="126"
              />
            </svg>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-secondary text-[10px] uppercase tracking-wider font-bold shadow-xs">
                  Private Allocation
                </span>
                <div className="w-8 h-8 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center text-on-secondary-fixed shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">
                    cloud_done
                  </span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-on-secondary-fixed mb-1.5 leading-snug">
                {t('student_library.digital_vault')}
              </h2>
              <p className="text-xs text-on-secondary-container max-w-[260px] leading-relaxed">
                {t('student_library.vault_desc')}
              </p>
            </div>

            <div className="mt-6 z-10">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-lg font-bold text-on-secondary-fixed">
                  {(allMaterials.length * 5.4 + 12.8).toFixed(1)} GB
                </span>
                <span className="text-[11px] text-on-secondary-container font-medium">
                  100 GB Total ({progressPercent}%)
                </span>
              </div>

              {/* Custom Storage Track */}
              <div className="w-full h-3 rounded-full bg-surface-container-lowest/60 overflow-hidden p-0.5 shadow-inner flex">
                <div
                  className="h-full bg-primary-container rounded-full transition-all duration-700"
                  style={{ width: `${videoPercent}%` }}
                />
                <div
                  className="h-full bg-secondary ml-1 rounded-full transition-all duration-700"
                  style={{ width: `${pdfPercent}%` }}
                />
                <div
                  className="h-full bg-on-secondary-container ml-1 rounded-full transition-all duration-700"
                  style={{ width: `${otherPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-3.5 mt-2.5 text-[11px] font-medium text-on-secondary-container flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  Video ({videoCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  PDF ({pdfCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-on-secondary-container"></span>
                  {t('student_library.filter_completed')} ({completedCount})
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <Link
                  to="/siswa/dashboard"
                  className="flex-1 py-2 px-3.5 rounded-full bg-primary-container text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md hover:bg-primary transition-colors text-center"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    upload_file
                  </span>
                  <span>+ {t('student_library.access_materials')}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleCleanCache}
                  className="px-3.5 py-2 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm text-on-secondary-fixed text-xs font-semibold hover:bg-surface-container-lowest transition-colors shadow-xs"
                >
                  {isCleaningCache ? t('student_dashboard.cleaning') : t('student_dashboard.clean_cache')}
                </button>
              </div>
            </div>
          </div>

          {/* Search & Category Filters Bento */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 border border-surface-container-high/40">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-surface rounded-full text-xs text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors shadow-inner"
                placeholder={t('student_library.search_vault')}
                type="text"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface text-[12px]"
                >
                  ✕
                </button>
              ) : (
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
                  tune
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFilterType("all");
                  setSelectedCourseId(null);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  filterType === "all" && selectedCourseId === null
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {t('student_library.all_materials')} ({allMaterials.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("video")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  filterType === "video"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                Video ({videoCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("pdf")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  filterType === "pdf"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                PDF Handouts ({pdfCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterType("completed")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  filterType === "completed"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {t('student_library.filter_completed')} ({completedCount})
              </button>
            </div>
          </div>

          {/* Resource Folders List (Structured Repositories) */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 border border-surface-container-high/40">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                {t('student_library.structured_repositories')}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCourseId(null)}
                className="text-[11px] text-secondary font-semibold hover:underline"
              >
                {selectedCourseId ? "Reset Filter" : `View All ${courses.length}`}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {courses.map((course, idx) => {
                const variant =
                  folderColorVariants[idx % folderColorVariants.length];
                const isSelected = selectedCourseId === course.id;

                return (
                  <div
                    key={course.id}
                    onClick={() =>
                      navigate(`/siswa/dashboard?courseId=${course.id}`)
                    }
                    className="p-3 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-between group bg-surface hover:bg-surface-container-lowest hover:border-primary/40 border border-surface-container-high/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${variant.avatar} flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          {variant.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {course.materials.length} {t('student_dashboard.materials_progress', { progress: course.progress })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourseId(isSelected ? null : course.id);
                        }}
                        title={isSelected ? "Reset filter materi" : "Filter materi di halaman ini"}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-secondary-fixed text-on-secondary-fixed"
                            : "text-outline hover:text-on-surface hover:bg-surface-container-highest"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isSelected ? "filter_alt_off" : "tune"}
                        </span>
                      </button>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[18px]">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                );
              })}

              {!courses.length && (
                <p className="text-xs text-on-surface-variant text-center py-4">
                  {t('student_dashboard.no_courses')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ==================== CENTER BENTO AREA (COL 5-9) ==================== */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Header with View Controls */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container-high/40">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                {t('student_library.curations')}
              </span>
              <h2 className="text-lg font-bold text-primary mt-0.5">
                {t('student_library.featured_assets')}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center p-0.5 rounded-full bg-surface shadow-inner border border-surface-container-high/40">
                <button
                  type="button"
                  aria-label="Grid View"
                  onClick={() => setViewMode("grid")}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    viewMode === "grid"
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    grid_view
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="List View"
                  onClick={() => setViewMode("list")}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    viewMode === "list"
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    view_list
                  </span>
                </button>
              </div>

              {/* Sort Selection */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "popularity" | "newest" | "duration"
                    )
                  }
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-full bg-surface text-xs font-semibold text-on-surface cursor-pointer shadow-xs border border-surface-container-high/40 outline-none hover:bg-surface-container-highest transition-colors"
                >
                  <option value="popularity">{t('student_library.popularity')}</option>
                  <option value="newest">{t('student_library.newest')}</option>
                  <option value="duration">{t('student_library.duration')}</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[14px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Curated Asset Cards 2x2 Bento Matrix (or List view) */}
          {filteredMaterials.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {filteredMaterials.map((material) => (
                <div
                  key={`${material.courseId}-${material.id}`}
                  onClick={() =>
                    navigate(
                      `/siswa/dashboard?courseId=${material.courseId}&materialId=${material.id}`
                    )
                  }
                  className={`bg-surface-container-low rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-primary/40 cursor-pointer transition-all flex flex-col justify-between group border border-surface-container-high/40 ${
                    viewMode === "list" ? "sm:flex-row sm:items-center sm:gap-4" : ""
                  }`}
                >
                  <div className={viewMode === "list" ? "flex-1 flex gap-4 items-center" : ""}>
                    {/* Media Thumbnail */}
                    <div
                      className={`relative rounded-xl overflow-hidden bg-surface-container shrink-0 ${
                        viewMode === "list"
                          ? "w-28 h-20"
                          : "w-full h-40 mb-3.5"
                      }`}
                    >
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={material.title}
                        src={material.thumbnail}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-surface/90 backdrop-blur-md text-[9px] text-on-surface font-bold uppercase tracking-wider shadow-xs">
                        {material.type === "pdf" ? ".PDF / DOC" : ".MP4 / STREAM"}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary-container text-on-primary text-[10px] font-semibold flex items-center gap-0.5 shadow-xs">
                        <span className="material-symbols-outlined text-[11px] text-tertiary-fixed fill-current">
                          star
                        </span>{" "}
                        {material.completed ? "5.0" : "4.9"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-secondary text-[11px] font-semibold mb-1">
                        <span className="material-symbols-outlined text-[14px]">
                          account_circle
                        </span>
                        <span className="truncate">
                          {material.instructor}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-primary leading-snug mb-1 group-hover:text-secondary transition-colors line-clamp-1">
                        <Link
                          to={`/siswa/dashboard?courseId=${material.courseId}&materialId=${material.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                        >
                          {material.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                        {material.description ||
                          `Modul kurikulum ${material.courseTitle} dengan materi komprehensif.`}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div
                    className={`flex items-center justify-between bg-surface-container-highest/60 rounded-full px-3.5 py-1.5 mt-auto border border-surface-container-high/40 ${
                      viewMode === "list" ? "sm:w-60 shrink-0 sm:mt-0" : ""
                    }`}
                  >
                    <span className="text-[11px] text-on-surface-variant font-medium truncate">
                      {material.durationMinutes || 15} {t('student_library.minutes')} • {material.completed ? t('student_library.completed_badge') : t('student_library.active_badge')}
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {material.url && (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Unduh Berkas Asli"
                          className="w-7 h-7 rounded-full bg-surface text-on-surface flex items-center justify-center hover:bg-surface-container-highest transition-colors shadow-xs border border-surface-container-high/50"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            download
                          </span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/siswa/dashboard?courseId=${material.courseId}&materialId=${material.id}`
                          )
                        }
                        title="Buka di Dashboard Player"
                        className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          play_arrow
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-10 text-center shadow-xs border border-surface-container-high/40">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">
                folder_open
              </span>
              <p className="text-sm font-semibold text-primary">
                {t('student_library.no_materials_found')}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                {t('student_library.no_materials_hint')}
              </p>
            </div>
          )}

          {/* Bottom Bento: Recent Downloads & Cloud Cache Sync */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 border border-surface-container-high/40">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  history
                </span>
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  {t('student_library.recent_downloads', { name: user?.nama || "Siswa" })}
                </h3>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Cloud Cache: Updated live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allMaterials.slice(0, 4).map((item, idx) => (
                <div
                  key={`recent-${idx}`}
                  onClick={() =>
                    navigate(
                      `/siswa/dashboard?courseId=${item.courseId}&materialId=${item.id}`
                    )
                  }
                  className="flex items-center justify-between p-2 rounded-full bg-surface px-3.5 shadow-xs border border-surface-container-high/30 cursor-pointer hover:bg-surface-container-highest hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.type === "pdf"
                          ? "bg-secondary-fixed text-on-secondary-fixed"
                          : "bg-primary text-on-primary"
                      }`}
                    >
                      {item.type === "pdf" ? "PDF" : "MP4"}
                    </span>
                    <span className="text-xs text-on-surface truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 ml-1">
                    play_circle
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT BENTO COLUMN (COL 10-12) ==================== */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Cloud Storage Breakdown Card */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                {t('student_library.quota_breakdown')}
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                pie_chart
              </span>
            </div>

            {/* Inline SVG Ring Chart with Category Legend */}
            <div className="flex items-center gap-4 py-1">
              <div className="relative w-20 h-20 shrink-0">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  {/* Background Circle */}
                  <path
                    className="text-surface-container-highest"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  {/* Segment 1: Video Materials */}
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${videoPercent}, 100`}
                    strokeWidth="4"
                  />
                  {/* Segment 2: PDF Materials */}
                  <path
                    className="text-secondary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${pdfPercent}, 100`}
                    strokeDashoffset={`-${videoPercent}`}
                    strokeWidth="4"
                  />
                  {/* Segment 3: Other / Notes */}
                  <path
                    className="text-secondary-fixed-dim"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${otherPercent}, 100`}
                    strokeDashoffset={`-${videoPercent + pdfPercent}`}
                    strokeWidth="4"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-bold text-primary">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-on-surface truncate">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                    {t('student_library.video_modules')}
                  </span>
                  <span className="font-bold text-primary">{videoCount * 2.8} GB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-on-surface truncate">
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                    {t('student_library.pdf_guides')}
                  </span>
                  <span className="font-semibold text-secondary">{pdfCount * 1.2} GB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-on-surface truncate">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shrink-0"></span>
                    {t('student_library.other_notes')}
                  </span>
                  <span className="font-semibold text-on-surface-variant">3.4 GB</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface flex items-center justify-between text-xs border border-surface-container-high/30">
              <span className="text-on-surface-variant">{t('student_library.free_available')}</span>
              <span className="font-bold text-primary">31.6 GB</span>
            </div>
          </div>

          {/* Studio Software Plugins & Licenses Card */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                {t('student_library.studio_licenses')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-semibold">
                {t('student_library.verified')}
              </span>
            </div>

            {/* License Item 1 */}
            <div className="p-3.5 rounded-xl bg-surface flex flex-col gap-1 shadow-xs border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  Rhino 8 Educational
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary" title="Active"></span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Expires Dec 2026 • Seat #{user?.id || "4412"}
              </p>
              <div className="flex items-center justify-between mt-1 pt-1 bg-surface-container-lowest rounded-full px-3 py-1 border border-surface-container-high/20">
                <code className="text-[10px] text-on-surface-variant font-mono font-medium">
                  {licenseCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-secondary hover:text-primary text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    content_copy
                  </span>{" "}
                  {isCopied ? t('student_library.copied') : t('student_library.copy')}
                </button>
              </div>
            </div>

            {/* License Item 2 */}
            <div className="p-3.5 rounded-xl bg-surface flex flex-col gap-1 shadow-xs border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  Enscape &amp; V-Ray Studio
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary" title="Active"></span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Cloud Node v4.1 • Global License
              </p>
              <div className="flex items-center justify-between mt-1 pt-1 text-[11px]">
                <span className="text-on-surface-variant">
                  GPU Render Farm Ready
                </span>
                <span className="text-secondary font-semibold">Synced</span>
              </div>
            </div>
          </div>

          {/* Community Asset Contributions Card */}
          <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Community Honor
              </span>
              <span className="material-symbols-outlined text-secondary text-[18px]">
                workspace_premium
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface shadow-xs border border-surface-container-high/30">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
                {(user?.nama || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wide font-medium block">
                  Top Contributor
                </span>
                <h4 className="text-xs font-bold text-primary truncate">
                  {user?.nama || "Anna Vance"}
                </h4>
                <span className="text-[11px] text-secondary font-semibold">
                  +{completedCount * 120 + 360} Studio Reputation
                </span>
              </div>
            </div>

            <div
              onClick={() => navigate("/siswa/dashboard")}
              className="p-3 rounded-xl bg-secondary-container/60 text-on-secondary-fixed flex items-start gap-2.5 border border-secondary/20 cursor-pointer hover:bg-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                pending_actions
              </span>
              <div>
                <span className="text-xs font-bold text-on-secondary-fixed block">
                  {t('student_library.active_courses_count', { count: analytics?.activeCourses || 1 })}
                </span>
                <p className="text-[11px] text-on-secondary-container leading-relaxed">
                  {t('student_library.course_completion_hint')}
                </p>
              </div>
            </div>

            {/* Quick Action: Request TA Assistance */}
            <Link
              to="/siswa/diskusi"
              className="w-full py-2 px-3 rounded-full bg-surface hover:bg-surface-container-highest text-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors border border-surface-container-high/40 text-center"
            >
              <span className="material-symbols-outlined text-[16px]">
                contact_support
              </span>
              <span>{t('student_library.contact_ta')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
