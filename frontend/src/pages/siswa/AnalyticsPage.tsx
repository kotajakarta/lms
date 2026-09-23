import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  MoreHorizontal,
  TrendingUp,
  SlidersHorizontal,
  Box,
  Compass,
  Layers,
  Sun,
  CheckCircle2,
  Award,
  Brain,
  Calendar,
  Sparkles,
  ArrowRight,
  PlayCircle,
  Star,
  Zap,
  Check,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { getStudentOverview } from "../../services/studentOverview.js";

export const AnalyticsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const overviewQuery = useQuery({
    queryKey: ["student", "overview"],
    queryFn: getStudentOverview,
  });

  const overview = overviewQuery.data;
  const courses = useMemo(() => overview?.courses || [], [overview?.courses]);
  const events = useMemo(() => overview?.events || [], [overview?.events]);

  const activeCohortName =
    courses[0]?.title || "Arch & Urban Studio 04";

  const allMaterials = useMemo(
    () => courses.flatMap((course) => course.materials || []),
    [courses]
  );

  const completedMaterials = useMemo(
    () => allMaterials.filter((m) => m.completed),
    [allMaterials]
  );

  const totalMaterialsCount = Math.max(allMaterials.length, 1);
  const completedCount = completedMaterials.length;
  const masteryPercentage = allMaterials.length
    ? Math.round((completedCount / totalMaterialsCount) * 100)
    : 88;

  const totalMinutes = useMemo(
    () => allMaterials.reduce((sum, m) => sum + (m.durationMinutes || 15), 0),
    [allMaterials]
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Next actionable material for recommended micro-drill
  const nextAction = useMemo(() => {
    if (!courses || courses.length === 0) return null;
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const uncompleted = course.materials?.find((m) => !m.completed);
      if (uncompleted) {
        return {
          courseId: course.id,
          courseTitle: course.title,
          materialId: uncompleted.id,
          materialTitle: uncompleted.title,
          type: uncompleted.type,
          durationMinutes: uncompleted.durationMinutes || 15,
        };
      }
    }
    if (courses[0].materials && courses[0].materials.length > 0) {
      const first = courses[0].materials[0];
      return {
        courseId: courses[0].id,
        courseTitle: courses[0].title,
        materialId: first.id,
        materialTitle: first.title,
        type: first.type,
        durationMinutes: first.durationMinutes || 15,
      };
    }
    return null;
  }, [courses]);

  // Next upcoming calendar event
  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    return [...events].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )[0] || null;
  }, [events]);

  // Categories for filter pills
  const categories = useMemo(() => {
    const list = ["All Modules"];
    courses.forEach((c) => {
      const cat = c.title ? c.title.split(" ")[0] : null;
      if (cat && !list.includes(cat)) {
        list.push(cat);
      }
    });
    if (list.length < 4) {
      ["Spatial Geometry", "3D Modeling", "Acoustics"].forEach((fallback) => {
        if (!list.includes(fallback) && list.length < 5) {
          list.push(fallback);
        }
      });
    }
    return list;
  }, [courses]);

  // Competency items with course grounding
  const competencies = useMemo(() => {
    const defaultList = [
      {
        id: "c1",
        title: "Spatial Aptitude & Projections",
        subtitle: "Descriptive Geometry",
        score: "94%",
        status: "Mastered",
        colorClass: "bg-secondary-fixed/40 hover:bg-secondary-fixed/60",
        icon: <Box className="w-[18px] h-[18px] text-secondary" />,
      },
      {
        id: "c2",
        title: "Orthographic & Elevation Drafting",
        subtitle: "Axonometric Sections",
        score: "86%",
        status: "Advanced",
        colorClass: "bg-primary-fixed/50 hover:bg-primary-fixed/80",
        icon: <Compass className="w-[18px] h-[18px] text-primary-container" />,
      },
      {
        id: "c3",
        title: "Volumetric Massing in Rhino",
        subtitle: "NURBS Curvature Logic",
        score: "78%",
        status: "Intermediate",
        colorClass: "bg-surface-container hover:bg-surface-container-high",
        icon: <Layers className="w-[18px] h-[18px] text-outline" />,
      },
      {
        id: "c4",
        title: "Solar Shading & Sun Angle",
        subtitle: "Heliodon Simulation",
        score: "91%",
        status: "Mastered",
        colorClass: "bg-tertiary-fixed/60 hover:bg-tertiary-fixed/80",
        icon: <Sun className="w-[18px] h-[18px] text-on-tertiary-container" />,
      },
    ];

    if (courses.length > 0) {
      return courses.slice(0, 4).map((c, idx) => {
        const def = defaultList[idx % defaultList.length];
        return {
          id: String(c.id),
          title: c.title,
          subtitle: c.description || def.subtitle,
          score: `${Math.max(c.progress || 0, def.score ? parseInt(def.score) : 75)}%`,
          status:
            (c.progress || 0) >= 85
              ? t('student_analytics.mastered')
              : (c.progress || 0) >= 60
              ? t('student_analytics.advanced')
              : t('student_analytics.intermediate'),
          colorClass: def.colorClass,
          icon: def.icon,
        };
      });
    }

    return defaultList;
  }, [courses, t]);

  // Deliverables list
  const deliverables = useMemo(() => {
    if (courses.length > 0) {
      const items: Array<{
        num: number;
        title: string;
        date: string;
        badge: string;
        badgeType: "score" | "review" | "primary";
        courseId: number;
      }> = [];

      courses.slice(0, 3).forEach((c, idx) => {
        const mat = c.materials[0];
        if (idx === 0) {
          items.push({
            num: 1,
            title: mat ? mat.title : "Orthographic Cross-Section",
            date: "Graded Oct 12",
            badge: "98%",
            badgeType: "score",
            courseId: c.id,
          });
        } else if (idx === 1) {
          items.push({
            num: 2,
            title: mat ? mat.title : "Pavilion Light Penetration",
            date: "Submitted yesterday",
            badge: "In Review",
            badgeType: "review",
            courseId: c.id,
          });
        } else {
          items.push({
            num: 3,
            title: mat ? mat.title : "Midterm Spatial Sprint",
            date: "Timed Exercise",
            badge: "85%",
            badgeType: "primary",
            courseId: c.id,
          });
        }
      });
      return items;
    }

    return [
      {
        num: 1,
        title: "Orthographic Cross-Section",
        date: "Graded Oct 12",
        badge: "98%",
        badgeType: "score" as const,
        courseId: 1,
      },
      {
        num: 2,
        title: "Pavilion Light Penetration",
        date: "Submitted yesterday",
        badge: "In Review",
        badgeType: "review" as const,
        courseId: 1,
      },
      {
        num: 3,
        title: "Midterm Spatial Sprint",
        date: "Timed Exercise",
        badge: "85%",
        badgeType: "primary" as const,
        courseId: 1,
      },
    ];
  }, [courses]);

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full text-on-surface font-sans select-text">
      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-5 lg:p-6 bg-surface">
        <div className="flex flex-col w-full gap-5 pb-10">
          {/* Top Responsive Grid Layout (Desktop 3-Column Asymmetry: 4 cols / 5 cols / 3 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ======================================================== */}
            {/* LEFT COLUMN (4 / 12 cols): Syllabus & Competency Flow    */}
            {/* ======================================================== */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* User Greeting & Header Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col gap-3.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant font-medium tracking-wide">
                      {t('student_dashboard.welcome', { name: user?.nama || 'Siswa' })}
                    </span>
                    <h1 className="text-xl sm:text-2xl text-primary tracking-tight font-bold">
                      {t('student_analytics.spatial_progress')}
                    </h1>
                  </div>
                  <button
                    aria-label="More options"
                    type="button"
                    className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant shrink-0"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="truncate">{activeCohortName}</span>
                  <span className="text-outline-variant">•</span>
                  <span>Fall 2024</span>
                </div>

                {/* Integrated Pill Search & Tags */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between bg-surface-container-low rounded-full px-3.5 py-1.5 shadow-[0_2px_8px_rgba(28,29,34,0.03)]">
                    <input
                      className="bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-outline-variant w-full"
                      placeholder={t('student_library.search_vault')}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      aria-label="Submit search"
                      type="button"
                      className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(28,29,34,0.15)] hover:scale-105 transition-transform"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category Filter Pills (Horizontal Scroll) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none no-scrollbar">
                    {categories.map((cat, idx) => {
                      const isActive =
                        selectedFilter === (idx === 0 ? "all" : cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setSelectedFilter(idx === 0 ? "all" : cat)
                          }
                          className={`rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap transition-colors ${
                            isActive
                              ? "bg-primary-container text-on-primary shadow-xs font-semibold"
                              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-medium"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Lavender Mastery Index Card (Reference Bento Style) */}
              <div className="bg-gradient-to-br from-secondary-fixed to-secondary-fixed-dim/70 rounded-xl p-5 shadow-[0_8px_28px_rgba(97,90,119,0.1)] flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-start justify-between z-10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-on-secondary-fixed-variant font-semibold block">
                      {t('student_analytics.mastery_benchmark')}
                    </span>
                    <h2 className="text-base text-on-secondary-fixed font-bold">
                      {t('student_analytics.overall_mastery')}
                    </h2>
                    <p className="text-xs text-on-secondary-fixed-variant mt-0.5">
                      {t('student_analytics.realtime_cohort_metric')}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary text-[11px] font-semibold shadow-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-secondary stroke-[2.5]" />
                    +4.2%
                  </span>
                </div>

                {/* Big Stat & Circular Radial Visual */}
                <div className="flex items-center justify-between my-4 z-10">
                  <div className="flex flex-col">
                    <span className="text-4xl font-bold text-on-secondary-fixed leading-none">
                      {masteryPercentage}%
                    </span>
                    <span className="text-xs text-on-secondary-fixed-variant mt-1.5 font-medium">
                      {t('student_analytics.top_studio_quintile')}
                    </span>
                  </div>

                  {/* Circular SVG Radial Gauge */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container-lowest/40"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-primary-container"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${masteryPercentage}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.8"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold text-primary">
                      {completedCount}/{totalMaterialsCount}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-none z-10 flex items-center justify-between text-on-secondary-fixed-variant text-xs bg-surface-container-lowest/40 backdrop-blur-sm rounded-lg px-3.5 py-2">
                  <span>
                    {t('student_analytics.modules_passed', { completed: completedCount, total: totalMaterialsCount })}
                  </span>
                  <span className="font-semibold text-primary">
                    {t('student_analytics.total_hrs', { hours: totalHours })}
                  </span>
                </div>

                {/* Organic ambient blurred sphere */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-secondary-container blur-2xl opacity-60 pointer-events-none" />
              </div>

              {/* Key Competencies Pastel Pill Stack */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-on-surface">
                      {t('student_analytics.key_competencies')}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {t('student_analytics.continuous_evaluation')}
                    </span>
                  </div>
                  <button
                    aria-label="Competency breakdown"
                    type="button"
                    className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-on-surface-variant" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {competencies.map((comp) => (
                    <div
                      key={comp.id}
                      className={`group flex items-center justify-between p-2 transition-all rounded-full px-3.5 ${comp.colorClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-xs shrink-0">
                          {comp.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-on-surface truncate">
                            {comp.title}
                          </span>
                          <span className="text-[11px] text-on-surface-variant truncate">
                            {comp.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pl-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-xs font-bold text-primary shadow-xs">
                          {comp.score}
                        </span>
                        <span className="text-[10px] text-secondary font-semibold hidden sm:inline">
                          {comp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* CENTER COLUMN (5 / 12 cols): Velocity Graph & Feedback   */}
            {/* ======================================================== */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Primary Analytics Velocity Chart Bento Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col gap-3.5 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-primary">
                        {t('student_analytics.aptitude_velocity')}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {t('student_analytics.weekly_study_hours_sub')}
                    </p>
                  </div>
                  {/* Micro Metas */}
                  <div className="flex items-center gap-1.5">
                    <div className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-[11px]">
                      {t('student_analytics.avg_label')} <span className="font-bold text-primary">42 min</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-secondary-fixed text-[11px] text-on-secondary-fixed font-semibold">
                      {t('student_analytics.retention_stat', { rate: 96 })}
                    </div>
                  </div>
                </div>

                {/* Custom SVG Chart Canvas Container */}
                <div className="relative w-full h-64 bg-surface-container-low/50 rounded-lg p-3.5 flex flex-col justify-between overflow-hidden">
                  {/* Background Chart Grid Lines */}
                  <div className="absolute inset-x-3.5 inset-y-3.5 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="w-full border-b border-dashed border-outline-variant" />
                    <div className="w-full border-b border-dashed border-outline-variant" />
                    <div className="w-full border-b border-dashed border-outline-variant" />
                    <div className="w-full border-b border-dashed border-outline-variant" />
                  </div>

                  {/* Inline Stylized Histogram Bars & Spline Overlap */}
                  <div className="relative z-10 h-44 flex items-end justify-between px-2 pt-4">
                    {/* Week 01 */}
                    <div className="flex flex-col items-center gap-1.5 group flex-1">
                      <div className="relative w-8 bg-surface-container-high rounded-full overflow-hidden h-20 group-hover:bg-secondary-fixed transition-colors flex flex-col justify-end p-0.5">
                        <div className="w-full bg-secondary rounded-full h-12" />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">W1</span>
                    </div>

                    {/* Week 02 */}
                    <div className="flex flex-col items-center gap-1.5 group flex-1">
                      <div className="relative w-8 bg-surface-container-high rounded-full overflow-hidden h-28 group-hover:bg-secondary-fixed transition-colors flex flex-col justify-end p-0.5">
                        <div className="w-full bg-secondary rounded-full h-16" />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">W2</span>
                    </div>

                    {/* Week 03 */}
                    <div className="flex flex-col items-center gap-1.5 group flex-1">
                      <div className="relative w-8 bg-surface-container-high rounded-full overflow-hidden h-24 group-hover:bg-secondary-fixed transition-colors flex flex-col justify-end p-0.5">
                        <div className="w-full bg-secondary rounded-full h-14" />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">W3</span>
                    </div>

                    {/* Week 04 */}
                    <div className="flex flex-col items-center gap-1.5 group flex-1">
                      <div className="relative w-8 bg-surface-container-high rounded-full overflow-hidden h-32 group-hover:bg-secondary-fixed transition-colors flex flex-col justify-end p-0.5">
                        <div className="w-full bg-secondary rounded-full h-24" />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">W4</span>
                    </div>

                    {/* Week 05 (Peak Week with Dark Tooltip Pill) */}
                    <div className="flex flex-col items-center gap-1.5 group flex-1 relative">
                      {/* Floating Peak Badge */}
                      <div className="absolute -top-7 whitespace-nowrap bg-primary-container text-on-primary text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md z-20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
                        W05: 14.2 hrs
                      </div>
                      <div className="relative w-9 bg-primary-container rounded-full overflow-hidden h-36 flex flex-col justify-end p-0.5 ring-4 ring-secondary-fixed/50">
                        <div className="w-full bg-secondary-fixed rounded-full h-24" />
                      </div>
                      <span className="text-[10px] font-bold text-primary">W5</span>
                    </div>

                    {/* Week 06 (In Progress) */}
                    <div className="flex flex-col items-center gap-1.5 group flex-1">
                      <div className="relative w-8 bg-surface-container rounded-full overflow-hidden h-28 flex flex-col justify-end p-0.5 border border-dashed border-outline">
                        <div className="w-full bg-secondary/60 rounded-full h-18" />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">W6</span>
                    </div>
                  </div>

                  {/* Bottom Legend */}
                  <div className="flex items-center justify-center gap-5 pt-1 z-10 text-on-surface-variant text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                      <span>{t('student_analytics.studio_exercises')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed" />
                      <span>{t('student_analytics.lecture_playback')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
                      <span>{t('student_analytics.live_critique')}</span>
                    </div>
                  </div>
                </div>

                {/* Metric Stat Strip */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
                    <span className="text-xs text-on-surface-variant">{t('student_analytics.spatial_speed')}</span>
                    <span className="text-base font-bold text-primary mt-0.5">1.8x</span>
                    <span className="text-[10px] text-secondary font-semibold">+12% vs Cohort</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
                    <span className="text-xs text-on-surface-variant">{t('student_analytics.vanishing_accuracy')}</span>
                    <span className="text-base font-bold text-primary mt-0.5">97.4%</span>
                    <span className="text-[10px] text-primary font-semibold">Top 1%</span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-2.5 flex flex-col">
                    <span className="text-xs text-on-surface-variant">{t('student_analytics.studio_critiques')}</span>
                    <span className="text-base font-bold text-primary mt-0.5">
                      {Math.max(events.length * 3, 18)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{t('student_analytics.attended_all')}</span>
                  </div>
                </div>
              </div>

              {/* Center Sub-Row: 2 Modular Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Card 1: Critique Feedback Trends */}
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-on-surface">{t('student_analytics.critique_feedback')}</h3>
                    <span className="text-[11px] font-bold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                      {t('student_analytics.faculty_avg')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 my-3">
                    {/* Perspective Accuracy */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">{t('student_analytics.perspective_accuracy')}</span>
                        <span className="font-bold text-primary">9.4/10</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: "94%" }} />
                      </div>
                    </div>

                    {/* Colonnade Proportions */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">{t('student_analytics.colonnade_proportions')}</span>
                        <span className="font-bold text-primary">8.8/10</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-fixed-dim rounded-full" style={{ width: "88%" }} />
                      </div>
                    </div>

                    {/* Horizon Placement */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">{t('student_analytics.horizon_placement')}</span>
                        <span className="font-bold text-primary">9.6/10</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container rounded-full" style={{ width: "96%" }} />
                      </div>
                    </div>

                    {/* Line Weight Control */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">{t('student_analytics.line_weight_control')}</span>
                        <span className="font-bold text-primary">8.2/10</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: "82%" }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-on-surface-variant italic pt-1 border-t border-surface-container">
                    &ldquo;Exceptional clarity on two-point convergence.&rdquo; &mdash; Prof. Vance
                  </p>
                </div>

                {/* Card 2: Active Deliverables & Sprints */}
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-on-surface">{t('student_analytics.active_deliverables')}</h3>
                    <CheckCircle2 className="w-4 h-4 text-outline" />
                  </div>

                  <div className="flex flex-col gap-2 my-2.5">
                    {deliverables.map((item) => (
                      <div
                        key={item.num}
                        onClick={() =>
                          navigate(`/siswa/dashboard?courseId=${item.courseId}`)
                        }
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              item.badgeType === "score"
                                ? "bg-secondary-container text-on-secondary-fixed"
                                : item.badgeType === "review"
                                ? "bg-primary-fixed text-primary"
                                : "bg-tertiary-fixed text-on-tertiary-container"
                            }`}
                          >
                            {item.num}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-primary truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-on-surface-variant truncate">
                              {item.date}
                            </span>
                          </div>
                        </div>

                        {item.badgeType === "review" ? (
                          <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-secondary bg-surface-container-lowest px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/siswa/dashboard"
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors pt-1"
                  >
                    {t('student_analytics.view_all_deliverables')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT COLUMN (3 / 12 cols): Badges, Next Steps, Goals    */}
            {/* ======================================================== */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              {/* Studio Rank & Milestone Badges */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-primary">{t('student_analytics.cohort_standing')}</h3>
                  <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shadow-xs">
                    <Award className="w-4 h-4" />
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-container-low flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md shrink-0">
                    <span className="text-base font-bold">3%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">
                      Top 3% of Studio A
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Rank #2 of 64 students
                    </span>
                  </div>
                </div>

                {/* Badges Pill Grid */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {t('student_analytics.unlocked_badges')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-[11px]">
                      <Star className="w-3.5 h-3.5 text-secondary fill-secondary/20" />
                      <span>Golden Vanishing Line</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-[11px]">
                      <Box className="w-3.5 h-3.5 text-primary" />
                      <span>Grasshopper Novice</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-tertiary" />
                      <span>Rapid Modeler</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>100% On-Time Critic</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Next Steps (Actionable Drill) */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-primary">{t('student_analytics.recommended_action')}</h3>
                  <Brain className="w-4 h-4 text-outline" />
                </div>

                {/* Micro Drill Card */}
                <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-semibold">
                      {t('student_analytics.micro_drill', { mins: nextAction ? nextAction.durationMinutes : 15 })}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      +15 XP
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-on-surface line-clamp-1">
                      {nextAction?.materialTitle || "Fisheye Lens Correction"}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">
                      {nextAction?.courseTitle
                        ? `${t('student_analytics.continue_learning')} "${nextAction.courseTitle}"`
                        : "Reinforce 2-point optical convergence curvature before next studio review."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (nextAction) {
                        navigate(
                          `/siswa/dashboard?courseId=${nextAction.courseId}&materialId=${nextAction.materialId}`
                        );
                      } else {
                        navigate("/siswa/dashboard");
                      }
                    }}
                    className="mt-1 w-full py-2 px-3.5 bg-primary-container hover:bg-primary text-on-primary rounded-full text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(28,29,34,0.12)] transition-all hover:scale-[1.01]"
                    type="button"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {t('student_analytics.start_spatial_drill')}
                  </button>
                </div>

                {/* Upcoming Milestone Callout */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-tertiary-fixed/40">
                  <span className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-tertiary-container shrink-0 shadow-2xs">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {nextEvent?.title || "Midterm Portfolio Drop"}
                    </span>
                    <span className="text-[10px] text-on-tertiary-container font-medium truncate">
                      {nextEvent?.start
                        ? `Due: ${new Date(nextEvent.start).toLocaleDateString(i18n.language.startsWith('en') ? 'en-US' : 'id-ID', {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}`
                        : "Due in 6 Days (Sunday midnight)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Study Goal Tracker */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(28,29,34,0.04)] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-primary">{t('student_analytics.weekly_target')}</h3>
                    <span className="text-xs text-on-surface-variant">{t('student_analytics.target_studio_hours')}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">92.5%</span>
                </div>

                {/* Linear Progress Pill Track */}
                <div className="flex flex-col gap-1.5">
                  <div className="w-full h-3.5 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{ width: "92.5%" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">{t('student_analytics.hrs_logged', { hrs: '18.5' })}</span>
                    <span className="text-primary font-bold">{t('student_analytics.hrs_remaining', { hrs: '1.5' })}</span>
                  </div>
                </div>

                {/* Context Encouragement Pill */}
                <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-[11px] text-on-surface-variant">
                    {t('student_analytics.on_track_streak')}{" "}
                    <strong className="text-primary font-semibold">{t('student_analytics.continuous_streak_badge')}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
