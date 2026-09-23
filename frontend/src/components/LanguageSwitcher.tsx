import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dark' | 'light' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dark',
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('en') ? 'en' : 'id';

  const setLanguage = (lang: 'id' | 'en') => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lang);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center rounded-full bg-slate-800/80 p-0.5 border border-slate-700/80 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
            currentLang === 'id'
              ? 'bg-[#0052cc] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
            currentLang === 'en'
              ? 'bg-[#0052cc] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  if (variant === 'light') {
    return (
      <div className={`inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs ${className}`}>
        <Globe size={14} className="text-slate-500 ml-1.5 mr-0.5" />
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
            currentLang === 'id'
              ? 'bg-white text-[#0052cc] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 font-semibold rounded-lg transition-all cursor-pointer ${
            currentLang === 'en'
              ? 'bg-white text-[#0052cc] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  // Default 'dark' style for enterprise sidebar
  return (
    <div className={`flex items-center justify-between rounded-xl bg-white/[0.06] p-1.5 border border-white/10 ${className}`}>
      <div className="flex items-center gap-2 pl-2 text-stone-300 text-xs">
        <Globe size={15} className="text-[#60a5fa]" />
        <span className="font-medium text-[11px] text-stone-300">
          {currentLang === 'id' ? 'Bahasa' : 'Language'}
        </span>
      </div>
      <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            currentLang === 'id'
              ? 'bg-[#0052cc] text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
            currentLang === 'en'
              ? 'bg-[#0052cc] text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    </div>
  );
};
export default LanguageSwitcher;
