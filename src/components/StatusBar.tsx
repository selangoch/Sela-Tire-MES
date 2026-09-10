import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

interface StatusBarProps {
  currentLang: Language;
  onlineCount?: number;
  cornerTagText?: string;
  adminStatusText?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentLang,
  onlineCount = 145,
  cornerTagText = '5#MES动均  172.16',
  adminStatusText = 'admine:shitou',
}) => {
  const t = translations[currentLang];

  const [timeStr, setTimeStr] = useState<string>('23:22');
  const [dateStr, setDateStr] = useState<string>('2026/8/3');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hh}:${mm}`);

      const yyyy = now.getFullYear();
      const m = now.getMonth() + 1;
      const d = now.getDate();
      setDateStr(`${yyyy}/${m}/${d}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="w-full flex-none select-none relative z-20">
      {/* MES Status Bar */}
      <div className="bg-[#0e3a6b] text-[#cfe0f5] flex items-center justify-between px-4 py-1.5 text-[11px] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="bg-white text-[#0e3a6b] font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-2xs">
            {t.onlineBadge}
          </span>
          <span className="font-semibold text-white">Sela Tire MES</span>
          <span className="opacity-80 font-mono">2026.04.21.154853</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-white/90">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono font-bold text-emerald-300 tracking-wide bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
            {adminStatusText}
          </span>
        </div>
      </div>

      {/* Taskbar Bar */}
      <div className="bg-[#1c1c1c] text-white flex items-center justify-end gap-4 px-4 py-1.5 text-[11px] font-mono border-t border-slate-800">
        <span>{timeStr}</span>
        <span>{dateStr}</span>
      </div>

    </footer>
  );
};
