import React, { useState } from 'react';
import { UFMachineData, Language } from '../types';
import { translations } from '../translations';
import { X, Save, RotateCcw, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateAutoKpiReward } from '../utils/kpiCalculator';
import { getTodayDateString } from '../utils/dateUtils';

interface KpiEntryModalProps {
  onClose: () => void;
  onSaveKpiData: (dateStr: string, records: UFMachineData[]) => void;
  currentLang: Language;
  currentDate: string;
  existingUFData: UFMachineData[];
}

export const KpiEntryModal: React.FC<KpiEntryModalProps> = ({
  onClose,
  onSaveKpiData,
  currentLang,
  currentDate,
  existingUFData,
}) => {
  const t = translations[currentLang];

  const [selectedDate, setSelectedDate] = useState<string>(currentDate || getTodayDateString());
  const [items, setItems] = useState<UFMachineData[]>(() => {
    return existingUFData.map((d) => {
      const target = d.target || 1200;
      return {
        ...d,
        target,
        kpi_usd: (typeof d.kpi_usd === 'number' && d.kpi_usd > 0)
          ? d.kpi_usd
          : calculateAutoKpiReward(d.day_shift, d.night_shift, target),
      };
    });
  });

  const handleKpiChange = (code: string, valStr: string) => {
    let val = Math.max(0, parseFloat(valStr) || 0);
    if (val > 45) val = 45; // Cap at $45 as requested
    setItems((prev) =>
      prev.map((item) => {
        if (item.machineCode === code) {
          return {
            ...item,
            kpi_usd: val,
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
        kpi_usd: 0,
      }))
    );
  };

  const handleAutoCalculateAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        const target = item.target || 1200;
        const autoKpi = calculateAutoKpiReward(item.day_shift, item.night_shift, target);
        return {
          ...item,
          kpi_usd: autoKpi,
        };
      })
    );
  };

  const handleFillSample = (amount: number) => {
    const capped = Math.min(amount, 45);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        kpi_usd: capped,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKpiData(selectedDate, items);
    onClose();
  };

  const totalKpiUsd = items.reduce((sum, item) => sum + (item.kpi_usd || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0e3a6b] text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>
              {currentLang === 'km'
                ? 'កំណត់ KPI ($) ស្វ័យប្រវត្ត (អតិបរមា $45)'
                : currentLang === 'en'
                ? 'Set Auto KPI Reward ($) (Max $45.00)'
                : '设置机台 KPI 自动奖金 (上限 $45)'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls & Quick Actions */}
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

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAutoCalculateAll}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="គណនាប្រាក់រង្វាន់ស្វ័យប្រវត្តិ ផ្អែកលើបរិមាណជាក់ស្តែងត្រឹម $45 ចុះក្រោម"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'km' ? 'គណនាស្វ័យប្រវត្តិ (≤ $45)' : 'Auto Calculate (≤ $45)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetZero}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>$0.00</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillSample(45)}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Max ($45.00)</span>
            </button>
          </div>

          {/* Total KPI Badge */}
          <div className="flex items-center gap-2 font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded shadow-2xs">
            <span>Total KPI:</span>
            <span className="text-emerald-700 font-extrabold text-sm">${totalKpiUsd.toFixed(2)}</span>
          </div>
        </div>

        {/* Modal Inputs Grid */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map((item) => {
              const outputTotal = item.day_shift + item.night_shift;
              return (
                <div
                  key={item.machineCode}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-emerald-400 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div>
                      <span className="font-extrabold text-sm text-[#0e3a6b]">{item.machineCode}</span>
                      <span className="text-[10px] text-slate-500 ml-1">({outputTotal} PCR)</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{item.machineName}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                      <span>KPI Reward ($)</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Max $45</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={45}
                        value={item.kpi_usd ?? 0}
                        onChange={(e) => handleKpiChange(item.machineCode, e.target.value)}
                        className="w-full border border-slate-300 rounded pl-6 pr-2 py-1 text-xs font-mono font-bold text-emerald-950 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[10px] text-slate-400">Target: 1250</span>
                    <span className="font-bold text-emerald-700">
                      ${(item.kpi_usd || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 italic">
              * ប្រាក់រង្វាន់ KPI ត្រូវបានគណនាដោយស្វ័យប្រវត្តតាមបរិមាណផលសម្រេចជាក់ស្តែង និងកំណត់ត្រឹម $45 ដុល្លារចុះក្រោម។
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
