import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  Star,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MonitorPlay,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { getStudentOverview } from "../../services/studentOverview.js";
import { Link } from "react-router-dom";

const tones = [
  "bg-blue-50 text-blue-700 border border-blue-200/60",
  "bg-slate-100 text-slate-700 border border-slate-200/80",
  "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
  "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
];

const gradientTones = [
  "from-slate-100 to-blue-50",
  "from-slate-100 to-indigo-50",
  "from-blue-100/60 to-slate-50",
  "from-indigo-100/60 to-slate-50",
];

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const overviewQuery = useQuery({
    queryKey: ["student", "overview"],
    queryFn: getStudentOverview,
  });

  const overview = overviewQuery.data;
  const courses = overview?.courses || [];
  const events = overview?.events || [];
  const materials = courses.flatMap((course) => course.materials || []);
  const completed = materials.filter((material) => material.completed).length;
  const totalMinutes = materials.reduce(
    (sum, material) => sum + (material.durationMinutes || 0),
    0,
  );

  const upcomingEvents = events
    .filter((event) => new Date(event.start).getTime() >= Date.now())
    .slice(0, 2);

  const chartBars = [58, 73, 48, 66, 54, 80, 68];

  // Format tanggal dinamis
  const today = new Date();
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    today,
  );
  const fullDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(today);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full bg-slate-50/50 p-5 md:p-8 gap-8 overflow-y-auto text-slate-900">
      {/* KIRI: Konten Utama */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        {/* Header (Top Courses) */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Top courses you may like
            </h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.slice(0, 6).map((course, index) => (
              <Link
                key={course.id}
                to={`/siswa/dashboard?courseId=${course.id}`}
                className="border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md hover:border-blue-200 transition bg-white flex flex-col gap-3"
              >
                {/* Image Placeholder */}
                <div
                  className={`relative h-40 w-full rounded-xl overflow-hidden bg-gradient-to-br ${gradientTones[index % gradientTones.length]} flex items-center justify-center`}
                >
                  {course.thumbnail && course.thumbnail !== "default.jpg" ? (
                    <img
                      src={course.thumbnail}
                      alt={`Thumbnail ${course.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen size={48} className="text-slate-400 opacity-60" />
                  )}
                  <button className="absolute top-3 right-3 bg-white/70 backdrop-blur-md p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-blue-600 transition shadow-xs">
                    <Bookmark size={18} />
                  </button>
                </div>

                <div className="flex justify-between items-center px-1 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${tones[index % tones.length]}`}
                  >
                    {course.progress >= 60 ? "Intermediate" : "Beginner"}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {course.materials?.length || 0}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star size={14} className="fill-amber-500" /> 4.9
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 px-1 leading-snug">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 mt-auto pt-2 px-1 pb-1">
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                    {(course.instructor || "I")[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate">
                    {course.instructor || "Instruktur"}
                  </span>
                </div>
              </Link>
            ))}

            {courses.length === 0 && (
              <div className="col-span-1 sm:col-span-2 xl:col-span-3 p-6 text-center text-slate-500 border border-dashed border-slate-300 rounded-2xl bg-white">
                Belum ada kursus yang tersedia.
              </div>
            )}
          </div>
        </section>

        {/* My Courses */}
        <section className="mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">My Courses</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
              View all
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {courses.slice(0, 5).map((course, index) => (
              <Link
                to={`/siswa/dashboard?courseId=${course.id}`}
                key={course.id}
                className="flex items-center justify-between p-3.5 border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-sm hover:border-blue-200 transition bg-white"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl shrink-0 ${tones[index % tones.length]}`}
                  >
                    <MonitorPlay size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      Progress: {course.progress || 0}% ·{" "}
                      {course.materials?.length || 0} lessons
                    </p>
                    <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(course.progress || 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition shrink-0 ml-4 border border-blue-200/60">
                  Continue <ArrowRight size={14} />
                </button>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* KANAN: Sidebar Statistik & Jadwal */}
      <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col gap-8 shrink-0">
        {/* Header Sidebar (Date & User) */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{dayName}</h2>
            <p className="text-sm text-slate-500 font-medium">{fullDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 border border-slate-200/90 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
              {(user?.nama || "S").slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Calendar Widget (Simplified) */}
        <div className="border border-slate-200/90 bg-white rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-6 text-slate-800 font-bold">
            <button>
              <ChevronLeft size={20} className="text-slate-400 hover:text-slate-600" />
            </button>
            <span className="flex items-center gap-2 text-sm">
              <CalendarDays size={16} className="text-blue-600" />{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
              }).format(today)}
            </span>
            <button>
              <ChevronRight size={20} className="text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          <div className="flex justify-between text-center">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day, i) => {
              const baseDate = today.getDate();
              const date = baseDate - today.getDay() + i + 1;
              const isActive =
                day ===
                new Intl.DateTimeFormat("en-US", { weekday: "short" })
                  .format(today)
                  .substring(0, 2);

              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30" : "text-slate-700"}`}
                  >
                    {date > 0 && date <= 31 ? date : 1}
                  </div>
                  {(i === 2 || i === 4) && (
                    <div className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule / Events */}
        <div className="flex flex-col gap-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 border border-slate-200/90 bg-white rounded-2xl shadow-xs hover:border-blue-200 hover:bg-slate-50/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-600 shrink-0 shadow-sm shadow-blue-600/30">
                  <Clock3 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                    {event.type}
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {event.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {new Date(event.start).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 shrink-0" />
            </div>
          ))}
          {!upcomingEvents.length && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 text-xs text-slate-400 text-center shadow-xs">
              Tidak ada jadwal mendatang.
            </div>
          )}
        </div>

        {/* Overall Information */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Overall Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200/90 bg-white rounded-2xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Total Kursus
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-900 text-lg">
                    {courses.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200/90 bg-white rounded-2xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Materi Selesai
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-900 text-lg">
                    {completed}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200/90 bg-white rounded-2xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Total Materi
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-900 text-lg">
                    {materials.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200/90 bg-white rounded-2xl p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                <Clock3 size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Durasi (Menit)
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-900 text-lg">
                    {totalMinutes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Productivity Chart */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Productivity</h3>
            <button className="text-xs font-semibold text-blue-600 flex items-center hover:text-blue-800">
              View details <ChevronRight size={14} />
            </button>
          </div>

          <div className="border border-slate-200/90 bg-white rounded-2xl p-5 shadow-xs h-48 flex items-end justify-between relative pt-8">
            <div className="absolute left-4 top-4 bottom-8 flex flex-col justify-between text-[9px] text-slate-400 font-medium">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="w-full pl-8 flex justify-between items-end h-full pb-6">
              {chartBars.map((height, i) => (
                <div
                  key={i}
                  className="w-3 bg-slate-100 rounded-t-full h-full relative flex flex-col justify-end"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full bg-blue-600 rounded-t-full absolute bottom-0 z-10 transition-all duration-500 hover:bg-blue-700 cursor-pointer shadow-xs"
                  />
                </div>
              ))}
            </div>

            <div className="absolute bottom-2 left-12 right-2 flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPage;
