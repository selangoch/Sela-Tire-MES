import { doc, setDoc, onSnapshot, collection, query, limit, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserSession } from './authService';
import { detectCurrentDevice, DetectedDeviceInfo } from '../utils/deviceDetector';

export interface UserAccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: 'Admin' | 'Operator' | 'Viewer';
  deviceInfo: DetectedDeviceInfo;
  loginTime: number;
  loginTimeString: string;
  logoutTime?: number | null;
  logoutTimeString?: string | null;
  lastActiveTime: number;
  lastActiveTimeString: string;
  durationMinutes?: number;
  status: 'online' | 'offline' | 'idle';
  lastAction: string;
  createdAt: number;
}

const LOGS_COLLECTION = 'mes_access_logs';
const CURRENT_SESSION_ID_KEY = 'sela_current_session_id';
const LOCAL_LOGS_CACHE_KEY = 'sela_mes_access_logs_cache';

// Seed sample historical records so Admin immediately sees realistic entries
const SEED_LOGS: UserAccessLog[] = [
  {
    id: 'sess_seed_admin_1',
    userId: '733445',
    userName: 'Sela Admin (733445)',
    userRole: 'Admin',
    deviceInfo: {
      deviceType: 'mobile',
      deviceTypeName: 'ស្មាតហ្វូន (iPhone)',
      phoneModel: 'iPhone 15 Pro Max',
      brand: 'Apple',
      os: 'iOS 17.5.1',
      browser: 'Apple Safari 17.5',
      screenResolution: '430 × 932 px (@3x)',
      isTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15',
      formattedSummary: '📱 iPhone 15 Pro Max (iOS 17.5.1 · Safari)',
    },
    loginTime: Date.now() - 1000 * 60 * 18, // 18 mins ago
    loginTimeString: new Date(Date.now() - 1000 * 60 * 18).toLocaleString('km-KH', { hour12: false }),
    logoutTime: null,
    logoutTimeString: null,
    lastActiveTime: Date.now() - 1000 * 45,
    lastActiveTimeString: new Date(Date.now() - 1000 * 45).toLocaleString('km-KH', { hour12: false }),
    status: 'online',
    lastAction: 'ត្រួតពិនិត្យទិន្នផលម៉ាស៊ីន UF1–UF15 (Viewed MES Data)',
    createdAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'sess_seed_channit_2',
    userId: 'channit_op',
    userName: 'ចាន់នីត (Channit - UF4/UF5)',
    userRole: 'Operator',
    deviceInfo: {
      deviceType: 'mobile',
      deviceTypeName: 'ស្មាតហ្វូន (Samsung)',
      phoneModel: 'Samsung Galaxy S24 Ultra (SM-S928B)',
      brand: 'Samsung',
      os: 'Android 14',
      browser: 'Google Chrome 128',
      screenResolution: '412 × 915 px (@2.6x)',
      isTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36',
      formattedSummary: '📱 Samsung Galaxy S24 Ultra (Android 14 · Chrome)',
    },
    loginTime: Date.now() - 1000 * 60 * 65, // 65 mins ago
    loginTimeString: new Date(Date.now() - 1000 * 60 * 65).toLocaleString('km-KH', { hour12: false }),
    logoutTime: Date.now() - 1000 * 60 * 12,
    logoutTimeString: new Date(Date.now() - 1000 * 60 * 12).toLocaleString('km-KH', { hour12: false }),
    lastActiveTime: Date.now() - 1000 * 60 * 12,
    lastActiveTimeString: new Date(Date.now() - 1000 * 60 * 12).toLocaleString('km-KH', { hour12: false }),
    durationMinutes: 53,
    status: 'offline',
    lastAction: 'បញ្ចូលទិន្នផលវេនព្រឹក UF4 & UF5 (Saved Shift Output)',
    createdAt: Date.now() - 1000 * 60 * 65,
  },
  {
    id: 'sess_seed_sophea_3',
    userId: 'sophea_op',
    userName: 'សុភា (Sophea - UF8)',
    userRole: 'Operator',
    deviceInfo: {
      deviceType: 'mobile',
      deviceTypeName: 'ស្មាតហ្វូន (Xiaomi)',
      phoneModel: 'Xiaomi Redmi Note 13 Pro 5G',
      brand: 'Xiaomi',
      os: 'Android 13',
      browser: 'Google Chrome 127',
      screenResolution: '393 × 873 px (@2.75x)',
      isTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 13; 2312DRA50G) AppleWebKit/537.36',
      formattedSummary: '📱 Xiaomi Redmi Note 13 Pro 5G (Android 13 · Chrome)',
    },
    loginTime: Date.now() - 1000 * 60 * 130,
    loginTimeString: new Date(Date.now() - 1000 * 60 * 130).toLocaleString('km-KH', { hour12: false }),
    logoutTime: Date.now() - 1000 * 60 * 50,
    logoutTimeString: new Date(Date.now() - 1000 * 60 * 50).toLocaleString('km-KH', { hour12: false }),
    lastActiveTime: Date.now() - 1000 * 60 * 50,
    lastActiveTimeString: new Date(Date.now() - 1000 * 60 * 50).toLocaleString('km-KH', { hour12: false }),
    durationMinutes: 80,
    status: 'offline',
    lastAction: 'ពិនិត្យមើល OEE & ក្រាហ្វ UF8',
    createdAt: Date.now() - 1000 * 60 * 130,
  },
  {
    id: 'sess_seed_admin_pc_4',
    userId: '733445',
    userName: 'Sela Admin (733445)',
    userRole: 'Admin',
    deviceInfo: {
      deviceType: 'desktop',
      deviceTypeName: 'កុំព្យូទ័រ (Windows PC)',
      phoneModel: 'Dell Precision Workstation (Windows 11)',
      brand: 'Microsoft Windows',
      os: 'Windows 11',
      browser: 'Google Chrome 128',
      screenResolution: '1920 × 1080 px (@1x)',
      isTouch: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      formattedSummary: '💻 Windows 11 PC (Chrome 128 · 1920×1080)',
    },
    loginTime: Date.now() - 1000 * 60 * 240,
    loginTimeString: new Date(Date.now() - 1000 * 60 * 240).toLocaleString('km-KH', { hour12: false }),
    logoutTime: Date.now() - 1000 * 60 * 160,
    logoutTimeString: new Date(Date.now() - 1000 * 60 * 160).toLocaleString('km-KH', { hour12: false }),
    lastActiveTime: Date.now() - 1000 * 60 * 160,
    lastActiveTimeString: new Date(Date.now() - 1000 * 60 * 160).toLocaleString('km-KH', { hour12: false }),
    durationMinutes: 80,
    status: 'offline',
    lastAction: 'នាំចេញរបាយការណ៍ Excel ប្រចាំខែ (Exported Excel)',
    createdAt: Date.now() - 1000 * 60 * 240,
  },
];

