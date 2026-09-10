import React from 'react';
import { MachineInfo, Language } from '../types';
import { translations } from '../translations';
import { Gauge, CheckCircle, AlertTriangle, Wrench, Activity, Zap } from 'lucide-react';

interface OEEDashboardProps {
  machines: MachineInfo[];
  currentLang: Language;
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
}

export const OEEDashboard: React.FC<OEEDashboardProps> = ({
  machines,
  currentLang,
  selectedMachineId,
  onSelectMachine,
}) => {
  const t = translations[currentLang];

  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  return (
    <div className="w-full bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Machine Selector Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {machines.map((m) => {
          const isSelected = m.id === selectedMachineId;
          const statusColors = {
            running: 'bg-emerald-500 text-emerald-50 border-emerald-600',
            warning: 'bg-amber-500 text-amber-50 border-amber-600',
            idle: 'bg-slate-400 text-slate-50 border-slate-500',
            maintenance: 'bg-red-500 text-red-50 border-red-600',
          };

          return (
            <div
              key={m.id}
              onClick={() => onSelectMachine(m.id)}
              className={`p-3 rounded-lg border bg-white cursor-pointer transition-all shadow-2xs hover:shadow-md ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-600/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800 truncate">{m.id}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    statusColors[m.status]
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate">{m.workshop}</div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-600 font-medium">OEE 指标:</span>
                <span className="text-base font-black text-[#0e3a6b] font-mono">{m.oee}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Machine Detail Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0e3a6b] flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-600" />
              <span>{currentMachine.name} - 设备综合效能 (OEE) 监控</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              所属厂区: {currentMachine.workshop} | 额定日产目标: {currentMachine.targetDaily} 条
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">当前运行速度</div>
              <div className="text-sm font-black text-emerald-700 font-mono">
                {currentMachine.currentSpeed} <span className="text-xs text-slate-500 font-normal">条/小时</span>
              </div>
            </div>
          </div>
        </div>

        {/* OEE 3 Big Pillar Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total OEE */}
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-lg flex flex-col justify-between">
            <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
              <span>OEE 综合效率</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-[#0e3a6b] font-mono my-3">
              {currentMachine.oee}%
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentMachine.oee}%` }}
              ></div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-lg flex flex-col justify-between">
            <div className="text-xs font-bold text-emerald-900 flex items-center justify-between">
              <span>时间开动率 (Availability)</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 font-mono my-3">
              {currentMachine.availability}%
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentMachine.availability}%` }}
              ></div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-indigo-50/60 border border-indigo-200 p-4 rounded-lg flex flex-col justify-between">
            <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
              <span>性能表现率 (Performance)</span>
              <Gauge className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-900 font-mono my-3">
              {currentMachine.performance}%
            </div>
            <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentMachine.performance}%` }}
              ></div>
            </div>
          </div>

          {/* Quality */}
          <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-lg flex flex-col justify-between">
            <div className="text-xs font-bold text-purple-900 flex items-center justify-between">
              <span>合格率 (Quality Rate)</span>
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 font-mono my-3">
              {currentMachine.quality}%
            </div>
            <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentMachine.quality}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Realtime Telemetry Summary */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
            <Wrench className="w-3.5 h-3.5 text-slate-600" />
            <span>机台诊断日志 & PLC 实时状态</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 pt-1">
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">螺杆挤出压力</span>
              <span className="font-mono font-bold text-slate-800">14.2 MPa</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">机头设定温度</span>
              <span className="font-mono font-bold text-slate-800">108.5 °C</span>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">胎面宽度激光测厚</span>
              <span className="font-mono font-bold text-emerald-700">±0.08 mm (正常)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
