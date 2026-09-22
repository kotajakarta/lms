import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminMaterialsPanel } from "./AdminMaterialsPanel.js";

interface Department {
  id: number;
  nama_jurusan: string;
}
interface Course {
  id: number;
  judul: string;
  deskripsi?: string | null;
  thumbnail?: string | null;
  nama_instruktur?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  course_departments: Array<{ department: Department }>;
  _count: {
    materials: number;
    enrollments: number;
    tugas: number;
    jadwal_kursus: number;
  };
}
interface CourseForm {
  judul: string;
  deskripsi: string;
  thumbnail: string;
  nama_instruktur: string;
  start_date: string;
  end_date: string;
  department_ids: string[];
}
const emptyForm: CourseForm = {
  judul: "",
  deskripsi: "",
  thumbnail: "",
  nama_instruktur: "",
  start_date: "",
  end_date: "",
  department_ids: [],
};

export const AdminCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [materialsCourse, setMaterialsCourse] = useState<Course | null>(null);
  const coursesQuery = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: async () => (await api.get<Course[]>("/courses")).data,
  });
  const departmentsQuery = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: async () =>
      (await api.get<Department[]>("/master/departments")).data,
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        department_ids: form.department_ids.map(Number).filter(Boolean),
      };
      return editingId
        ? api.put(`/courses/${editingId}`, payload)
        : api.post("/courses", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      closeForm();
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Kursus gagal disimpan."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] }),
    onError: (err: any) =>
      setError(err.response?.data?.message || "Kursus gagal dihapus."),
  });
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };
  const openEdit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      judul: course.judul,
      deskripsi: course.deskripsi || "",
      thumbnail: course.thumbnail || "",
      nama_instruktur: course.nama_instruktur || "",
      start_date: course.start_date?.slice(0, 10) || "",
      end_date: course.end_date?.slice(0, 10) || "",
      department_ids: course.course_departments.map(({ department }) =>
        String(department.id),
      ),
    });
    setShowForm(true);
    setError(null);
  };
  const toggleDepartment = (id: string) =>
    setForm((current) => ({
      ...current,
      department_ids: current.department_ids.includes(id)
        ? current.department_ids.filter((item) => item !== id)
        : [...current.department_ids, id],
    }));
  const inputClass =
    "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#615a77] focus:ring-2 focus:ring-[#e4dbfe]";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#615a77]">
            Learning studio
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            Kursus
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Buat jalur pembelajaran yang langsung terhubung ke siswa, materi,
            dan jadwal.
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
            setError(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1c1d22] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-black"
        >
          <Plus size={17} /> Buat kursus
        </button>
      </div>
      {error && !showForm && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {coursesQuery.isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-sm text-stone-500">
            Memuat kursus...
          </div>
        ) : (
          coursesQuery.data?.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-3xl border border-[#eee9df] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-32 overflow-hidden bg-[#e4dbfe]">
                {course.thumbnail && course.thumbnail !== "default.jpg" ? (
                  <img
                    src={course.thumbnail}
                    alt={`Thumbnail ${course.judul}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute -right-6 -top-12 h-40 w-40 rounded-full border-[24px] border-white/30" />
                    <BookOpen
                      className="absolute bottom-5 left-5 text-[#615a77]"
                      size={30}
                      strokeWidth={1.5}
                    />
                  </>
                )}
                <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(course)}
                    className="rounded-full bg-white/80 p-2 text-zinc-700 hover:bg-white"
                    title="Edit kursus"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() =>
                      window.confirm(
                        `Hapus kursus ${course.judul}? Data materi, tugas, dan enrollment terkait juga dapat terhapus.`,
                      ) && deleteMutation.mutate(course.id)
                    }
                    className="rounded-full bg-white/80 p-2 text-red-600 hover:bg-white"
                    title="Hapus kursus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">
                      {course.judul}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                      {course.deskripsi || "Belum ada deskripsi kursus."}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#e8efc8] px-2 py-1 text-[10px] font-bold text-[#58701c]">
                    Aktif
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold text-[#615a77]">
                  {course.nama_instruktur || "Instruktur belum ditentukan"}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-4 text-center">
                  <div>
                    <p className="text-base font-bold text-zinc-900">
                      {course._count.materials}
                    </p>
                    <p className="text-[10px] text-stone-500">Materi</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-zinc-900">
                      {course._count.enrollments}
                    </p>
                    <p className="text-[10px] text-stone-500">Siswa</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-zinc-900">
                      {course._count.tugas}
                    </p>
                    <p className="text-[10px] text-stone-500">Tugas</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {course.course_departments.length ? (
                    course.course_departments.map(({ department }) => (
                      <span
                        key={department.id}
                        className="rounded-full bg-[#f6f3ed] px-2.5 py-1 text-[10px] font-semibold text-stone-600"
                      >
                        {department.nama_jurusan}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-stone-400">
                      Semua jurusan
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
        {!coursesQuery.isLoading && !coursesQuery.data?.length && (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-10 text-center md:col-span-2 xl:col-span-3">
            <BookOpen className="mx-auto text-[#615a77]" size={30} />
            <h3 className="mt-3 font-bold text-zinc-900">Belum ada kursus</h3>
            <p className="mt-1 text-sm text-stone-500">
              Buat kursus pertama untuk mulai mengisi pengalaman belajar siswa.
            </p>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1d22]/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-[#fcf9f3] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#615a77]">
                  {editingId ? "Perbarui course" : "Learning studio"}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                  {editingId ? "Edit kursus" : "Buat kursus baru"}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="rounded-full bg-white p-2 text-stone-500 hover:text-zinc-900"
                aria-label="Tutup"
              >
                <X size={19} />
              </button>
            </div>
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate();
              }}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
                Judul kursus
                <input
                  required
                  value={form.judul}
                  onChange={(event) =>
                    setForm({ ...form, judul: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Contoh: Spatial Design Fundamentals"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
                Deskripsi
                <textarea
                  value={form.deskripsi}
                  onChange={(event) =>
                    setForm({ ...form, deskripsi: event.target.value })
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="Tujuan dan ringkasan pembelajaran"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
                Thumbnail kursus
                <input
                  type="url"
                  value={form.thumbnail}
                  onChange={(event) =>
                    setForm({ ...form, thumbnail: event.target.value })
                  }
                  className={inputClass}
                  placeholder="https://contoh.com/gambar-kursus.jpg"
                />
                <span className="mt-1 block text-[11px] font-normal text-stone-500">
                  URL gambar akan tampil di kartu admin dan analitik siswa.
                </span>
              </label>
              <label className="text-sm font-semibold text-zinc-700">
                Nama instruktur
                <input
                  value={form.nama_instruktur}
                  onChange={(event) =>
                    setForm({ ...form, nama_instruktur: event.target.value })
                  }
                  className={inputClass}
                  placeholder="Nama instruktur"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm font-semibold text-zinc-700">
                  Mulai
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(event) =>
                      setForm({ ...form, start_date: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
                <label className="text-sm font-semibold text-zinc-700">
                  Selesai
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(event) =>
                      setForm({ ...form, end_date: event.target.value })
                    }
                    className={inputClass}
                  />
                </label>
              </div>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold text-zinc-700">
                  Jurusan yang dituju{" "}
                  <span className="font-normal text-stone-400">(opsional)</span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {departmentsQuery.data?.map((department) => (
                    <label
                      key={department.id}
                      className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold transition ${form.department_ids.includes(String(department.id)) ? "border-[#615a77] bg-[#e4dbfe] text-[#49435f]" : "border-stone-200 bg-white text-stone-600 hover:bg-[#f6f3ed]"}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.department_ids.includes(
                          String(department.id),
                        )}
                        onChange={() => toggleDepartment(String(department.id))}
                        className="sr-only"
                      />
                      {department.nama_jurusan}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex justify-end gap-3 pt-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-white"
                >
                  Batal
                </button>
                <button
                  disabled={saveMutation.isPending}
                  className="rounded-full bg-[#1c1d22] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saveMutation.isPending
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan perubahan"
                      : "Buat kursus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {materialsCourse && (
        <AdminMaterialsPanel
          courseId={materialsCourse.id}
          courseTitle={materialsCourse.judul}
          onClose={() => setMaterialsCourse(null)}
        />
      )}
    </div>
  );
};

export default AdminCoursesPage;
