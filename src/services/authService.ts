import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { accessLogService } from './accessLogService';

export interface UserSession {
  userId: string;
  role: 'Admin' | 'Operator' | 'Viewer';
  name: string;
  loginTime: number;
}

export interface UserRecord {
  userId: string;
  name: string;
  role: 'Admin' | 'Operator' | 'Viewer';
  passwordHash: string;
  createdAt: number;
}

const AUTH_SESSION_KEY = 'sela_mes_auth_session';
const REGISTERED_USERS_LOCAL_KEY = 'sela_mes_registered_users';
const USERS_COLLECTION = 'mes_users';

// Master Admin initial account (ID: 733445, Password: selanjr10)
const TARGET_ID = '733445';
const TARGET_PASSWORD_HASH = 'cb2b0f4fdc15e8b4e70e30d195a63901f4c781034c56e29ce8b4edeeaa2562ec';

export async function computeSha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Crypto API digest failed, falling back to direct check', e);
    }
  }
  return '';
}

function getLocalUsers(): Record<string, UserRecord> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_LOCAL_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read local registered users', e);
  }
  return {};
}

function saveLocalUser(user: UserRecord): void {
  try {
    const users = getLocalUsers();
    users[user.userId] = user;
    localStorage.setItem(REGISTERED_USERS_LOCAL_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user locally', e);
  }
}

export const authService = {
  /**
   * Registers a new user account (saved to Firestore and localStorage)
   */
  async register(
    userIdInput: string,
    nameInput: string,
    passwordInput: string,
    role: 'Admin' | 'Operator' | 'Viewer' = 'Operator'
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    const cleanId = userIdInput.trim();
    const cleanName = nameInput.trim() || `User_${cleanId}`;
    const cleanPass = passwordInput.trim();

    if (!cleanId || cleanId.length < 3) {
      return { success: false, error: 'User ID ត្រូវតែមានយ៉ាងតិច ៣ តួអក្សរ / ID must be at least 3 characters' };
    }

    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, error: 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៤ តួអក្សរ / Password must be at least 4 characters' };
    }

    // Check if ID is master admin
    if (cleanId === TARGET_ID) {
      return { success: false, error: 'ID នេះត្រូវបានប្រើប្រាស់រួចហើយ (Admin ID) / ID already reserved' };
    }

    // Check local database first
    const localUsers = getLocalUsers();
    if (localUsers[cleanId]) {
      return { success: false, error: 'ID នេះមានរួចហើយ សូមជ្រើសរើស ID ផ្សេង / User ID already exists' };
    }

    const passwordHash = (await computeSha256(cleanPass)) || cleanPass;

    const newRecord: UserRecord = {
      userId: cleanId,
      name: cleanName,
      role,
      passwordHash,
      createdAt: Date.now(),
    };

    // Save to localStorage immediately
    saveLocalUser(newRecord);

    // Save to Firestore for cross-device sync
    try {
      const userDocRef = doc(db, USERS_COLLECTION, cleanId);
      // Check if exists in Firestore
      const existingSnap = await getDoc(userDocRef);
      if (existingSnap.exists()) {
        return { success: false, error: 'ID នេះមានរួចហើយក្នុងប្រព័ន្ធ / User ID already registered in database' };
      }
      await setDoc(userDocRef, newRecord);
    } catch (err) {
      console.warn('Firestore user registration sync error (saved locally):', err);
    }

    const session: UserSession = {
      userId: cleanId,
      role,
      name: cleanName,
      loginTime: Date.now(),
    };

    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }

    // Record login access log
    accessLogService.recordLogin(session).catch((err) => console.warn(err));

    return { success: true, session };
  },

  /**
   * Logs in with User ID and Password
   */
  async login(
    idInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    const trimmedId = idInput.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, error: 'សូមបញ្ចូល ID និងពាក្យសម្ងាត់ / Please enter ID and Password' };
    }

    const computedHash = await computeSha256(trimmedPass);

    // 1. Check Master Admin Account (733445)
    if (trimmedId === TARGET_ID) {
      let isMatch = false;
      if (computedHash && computedHash === TARGET_PASSWORD_HASH) {
        isMatch = true;
      } else if (trimmedPass === 'selanjr10') {
        isMatch = true;
      }

      if (!isMatch) {
        return { success: false, error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! / Incorrect password!' };
      }

      const session: UserSession = {
        userId: TARGET_ID,
        role: 'Admin',
        name: 'Sela Admin (733445)',
        loginTime: Date.now(),
      };

      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        console.error(e);
      }

      // Record login access log
      accessLogService.recordLogin(session).catch((err) => console.warn(err));

      return { success: true, session };
    }

    // 2. Check Firestore for registered user
    try {
      const userDocRef = doc(db, USERS_COLLECTION, trimmedId);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const userData = snap.data() as UserRecord;
        if (userData.passwordHash === computedHash || userData.passwordHash === trimmedPass) {
          const session: UserSession = {
            userId: userData.userId,
            role: userData.role || 'Operator',
            name: userData.name || userData.userId,
            loginTime: Date.now(),
          };
          saveLocalUser(userData);
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
          accessLogService.recordLogin(session).catch((err) => console.warn(err));
          return { success: true, session };
        } else {
          return { success: false, error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! / Incorrect password!' };
        }
      }
    } catch (err) {
      console.warn('Firestore login check failed, checking local users:', err);
    }

    // 3. Check localStorage registered users
    const localUsers = getLocalUsers();
    const localUser = localUsers[trimmedId];
    if (localUser) {
      if (localUser.passwordHash === computedHash || localUser.passwordHash === trimmedPass) {
        const session: UserSession = {
          userId: localUser.userId,
          role: localUser.role || 'Operator',
          name: localUser.name || localUser.userId,
          loginTime: Date.now(),
        };
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        accessLogService.recordLogin(session).catch((err) => console.warn(err));
        return { success: true, session };
      } else {
        return { success: false, error: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! / Incorrect password!' };
      }
    }

    return { success: false, error: 'គណនីនេះមិនទាន់មាននៅក្នុងប្រព័ន្ធទេ! សូមចុះឈ្មោះថ្មី / Account not found. Please register!' };
  },

  getCurrentSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.userId) {
          return parsed as UserSession;
        }
      }
    } catch (e) {
      console.error('Failed to parse current auth session', e);
    }
    return null;
  },

  logout(): void {
    // Record exit/logout timestamp in access logs
    accessLogService.recordLogout().catch((err) => console.warn(err));

    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch (e) {
      console.error('Failed to remove auth session', e);
    }
  },
};

