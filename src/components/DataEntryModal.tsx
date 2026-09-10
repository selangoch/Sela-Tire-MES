import React, { useState, useEffect } from 'react';
import { UFMachineData, Language } from '../types';
import { translations } from '../translations';
import { X, Save, RotateCcw, CheckCircle, Sliders } from 'lucide-react';
import { ufMachineCodes, getUFMachineDataForDate } from '../data/initialData';
import { calculateAutoKpiReward } from '../utils/kpiCalculator';
import { getTodayDateString } from '../utils/dateUtils';

interface DataEntryModalProps {
  onClose: () => void;
  onSaveData: (dateStr: string, records: UFMachineData[]) => void;
  currentLang: Language;
  currentDate: string;
  existingUFData: UFMachineData[];
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({
  onClose,
  onSaveData,
  currentLang,
  currentDate,
  existingUFData,
}) => {
  const t = translations[currentLang];

  const [selectedDate, setSelectedDate] = useState<string>(currentDate || getTodayDateString());
  const [items, setItems] = useState<UFMachineData[]>([]);

  useEffect(() => {
    const loaded = getUFMachineDataForDate(selectedDate);
    setItems(
      loaded.map((d) => {
        const target = d.target || 1250;
        return {
          ...d,
          target,
          kpi_usd: (typeof d.kpi_usd === 'number' && d.kpi_usd > 0)
            ? d.kpi_usd
            : calculateAutoKpiReward(d.day_shift, d.night_shift, target),
        };
      })
    );
  }, [selectedDate]);

  const handleValChange = (code: string, shift: 'day' | 'night', valStr: string) => {
    const val = Math.max(0, parseInt(valStr, 10) || 0);
    setItems((prev) =>
      prev.map((item) => {
        if (item.machineCode === code) {
          const newDay = shift === 'day' ? val : item.day_shift;
          const newNight = shift === 'night' ? val : item.night_shift;
          const target = item.target || 1250;
          return {
            ...item,
            day_shift: newDay,
            night_shift: newNight,
            target,
            kpi_usd: calculateAutoKpiReward(newDay, newNight, target),
          };
        }
        return item;
      })
    );
  };

  const handleResetZero = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        day_shift: 0,
        night_shift: 0,
        kpi_usd: 0,
      }))
    );
  };

  const handleFillTarget = () => {
    setItems((prev) =>
      prev.map((item) => {
        const target = item.target || 1200;
        return {
          ...item,
          day_shift: target,
          night_shift: target,
          target,
          kpi_usd: calculateAutoKpiReward(target, target, target),
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveData(selectedDate, items);
    onClose();
  };

  const totalDay = items.reduce((sum, i) => sum + (i.day_shift || 0), 0);
  const totalNight = items.reduce((sum, i) => sum + (i.night_shift || 0), 0);
  const totalCombined = totalDay + totalNight;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0e3a6b] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>{t.editProductionTitle || 'UF1–UF15 Machine Production Entry (Admin Control)'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">{t.dateLabel}:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-300 bg-white font-mono font-bold text-slate-800 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetZero}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.zeroAllBtn || 'Reset All to 0'}</span>
            </button>
            <button
              type="button"
              onClick={handleFillTarget}
              className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>填入目标 (1250)</span>
            </button>
          </div>

          {/* Summary Badges */}
          <div className="flex items-center gap-3 font-mono font-bold text-xs bg-white px-3 py-1 rounded border border-slate-200 shadow-2xs">
            <span className="text-sky-700">早: {totalDay.toLocaleString()}</span>
            <span className="text-indigo-700">夜: {totalNight.toLocaleString()}</span>
            <span className="text-[#0e3a6b] font-black border-l border-slate-200 pl-2">
              总: {totalCombined.toLocaleString()} PCR
            </span>
          </div>
        </div>

        {/* Modal Body: 15 Machine Inputs Grid */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map((item) => {
              const total = item.day_shift + item.night_shift;
              return (
                <div
                  key={item.machineCode}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-sm text-[#0e3a6b]">{item.machineCode}</span>
                    <span className="text-[10px] font-medium text-slate-500">{item.machineName}</span>
                  </div>

                  {/* Day Shift Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-sky-800 flex items-center justify-between">
                      <span>🌞 {t.dayShift}</span>
                      <span className="text-[10px] text-slate-400 font-normal">PCR</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={item.day_shift}
                      onChange={(e) => handleValChange(item.machineCode, 'day', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-sky-950 bg-white focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                    />
                  </div>

                  {/* Night Shift Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-indigo-800 flex items-center justify-between">
                      <span>🌙 {t.nightShift}</span>
                      <span className="text-[10px] text-slate-400 font-normal">PCR</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={item.night_shift}
                      onChange={(e) => handleValChange(item.machineCode, 'night', e.target.value)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-indigo-950 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Machine Combined Total */}
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] font-bold text-slate-500">机台合计:</span>
                    <span className="font-black text-[#0e3a6b]">{total.toLocaleString()} PCR</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 italic">
              * Auto KPI Reward is dynamically calculated (capped at $45.00) and synced to Firestore in real time.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{t.save}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
