import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Film, Link2, Pencil, Trash2, Upload, X } from "lucide-react";
import { api } from "../../services/api.js";

type MaterialType = "pdf" | "video" | "gdrive_video";
interface Material {
  id: number;
  judul: string;
  deskripsi?: string | null;
  tipe: MaterialType;
  file_path?: string | null;
  video_url?: string | null;
  duration_minutes: number;
  urutan?: number | null;
}
interface Props {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
}

export const AdminMaterialsPanel: React.FC<Props> = ({
  courseId,
  courseTitle,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [type, setType] = useState<MaterialType>("pdf");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const materialsQuery = useQuery({
    queryKey: ["admin", "materials", courseId],
    queryFn: async () =>
      (await api.get<Material[]>(`/courses/${courseId}/materials`)).data,
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("judul", title);
      data.append("deskripsi", description);
      data.append("tipe", type);
      data.append("duration_minutes", duration || "0");
      if (type === "gdrive_video") data.append("video_url", youtubeUrl);
      if (file) data.append("file", file);
      return editingId
        ? api.put(`/courses/${courseId}/materials/${editingId}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : api.post(`/courses/${courseId}/materials`, data, {
        headers: { "Content-Type": "multipart/form-data" },
          });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "materials", courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setDuration("");
      setFile(null);
      setEditingId(null);
      setError(null);
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Materi gagal disimpan."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/courses/${courseId}/materials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "materials", courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Materi gagal dihapus."),
  });
  const resetFile = (event: React.ChangeEvent<HTMLInputElement>) =>
    setFile(event.target.files?.[0] || null);
  const typeOptions = [
    { value: "pdf" as const, label: "PDF", icon: FileText },
    { value: "video" as const, label: "Video upload", icon: Film },
    { value: "gdrive_video" as const, label: "YouTube URL", icon: Link2 },
  ];
  const inputClass =
    "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#615a77] focus:ring-2 focus:ring-[#e4dbfe]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1d22]/45 p-4 backdrop-blur-sm">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-[#fcf9f3] p-6 shadow-2xl sm:p-8">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#615a77]">
              Learning materials
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              {courseTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white p-2 text-stone-500 hover:text-zinc-900"
            aria-label="Tutup materi"
          >
            <X size={19} />
          </button>
        </header>
        {error && (
          <div className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            uploadMutation.mutate();
          }}
          className="mt-6 rounded-3xl border border-[#eee9df] bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
              Judul materi
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={inputClass}
                placeholder="Contoh: Modul 1 - Perspektif Dasar"
              />
            </label>
            <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
              Deskripsi
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={inputClass}
                rows={2}
              />
            </label>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-semibold text-zinc-700">
                Sumber materi
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {typeOptions.map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold transition ${type === value ? "border-[#615a77] bg-[#e4dbfe] text-[#49435f]" : "border-stone-200 bg-[#f6f3ed] text-stone-600"}`}
                  >
                    <input
                      type="radio"
                      name="material-type"
                      value={value}
                      checked={type === value}
                      onChange={() => {
                        setType(value);
                        setFile(null);
                      }}
                      className="sr-only"
                    />
                    <Icon size={17} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {type === "gdrive_video" ? (
              <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
                URL YouTube
                <input
                  required
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  className={inputClass}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <span className="mt-1 block text-[11px] font-normal text-stone-500">
                  Gunakan link video YouTube biasa atau short link.
                </span>
              </label>
            ) : (
              <label className="text-sm font-semibold text-zinc-700 sm:col-span-2">
                File {type === "pdf" ? "PDF" : "video"}
                <span className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-[#f6f3ed] px-3 py-3 text-sm font-normal text-stone-600 hover:bg-[#eee9df]">
                  <Upload size={17} />
                  {file
                    ? file.name
                    : `Pilih ${type === "pdf" ? "file PDF" : "file video"}`}
                  <input
                    required={!editingId}
                    type="file"
                    accept={type === "pdf" ? "application/pdf,.pdf" : "video/*"}
                    onChange={resetFile}
                    className="sr-only"
                  />
                </span>
              </label>
            )}
            <label className="text-sm font-semibold text-zinc-700">
              Durasi (menit)
              <input
                type="number"
                min="0"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className={inputClass}
                placeholder="Contoh: 24"
              />
            </label>
            <div className="flex items-end justify-end">
              <button
                disabled={uploadMutation.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-[#1c1d22] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                <Upload size={16} />
                {uploadMutation.isPending
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan perubahan"
                    : "Simpan materi"}
              </button>
            </div>
          </div>
        </form>
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900">
              Materi tersimpan
            </h3>
            <span className="rounded-full bg-[#e8efc8] px-2.5 py-1 text-[10px] font-bold text-[#58701c]">
              {materialsQuery.data?.length || 0} materi
            </span>
          </div>
          <div className="space-y-2">
            {materialsQuery.isLoading ? (
              <p className="py-6 text-sm text-stone-500">Memuat materi...</p>
            ) : (
              materialsQuery.data?.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#eee9df] bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e4dbfe] text-[#615a77]">
                      {material.tipe === "pdf" ? (
                        <FileText size={17} />
                      ) : material.tipe === "video" ? (
                        <Film size={17} />
                      ) : (
                        <Link2 size={17} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-800">
                        {material.judul}
                      </p>
                      <p className="truncate text-[11px] text-stone-500">
                        {material.tipe === "gdrive_video"
                          ? material.video_url
                          : material.file_path}{" "}
                        · {material.duration_minutes} menit
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => {
                        setEditingId(material.id);
                        setTitle(material.judul);
                        setDescription(material.deskripsi || "");
                        setType(material.tipe);
                        setYoutubeUrl(material.video_url || "");
                        setDuration(String(material.duration_minutes));
                        setFile(null);
                        setError(null);
                      }}
                      className="rounded-full p-2 text-stone-400 hover:bg-[#e4dbfe] hover:text-[#615a77]"
                      title="Edit materi"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() =>
                        window.confirm(`Hapus materi ${material.judul}?`) &&
                        deleteMutation.mutate(material.id)
                      }
                      className="rounded-full p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                      title="Hapus materi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
            {!materialsQuery.isLoading && !materialsQuery.data?.length && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">
                Belum ada materi untuk kursus ini.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminMaterialsPanel;
