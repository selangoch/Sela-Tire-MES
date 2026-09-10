import { CycleRange, CycleSummaryData, DailyCycleRecord, UFMachineData } from '../types';
import { ufMachineCodes } from '../data/initialData';
import { calculateOperatorMonthlyKpis } from './kpiCalculator';
import { getTodayDateString } from './dateUtils';

/**
 * Calculates the monthly cycle range (27th of previous month to 26th of current month).
 * If the current selected date is on the 27th or later, the cycle automatically rolls over
 * and restarts fresh from the 27th of the current month to the 26th of the next month.
 * This works automatically for all future months.
 */
export function getCycle26Range(dateStr?: string, customStartDay: number = 27): CycleRange {
  const effectiveDate = dateStr && dateStr.trim() ? dateStr.trim() : getTodayDateString();
  const parts = effectiveDate.split('-').map((p) => parseInt(p, 10));
  const todayParts = getTodayDateString().split('-').map((p) => parseInt(p, 10));
  const year = parts[0] || todayParts[0];
  const month = parts[1] || todayParts[1];
  const day = parts[2] || todayParts[2];

  let startYear = year;
  let startMonth = month - 1;
  let endYear = year;
  let endMonth = month;

  // Day 26 or earlier belongs to [Prev Month Day 27 -> This Month Day 26]
  // Day 27 or later automatically starts the NEW cycle [This Month Day 27 -> Next Month Day 26]
  if (day <= 26) {
    if (startMonth < 1) {
      startMonth = 12;
      startYear = year - 1;
    }
  } else {
    // 27th or after -> Reset and start new cycle
    startYear = year;
    startMonth = month;
    endMonth = month + 1;
    if (endMonth > 12) {
      endMonth = 1;
      endYear = year + 1;
    }
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  const startDayPad = pad(customStartDay);
  const startDate = `${startYear}-${pad(startMonth)}-${startDayPad}`;
  const endDate = `${endYear}-${pad(endMonth)}-26`;

  return {
    startDate,
    endDate,
    label: `${startDate} ដល់ ${endDate}`,
    prevMonthName: `${startYear}-${pad(startMonth)}`,
    currMonthName: `${endYear}-${pad(endMonth)}`,
  };
}

/**
 * Get quick preset cycle ranges for navigation (e.g. previous month, current month, next month)
 */
export function getAvailableCyclePresets(referenceDateStr?: string): {
  label: string;
  range: CycleRange;
}[] {
  const refDate = referenceDateStr && referenceDateStr.trim() ? referenceDateStr.trim() : getTodayDateString();
  const parts = refDate.split('-').map((p) => parseInt(p, 10));
  const todayParts = getTodayDateString().split('-').map((p) => parseInt(p, 10));
  const year = parts[0] || todayParts[0];
  const month = parts[1] || todayParts[1];

  const presets: { label: string; range: CycleRange }[] = [];

  // Generate 4 cycles: 2 past, 1 current, 1 future
  for (let offset = -2; offset <= 2; offset++) {
    let m = month + offset;
    let y = year;
    while (m < 1) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    const sampleDate = `${y}-${m.toString().padStart(2, '0')}-15`;
    const r = getCycle26Range(sampleDate);
    const label = `${r.startDate} ~ ${r.endDate}`;
    if (!presets.some((p) => p.range.startDate === r.startDate)) {
      presets.push({ label, range: r });
    }
  }

  return presets;
}

/**
 * Generates all consecutive YYYY-MM-DD date strings between start and end dates (inclusive).
 */
export function getAllDatesInCycle(range: CycleRange): string[] {
  const dates: string[] = [];
  const curr = new Date(`${range.startDate}T00:00:00Z`);
  const end = new Date(`${range.endDate}T00:00:00Z`);

  while (curr <= end) {
    const y = curr.getUTCFullYear();
    const m = String(curr.getUTCMonth() + 1).padStart(2, '0');
    const d = String(curr.getUTCDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return dates;
}

/**
 * Aggregates production and KPI statistics across all dates in the cycle.
 */
export function aggregateCycleData(
  range: CycleRange,
  dateMap: Record<string, UFMachineData[]>,
  currentDateUF: UFMachineData[],
  currentDateStr: string,
  targetPerShift: number = 1200
): CycleSummaryData {
  const dates = getAllDatesInCycle(range);

  let totalProduction = 0;
  let totalDayShift = 0;
  let totalNightShift = 0;
  let totalKpiUsd = 0;
  let recordedDaysCount = 0;

  const machineTotals: Record<string, number> = {};
  const machineDayTotals: Record<string, number> = {};
  const machineNightTotals: Record<string, number> = {};
  const machineKpis: Record<string, number> = {};

  ufMachineCodes.forEach((m) => {
    machineTotals[m.code] = 0;
    machineDayTotals[m.code] = 0;
    machineNightTotals[m.code] = 0;
    machineKpis[m.code] = 0;
  });

  const dailyBreakdown: DailyCycleRecord[] = [];

  dates.forEach((dStr) => {
    let machinesForDate = dateMap[dStr];

    // If current selected date matches, make sure latest live memory state is used
    if (dStr === currentDateStr && currentDateUF && currentDateUF.length === 15) {
      machinesForDate = currentDateUF;
    }

    if (machinesForDate && machinesForDate.length > 0) {
      let daySum = 0;
      let nightSum = 0;
      let kpiSum = 0;
      let hasData = false;

      machinesForDate.forEach((m) => {
        const dVal = m.day_shift || 0;
        const nVal = m.night_shift || 0;
        const kVal = m.kpi_usd || 0;

        if (dVal > 0 || nVal > 0 || kVal > 0) {
          hasData = true;
        }

        daySum += dVal;
        nightSum += nVal;
        kpiSum += kVal;

        machineTotals[m.machineCode] = (machineTotals[m.machineCode] || 0) + dVal + nVal;
        machineDayTotals[m.machineCode] = (machineDayTotals[m.machineCode] || 0) + dVal;
        machineNightTotals[m.machineCode] = (machineNightTotals[m.machineCode] || 0) + nVal;
        machineKpis[m.machineCode] = (machineKpis[m.machineCode] || 0) + kVal;
      });

      const dayTotalCombined = daySum + nightSum;
      totalDayShift += daySum;
      totalNightShift += nightSum;
      totalProduction += dayTotalCombined;
      totalKpiUsd += kpiSum;

      if (hasData) {
        recordedDaysCount++;
      }

      dailyBreakdown.push({
        date: dStr,
        total: dayTotalCombined,
        dayTotal: daySum,
        nightTotal: nightSum,
        kpiTotal: kpiSum,
        machines: machinesForDate,
      });
    } else {
      dailyBreakdown.push({
        date: dStr,
        total: 0,
        dayTotal: 0,
        nightTotal: 0,
        kpiTotal: 0,
        machines: [],
      });
    }
  });

  const divisor = recordedDaysCount > 0 ? recordedDaysCount : 1;
  const dailyAvg = Math.round(totalProduction / divisor);

  // Operator-Level Monthly KPI Calculation ($45.00 Max per person/month)
  const operatorKpis = calculateOperatorMonthlyKpis(
    machineTotals,
    machineDayTotals,
    machineNightTotals,
    recordedDaysCount,
    targetPerShift
  );

  return {
    range,
    totalProduction,
    totalDayShift,
    totalNightShift,
    totalKpiUsd,
    recordedDaysCount,
    totalDaysInCycle: dates.length,
    dailyAvg,
    machineTotals,
    machineDayTotals,
    machineNightTotals,
    machineKpis,
    operatorKpis,
    dailyBreakdown,
  };
}
