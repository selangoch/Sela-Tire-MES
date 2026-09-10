import React, { useState } from 'react';
import { UFMachineData, Language } from '../types';
import { translations } from '../translations';
import { calculateAutoKpiReward } from '../utils/kpiCalculator';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  LabelList,
} from 'recharts';
import { BarChart3, Sparkles } from 'lucide-react';

interface ChartSectionProps {
  data: UFMachineData[];
  shiftFilter: string;
  currentLang: Language;
  onSelectMachine?: (machineData: UFMachineData) => void;
  selectedMachineCode?: string;
  targetPerShift?: number;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  data,
  shiftFilter,
  currentLang,
  onSelectMachine,
  selectedMachineCode,
  targetPerShift = 1200,
}) => {
  const t = translations[currentLang];
  const [chartMode, setChartMode] = useState<'classicSvg' | 'interactive'>('classicSvg');
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);

  const showDay = shiftFilter === 'all' || shiftFilter === 'day';
  const showNight = shiftFilter === 'all' || shiftFilter === 'night';

  // SVG Chart Geometry Constants
  const W = 1000;
  const H = 450;
  const padL = 55;
  const padB = 60;
  const padT = 40;
  const padR = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Max scale calculation
  const maxOutputVal = Math.max(
    ...data.map((d) => Math.max(d.day_shift, d.night_shift)),
    1500
  );
  const maxVal = Math.ceil(maxOutputVal / 300) * 300;
  const groupW = chartW / Math.max(data.length, 1);
  const barW = groupW * 0.34;

  // Grid Y ticks
  const gridTicks = [0, 300, 600, 900, 1200, 1500];

  return (
    <div className="w-full bg-white pt-4 pb-3 px-2 sm:px-6">
      {/* Title & Legend Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
        {/* Chart Title & Legend */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-4 bg-sky-500 rounded-xs inline-block"></span>
            <span>{t.ufDbChartTitle || 'UF-DB Machine Production'}</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-700 font-medium border-l border-slate-200 pl-4">
            {showDay && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#38b6e8] shadow-2xs inline-block"></span>
                <span>{t.dayShift} <span className="text-[10px] text-sky-700 font-mono">(1,200=100%)</span></span>
              </div>
            )}
            {showNight && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#5b4fc4] shadow-2xs inline-block"></span>
                <span>{t.nightShift} <span className="text-[10px] text-indigo-700 font-mono">(1,200=100%)</span></span>
              </div>
            )}
            {showTargetLine && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 border-b-2 border-dashed border-red-500 inline-block"></span>
                <span className="text-red-700 font-semibold">{t.targetLine} ({targetPerShift} PCR = 100%)</span>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showTargetLine}
              onChange={(e) => setShowTargetLine(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{t.targetLine}</span>
          </label>

          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-300 ml-2">
            <button
              onClick={() => setChartMode('classicSvg')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded flex items-center gap-1 ${
                chartMode === 'classicSvg'
                  ? 'bg-white text-[#0e3a6b] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>经典MES</span>
            </button>
            <button
              onClick={() => setChartMode('interactive')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded flex items-center gap-1 ${
                chartMode === 'interactive'
                  ? 'bg-white text-[#0e3a6b] font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>交互研判</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLASSIC SVG RENDER */}
      {chartMode === 'classicSvg' && (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[750px] max-w-[1050px] mx-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
              {/* Grid Lines & Y Axis Labels */}
              {gridTicks.map((v) => {
                const y = padT + chartH - (v / maxVal) * chartH;
                return (
                  <g key={`grid-${v}`}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={W - padR}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth={1}
                    />
                    <text
                      x={padL - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize={10}
                      fill="#64748b"
                      className="font-sans font-medium"
                    >
                      {v.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* Target Line SVG (1200 PCR) */}
              {showTargetLine && (
                <g>
                  <line
                    x1={padL}
                    y1={padT + chartH - (targetPerShift / maxVal) * chartH}
                    x2={W - padR}
                    y2={padT + chartH - (targetPerShift / maxVal) * chartH}
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={W - padR - 5}
                    y={padT + chartH - (targetPerShift / maxVal) * chartH - 4}
                    textAnchor="end"
                    fontSize={10}
                    fill="#ef4444"
                    className="font-sans font-bold"
                  >
                    Target {targetPerShift} (100%)
                  </text>
                </g>
              )}

              {/* 15 Machine Groups */}
              {data.map((d, i) => {
                const gx = padL + i * groupW;
                const hDay = (d.day_shift / maxVal) * chartH;
                const hNight = (d.night_shift / maxVal) * chartH;

                let xDay = gx + groupW * 0.1;
                let xNight = xDay + barW + 3;

                if (!showNight) xDay = gx + groupW * 0.25;
                if (!showDay) xNight = gx + groupW * 0.25;

                const yDay = padT + chartH - hDay;
                const yNight = padT + chartH - hNight;
                const isSelected = selectedMachineCode === d.machineCode;

                const machineTarget = d.target || targetPerShift || 1200;
                const pctDay = d.day_shift > 0 ? Math.round((d.day_shift / machineTarget) * 100) : 0;
                const pctNight = d.night_shift > 0 ? Math.round((d.night_shift / machineTarget) * 100) : 0;
                const totalOutput = d.day_shift + d.night_shift;
                const pctTotal = totalOutput > 0 ? Math.round((totalOutput / (machineTarget * 2)) * 100) : 0;
                const kpiVal = (d.kpi_usd !== undefined && d.kpi_usd > 0)
                  ? d.kpi_usd
                  : calculateAutoKpiReward(d.day_shift, d.night_shift, machineTarget);

                return (
                  <g
                    key={`bar-group-${d.machineCode}`}
                    onClick={() => onSelectMachine && onSelectMachine(d)}
                    className="cursor-pointer group"
                  >
                    {/* Background hover highlight */}
                    <rect
                      x={gx}
                      y={padT}
                      width={groupW}
                      height={chartH}
                      fill={isSelected ? '#3b82f615' : 'transparent'}
                      className="group-hover:fill-blue-50/50 transition-colors"
                    />

                    {/* Day Shift Bar */}
                    {showDay && (
                      <g>
                        <rect
                          x={xDay}
                          y={yDay}
                          width={barW}
                          height={Math.max(hDay, 1)}
                          rx={2}
                          fill="#38b6e8"
                          className="transition-all duration-200 group-hover:brightness-95"
                        />
                        {/* Percentage % above bar */}
                        <text
                          x={xDay + barW / 2}
                          y={yDay - 15}
                          textAnchor="middle"
                          fontSize={9.5}
                          fill={pctDay >= 100 ? '#0369a1' : '#0284c7'}
                          fontWeight="bold"
                          className="font-mono"
                        >
                          {pctDay}%
                        </text>
                        {/* PCR Count value above bar */}
                        <text
                          x={xDay + barW / 2}
                          y={yDay - 4}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#334155"
                          fontWeight={600}
                          className="font-sans"
                        >
                          {d.day_shift.toLocaleString()}
                        </text>
                      </g>
                    )}

                    {/* Night Shift Bar */}
                    {showNight && (
                      <g>
                        <rect
                          x={xNight}
                          y={yNight}
                          width={barW}
                          height={Math.max(hNight, 1)}
                          rx={2}
                          fill="#5b4fc4"
                          className="transition-all duration-200 group-hover:brightness-95"
                        />
                        {d.night_shift > 0 ? (
                          <>
                            {/* Percentage % above bar */}
                            <text
                              x={xNight + barW / 2}
                              y={yNight - 15}
                              textAnchor="middle"
                              fontSize={9.5}
                              fill={pctNight >= 100 ? '#4338ca' : '#6366f1'}
                              fontWeight="bold"
                              className="font-mono"
                            >
                              {pctNight}%
                            </text>
                            {/* PCR Count value above bar */}
                            <text
                              x={xNight + barW / 2}
                              y={yNight - 4}
                              textAnchor="middle"
                              fontSize={9}
                              fill="#334155"
                              fontWeight={600}
                              className="font-sans"
                            >
                              {d.night_shift.toLocaleString()}
                            </text>
                          </>
                        ) : (
                          <text
                            x={xNight + barW / 2}
                            y={yNight - 4}
                            textAnchor="middle"
                            fontSize={8.5}
                            fill="#94a3b8"
                            className="font-mono"
                          >
                            0
                          </text>
                        )}
                      </g>
                    )}

                    {/* Machine X-Axis Label (UF1, UF2, ... UF15) */}
                    <text
                      x={gx + groupW / 2}
                      y={padT + chartH + 16}
                      textAnchor="middle"
                      fontSize={11}
                      fill={isSelected ? '#0284c7' : '#0f172a'}
                      fontWeight={isSelected ? 'bold' : '700'}
                      className="font-sans tracking-tight"
                    >
                      {d.machineCode}
                    </text>

                    {/* Daily Machine % and total underneath machine code */}
                    <text
                      x={gx + groupW / 2}
                      y={padT + chartH + 30}
                      textAnchor="middle"
                      fontSize={9}
                      fill={pctTotal >= 100 ? '#047857' : '#475569'}
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {pctTotal}%
                    </text>

                    {/* KPI Dollar Value ($) */}
                    <text
                      x={gx + groupW / 2}
                      y={padT + chartH + 44}
                      textAnchor="middle"
                      fontSize={9.5}
                      fill="#059669"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      ${kpiVal.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Line */}
              <line
                x1={padL}
                y1={padT + chartH}
                x2={W - padR}
                y2={padT + chartH}
                stroke="#cbd5e1"
                strokeWidth={1.5}
              />
            </svg>
          </div>
        </div>
      )}

      {/* INTERACTIVE RECHARTS RENDER */}
      {chartMode === 'interactive' && (
        <div className="w-full h-[390px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 35, right: 20, bottom: 25, left: 10 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  onSelectMachine?.(e.activePayload[0].payload as UFMachineData);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="machineCode"
                tickLine={false}
                tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 'bold' }}
              />
              <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, maxVal]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload as UFMachineData;
                    const mTarget = row.target || targetPerShift || 1200;
                    const pDay = Math.round((row.day_shift / mTarget) * 100);
                    const pNight = Math.round((row.night_shift / mTarget) * 100);
                    const pTot = Math.round(((row.day_shift + row.night_shift) / (mTarget * 2)) * 100);
                    const kpi = (row.kpi_usd !== undefined && row.kpi_usd > 0)
                      ? row.kpi_usd
                      : calculateAutoKpiReward(row.day_shift, row.night_shift, mTarget);

                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-md shadow-xl text-xs space-y-1.5">
                        <div className="font-bold border-b border-slate-700 pb-1">
                          {row.machineCode} ({row.machineName})
                        </div>
                        {showDay && (
                          <div className="flex justify-between items-center gap-4 text-sky-300">
                            <span>早班 (Day Shift):</span>
                            <span className="font-mono font-bold">{row.day_shift} PCR ({pDay}%)</span>
                          </div>
                        )}
                        {showNight && (
                          <div className="flex justify-between items-center gap-4 text-indigo-300">
                            <span>夜班 (Night Shift):</span>
                            <span className="font-mono font-bold">{row.night_shift} PCR ({pNight}%)</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center gap-4 text-amber-300 pt-1 border-t border-slate-800 font-bold">
                          <span>机台总产量:</span>
                          <span className="font-mono">{row.day_shift + row.night_shift} PCR ({pTot}%)</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-emerald-300 pt-1 border-t border-slate-800 font-bold">
                          <span>KPI Reward ($):</span>
                          <span className="font-mono">${kpi.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {showDay && (
                <Bar dataKey="day_shift" name="早班" fill="#38b6e8" radius={[2, 2, 0, 0]}>
                  <LabelList
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (!value) return null;
                      const pct = Math.round((Number(value) / 1200) * 100);
                      return (
                        <g>
                          <text x={x + width / 2} y={y - 14} fill="#0284c7" textAnchor="middle" fontSize={9.5} fontWeight="bold" fontFamily="monospace">
                            {pct}%
                          </text>
                          <text x={x + width / 2} y={y - 3} fill="#334155" textAnchor="middle" fontSize={9} fontWeight="600">
                            {value}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Bar>
              )}
              {showNight && (
                <Bar dataKey="night_shift" name="夜班" fill="#5b4fc4" radius={[2, 2, 0, 0]}>
                  <LabelList
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (!value) return null;
                      const pct = Math.round((Number(value) / 1200) * 100);
                      return (
                        <g>
                          <text x={x + width / 2} y={y - 14} fill="#6366f1" textAnchor="middle" fontSize={9.5} fontWeight="bold" fontFamily="monospace">
                            {pct}%
                          </text>
                          <text x={x + width / 2} y={y - 3} fill="#334155" textAnchor="middle" fontSize={9} fontWeight="600">
                            {value}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Bar>
              )}

              {showTargetLine && (
                <ReferenceLine
                  y={targetPerShift}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target: ${targetPerShift} (100%)`,
                    fill: '#ef4444',
                    fontSize: 11,
                    position: 'top',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
