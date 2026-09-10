import { ShiftData, MachineInfo, UFMachineData } from '../types';

export const ufMachineCodes = [
  { code: 'UF1', name: 'UF-DB-01 សក្កដា', operator: 'សក្កដា' },
  { code: 'UF2', name: 'UF-DB-02 សក្កដា', operator: 'សក្កដា' },
  { code: 'UF3', name: 'UF-DB-03 សក្កដា', operator: 'សក្កដា' },
  { code: 'UF4', name: 'UF-DB-04 ចាន់និត', operator: 'ចាន់និត' },
  { code: 'UF5', name: 'UF-DB-05 ចាន់និត', operator: 'ចាន់និត' },
  { code: 'UF6', name: 'UF-DB-06 សេនទី', operator: 'សេនទី' },
  { code: 'UF7', name: 'UF-DB-07 សេនទី', operator: 'សេនទី' },
  { code: 'UF8', name: 'UF-DB-08 សុភា', operator: 'សុភា' },
  { code: 'UF9', name: 'UF-DB-09 កក្កដា', operator: 'កក្កដា' },
  { code: 'UF10', name: 'UF-DB-10 កក្កដា', operator: 'កក្កដា' },
  { code: 'UF11', name: 'UF-DB-11 មេងជួ', operator: 'មេងជួ' },
  { code: 'UF12', name: 'UF-DB-12 មេងជួ', operator: 'មេងជួ' },
  { code: 'UF13', name: 'UF-DB-13 សិទ្ធ', operator: 'សិទ្ធ' },
  { code: 'UF14', name: 'UF-DB-14 សិទ្ធ', operator: 'សិទ្ធ' },
  { code: 'UF15', name: 'UF-DB-15 សិទ្ធ', operator: 'សិទ្ធ' },
];

export function getUFMachineDataForDate(dateStr: string, userId: string = '733445'): UFMachineData[] {
  const userStorageKey = `sela_mes_uf_data_user_${userId}_${dateStr || 'default'}`;
  const legacyStorageKey = `sela_mes_uf_store_${dateStr || 'default'}`;

  // Helper map for updated names
  const codeToNameMap: Record<string, string> = {};
  ufMachineCodes.forEach((m) => {
    codeToNameMap[m.code] = m.name;
  });

  try {
    // 1. Try reading user-scoped storage
    const saved = localStorage.getItem(userStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 15) {
        return parsed.map((item) => ({
          ...item,
          machineName: codeToNameMap[item.machineCode] || item.machineName,
        }));
      }
    }

    // 2. Migration fallback: Check legacy storage and migrate to user storage
    const legacySaved = localStorage.getItem(legacyStorageKey);
    if (legacySaved) {
      const parsedLegacy = JSON.parse(legacySaved);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length === 15) {
        const normalized = parsedLegacy.map((item) => ({
          ...item,
          machineName: codeToNameMap[item.machineCode] || item.machineName,
        }));
        saveUFMachineDataForDate(dateStr, normalized, userId);
        return normalized;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved UF machine data', e);
  }

  // 3. Default for a date with no saved data: ALL 0 (Requirement 7)
  const nowStr = new Date().toISOString();
  return ufMachineCodes.map((m) => {
    return {
      userId,
      date: dateStr,
      machineCode: m.code,
      machineName: m.name,
      day_shift: 0,
      night_shift: 0,
      operator_day: m.operator || '张伟 (Zhang W.)',
      operator_night: m.operator || '李强 (Li Q.)',
      scrap_day: 0,
      scrap_night: 0,
      target: 1200,
      notes: '',
      createdAt: nowStr,
      updatedAt: nowStr,
    };
  });
}

export function saveUFMachineDataForDate(
  dateStr: string,
  data: UFMachineData[],
  userId: string = '733445'
): void {
  const userStorageKey = `sela_mes_uf_data_user_${userId}_${dateStr || 'default'}`;
  const nowStr = new Date().toISOString();

  const formattedData = data.map((item) => ({
    ...item,
    userId,
    date: dateStr,
    target: item.target || 1200,
    createdAt: item.createdAt || nowStr,
    updatedAt: nowStr,
  }));

  try {
    localStorage.setItem(userStorageKey, JSON.stringify(formattedData));
  } catch (e) {
    console.error('Failed to save UF machine data to localStorage', e);
  }
}

export const initialShiftData: ShiftData[] = [
  { day: 1, day_shift: 1047, night_shift: 1176, operator_day: '张伟 (Zhang W.)', operator_night: '李强 (Li Q.)', scrap_day: 12, scrap_night: 8, target: 1250, notes: '设备运转正常，无异常停机' },
  { day: 2, day_shift: 1185, night_shift: 1082, operator_day: '王芳 (Wang F.)', operator_night: '赵敏 (Zhao M.)', scrap_day: 15, scrap_night: 11, target: 1250, notes: '夜班换模具耽误20分钟' },
  { day: 3, day_shift: 941, night_shift: 922, operator_day: '陈杰 (Chen J.)', operator_night: '刘洋 (Liu Y.)', scrap_day: 22, scrap_night: 19, target: 1250, notes: '胶料硬度偏高，挤出速度调低' },
];

export const machinesList: MachineInfo[] = [
  {
    id: 'Pto2',
    name: 'Pto2机 (胎面挤出成型机)',
    workshop: '5#车间',
    status: 'running',
    oee: 88.5,
    availability: 92.1,
    performance: 97.3,
    quality: 98.8,
    currentSpeed: 182,
    targetDaily: 2200,
  },
  {
    id: 'Pto1',
    name: 'Pto1机 (钢丝圈挤出机)',
    workshop: '5#车间',
    status: 'running',
    oee: 91.2,
    availability: 94.0,
    performance: 98.1,
    quality: 99.0,
    currentSpeed: 210,
    targetDaily: 2400,
  },
  {
    id: 'Pto3',
    name: 'Pto3机 (带束层复合挤出机)',
    workshop: '5#车间',
    status: 'warning',
    oee: 76.4,
    availability: 81.0,
    performance: 95.0,
    quality: 99.2,
    currentSpeed: 145,
    targetDaily: 2000,
  },
];
