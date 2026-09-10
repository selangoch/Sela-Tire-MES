export type Language = 'zh' | 'en' | 'km';

export interface ShiftData {
  day: number;
  day_shift: number;
  night_shift: number;
  operator_day?: string;
  operator_night?: string;
  scrap_day?: number;
  scrap_night?: number;
  target?: number;
  notes?: string;
}

export interface MachineInfo {
  id: string;
  name: string;
  workshop: string;
  status: 'running' | 'maintenance' | 'idle' | 'warning';
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  currentSpeed: number; // tires/hr
  targetDaily: number;
}

export interface FilterState {
  date: string;
  workshop: string;
  shift: string;
  machineId: string;
}

export interface UFMachineData {
  userId?: string;
  date?: string;
  machineCode: string; // 'UF1', 'UF2', ..., 'UF15'
  machineName: string; // 'UF-DB-01', 'UF-DB-02', ..., 'UF-DB-15'
  day_shift: number;
  night_shift: number;
  operator_day?: string;
  operator_night?: string;
  scrap_day?: number;
  scrap_night?: number;
  target?: number;
  kpi_usd?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SummaryStats {
  totalDay: number;
  totalNight: number;
  totalCombined: number;
  avgDay: number;
  avgNight: number;
  avgDailyTotal: number;
  maxDay: { day: number; val: number };
  maxNight: { day: number; val: number };
  maxTotal: { day: number; val: number };
  targetAchievedDays: number;
}

export interface CycleRange {
  startDate: string; // e.g. '2026-07-26'
  endDate: string;   // e.g. '2026-08-26'
  label: string;     // e.g. '26/07/2026 ~ 26/08/2026'
  prevMonthName?: string;
  currMonthName?: string;
}

export interface DailyCycleRecord {
  date: string;
  total: number;
  dayTotal: number;
  nightTotal: number;
  kpiTotal: number;
  machines: UFMachineData[];
}

export interface OperatorKpiSummary {
  rank: number;
  operatorName: string;
  machineCodes: string[];
  machineCount: number;
  totalDayOutput: number;
  totalNightOutput: number;
  totalOutput: number;
  targetOutput: number;
  achievementRate: number; // percentage e.g. 102.5%
  monthlyKpiUsd: number;   // Ranked: Rank 1=$45, 2=$43, 3=$40, 4=$38, 5=$35, 6=$32, 7=$30, 8=$28
}

export interface CycleSummaryData {
  range: CycleRange;
  totalProduction: number;
  totalDayShift: number;
  totalNightShift: number;
  totalKpiUsd: number;
  recordedDaysCount: number;
  totalDaysInCycle: number;
  dailyAvg: number;
  machineTotals: Record<string, number>;
  machineDayTotals: Record<string, number>;
  machineNightTotals: Record<string, number>;
  machineKpis: Record<string, number>;
  operatorKpis: OperatorKpiSummary[];
  dailyBreakdown: DailyCycleRecord[];
}
