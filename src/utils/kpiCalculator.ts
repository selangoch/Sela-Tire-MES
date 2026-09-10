import { OperatorKpiSummary } from '../types';

/**
 * Operator to Machine Code Mapping in Sela Tire MES:
 * - សក្កដា: UF1, UF2, UF3
 * - ចាន់និត: UF4, UF5 (Updated per request)
 * - សេនទី: UF6, UF7
 * - សុភា: UF8 (Updated per request)
 * - កក្កដា: UF9, UF10
 * - មេងជួ: UF11, UF12
 * - សិទ្ធ: UF13, UF14, UF15 (3 ម៉ាស៊ីន)
 */
export const OPERATOR_MAPPINGS: { name: string; machines: string[] }[] = [
  { name: 'សក្កដា', machines: ['UF1', 'UF2', 'UF3'] },
  { name: 'ចាន់និត', machines: ['UF4', 'UF5'] },
  { name: 'សេនទី', machines: ['UF6', 'UF7'] },
  { name: 'សុភា', machines: ['UF8'] },
  { name: 'កក្កដា', machines: ['UF9', 'UF10'] },
  { name: 'មេងជួ', machines: ['UF11', 'UF12'] },
  { name: 'សិទ្ធ', machines: ['UF13', 'UF14', 'UF15'] },
];

/**
 * Rank Reward Schedule (តារាងប្រាក់រង្វាន់ KPI តាមចំណាត់ថ្នាក់ប្រចាំខែ):
 * - លេខ ១ (Rank 1): $45
 * - លេខ ២ (Rank 2): $43
 * - លេខ ៣ (Rank 3): $40
 * - លេខ ៤ (Rank 4): $38
 * - លេខ ៥ (Rank 5): $35
 * - លេខ ៦ (Rank 6): $32
 * - លេខ ៧ (Rank 7): $30
 * - លេខ ៨ (Rank 8): $28
 */
export const RANK_REWARDS: Record<number, number> = {
  1: 45, // លេខមួយ: $45
  2: 43, // លេខពីរ: $43
  3: 40, // លេខបី: $40
  4: 38, // លេខបួន: $38
  5: 35, // លេខប្រាំ: $35
  6: 32, // លេខប្រាំមួយ: $32
  7: 30, // លេខប្រាំពីរ: $30
  8: 28, // លេខប្រាំបី: $28
};

/**
 * Production Target Standards in Sela Tire MES:
 * - ម៉ាស៊ីននីមួយៗ: ១២០០ ទៅ ១២៥០ (100%) ក្នុងមួយម៉ាស៊ីន/វេន (២៤០០ ទៅ ២៥០០ PCR/ម៉ាស៊ីន/ថ្ងៃ)
 * - វេនថ្ងៃសរុប (Day Shift Total): ១៦០០០ ទៅ ១៦៥០០ (100%) ក្នុងមួយថ្ងៃ
 * - វេនយប់សរុប (Night Shift Total): ១៦៥០០ ទៅ ១៧០០០ (100%) ក្នុងមួយយប់
 * - សរុបប្រចាំថ្ងៃរោងចក្រ (Daily Factory Total): ៣២៥០០ (100%) ក្នុងមួយថ្ងៃ (16000 + 16500)
 */
export const TARGET_STANDARDS = {
  MACHINE_SHIFT_BASE: 1200,      // 1200 PCR per machine per shift (100% threshold)
  MACHINE_SHIFT_MAX: 1250,       // 1250 PCR per machine per shift (104.2%)
  MACHINE_DAILY_BASE: 2400,      // 2400 PCR per machine daily (100% threshold)
  MACHINE_DAILY_MAX: 2500,       // 2500 PCR per machine daily
  FACTORY_DAY_BASE: 16000,       // 16000 PCR Day shift total (100% threshold)
  FACTORY_DAY_MAX: 16500,        // 16500 PCR Day shift total (103.1%)
  FACTORY_NIGHT_BASE: 16500,     // 16500 PCR Night shift total (100% threshold)
  FACTORY_NIGHT_MAX: 17000,      // 17000 PCR Night shift total (103.0%)
  FACTORY_DAILY_TOTAL: 32500,    // 32500 PCR Daily Factory Total (100%)
};

/**
 * Daily Machine-Level Auto KPI Reward Calculation
 * Target standard: 1200–1250 PCR per shift (2400 PCR per machine daily = 100%).
 * Auto-computes dollar value based on output volume, capped at $45.00 max.
 */
