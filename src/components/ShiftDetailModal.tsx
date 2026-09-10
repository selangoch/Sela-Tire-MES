import React, { useState } from 'react';
import { ShiftData, Language } from '../types';
import { translations } from '../translations';
import { X, User, AlertTriangle, FileText, CheckCircle2, Clock, Save } from 'lucide-react';

interface ShiftDetailModalProps {
  dayData: ShiftData | null;
  onClose: () => void;
  onSave: (updated: ShiftData) => void;
  currentLang: Language;
}

export const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({
  dayData,
  onClose,
  onSave,
  currentLang,
}) => {
  if (!dayData) return null;
  const t = translations[currentLang];

  const [formData, setFormData] = useState<ShiftData>({ ...dayData });

  const totalOutput = formData.day_shift + formData.night_shift;
  const totalScrap = (formData.scrap_day || 0) + (formData.scrap_night || 0);
  const totalInput = totalOutput + totalScrap;
  const scrapRate = totalInput > 0 ? ((totalScrap / totalInput) * 100).toFixed(2) : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0e3a6b] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="w-4 h-4 text-blue-300" />
            <span>第 {formData.day} 天 (Day {formData.day}) - {t.hourlyDetail}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50 border border-sky-200 p-3 rounded text-center">
              <div className="text-slate-500 text-[11px] font-medium">{t.dayShift}</div>
              <div className="text-lg font-black text-sky-900 font-mono mt-0.5">
                {formData.day_shift} <span className="text-xs font-normal">条</span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded text-center">
              <div className="text-slate-500 text-[11px] font-medium">{t.nightShift}</div>
              <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">
                {formData.night_shift} <span className="text-xs font-normal">条</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-center">
              <div className="text-slate-500 text-[11px] font-medium">{t.totalProduction}</div>
              <div className="text-lg font-black text-amber-900 font-mono mt-0.5">
                {totalOutput} <span className="text-xs font-normal">条</span>
              </div>
            </div>
          </div>

          {/* Shift Outputs & Scraps editable inputs */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Day Shift Section */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2.5">
              <div className="font-bold text-sky-800 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>{t.dayShift}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">{t.dayShiftOutput}</label>
                <input
                  type="number"
                  value={formData.day_shift}
                  onChange={(e) => setFormData({ ...formData, day_shift: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">{t.operatorDay}</label>
                <input
                  type="text"
                  value={formData.operator_day || ''}
                  onChange={(e) => setFormData({ ...formData, operator_day: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">{t.scrapDay}</label>
                <input
                  type="number"
                  value={formData.scrap_day || 0}
                  onChange={(e) => setFormData({ ...formData, scrap_day: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono text-red-600"
                />
              </div>
            </div>

            {/* Night Shift Section */}
            <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2.5">
              <div className="font-bold text-indigo-800 flex items-center justify-between border-b border-slate-200 pb-1">
                <span>{t.nightShift}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">{t.nightShiftOutput}</label>
                <input
                  type="number"
                  value={formData.night_shift}
                  onChange={(e) => setFormData({ ...formData, night_shift: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">{t.operatorNight}</label>
                <input
                  type="text"
                  value={formData.operator_night || ''}
                  onChange={(e) => setFormData({ ...formData, operator_night: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">{t.scrapNight}</label>
                <input
                  type="number"
                  value={formData.scrap_night || 0}
                  onChange={(e) => setFormData({ ...formData, scrap_night: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white font-mono text-red-600"
                />
              </div>
            </div>
          </div>

          {/* Quality & Scrap Rate Indicator */}
          <div className="bg-slate-100 p-2.5 rounded border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">综合废品总数 / 废品率:</span>
            <span className="font-mono font-bold text-slate-800">
              {totalScrap} 条 ({scrapRate}%)
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-600 mb-1 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{t.notes}</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#3f7fd1] hover:bg-[#326ab3] text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
