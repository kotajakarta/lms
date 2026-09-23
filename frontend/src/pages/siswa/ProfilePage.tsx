import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  GraduationCap,
  Mail,
  Building,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const activeTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';

  const handleTabChange = (tab: 'profile' | 'security') => {
    setSearchParams(tab === 'security' ? { tab: 'security' } : {});
  };

  // Profile Edit State
  const [name, setName] = useState(user?.nama || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Reset State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Mutation to update profile name
  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await api.put('/users/profile/me', { nama: newName });
      return res.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setProfileSuccessMsg(t('student_profile.profile_updated_success'));
      setProfileErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setProfileErrorMsg(
        err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.'
      );
      setProfileSuccessMsg('');
    },
  });

  // Mutation to reset / change password
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/users/profile/me', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      setPasswordSuccessMsg(t('student_profile.password_updated_success'));
      setPasswordErrorMsg('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setPasswordErrorMsg(
        err.response?.data?.message || 'Gagal mengganti kata sandi. Periksa kata sandi lama Anda.'
      );
      setPasswordSuccessMsg('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfileMutation.mutate(name.trim());
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newPassword.length < 6) {
      setPasswordErrorMsg(t('student_profile.password_length_err'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(t('student_profile.password_mismatch'));
      return;
    }

    resetPasswordMutation.mutate();
  };

  const getInitials = (userName?: string) => {
    if (!userName) return 'S';
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-full p-4 sm:p-6 lg:p-8 text-on-surface font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <header className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                {t('student_profile.tag')}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mt-1">
                {t('student_profile.title')}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                {t('student_profile.subtitle')}
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="inline-flex p-1 bg-surface-container-low rounded-xl border border-stone-200/80 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleTabChange('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-on-surface shadow-xs'
                    : 'text-stone-500 hover:text-on-surface'
                }`}
              >
                <User size={14} />
                <span>{t('student_profile.tab_profile')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('security')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === 'security'
                    ? 'bg-white text-on-surface shadow-xs'
                    : 'text-stone-500 hover:text-on-surface'
                }`}
              >
                <KeyRound size={14} />
                <span>{t('student_profile.tab_security')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab 1: Personal Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Card: Profile Snapshot */}
            <div className="md:col-span-1 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-2xl font-bold shadow-md">
                {getInitials(user?.nama)}
              </div>
              <h2 className="text-base font-bold text-on-surface mt-3">
                {user?.nama || 'Siswa'}
              </h2>
              <p className="text-xs text-stone-500">{user?.email}</p>

              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap size={13} />
                <span>{user?.role || 'Siswa'}</span>
              </div>

              <div className="w-full border-t border-stone-100 my-5" />

              <div className="w-full space-y-3 text-left text-xs">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Status Akun
                  </span>
                  <span className="font-semibold text-emerald-600">Terverifikasi</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Building size={14} />
                    Departemen
                  </span>
                  <span className="font-medium text-on-surface">Arsitektur & Desain</span>
                </div>
              </div>
            </div>

            {/* Right Card: Edit Profile Form */}
            <div className="md:col-span-2 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold text-on-surface mb-4">
                Ubah Informasi Pribadi
              </h2>

              {/* Success Notification */}
              {profileSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Error Notification */}
              {profileErrorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* Full Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    {t('student_profile.full_name')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full h-10 px-3.5 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary transition-all"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    {t('student_profile.email_address')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full h-10 pl-3.5 pr-10 text-xs bg-stone-100 rounded-xl border border-stone-200 text-stone-500 cursor-not-allowed select-none"
                    />
                    <Mail
                      size={15}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Email terikat dengan identitas akademik institusi Anda.
                  </p>
                </div>

                {/* Role (Read-only) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">
                      {t('student_profile.role_label')}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.role?.toUpperCase() || 'SISWA'}
                      className="w-full h-10 px-3.5 text-xs bg-stone-100 rounded-xl border border-stone-200 text-stone-500 cursor-not-allowed select-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">
                      {t('student_profile.department_label')}
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Studio Desain & Arsitektur"
                      className="w-full h-10 px-3.5 text-xs bg-stone-100 rounded-xl border border-stone-200 text-stone-500 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending || !name.trim()}
                    className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-stone-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <Save size={14} />
                    <span>
                      {updateProfileMutation.isPending
                        ? t('student_profile.saving')
                        : t('student_profile.save_changes')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Reset Password */}
        {activeTab === 'security' && (
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">
                  {t('student_profile.password_title')}
                </h2>
                <p className="text-xs text-stone-500">
                  {t('student_profile.password_subtitle')}
                </p>
              </div>
            </div>

            {/* Success Notification */}
            {passwordSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            {/* Error Notification */}
            {passwordErrorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  {t('student_profile.old_password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder={t('student_profile.old_password_placeholder')}
                    className="w-full h-10 pl-3.5 pr-10 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-on-surface cursor-pointer"
                  >
                    {showOldPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  {t('student_profile.new_password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('student_profile.new_password_placeholder')}
                    className="w-full h-10 pl-3.5 pr-10 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-on-surface cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  {t('student_profile.confirm_password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('student_profile.confirm_password_placeholder')}
                    className="w-full h-10 pl-3.5 pr-10 text-xs bg-surface-container-low rounded-xl border border-stone-200/80 text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/40 focus:border-secondary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-on-surface cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-1.5 text-[11px] text-stone-500">
                <p className="font-semibold text-stone-700">Persyaratan Kata Sandi:</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      newPassword.length >= 6
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-300 text-stone-600'
                    }`}
                  >
                    ✓
                  </span>
                  <span>Minimal 6 karakter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      confirmPassword && newPassword === confirmPassword
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-300 text-stone-600'
                    }`}
                  >
                    ✓
                  </span>
                  <span>Kata sandi baru dan konfirmasi cocok</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={
                    resetPasswordMutation.isPending ||
                    !oldPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-stone-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>
                    {resetPasswordMutation.isPending
                      ? t('student_profile.updating_password')
                      : t('student_profile.update_password')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
