import React from 'react';
import { FilterState, Language, MachineInfo, CycleRange } from '../types';
import { translations } from '../translations';
import { Search, FileSpreadsheet, PlusCircle, Gauge, BarChart2, DollarSign, Calendar, Users } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';

interface ToolbarProps {
  filters: FilterState;
  onChangeFilter: (key: keyof FilterState, value: string) => void;
  onQuery: () => void;
  onExportExcel: () => void;
  onOpenDataEntry: () => void;
  onOpenKpiEntry?: () => void;
  onOpenCycleModal?: () => void;
  onOpenAccessLogs?: () => void;
  cycleRange?: CycleRange;
  machines: MachineInfo[];
  currentLang: Language;
  activeTab: 'output' | 'oee';
  onTabChange: (tab: 'output' | 'oee') => void;
  isLoading?: boolean;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  filters,
  onChangeFilter,
  onQuery,
  onExportExcel,
  onOpenDataEntry,
  onOpenKpiEntry,
  onOpenCycleModal,
  onOpenAccessLogs,
  cycleRange,
  machines,
  currentLang,
  activeTab,
  onTabChange,
  isLoading = false,
  isAdmin = false,
  onOpenAdminLogin,
}) => {
  const t = translations[currentLang];

  return (
    <div className="bg-[#fafbfc] px-4 py-2.5 text-xs text-slate-700 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      {/* Left Filter Controls */}
      <div className="flex flex-wrap items-center gap-3.5">
        {/* Date */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-500 font-medium whitespace-nowrap">{t.dateLabel}</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onChangeFilter('date', e.target.value)}
            className="border border-slate-300 bg-white rounded px-2 py-1 text-xs text-slate-800 shadow-2xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
          />
          <button
            type="button"
            onClick={() => onChangeFilter('date', getTodayDateString())}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
              filters.date === getTodayDateString()
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-blue-700'
            }`}
            title="ត្រឡប់មកថ្ងៃនេះ / Back to Today"
          >
            {t.today || (currentLang === 'km' ? 'ថ្ងៃនេះ' : currentLang === 'en' ? 'Today' : '今天')}
          </button>
        </div>

        {/* Query & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onQuery}
            disabled={isLoading}
            className="bg-[#3f7fd1] hover:bg-[#326ab3] active:bg-[#285794] text-white font-medium rounded px-3.5 py-1 text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Search className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t.queryBtn}</span>
          </button>

          <button
            onClick={onExportExcel}
            className="bg-white hover:bg-slate-50 text-[#3f7fd1] border border-[#3f7fd1] font-medium rounded px-3 py-1 text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.exportExcel}</span>
          </button>

          {/* 26-26 Cycle Summary Button */}
          {onOpenCycleModal && (
            <button
              onClick={onOpenCycleModal}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded px-3 py-1 text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer border border-indigo-500"
              title="គិតសរុបចាប់ពីថ្ងៃទី២៦ខែមុន ដល់ ថ្ងៃទី២៦ខែនេះ"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-200" />
              <span>{t.cycleDetailBtn || 'ស្ថិតិវដ្ត ២៦-២៦'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isAdmin) {
                onOpenDataEntry();
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className={`${
              isAdmin
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            } text-white font-medium rounded px-3 py-1 text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>
              {t.editProductionBtn || t.addRecord}
              {!isAdmin && ` (${t.loginBtn || '登录'})`}
            </span>
          </button>

          <button
            onClick={() => {
              if (isAdmin) {
                onOpenKpiEntry?.();
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded px-3 py-1 text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer border border-emerald-500"
            title="Set KPI Dollar Value for UF1–UF15"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
            <span>
              {currentLang === 'km' ? 'កំណត់ KPI ($)' : currentLang === 'en' ? 'Set KPI ($)' : '设置 KPI ($)'}
              {!isAdmin && ` (${t.loginBtn || '登录'})`}
            </span>
          </button>

          {/* Admin-only Access & Device Tracking Button */}
          {isAdmin && onOpenAccessLogs && (
            <button
              onClick={onOpenAccessLogs}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold rounded px-3 py-1 text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer border border-slate-600"
              title="ពិនិត្យមើលទិន្នន័យអ្នកចូលប្រើប្រាស់ និងម៉ូដេលទូរស័ព្ទ (Admin Only)"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {currentLang === 'km' ? 'អ្នកចូលប្រើប្រាស់ (Admin)' : currentLang === 'en' ? 'User Access' : '用户访问'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Right Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded border border-slate-300">
        <button
          onClick={() => onTabChange('output')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
            activeTab === 'output'
              ? 'bg-white text-[#0e3a6b] font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{t.outputTab}</span>
        </button>
        <button
          onClick={() => onTabChange('oee')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
            activeTab === 'oee'
              ? 'bg-white text-[#0e3a6b] font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{t.oeeTab}</span>
        </button>
      </div>
    </div>
  );
};
