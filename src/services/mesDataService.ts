import { doc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { UFMachineData, CycleRange } from '../types';
import { ufMachineCodes } from '../data/initialData';
import { getAllDatesInCycle } from '../utils/cycleUtils';
import { calculateAutoKpiReward } from '../utils/kpiCalculator';
import { getTodayDateString } from '../utils/dateUtils';

const COLLECTION_NAME = 'mes_production_records';

export const mesDataService = {
  /**
   * Helper to construct document ID for a user & date
   */
  getDocId(userId: string, dateStr: string): string {
    const cleanUser = (userId || '733445').trim();
    const cleanDate = (dateStr && dateStr.trim()) ? dateStr.trim() : getTodayDateString();
    return `${cleanUser}_${cleanDate}`;
  },

  /**
   * Normalize machine names to latest assignments (UF4/UF5 -> Channit, UF8 -> Sophea)
   */
  normalizeMachineNames(machines: UFMachineData[]): UFMachineData[] {
    const codeToNameMap: Record<string, string> = {};
    ufMachineCodes.forEach((m) => {
      codeToNameMap[m.code] = m.name;
    });
    return machines.map((m) => ({
      ...m,
      machineName: codeToNameMap[m.machineCode] || m.machineName,
    }));
  },

  /**
   * Generates initial 0-value array of 15 machines for a new date
   */
  getInitialMachines(userId: string, dateStr: string): UFMachineData[] {
    const nowStr = new Date().toISOString();
    return ufMachineCodes.map((m) => ({
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
      target: 1250,
      kpi_usd: 0,
      notes: '',
      createdAt: nowStr,
      updatedAt: nowStr,
      updatedBy: userId,
    }));
  },

  /**
   * Check legacy localStorage data for migration
   */
  getLegacyLocalStorageData(userId: string, dateStr: string): UFMachineData[] | null {
    const userStorageKey = `sela_mes_uf_data_user_${userId}_${dateStr || 'default'}`;
    const legacyStorageKey = `sela_mes_uf_store_${dateStr || 'default'}`;

    try {
      const saved = localStorage.getItem(userStorageKey) || localStorage.getItem(legacyStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 15) {
          return this.normalizeMachineNames(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse local storage migration data', e);
    }
    return null;
  },

  /**
   * Real-time subscription listener for UF Machine Data for a specific date
   * Whenever data changes on ANY device (PC or Phone), callback is called automatically!
   */
  subscribeToUFMachineData(
    userId: string,
    dateStr: string,
    callback: (data: UFMachineData[]) => void
  ): () => void {
    const docId = this.getDocId(userId, dateStr);
    const docRef = doc(db, COLLECTION_NAME, docId);

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data();
          if (docData && Array.isArray(docData.machines) && docData.machines.length === 15) {
            callback(this.normalizeMachineNames(docData.machines as UFMachineData[]));
            return;
          }
        }

        // Document does not exist in Firestore yet for this date.
        // Check if there is local data to migrate to Cloud
        const legacyData = this.getLegacyLocalStorageData(userId, dateStr);
        if (legacyData) {
          await this.saveUFMachineDataForDate(dateStr, legacyData, userId);
        } else {
          // Initialize 0 values for new date and save to Firestore
          const initial = this.getInitialMachines(userId, dateStr);
          await this.saveUFMachineDataForDate(dateStr, initial, userId);
        }
      },
      (error) => {
        console.error('Firestore snapshot listener error:', error);
        // Fallback to local storage or initial values if offline
        const local = this.getLegacyLocalStorageData(userId, dateStr) || this.getInitialMachines(userId, dateStr);
        callback(this.normalizeMachineNames(local));
      }
    );

    return unsubscribe;
  },

  /**
   * Save complete 15-machine dataset to Firestore
   */
  async saveUFMachineDataForDate(
    dateStr: string,
    data: UFMachineData[],
    userId: string = '733445'
  ): Promise<void> {
    const docId = this.getDocId(userId, dateStr);
    const docRef = doc(db, COLLECTION_NAME, docId);
    const nowStr = new Date().toISOString();

    const formattedMachines = data.map((item) => {
      const target = item.target || 1250;
      const kpi = (typeof item.kpi_usd === 'number' && item.kpi_usd > 0)
        ? item.kpi_usd
        : calculateAutoKpiReward(item.day_shift, item.night_shift, target);

      return {
        ...item,
        userId,
        date: dateStr,
        target,
        kpi_usd: kpi,
        createdAt: item.createdAt || nowStr,
        updatedAt: nowStr,
        updatedBy: userId,
      };
    });

    const payload = {
      userId,
      date: dateStr,
      updatedAt: nowStr,
      updatedBy: userId,
      machines: formattedMachines,
    };

    try {
      await setDoc(docRef, payload, { merge: true });
      // Keep local backup cache
      const userStorageKey = `sela_mes_uf_data_user_${userId}_${dateStr || 'default'}`;
      localStorage.setItem(userStorageKey, JSON.stringify(formattedMachines));
    } catch (e) {
      console.error('Error saving data to Firestore:', e);
      // Fallback save to local storage
      const userStorageKey = `sela_mes_uf_data_user_${userId}_${dateStr || 'default'}`;
      localStorage.setItem(userStorageKey, JSON.stringify(formattedMachines));
      throw e;
    }
  },

  /**
   * Update a single cell (day/night shift quantity for 1 machine)
   */
  async updateSingleMachineCell(
    dateStr: string,
    machineCode: string,
    shift: 'day' | 'night',
    value: number,
    currentMachines: UFMachineData[],
    userId: string = '733445'
  ): Promise<UFMachineData[]> {
    const updated = currentMachines.map((m) => {
      if (m.machineCode === machineCode) {
        const newDay = shift === 'day' ? value : m.day_shift;
        const newNight = shift === 'night' ? value : m.night_shift;
        const target = m.target || 1250;
        const autoKpi = calculateAutoKpiReward(newDay, newNight, target);
        return {
          ...m,
          day_shift: newDay,
          night_shift: newNight,
          target,
          kpi_usd: autoKpi,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        };
      }
      return m;
    });

    await this.saveUFMachineDataForDate(dateStr, updated, userId);
    return updated;
  },

  /**
   * Reads all available dates for a cycle from localStorage
   */
  getCycleLocalStorageData(userId: string, range: CycleRange): Record<string, UFMachineData[]> {
    const dates = getAllDatesInCycle(range);
    const result: Record<string, UFMachineData[]> = {};

    dates.forEach((dStr) => {
      const data = this.getLegacyLocalStorageData(userId, dStr);
      if (data && data.length === 15) {
        result[dStr] = data;
      }
    });

    return result;
  },

  /**
   * Subscribes to real-time updates for all production records in the 26-26 cycle.
   */
  subscribeToCycleData(
    userId: string,
    range: CycleRange,
    callback: (dateMap: Record<string, UFMachineData[]>) => void
  ): () => void {
    const cleanUser = (userId || '733445').trim();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', cleanUser)
    );

    // Initial local read for instant render
    const localMap = this.getCycleLocalStorageData(cleanUser, range);
    callback(localMap);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resultMap: Record<string, UFMachineData[]> = { ...localMap };

        snapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          if (
            docData &&
            docData.date &&
            Array.isArray(docData.machines) &&
            docData.machines.length === 15
          ) {
            const docDate = docData.date;
            // Only include dates within the cycle range
            if (docDate >= range.startDate && docDate <= range.endDate) {
              resultMap[docDate] = this.normalizeMachineNames(docData.machines as UFMachineData[]);
            }
          }
        });

        callback(resultMap);
      },
      (error) => {
        console.error('Error subscribing to cycle data:', error);
        callback(localMap);
      }
    );

    return unsubscribe;
  },
};

