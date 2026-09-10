import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { X, Settings, Check } from 'lucide-react';

interface UserSettingsModalProps {
  onClose: () => void;
  targetPerShift: number;
  onUpdateTarget: (newTarget: number) => void;
  showBrowserBar: boolean;
  onToggleBrowserBar: (show: boolean) => void;
  movingAverageVal: string;
  onUpdateMovingAverage: (val: string) => void;
  currentLang: Language;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  onClose,
  targetPerShift,
  onUpdateTarget,
  showBrowserBar,
  onToggleBrowserBar,
  movingAverageVal,
  onUpdateMovingAverage,
  currentLang,
}) => {
  const t = translations[currentLang];

  const [targetVal, setTargetVal] = useState<number>(targetPerShift);
  const [avgTag, setAvgTag] = useState<string>(movingAverageVal);
  const [browserBar, setBrowserBar] = useState<boolean>(showBrowserBar);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTarget(targetVal);
    onUpdateMovingAverage(avgTag);
    onToggleBrowserBar(browserBar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#0e3a6b] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Settings className="w-4 h-4 text-blue-300" />
            <span>{t.userSettings}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Target per shift */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              {t.targetOutput}
            </label>
            <input
              type="number"
              value={targetVal}
              onChange={(e) => setTargetVal(Number(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-1.5 font-mono text-xs text-slate-800"
            />
          </div>

          {/* Corner Tag Value */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              右下角 MES 动态均值 Tag 文本
            </label>
            <input
              type="text"
              value={avgTag}
              onChange={(e) => setAvgTag(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
            />
          </div>

          {/* Toggle Browser Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-700 font-medium">显示顶部模拟浏览器导航栏</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={browserBar}
                onChange={(e) => setBrowserBar(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-medium cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#3f7fd1] hover:bg-[#326ab3] text-white text-xs font-medium cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
