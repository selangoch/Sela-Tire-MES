import React, { useState } from 'react';
import { CycleSummaryData, Language } from '../types';
import { translations } from '../translations';
import {
  X,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Layers,
  Sun,
  Moon,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Cycle26ModalProps {
  onClose: () => void;
  cycleData: CycleSummaryData;
  currentLang: Language;
  userId?: string;
}

export const Cycle26Modal: React.FC<Cycle26ModalProps> = ({
  onClose,
  cycleData,
  currentLang,
  userId = '733445',
}) => {
  const t = translations[currentLang];
  const [activeSubTab, setActiveSubTab] = useState<'operators' | 'machines' | 'daily'>('operators');

  const {
    range,
    totalProduction,
    totalDayShift,
    totalNightShift,
    totalKpiUsd,
    recordedDaysCount,
    totalDaysInCycle,
    dailyAvg,
    machineTotals,
    machineDayTotals,
    machineNightTotals,
    machineKpis,
    operatorKpis = [],
    dailyBreakdown,
  } = cycleData;

  const totalOperatorKpiUsd = operatorKpis.reduce((acc, curr) => acc + curr.monthlyKpiUsd, 0);

  const handleExportCycleExcel = () => {
    try {
      // Sheet 1: Operator Monthly Ranked KPI
      const operatorRows = operatorKpis.map((op) => ({
        'ចំណាត់ថ្នាក់ (Rank)': `លេខ ${op.rank || 1}`,
        'ឈ្មោះបុគ្គលិក (Operator Name)': op.operatorName,
        'ម៉ាស៊ីនទទួលខុសត្រូវ (Assigned Machines)': op.machineCodes.join(', '),
        'ចំនួនម៉ាស៊ីន (Machine Count)': op.machineCount,
        'ទិន្នផលវេនព្រឹក (Day Shift PCR)': op.totalDayOutput,
        'ទិន្នផលវេនយប់ (Night Shift PCR)': op.totalNightOutput,
        'ទិន្នផលសរុបវដ្ត (Total Output PCR)': op.totalOutput,
        'គោលដៅផលិតកម្ម (Target Output PCR)': op.targetOutput,
        'អត្រាសម្រេច (%) (Achievement %)': `${op.achievementRate}%`,
        'ប្រាក់រង្វាន់ KPI តាមចំណាត់ថ្នាក់ ($)': `$${op.monthlyKpiUsd.toFixed(2)}`,
      }));

      // Sheet 2: Machine Summaries
      const machineRows = Object.keys(machineTotals).map((code) => {
        const total = machineTotals[code] || 0;
        const day = machineDayTotals[code] || 0;
        const night = machineNightTotals[code] || 0;
        const kpi = machineKpis[code] || 0;
        const pct = totalProduction > 0 ? ((total / totalProduction) * 100).toFixed(1) : '0.0';

        return {
          'ម៉ាស៊ីន (Machine)': code,
          'សរុបវេនព្រឹក (Day Total)': day,
          'សរុបវេនយប់ (Night Total)': night,
          'សរុបវដ្ត (Cycle Total PCR)': total,
          'សមាមាត្រ (%) (Share %)': `${pct}%`,
          'KPI ($)': `$${kpi.toFixed(2)}`,
        };
      });

      // Sheet 3: Daily Records
      const dailyRows = dailyBreakdown
        .filter((d) => d.total > 0 || d.kpiTotal > 0)
        .map((d) => ({
          'កាលបរិច្ឆេទ (Date)': d.date,
          'សរុបវេនព្រឹក (Day Total)': d.dayTotal,
          'សរុបវេនយប់ (Night Total)': d.nightTotal,
          'សរុបប្រចាំថ្ងៃ (Daily Total PCR)': d.total,
          'KPI ប្រចាំថ្ងៃ ($)': `$${d.kpiTotal.toFixed(2)}`,
        }));

      const wb = XLSX.utils.book_new();
      const wsOp = XLSX.utils.json_to_sheet(operatorRows);
      const ws1 = XLSX.utils.json_to_sheet(machineRows);
      const ws2 = XLSX.utils.json_to_sheet(dailyRows);

      XLSX.utils.book_append_sheet(wb, wsOp, 'Operator KPI ($45 Max)');
      XLSX.utils.book_append_sheet(wb, ws1, 'Machine Totals');
      XLSX.utils.book_append_sheet(wb, ws2, 'Daily Records');

      XLSX.writeFile(wb, `Sela_MES_Cycle_${range.startDate}_to_${range.endDate}_User_${userId}.xlsx`);
    } catch (e) {
      console.error('Error exporting cycle Excel:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0e3a6b] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-500/20 rounded-lg border border-sky-400/30">
              <Calendar className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>
                  {currentLang === 'km'
                    ? 'ស្ថិតិផលិតកម្ម និង KPI សរុបវដ្ត ២៧ ខែមុន - ២៦ ខែនេះ'
                    : currentLang === 'en'
                    ? 'Monthly Cycle Production & KPI (27th Prev ~ 26th Current)'
                    : '月度周期产量与 KPI 统计 (上月27日 ~ 本月26日)'}
                </span>
                <span className="bg-sky-400/20 text-sky-200 border border-sky-300/30 text-xs px-2 py-0.5 rounded-full font-mono">
                  {range.startDate} ~ {range.endDate}
                </span>
              </div>
              <div className="text-xs text-sky-200/80 mt-0.5 flex items-center gap-2">
                <span>
                  {currentLang === 'km'
                    ? '⚡ ចំនួនសរុបរាប់ពីថ្ងៃទី២៧ ដល់ ថ្ងៃទី២៦ ហើយចូលដល់ថ្ងៃទី២៧ នឹងចាប់ផ្ដើមឡើងវិញដោយស្វ័យប្រវត្ត'
                    : currentLang === 'en'
                    ? '⚡ Cycle runs from 27th to 26th, automatically restarts on the 27th for subsequent months'
                    : '⚡ 周期从27日累计至26日，进入27日自动清零重新起计'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCycleExcel}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.exportExcel || 'នាំចេញ Excel'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs shrink-0">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentLang === 'km' ? 'ទិន្នផលសរុបវដ្ត' : 'Total Cycle Output'}</span>
              </span>
              <span className="text-blue-700 font-mono font-bold">
                {Math.round((totalProduction / (32500 * Math.max(1, recordedDaysCount))) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-[#0e3a6b] font-mono mt-1">
              {totalProduction.toLocaleString()} <span className="text-xs font-normal text-slate-500">PCR</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
              ព្រឹក: {totalDayShift.toLocaleString()} ({Math.round((totalDayShift / (16000 * Math.max(1, recordedDaysCount))) * 100)}%) | យប់: {totalNightShift.toLocaleString()} ({Math.round((totalNightShift / (16500 * Math.max(1, recordedDaysCount))) * 100)}%)
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentLang === 'km' ? 'KPI បុគ្គលិកសរុប (Max $45/នាក់)' : 'Total Operator KPI'}</span>
            </div>
            <div className="text-lg font-black text-emerald-700 font-mono mt-1">
              ${totalOperatorKpiUsd.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-600/80 mt-0.5 font-sans">
              គណនាតាមឈ្មោះ ៧ នាក់ (អតិបរមា $45)
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentLang === 'km' ? 'ថ្ងៃមានទិន្នន័យផលិតកម្ម' : 'Active Days Logged'}</span>
            </div>
            <div className="text-lg font-black text-indigo-900 font-mono mt-1">
              {recordedDaysCount} / {totalDaysInCycle}{' '}
              <span className="text-xs font-normal text-slate-500">{currentLang === 'km' ? 'ថ្ងៃ' : 'days'}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              វដ្ត ៣១ ថ្ងៃ (២៧ ខែមុន - ២៦ ខែនេះ)
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentLang === 'km' ? 'មធ្យមភាគប្រចាំថ្ងៃក្នុងវដ្ត' : 'Cycle Daily Avg'}</span>
            </div>
            <div className="text-lg font-black text-slate-800 font-mono mt-1">
              {dailyAvg.toLocaleString()} <span className="text-xs font-normal text-slate-500">PCR/ថ្ងៃ</span>
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5 font-sans font-semibold">
              {Math.round((dailyAvg / 32500) * 100)}% នៃគោលដៅ 32,500 PCR/ថ្ងៃ
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveSubTab('operators')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'operators'
                ? 'border-emerald-600 text-emerald-800 font-bold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {currentLang === 'km'
                ? '⭐ ប្រាក់រង្វាន់ KPI តាមឈ្មោះមនុស្ស (អតិបរមា $45.00/ខែ)'
                : currentLang === 'en'
                ? 'Operator Monthly KPI (Max $45/person)'
                : '月度人员 KPI 奖金 (每人封顶 $45)'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('machines')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'machines'
                ? 'border-indigo-600 text-indigo-800 font-bold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'km' ? 'ស្ថិតិម៉ាស៊ីន UF1–UF15' : 'Machine Totals (UF1–UF15)'}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('daily')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'daily'
                ? 'border-indigo-600 text-indigo-800 font-bold bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'km' ? 'កំណត់ត្រាប្រចាំថ្ងៃក្នុងវដ្ត' : 'Daily Logs in Cycle'}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {/* TAB 1: OPERATOR MONTHLY KPI RANKING */}
          {activeSubTab === 'operators' && (
            <div className="space-y-4">
              {/* Ranking Reward Rules Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-950 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm mb-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>
                    {currentLang === 'km'
                      ? 'តារាងប្រាក់រង្វាន់ KPI ប្រចាំខែ គិតតាមចំណាត់ថ្នាក់ទិន្នផលសរុបបុគ្គលិក'
                      : 'Monthly Operator KPI Reward Schedule by Total Production Rank'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 text-center text-[11px] font-semibold">
                  <div className="bg-white/90 p-1.5 rounded border border-amber-300 shadow-2xs">
                    <div className="text-amber-700">🥇 លេខ ១</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$45.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-slate-300 shadow-2xs">
                    <div className="text-slate-700">🥈 លេខ ២</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$43.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-amber-600/30 shadow-2xs">
                    <div className="text-amber-800">🥉 លេខ ៣</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$40.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-blue-200 shadow-2xs">
                    <div className="text-blue-700">🏅 លេខ ៤</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$38.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-blue-200 shadow-2xs">
                    <div className="text-blue-700">លេខ ៥</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$35.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-blue-200 shadow-2xs">
                    <div className="text-blue-700">លេខ ៦</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$32.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-blue-200 shadow-2xs">
                    <div className="text-blue-700">លេខ ៧</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$30.00</div>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded border border-slate-200 shadow-2xs">
                    <div className="text-slate-600">លេខ ៨</div>
                    <div className="font-bold font-mono text-emerald-700 text-sm">$28.00</div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">ចំណាត់ថ្នាក់</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">ឈ្មោះបុគ្គលិកប្រតិបត្តិការ</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">ម៉ាស៊ីនទទួលខុសត្រូវ</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">វេនព្រឹក (PCR)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">វេនយប់ (PCR)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-[#0e3a6b]">
                        សរុបវដ្តប្រចាំខែ (PCR)
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-right">គោលដៅវដ្ត (PCR)</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">សម្រេចបាន (%)</th>
                      <th className="py-2.5 px-3 text-right bg-emerald-100/80 text-emerald-950 font-bold">
                        ប្រាក់រង្វាន់ KPI ($)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {operatorKpis.map((op) => {
                      const isHigh = op.achievementRate >= 100;
                      const rank = op.rank || 1;

                      let rankBadge = (
                        <span className="font-bold text-slate-600 font-mono">
                          #{rank}
                        </span>
                      );
                      if (rank === 1) {
                        rankBadge = (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs text-[11px]">
                            🥇 លេខ ១
                          </span>
                        );
                      } else if (rank === 2) {
                        rankBadge = (
                          <span className="bg-slate-200 text-slate-800 border border-slate-300 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs text-[11px]">
                            🥈 លេខ ២
                          </span>
                        );
                      } else if (rank === 3) {
                        rankBadge = (
                          <span className="bg-amber-50 text-amber-800 border border-amber-400 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs text-[11px]">
                            🥉 លេខ ៣
                          </span>
                        );
                      } else if (rank === 4) {
                        rankBadge = (
                          <span className="bg-sky-100 text-sky-900 border border-sky-300 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[11px]">
                            🏅 លេខ ៤
                          </span>
                        );
                      } else {
                        rankBadge = (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2 py-0.5 rounded-full text-[11px]">
                            លេខ {rank}
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={op.operatorName}
                          className={`hover:bg-slate-50 transition-colors ${
                            rank === 1 ? 'bg-amber-50/20' : rank === 2 ? 'bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                            {rankBadge}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{op.operatorName}</span>
                              {op.operatorName === 'ចាន់និត' && (
                                <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.2 rounded font-normal border border-sky-200">
                                  UF4 & UF5
                                </span>
                              )}
                              {op.operatorName === 'សុភា' && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-normal border border-purple-200">
                                  UF8
                                </span>
                              )}
                              {op.operatorName === 'សិទ្ធ' && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-normal border border-amber-200">
                                  UF13, UF14 & UF15
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-600">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {op.machineCodes.join(', ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-sky-800 font-medium">
                            {op.totalDayOutput.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-indigo-800 font-medium">
                            {op.totalNightOutput.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-[#0e3a6b] text-sm">
                            {op.totalOutput.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-500">
                            {op.targetOutput.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-200 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                                isHigh
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {op.achievementRate}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-900 bg-emerald-50/80 text-sm sm:text-base">
                            ${op.monthlyKpiUsd.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-emerald-100/90 font-bold text-slate-900 border-t-2 border-emerald-300">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-left font-black text-emerald-950">
                        សរុបបុគ្គលិកទាំងអស់ ({operatorKpis.length} នាក់)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sky-950">
                        {operatorKpis.reduce((a, b) => a + b.totalDayOutput, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-950">
                        {operatorKpis.reduce((a, b) => a + b.totalNightOutput, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-950">
                        {operatorKpis.reduce((a, b) => a + b.totalOutput, 0).toLocaleString()} PCR
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {operatorKpis.reduce((a, b) => a + b.targetOutput, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-900">
                        {(() => {
                          const totTarget = operatorKpis.reduce((a, b) => a + b.targetOutput, 0);
                          const totOut = operatorKpis.reduce((a, b) => a + b.totalOutput, 0);
                          return totTarget > 0 ? `${Math.round((totOut / totTarget) * 100)}%` : '0%';
                        })()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-950 text-base">
                        ${totalOperatorKpiUsd.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MACHINE TOTALS (UF1-UF15) */}
          {activeSubTab === 'machines' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">កូដម៉ាស៊ីន</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">ឈ្មោះម៉ាស៊ីន / អ្នកទទួលខុសត្រូវ</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right">សរុបវេនព្រឹក (PCR)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right">សរុបវេនយប់ (PCR)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-[#0e3a6b]">
                      សរុបវដ្តទាំងមូល (PCR)
                    </th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">សមាមាត្រ (%)</th>
                    <th className="py-2.5 px-3 text-right bg-emerald-50 text-emerald-900 font-bold">
                      KPI ម៉ាស៊ីន ($)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.keys(machineTotals).map((code) => {
                    const total = machineTotals[code] || 0;
                    const day = machineDayTotals[code] || 0;
                    const night = machineNightTotals[code] || 0;
                    const kpi = machineKpis[code] || 0;
                    const pct = totalProduction > 0 ? ((total / totalProduction) * 100).toFixed(1) : '0.0';

                    // Get human-readable machine name
                    const codeToNameMap: Record<string, string> = {
                      UF1: 'UF-DB-01 សក្កដា',
                      UF2: 'UF-DB-02 សក្កដា',
                      UF3: 'UF-DB-03 សក្កដា',
                      UF4: 'UF-DB-04 ចាន់និត',
                      UF5: 'UF-DB-05 ចាន់និត',
                      UF6: 'UF-DB-06 សេនទី',
                      UF7: 'UF-DB-07 សេនទី',
                      UF8: 'UF-DB-08 សុភា',
                      UF9: 'UF-DB-09 កក្កដា',
                      UF10: 'UF-DB-10 កក្កដា',
                      UF11: 'UF-DB-11 មេងជួ',
                      UF12: 'UF-DB-12 មេងជួ',
                      UF13: 'UF-DB-13 សិទ្ធ',
                      UF14: 'UF-DB-14 សិទ្ធ',
                      UF15: 'UF-DB-15 សិទ្ធ',
                    };
                    const machineTitle = codeToNameMap[code] || code;

                    return (
                      <tr key={code} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 border-r border-slate-200 font-bold font-mono text-slate-900">
                          {code}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-800">
                          {machineTitle}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-sky-800">
                          {day.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-indigo-800">
                          {night.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-[#0e3a6b]">
                          {total.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-slate-600">
                          {pct}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/40">
                          ${kpi.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: DAILY LOGS IN CYCLE */}
          {activeSubTab === 'daily' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">កាលបរិច្ឆេទ</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right">វេនព្រឹក (PCR)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right">វេនយប់ (PCR)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-[#0e3a6b]">
                      ទិន្នផលសរុបប្រចាំថ្ងៃ (PCR)
                    </th>
                    <th className="py-2.5 px-3 text-right bg-emerald-50 text-emerald-900 font-bold">
                      KPI សរុបប្រចាំថ្ងៃ ($)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dailyBreakdown.map((d) => (
                    <tr key={d.date} className={`hover:bg-slate-50 transition-colors ${d.total === 0 ? 'opacity-50' : ''}`}>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-semibold text-slate-800">
                        {d.date}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-sky-800">
                        {d.dayTotal.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-indigo-800">
                        {d.nightTotal.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-[#0e3a6b]">
                        {d.total.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/40">
                        ${d.kpiTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Sela Tire MES • វដ្ត ២៦-២៦ • បុគ្គលិក ៧ នាក់ • ម៉ាស៊ីន UF1–UF15
            </span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-1.5 rounded transition-colors cursor-pointer"
          >
            {t.close || 'បិទ'}
          </button>
        </div>
      </div>
    </div>
  );
};
