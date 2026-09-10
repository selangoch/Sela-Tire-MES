import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { UserSession } from '../services/authService';
import { Lock, Globe, Home, RefreshCw, Settings, LogOut, ShieldCheck, User, Users, Smartphone, X } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  onOpenSettings: () => void;
  onOpenAccessLogs?: () => void;
  activeOnlineCount?: number;
  currentMachineName: string;
  showBrowserBar: boolean;
  currentUser: UserSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLangChange,
  onOpenSettings,
  onOpenAccessLogs,
  activeOnlineCount = 1,
  currentMachineName,
  showBrowserBar,
  currentUser,
  onLogout,
}) => {
  const t = translations[currentLang] || translations.zh;
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.userId === '733445';

  return (
    <header className="bg-[#0e3a6b] text-white select-none border-b border-[#0a2c52] shadow-md">
      {/* Top Browser URL Bar Simulation */}
      {showBrowserBar && (
        <div className="bg-slate-900 px-3 py-1 text-xs flex items-center justify-between border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px] shrink-0">
              <Lock className="w-3 h-3" /> {t.unsafeNotice}
            </span>
            <span className="text-slate-400 select-all font-mono text-[11px] truncate">
              www.ufdb-sela-mes.com
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
            {currentUser && (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <User className="w-3 h-3" /> User ID: {currentUser.userId}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Blue Banner Navigation */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Left Title & Language */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center font-black text-xs text-amber-300 border border-white/20">
            ST
          </div>
          <span className="text-sm sm:text-base font-bold tracking-wide">{t.appTitle}</span>

          {/* Language Selector */}
          <div className="flex gap-1 ml-2">
            {(['zh', 'en', 'km'] as Language[]).map((lang) => {
              const labels = { zh: '中', en: 'EN', km: 'ខ្មែរ' };
              const active = currentLang === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onLangChange(lang)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-white/15 text-white/90 hover:bg-white/25'
                  }`}
                >
                  {labels[lang]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2 sm:gap-3.5 text-xs opacity-95">
          {/* Cloud DB Real-time Sync Badge */}
          <div className="flex items-center gap-1.5 bg-blue-900/80 text-blue-200 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
            <span className="ml-0.5">PC ↔ Phone Cloud Sync</span>
          </div>

          {/* User ID Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-600/90 text-white px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-400/40 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>ID: {currentUser?.userId || '733445'} ({currentUser?.role || 'Admin'})</span>
          </div>

          {/* Admin Only: User Access & Phone Model Logs */}
          {isAdmin && onOpenAccessLogs && (
            <button
              onClick={onOpenAccessLogs}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer border border-indigo-400/40"
              title="ពិនិត្យមើលទិន្នន័យអ្នកចូលប្រើប្រាស់ និងម៉ូដេលទូរស័ព្ទ (Admin Only)"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentLang === 'km' ? 'អ្នកចូលប្រើ' : currentLang === 'en' ? 'User Logs' : '访问监控'}</span>
              {activeOnlineCount !== undefined && activeOnlineCount > 0 && (
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full leading-none">
                  {activeOnlineCount}
                </span>
              )}
            </button>
          )}

          <button className="hidden sm:flex items-center gap-1 hover:underline cursor-pointer">
            <Home className="w-3.5 h-3.5" />
            <span>{t.home}</span>
          </button>
          
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 hover:underline cursor-pointer hover:text-yellow-300 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.userSettings}</span>
          </button>

          {/* Prominent Logout Button */}
          <button
            onClick={onLogout}
            title="Logout / ចាកចេញ"
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer border border-rose-400/30 ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{currentLang === 'km' ? 'ចាកចេញ' : currentLang === 'en' ? 'Logout' : '退出登录'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