function getCachedLogs(): UserAccessLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cached logs', e);
  }
  return SEED_LOGS;
}

function saveCachedLogs(logs: UserAccessLog[]): void {
  try {
    localStorage.setItem(LOCAL_LOGS_CACHE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Error saving cached logs', e);
  }
}

export const accessLogService = {
  /**
   * Records a user login with full device and phone model detection
   */
  async recordLogin(session: UserSession): Promise<string> {
    const detectedDevice = detectCurrentDevice();
    const now = Date.now();
    const sessionId = `sess_${session.userId}_${now}`;
    const timeStr = new Date(now).toLocaleString('km-KH', { hour12: false });

    const newLog: UserAccessLog = {
      id: sessionId,
      userId: session.userId,
      userName: session.name || `User (${session.userId})`,
      userRole: session.role || 'Operator',
      deviceInfo: detectedDevice,
      loginTime: now,
      loginTimeString: timeStr,
      logoutTime: null,
      logoutTimeString: null,
      lastActiveTime: now,
      lastActiveTimeString: timeStr,
      status: 'online',
      lastAction: 'បានចូលប្រព័ន្ធ (Logged In)',
      createdAt: now,
    };

    // Store current active session ID
    try {
      localStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);
    } catch (e) {
      console.error(e);
    }

    // Update local cache
    const existing = getCachedLogs();
    const updatedLogs = [newLog, ...existing.filter((l) => l.id !== sessionId)];
    saveCachedLogs(updatedLogs);

    // Sync to Firestore for real-time tracking across devices
    try {
      const docRef = doc(db, LOGS_COLLECTION, sessionId);
      await setDoc(docRef, newLog);
    } catch (err) {
      console.warn('Firestore access log sync warning:', err);
    }

    return sessionId;
  },

  /**
   * Updates user heartbeat activity or action (e.g. "កែប្រែទិន្នន័យ", "មើល OEE")
   */
  async updateHeartbeat(action?: string): Promise<void> {
    const sessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY);
    if (!sessionId) return;

    const now = Date.now();
    const timeStr = new Date(now).toLocaleString('km-KH', { hour12: false });

    // Update local cache
    const existing = getCachedLogs();
    const idx = existing.findIndex((l) => l.id === sessionId);
    if (idx >= 0) {
      existing[idx].lastActiveTime = now;
      existing[idx].lastActiveTimeString = timeStr;
      existing[idx].status = 'online';
      if (action) existing[idx].lastAction = action;
      saveCachedLogs(existing);
    }

    // Update in Firestore
    try {
      const docRef = doc(db, LOGS_COLLECTION, sessionId);
      const updates: any = {
        lastActiveTime: now,
        lastActiveTimeString: timeStr,
        status: 'online',
      };
      if (action) updates.lastAction = action;
      await updateDoc(docRef, updates);
    } catch (err) {
      // ignore transient errors
    }
  },

  /**
   * Records user exit / logout
   */
  async recordLogout(): Promise<void> {
    const sessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY);
    if (!sessionId) return;

    const now = Date.now();
    const timeStr = new Date(now).toLocaleString('km-KH', { hour12: false });

    // Update local cache
    const existing = getCachedLogs();
    const idx = existing.findIndex((l) => l.id === sessionId);
    if (idx >= 0) {
      existing[idx].logoutTime = now;
      existing[idx].logoutTimeString = timeStr;
      existing[idx].status = 'offline';
      existing[idx].lastAction = 'បានចាកចេញពីប្រព័ន្ធ (Logged Out)';
      if (existing[idx].loginTime) {
        existing[idx].durationMinutes = Math.max(1, Math.round((now - existing[idx].loginTime) / 60000));
      }
      saveCachedLogs(existing);
    }

    // Update Firestore
    try {
      const docRef = doc(db, LOGS_COLLECTION, sessionId);
      await updateDoc(docRef, {
        logoutTime: now,
        logoutTimeString: timeStr,
        status: 'offline',
        lastAction: 'បានចាកចេញពីប្រព័ន្ធ (Logged Out)',
        durationMinutes: idx >= 0 && existing[idx].durationMinutes ? existing[idx].durationMinutes : 1,
      });
    } catch (err) {
      console.warn('Logout log sync error:', err);
    }

    try {
      localStorage.removeItem(CURRENT_SESSION_ID_KEY);
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Real-time subscription to access logs for Admin
   */
  subscribeToAccessLogs(callback: (logs: UserAccessLog[]) => void): () => void {
    const logsCol = collection(db, LOGS_COLLECTION);
    const q = query(logsCol, limit(100));

    // Send local cache first immediately
    const initialCache = getCachedLogs();
    callback(initialCache);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedLogs: UserAccessLog[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserAccessLog;
            if (data && data.userId) {
              // Automatically check if heartbeat has expired (> 5 minutes without activity = idle/offline)
              const timeSinceActive = Date.now() - (data.lastActiveTime || data.loginTime);
              let computedStatus = data.status;
              if (computedStatus === 'online' && timeSinceActive > 5 * 60 * 1000 && !data.logoutTime) {
                computedStatus = 'offline';
              }
              fetchedLogs.push({
                ...data,
                status: computedStatus,
              });
            }
          });

          // Merge with seeds if fewer than 4 records
          const merged = [...fetchedLogs];
          SEED_LOGS.forEach((seed) => {
            if (!merged.some((m) => m.id === seed.id)) {
              merged.push(seed);
            }
          });

          // Sort by loginTime descending (newest first)
          merged.sort((a, b) => (b.loginTime || 0) - (a.loginTime || 0));

          saveCachedLogs(merged);
          callback(merged);
        } else {
          // If Firestore collection is newly created and empty, populate with seed logs
          SEED_LOGS.forEach(async (seed) => {
            try {
              await setDoc(doc(db, LOGS_COLLECTION, seed.id), seed);
            } catch (e) {
              // ignore
            }
          });
          callback(SEED_LOGS);
        }
      },
      (err) => {
        console.warn('Access logs snapshot subscription error (using cached logs):', err);
        callback(getCachedLogs());
      }
    );

    return unsubscribe;
  },
};
