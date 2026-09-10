import React, { useState } from 'react';
import { UFMachineData, Language, CycleSummaryData } from '../types';
import { translations } from '../translations';
import { calculateAutoKpiReward } from '../utils/kpiCalculator';
import { Info, Award, TrendingUp, Edit3, Target, CheckCircle2, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

interface DataTableProps {
  data: UFMachineData[];
  shiftFilter: string;
  currentLang: Language;
  onSelectMachine: (machineData: UFMachineData) => void;
  selectedMachineCode?: string;
  stats: {
    totalDay: number;
    totalNight: number;
    totalCombined: number;
    avgMachine: number;
    targetAchievedCount: number;
    maxMachine: { code: string; name: string; val: number };
  };
  onOpenEditModal: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onUpdateCell: (machineCode: string, shift: 'day' | 'night', val: number) => void;
  targetPerShift?: number;
  cycleData?: CycleSummaryData;
  onOpenCycleModal?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  shiftFilter,
  currentLang,
  onSelectMachine,
  selectedMachineCode,
  stats,
  onOpenEditModal,
  isAdmin = false,
  onOpenAdminLogin,
  onUpdateCell,
  targetPerShift = 1250,
  cycleData,
  onOpenCycleModal,
}) => {
  const t = translations[currentLang];
  const [editingCell, setEditingCell] = useState<{ code: string; shift: 'day' | 'night' } | null>(null);
  const [editVal, setEditVal] = useState<string>('0');

  const showDay = shiftFilter === 'all' || shiftFilter === 'day';
  const showNight = shiftFilter === 'all' || shiftFilter === 'night';

  const handleStartEdit = (code: string, shift: 'day' | 'night', currentNum: number) => {
    if (!isAdmin) {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    setEditingCell({ code, shift });
    setEditVal(currentNum.toString());
  };

  const handleCommitEdit = () => {
    if (editingCell) {
      const num = Math.max(0, parseInt(editVal, 10) || 0);
      onUpdateCell(editingCell.code, editingCell.shift, num);
      setEditingCell(null);
    }
  };

  return (
    <div className="w-full bg-white text-slate-800">
      {/* Top Action Bar above Table */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 text-sm">{t.ufTableTitle || 'UF-DB Machines'}</span>
          <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold border border-sky-200">
            15 Machines (UF1–UF15)
          </span>

          {cycleData && (
            <button
              onClick={onOpenCycleModal}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full font-sans text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              title="មើលស្ថិតិវដ្ត ២៦ ខែមុន ដល់ ២៦ ខែនេះ"
            >
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>
                {currentLang === 'km' ? 'វដ្ត ២៦-២៦:' : currentLang === 'en' ? 'Cycle 26-26:' : '26-26周期:'}{' '}
                <strong className="font-mono">{cycleData.range.startDate} ~ {cycleData.range.endDate}</strong>
              </span>
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {cycleData.totalProduction.toLocaleString()} PCR
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {cycleData && (
            <button
              onClick={onOpenCycleModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded px-3 py-1.5 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.cycleDetailBtn || 'ស្ថិតិវដ្ត ២៦-២៦'}</span>
            </button>
          )}

          {isAdmin ? (
            <button
              onClick={onOpenEditModal}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded px-3 py-1.5 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.editProductionBtn || 'បញ្ចូលចំនួនផលិតកម្ម'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded px-3 py-1.5 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.editProductionBtn || 'បញ្ចូលចំនួនផលិតកម្ម'} ({t.loginBtn || '登录'})</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Scroll Container */}
      <div className="overflow-x-auto w-full border-b border-slate-300">
        <table className="w-full text-center text-xs border-collapse font-sans min-w-[1100px]">
          <thead>
            {/* Header: Exactly 1 Row for 15 Machines in perfect order */}
            <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
              <th className="border border-slate-300 px-3 py-2 bg-slate-200/90 font-bold text-slate-900 sticky left-0 z-20 shadow-xs min-w-[150px] text-left">
                <div className="font-bold text-xs text-slate-900">{t.tableHeaderTitle || 'ទិន្នផលប្រចាំថ្ងៃតាមម៉ាស៊ីន'}</div>
                <div className="text-[10px] text-slate-500 font-normal">UF1 – UF15</div>
              </th>

              {/* 15 Machine Columns (UF1 to UF15) in direct sequential order */}
              {data.map((d) => {
                const isSelected = selectedMachineCode === d.machineCode;
                return (
                  <th
                    key={`h-${d.machineCode}`}
                    onClick={() => onSelectMachine(d)}
                    className={`border border-slate-300 py-2 px-1 cursor-pointer transition-colors hover:bg-blue-100 min-w-[66px] ${
                      isSelected ? 'bg-blue-200 text-blue-950 font-bold' : 'bg-slate-100/90 text-slate-800'
                    }`}
                  >
                    <div className="font-black text-sm text-[#0e3a6b]">{d.machineCode}</div>
                    <div className="text-[10px] text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {d.machineName}
                    </div>
                  </th>
                );
              })}

              {/* Summary Header Column */}
              <th className="border border-slate-300 py-2 px-3 bg-amber-100 text-amber-950 font-bold min-w-[110px]">
                {t.totalRowLabel || 'សរុប'}
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Day Shift Row */}
            {showDay && (
              <tr className="hover:bg-sky-50/30 transition-colors">
                <td className="border border-slate-300 py-2 px-3 font-bold text-sky-900 bg-sky-50/80 sticky left-0 z-10 shadow-xs text-left">
                  <span className="mr-1">🌞</span> {t.dayShift}
                </td>
                {data.map((d) => {
                  const isEditing = editingCell?.code === d.machineCode && editingCell.shift === 'day';
                  return (
                    <td
                      key={`day-${d.machineCode}`}
                      onClick={() => !isEditing && handleStartEdit(d.machineCode, 'day', d.day_shift)}
                      className={`border border-slate-300 py-2 px-1 text-sky-950 font-bold text-xs font-mono transition-colors cursor-pointer hover:bg-sky-100 ${
                        selectedMachineCode === d.machineCode ? 'bg-sky-100' : ''
                      }`}
                      title={`${d.machineCode} Day Shift: ${d.day_shift} PCR (Click to edit)`}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editVal}
                          autoFocus
                          onChange={(e) => setEditVal(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={(e) => e.key === 'Enter' && handleCommitEdit()}
                          className="w-full bg-white border border-sky-500 rounded px-1 py-0.5 text-center font-bold text-xs text-slate-900 focus:outline-none"
                        />
                      ) : (
                        <span>{d.day_shift.toLocaleString()}</span>
                      )}
                    </td>
                  );
                })}
                <td className="border border-slate-300 py-1 px-2 bg-sky-50 text-sky-950 font-bold font-mono">
                  <div>{stats.totalDay.toLocaleString()}</div>
                  <div className="text-[10px] text-sky-700 font-semibold font-sans">
                    {Math.round((stats.totalDay / 16000) * 100)}% (គោលដៅ 16K)
                  </div>
                </td>
              </tr>
            )}

            {/* Night Shift Row */}
            {showNight && (
              <tr className="hover:bg-indigo-50/30 transition-colors">
                <td className="border border-slate-300 py-2 px-3 font-bold text-indigo-900 bg-indigo-50/80 sticky left-0 z-10 shadow-xs text-left">
                  <span className="mr-1">🌙</span> {t.nightShift}
                </td>
                {data.map((d) => {
                  const isEditing = editingCell?.code === d.machineCode && editingCell.shift === 'night';
                  return (
                    <td
                      key={`night-${d.machineCode}`}
                      onClick={() => !isEditing && handleStartEdit(d.machineCode, 'night', d.night_shift)}
                      className={`border border-slate-300 py-2 px-1 text-indigo-950 font-bold text-xs font-mono transition-colors cursor-pointer hover:bg-indigo-100 ${
                        selectedMachineCode === d.machineCode ? 'bg-indigo-100' : ''
                      }`}
                      title={`${d.machineCode} Night Shift: ${d.night_shift} PCR (Click to edit)`}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editVal}
                          autoFocus
                          onChange={(e) => setEditVal(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={(e) => e.key === 'Enter' && handleCommitEdit()}
                          className="w-full bg-white border border-indigo-500 rounded px-1 py-0.5 text-center font-bold text-xs text-slate-900 focus:outline-none"
                        />
                      ) : (
                        <span>{d.night_shift.toLocaleString()}</span>
                      )}
                    </td>
                  );
                })}
                <td className="border border-slate-300 py-1 px-2 bg-indigo-50 text-indigo-950 font-bold font-mono">
                  <div>{stats.totalNight.toLocaleString()}</div>
                  <div className="text-[10px] text-indigo-700 font-semibold font-sans">
                    {Math.round((stats.totalNight / 16500) * 100)}% (គោលដៅ 16.5K)
                  </div>
                </td>
              </tr>
            )}

            {/* Machine Total Production Row */}
            <tr className="bg-slate-50 font-bold hover:bg-slate-100 transition-colors">
              <td className="border border-slate-300 py-2 px-3 font-extrabold text-[#0e3a6b] bg-slate-100 sticky left-0 z-10 shadow-xs text-left">
                📊 {t.totalRowLabel || 'សរុប'}
              </td>
              {data.map((d) => {
                const total = d.day_shift + d.night_shift;
                return (
                  <td
                    key={`total-${d.machineCode}`}
                    className={`border border-slate-300 py-2 px-1 text-[#0e3a6b] font-black font-mono text-xs ${
                      selectedMachineCode === d.machineCode ? 'bg-blue-100' : ''
                    }`}
                  >
                    {total.toLocaleString()}
                  </td>
                );
              })}
              {/* Grand Total */}
              <td className="border border-slate-300 py-1.5 px-3 bg-amber-200 text-[#0e3a6b] font-black font-mono text-xs">
                <div className="text-sm">{stats.totalCombined.toLocaleString()}</div>
                <div className="text-[10px] text-amber-900 font-bold font-sans">
                  {Math.round((stats.totalCombined / 32500) * 100)}% (គោលដៅ 32.5K)
                </div>
              </td>
            </tr>

            {/* Target Achievement Rate Row */}
            <tr className="bg-emerald-50/40 text-[11px]">
              <td className="border border-slate-300 py-1.5 px-3 font-bold text-emerald-900 bg-emerald-50/80 sticky left-0 z-10 shadow-xs text-left">
                <div className="flex items-center justify-between">
                  <span>🎯 {t.achievementRate || 'អត្រាសម្រេចគោលដៅ'}</span>
                  <span className="text-[9px] font-normal text-emerald-700 bg-emerald-100 px-1 rounded">2.4K=100%</span>
                </div>
              </td>
              {data.map((d) => {
                const total = d.day_shift + d.night_shift;
                const totalTarget = (d.target || 1200) * 2; // 2400 PCR = 100%
                const pct = totalTarget > 0 ? Math.round((total / totalTarget) * 100) : 0;
                const isAchieved = pct >= 100;
                return (
                  <td
                    key={`rate-${d.machineCode}`}
                    className={`border border-slate-300 py-1.5 px-1 font-mono font-bold ${
                      isAchieved ? 'text-emerald-700 bg-emerald-50/60' : 'text-slate-600'
                    }`}
                    title={`${d.machineCode} ទិន្នផល: ${total} PCR / គោលដៅ: ${totalTarget} PCR (សម្រេច ${pct}%)`}
                  >
                    {pct}%
                  </td>
                );
              })}
              <td className="border border-slate-300 py-1.5 px-2 bg-amber-100 font-bold font-mono text-amber-900 text-xs">
                <div>{Math.round((stats.totalCombined / 32500) * 100)}%</div>
                <div className="text-[10px] text-slate-600 font-normal">
                  ({stats.targetAchievedCount}/{data.length} ម៉ាស៊ីន)
                </div>
              </td>
            </tr>

            {/* KPI Dollar Value ($) Row */}
            <tr className="bg-emerald-100/30 text-[11px]">
              <td className="border border-slate-300 py-1.5 px-3 font-bold text-emerald-950 bg-emerald-100/60 sticky left-0 z-10 shadow-xs text-left">
                <div className="flex items-center justify-between">
                  <span>💵 KPI ($)</span>
                  <span className="text-[9px] font-normal text-emerald-700 bg-emerald-100 px-1 rounded border border-emerald-300">Auto ≤ $45</span>
                </div>
              </td>
              {data.map((d) => (
                <td
                  key={`kpi-${d.machineCode}`}
                  className="border border-slate-300 py-1.5 px-1 font-mono font-bold text-emerald-800 bg-emerald-50/50"
                  title={`${d.machineCode} KPI Auto Reward: $${(d.kpi_usd ?? 0).toFixed(2)} (Output: ${d.day_shift + d.night_shift} PCR, Max: $45)`}
                >
                  ${(d.kpi_usd ?? 0).toFixed(2)}
                </td>
              ))}
              <td className="border border-slate-300 py-1.5 px-2 bg-emerald-200/90 font-bold font-mono text-emerald-950">
                ${data.reduce((sum, item) => sum + (item.kpi_usd || 0), 0).toFixed(2)}
              </td>
            </tr>

            {/* Cycle 26th-26th Cumulative Total Row */}
            {cycleData && (
              <tr className="bg-indigo-50/60 text-[11px]">
                <td className="border border-slate-300 py-1.5 px-3 font-bold text-indigo-950 bg-indigo-100/80 sticky left-0 z-10 shadow-xs text-left">
                  <div className="flex items-center justify-between">
                    <span>📊 {t.cycleAccumulated || 'សរុបវដ្ត (២៦-២៦)'}</span>
                  </div>
                </td>
                {data.map((d) => {
                  const machineCycleTotal = cycleData.machineTotals[d.machineCode] || 0;
                  return (
                    <td
                      key={`cycle-${d.machineCode}`}
                      className="border border-slate-300 py-1.5 px-1 font-mono font-bold text-indigo-900 bg-indigo-50/40"
                      title={`${d.machineCode} វដ្ត ២៦-២៦ សរុប: ${machineCycleTotal.toLocaleString()} 条`}
                    >
                      {machineCycleTotal.toLocaleString()}
                    </td>
                  );
                })}
                <td className="border border-slate-300 py-1.5 px-2 bg-indigo-200/90 font-bold font-mono text-indigo-950">
                  <div>{cycleData.totalProduction.toLocaleString()}</div>
                  <div className="text-[10px] text-indigo-800 font-semibold font-sans">
                    {Math.round((cycleData.totalProduction / (32500 * Math.max(1, cycleData.recordedDaysCount))) * 100)}% វដ្ត
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stat Cards Banner Below Table */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 bg-slate-50 border-t border-slate-200 text-xs">
        {/* Card 1: Today's Total */}
        <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-500 text-[11px] font-medium truncate">
              {currentLang === 'km' ? 'ទិន្នផលសរុបប្រចាំថ្ងៃ' : currentLang === 'en' ? 'Daily Total Output' : '当日总产量'}
            </div>
            <div className="text-sm font-black text-[#0e3a6b] truncate">
              {stats.totalCombined.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">PCR</span>
            </div>
            <div className="text-[10px] text-sky-700 font-bold font-mono">
              {Math.round((stats.totalCombined / 32500) * 100)}% នៃគោលដៅ 32.5K
            </div>
          </div>
        </div>

        {/* Card 2: 26th-to-26th Cycle Total */}
        {cycleData && (
          <div
            onClick={onOpenCycleModal}
            className="bg-indigo-50/60 hover:bg-indigo-100/70 p-2.5 rounded border border-indigo-200 flex items-center gap-2.5 shadow-2xs cursor-pointer transition-all hover:scale-[1.01]"
            title="ចុចដើម្បីមើលស្ថិតិលម្អិតវដ្ត ២៦ ខែមុន ដល់ ២៦ ខែនេះ"
          >
            <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-indigo-900 text-[11px] font-bold truncate">
                  {t.cycleTotalTitle || 'សរុបវដ្ត (២៦-២៦)'}
                </span>
                <ArrowUpRight className="w-3 h-3 text-indigo-600 shrink-0" />
              </div>
              <div className="text-sm font-black text-indigo-950 font-mono truncate">
                {cycleData.totalProduction.toLocaleString()}{' '}
                <span className="text-[10px] text-indigo-700 font-normal">PCR</span>
              </div>
              <div className="text-[10px] text-indigo-800 font-bold font-mono truncate">
                {Math.round((cycleData.totalProduction / (32500 * Math.max(1, cycleData.recordedDaysCount))) * 100)}% នៃគោលដៅវដ្ត
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Daily Avg */}
        <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 bg-sky-50 text-sky-700 rounded-lg shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-500 text-[11px] font-medium truncate">
              {currentLang === 'km' ? 'មធ្យមភាគប្រចាំថ្ងៃ (ម៉ាស៊ីន)' : currentLang === 'en' ? 'Daily Avg (Machine)' : '日均产量 (机台)'}
            </div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {stats.avgMachine.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">PCR/台</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              គោលដៅ: 2,400 PCR/台
            </div>
          </div>
        </div>

        {/* Card 4: Top Machine */}
        <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-500 text-[11px] font-medium truncate">
              {currentLang === 'km' ? 'ម៉ាស៊ីនទិន្នផលខ្ពស់បំផុត' : currentLang === 'en' ? 'Top Producing Machine' : '最高产出机台'}
            </div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {stats.maxMachine.val.toLocaleString()}{' '}
              <span className="text-[10px] text-slate-500 font-normal">({stats.maxMachine.code})</span>
            </div>
            <div className="text-[10px] text-purple-700 font-bold font-mono">
              {Math.round((stats.maxMachine.val / 2400) * 100)}% នៃគោលដៅ 2.4K
            </div>
          </div>
        </div>

        {/* Card 5: Target Achievement */}
        <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-500 text-[11px] font-medium truncate">
              {currentLang === 'km' ? 'ចំនួនម៉ាស៊ីនសម្រេចគោលដៅ' : currentLang === 'en' ? 'Target Achieved Machines' : '达标机台数'}
            </div>
            <div className="text-sm font-bold text-emerald-700 truncate">
              {stats.targetAchievedCount} / {data.length} <span className="text-[10px] text-slate-500 font-normal">台</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold truncate">
              (គោលដៅ ≥2,400 PCR)
            </div>
          </div>
        </div>

        {/* Card 6: Total KPI Value */}
        <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-slate-500 text-[11px] font-medium truncate">
              {currentLang === 'km' ? 'តម្លៃ KPI សរុប ($)' : currentLang === 'en' ? 'Total KPI Reward ($)' : 'KPI 总金额 ($)'}
            </div>
            <div className="text-sm font-black text-emerald-700 font-mono truncate">
              ${data.reduce((sum, item) => {
                const kpi = (item.kpi_usd !== undefined && item.kpi_usd > 0)
                  ? item.kpi_usd
                  : calculateAutoKpiReward(item.day_shift, item.night_shift, item.target || targetPerShift);
                return sum + kpi;
              }, 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-600 font-sans">
              Auto ≤ $45 / ម៉ាស៊ីន
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