export function calculateAutoKpiReward(
  dayShift: number,
  nightShift: number,
  targetPerShift: number = 1200
): number {
  const day = Math.max(0, Number(dayShift) || 0);
  const night = Math.max(0, Number(nightShift) || 0);
  const total = day + night;

  if (total <= 0) return 0;

  const target = targetPerShift > 0 ? targetPerShift : TARGET_STANDARDS.MACHINE_SHIFT_BASE;
  const dailyTarget = target * 2; // 2400 PCR for 2 shifts (100%)

  if (total >= dailyTarget) {
    const excess = total - dailyTarget;
    const bonus = Math.min(10, (excess / 200) * 10);
    const reward = 35 + bonus;
    return Math.min(45, Math.max(0, Math.round(reward * 100) / 100));
  } else {
    const ratio = total / dailyTarget;
    const reward = ratio * 35;
    return Math.min(45, Math.max(0, Math.round(reward * 100) / 100));
  }
}

/**
 * Monthly Operator-Level Ranked KPI Reward Calculation (Per Person/Name)
 * Ranks all operators by their total monthly production output (PCR) in the cycle:
 * - លេខ ១ (Rank 1): $45.00
 * - លេខ ២ (Rank 2): $43.00
 * - លេខ ៣ (Rank 3): $40.00
 * - លេខ ៤ (Rank 4): $38.00
 * - លេខ ៥ (Rank 5): $35.00
 * - លេខ ៦ (Rank 6): $32.00
 * - លេខ ៧ (Rank 7): $30.00
 * - លេខ ៨ (Rank 8): $28.00
 * (Operators with 0 output receive $0.00)
 */
export function calculateOperatorMonthlyKpis(
  machineTotals: Record<string, number>,
  machineDayTotals: Record<string, number>,
  machineNightTotals: Record<string, number>,
  recordedDaysCount: number = 1,
  targetPerShift: number = 1200
): OperatorKpiSummary[] {
  const activeDays = Math.max(1, recordedDaysCount);
  const baseTargetPerMachineDay = (targetPerShift > 0 ? targetPerShift : TARGET_STANDARDS.MACHINE_SHIFT_BASE) * 2; // 2400 PCR

  // 1. Calculate raw output totals for each operator
  const rawList = OPERATOR_MAPPINGS.map((op) => {
    let totalDay = 0;
    let totalNight = 0;
    let total = 0;

    op.machines.forEach((code) => {
      totalDay += machineDayTotals[code] || 0;
      totalNight += machineNightTotals[code] || 0;
      total += machineTotals[code] || 0;
    });

    const targetOutput = baseTargetPerMachineDay * op.machines.length * activeDays;
    const achievementRate = targetOutput > 0 ? (total / targetOutput) * 100 : 0;

    return {
      operatorName: op.name,
      machineCodes: op.machines,
      machineCount: op.machines.length,
      totalDayOutput: totalDay,
      totalNightOutput: totalNight,
      totalOutput: total,
      targetOutput,
      achievementRate: Math.round(achievementRate * 10) / 10,
    };
  });

  // 2. Sort operators in descending order of totalOutput
  const sorted = [...rawList].sort((a, b) => {
    if (b.totalOutput !== a.totalOutput) {
      return b.totalOutput - a.totalOutput;
    }
    // If output tied, sort by achievement rate
    return b.achievementRate - a.achievementRate;
  });

  // 3. Assign ranks and corresponding rewards
  const rankedList: OperatorKpiSummary[] = sorted.map((op, index) => {
    const rank = index + 1;
    let monthlyKpiUsd = 0;

    if (op.totalOutput > 0) {
      monthlyKpiUsd = RANK_REWARDS[rank] ?? 28;
    }

    return {
      ...op,
      rank,
      monthlyKpiUsd,
    };
  });

  return rankedList;
}

/**
 * Returns formatted auto KPI calculation explanation for users
 */
export function getKpiCalculationDescription(currentLang: string = 'km'): string {
  if (currentLang === 'km') {
    return 'ប្រព័ន្ធគណនាប្រាក់រង្វាន់ KPI សរុបប្រចាំខែតាមចំណាត់ថ្នាក់បុគ្គលិក៖ លេខ១ = $៤៥, លេខ២ = $៤៣, លេខ៣ = $៤០, លេខ៤ = $៣៨, លេខ៥ = $៣៥, លេខ៦ = $៣២, លេខ៧ = $៣០, លេខ៨ = $២៨។';
  } else if (currentLang === 'en') {
    return 'Monthly Operator Ranked KPI Rewards: Rank 1 = $45, Rank 2 = $43, Rank 3 = $40, Rank 4 = $38, Rank 5 = $35, Rank 6 = $32, Rank 7 = $30, Rank 8 = $28.';
  } else {
    return '月度人员总产量排名 KPI 奖金：第1名 $45，第2名 $43，第3名 $40，第4名 $38，第5名 $35，第6名 $32，第7名 $30，第8名 $28。';
  }
}
