import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.requires_2fa) {
        setTempToken(res.data.temp_token);
        setShow2FAModal(true);
      } else {
        const { user, access_token } = res.data;
        setAuth(user, access_token);
        if (user.role === 'admin' || user.role === 'superadmin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'instruktur') {
          navigate('/admin/courses');
        } else {
          navigate('/siswa/analitik');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-2fa', {
        temp_token: tempToken,
        otp_code: otpCode,
      });
      const { user, access_token } = res.data;
      setAuth(user, access_token);
      setShow2FAModal(false);
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'instruktur') {
        navigate('/admin/courses');
      } else {
        navigate('/siswa/analitik');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode verifikasi 2FA tidak valid atau kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-4 border border-indigo-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">UZDEM LMS</h1>
          <p className="text-slate-400 mt-2 text-sm">Masuk ke akun pembelajaran Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <a href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                Lupa password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-slate-700 w-full" />
            <span className="bg-slate-800 px-3 text-xs text-slate-400 uppercase tracking-wider absolute">
              atau
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setAuth(
                {
                  id: 99,
                  nama: 'Anna Vance',
                  email: 'anna@studio.uzdem.id',
                  role: 'siswa',
                  foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABy3ovZuk2NppxT2DK22M7tlvfTD6E-HfBzNcm0JselOKHF-RyCwuTeStMqTHRM6ijkmHntDrOBiyQx6ebCP8r-B-C2NK2bYO0EdgBuKuX4mmMRy-3-wShoo_E-ZfPZsymNZ1iA-rlYVIimRwc5K6K9XP6vwci8RJ1kYQwhZ72EfE5nXXlhSZCjSx4bgmZrTPqn0qOy7yQqbW5mhjxTC_wBF3nb9QTc4r2y_3BaXHji0jR7NvFz3DpwsNxYp4WGA05g',
                  two_factor_enabled: false,
                },
                'demo-student-token'
              );
              navigate('/siswa/analitik');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-600 transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Masuk Sebagai Siswa (Demo Anna)</span>
          </button>
        </form>
      </div>

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600/20 text-indigo-400 mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verifikasi Dua Langkah</h2>
              <p className="text-slate-400 text-sm mt-1">
                Masukkan 6 digit kode dari aplikasi Google Authenticator Anda atau kode recovery.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={10}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Contoh: 123456"
                  className="w-full text-center tracking-widest text-2xl font-mono py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="w-1/2 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Verifikasi...' : 'Konfirmasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
