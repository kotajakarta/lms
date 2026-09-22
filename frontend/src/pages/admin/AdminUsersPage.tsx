import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "../../services/api.js";

interface User {
  id: number;
  nama: string;
  email: string;
  role: "siswa" | "instruktur" | "admin" | "superadmin";
  department_id?: number | null;
  wilayah_id?: number | null;
  cabang_id?: number | null;
  department?: { nama_jurusan: string } | null;
  wilayah?: { nama_wilayah: string } | null;
  cabang?: { nama_cabang: string } | null;
}
interface UserResponse {
  data: User[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}
interface Option {
  id: number;
  nama_jurusan?: string;
  nama_wilayah?: string;
  nama_cabang?: string;
}
interface UserForm {
  nama: string;
  email: string;
  password: string;
  role: User["role"];
  department_id: string;
  wilayah_id: string;
  cabang_id: string;
}
const emptyForm: UserForm = {
  nama: "",
  email: "",
  password: "",
  role: "siswa",
  department_id: "",
  wilayah_id: "",
  cabang_id: "",
};

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: async () =>
      (
        await api.get<UserResponse>(
          `/users?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`,
        )
      ).data,
  });
  const departmentsQuery = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: async () => (await api.get<Option[]>("/master/departments")).data,
  });
  const wilayahQuery = useQuery({
    queryKey: ["admin", "wilayah"],
    queryFn: async () => (await api.get<Option[]>("/master/wilayah")).data,
  });
  const cabangQuery = useQuery({
    queryKey: ["admin", "cabang", form.wilayah_id],
    queryFn: async () =>
      (
        await api.get<Option[]>(
          `/master/cabang${form.wilayah_id ? `?wilayah_id=${form.wilayah_id}` : ""}`,
        )
      ).data,
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nama: form.nama,
        email: form.email,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
        ...(form.department_id
          ? { department_id: Number(form.department_id) }
          : {}),
        ...(form.wilayah_id ? { wilayah_id: Number(form.wilayah_id) } : {}),
        ...(form.cabang_id ? { cabang_id: Number(form.cabang_id) } : {}),
      };
      return editingId
        ? api.put(`/users/${editingId}`, payload)
        : api.post("/users", { ...payload, password: form.password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      closeForm();
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Data pengguna gagal disimpan."),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    onError: (err: any) =>
      setError(err.response?.data?.message || "Pengguna gagal dihapus."),
  });
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };
  const beginEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      nama: user.nama,
      email: user.email,
      password: "",
      role: user.role,
      department_id: String(user.department_id || ""),
      wilayah_id: String(user.wilayah_id || ""),
      cabang_id: String(user.cabang_id || ""),
    });
    setShowForm(true);
    setError(null);
  };
  const users = usersQuery.data?.data || [];
  const options = (items: Option[] | undefined, label: keyof Option) =>
    items?.map((item) => (
      <option key={item.id} value={item.id}>
        {String(item[label])}
      </option>
    ));
  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#2d6d65] focus:ring-2 focus:ring-[#2d6d65]/10";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b8883]">
            Direktori akses
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Pengguna</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola akun dan penempatan organisasi dari satu tempat.
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
            setError(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173e3c] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#173e3c]/15 transition hover:bg-[#245956]"
        >
          <Plus size={17} /> Tambah pengguna
        </button>
      </div>
      <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full rounded-xl border border-slate-200 bg-[#f7f9f8] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#2d6d65]"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {usersQuery.data?.meta.total ?? 0} pengguna
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#f7f9f8] text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Pengguna</th>
                <th className="px-5 py-4">Peran</th>
                <th className="px-5 py-4">Organisasi</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Memuat pengguna...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fbfcfb]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6ddf5] font-bold text-[#69518d]">
                          {user.nama.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.nama}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${user.role === "siswa" ? "bg-[#e8efc8] text-[#58701c]" : user.role === "superadmin" ? "bg-[#e6ddf5] text-[#69518d]" : "bg-[#fce4dc] text-[#a34e3b]"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{user.department?.nama_jurusan || "Tanpa jurusan"}</p>
                      <p className="text-xs text-slate-400">
                        {user.cabang?.nama_cabang ||
                          user.wilayah?.nama_wilayah ||
                          "Belum ditempatkan"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => beginEdit(user)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-[#e8f3f1] hover:text-[#27635e]"
                          title="Edit pengguna"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() =>
                            window.confirm(`Hapus pengguna ${user.nama}?`) &&
                            deleteMutation.mutate(user.id)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Hapus pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!usersQuery.isLoading && !users.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Belum ada pengguna yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a2b]/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b8883]">
                  {editingId ? "Perbarui akses" : "Akun baru"}
                </p>
                <h3 className="mt-2 text-2xl font-bold">
                  {editingId ? "Edit pengguna" : "Tambah pengguna"}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup form"
              >
                <X size={20} />
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
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Nama lengkap
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Peran
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as User["role"] })
                  }
                  className={fieldClass}
                >
                  <option value="siswa">Siswa</option>
                  <option value="instruktur">Instruktur</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Password
                <input
                  required={!editingId}
                  minLength={6}
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder={
                    editingId ? "Kosongkan jika tetap" : "Min. 6 karakter"
                  }
                  className={fieldClass}
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Jurusan
                <select
                  value={form.department_id}
                  onChange={(e) =>
                    setForm({ ...form, department_id: e.target.value })
                  }
                  className={fieldClass}
                >
                  <option value="">Pilih jurusan</option>
                  {options(departmentsQuery.data, "nama_jurusan")}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Wilayah
                <select
                  value={form.wilayah_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      wilayah_id: e.target.value,
                      cabang_id: "",
                    })
                  }
                  className={fieldClass}
                >
                  <option value="">Pilih wilayah</option>
                  {options(wilayahQuery.data, "nama_wilayah")}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Cabang
                <select
                  value={form.cabang_id}
                  onChange={(e) =>
                    setForm({ ...form, cabang_id: e.target.value })
                  }
                  className={fieldClass}
                >
                  <option value="">Pilih cabang</option>
                  {options(cabangQuery.data, "nama_cabang")}
                </select>
              </label>
              <div className="flex justify-end gap-3 pt-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  disabled={saveMutation.isPending}
                  className="rounded-xl bg-[#173e3c] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saveMutation.isPending
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan perubahan"
                      : "Buat pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
