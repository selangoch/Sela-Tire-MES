/**
 * Device & Phone Model Detection Utility for Sela Tire MES
 * Accurately detects phone models (iPhone, Samsung Galaxy, Xiaomi/Redmi, OPPO, Vivo, etc.),
 * operating systems, browsers, and screen specs for Admin User Access Logs.
 */

export interface DetectedDeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceTypeName: string; // e.g. "ស្មាតហ្វូន (Phone)", "កុំព្យូទ័រ (PC)", "ថេប្លេត (Tablet)"
  phoneModel: string; // e.g. "iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Xiaomi Redmi Note 13", "Windows 11 PC"
  brand: string; // e.g. "Apple", "Samsung", "Xiaomi", "OPPO", "Vivo", "Google", "Microsoft"
  os: string; // e.g. "iOS 17.5", "Android 14", "Windows 11", "macOS Sonoma"
  browser: string; // e.g. "Chrome 128", "Safari 17.5", "Edge 128", "Samsung Internet"
  screenResolution: string; // e.g. "393 × 852 px"
  isTouch: boolean;
  userAgent: string;
  formattedSummary: string; // e.g. "📱 iPhone 15 Pro (iOS 17.5)"
}

// Known Samsung SM codes mapping
const SAMSUNG_MODELS: Record<string, string> = {
  'SM-S928': 'Samsung Galaxy S24 Ultra',
  'SM-S926': 'Samsung Galaxy S24+',
  'SM-S921': 'Samsung Galaxy S24',
  'SM-S918': 'Samsung Galaxy S23 Ultra',
  'SM-S916': 'Samsung Galaxy S23+',
  'SM-S911': 'Samsung Galaxy S23',
  'SM-S908': 'Samsung Galaxy S22 Ultra',
  'SM-S906': 'Samsung Galaxy S22+',
  'SM-S901': 'Samsung Galaxy S22',
  'SM-G998': 'Samsung Galaxy S21 Ultra',
  'SM-G996': 'Samsung Galaxy S21+',
  'SM-G991': 'Samsung Galaxy S21',
  'SM-N986': 'Samsung Galaxy Note 20 Ultra',
  'SM-N981': 'Samsung Galaxy Note 20',
  'SM-F946': 'Samsung Galaxy Z Fold 5',
  'SM-F731': 'Samsung Galaxy Z Flip 5',
  'SM-F956': 'Samsung Galaxy Z Fold 6',
  'SM-F741': 'Samsung Galaxy Z Flip 6',
  'SM-A556': 'Samsung Galaxy A55 5G',
  'SM-A546': 'Samsung Galaxy A54 5G',
  'SM-A536': 'Samsung Galaxy A53 5G',
  'SM-A356': 'Samsung Galaxy A35 5G',
  'SM-A346': 'Samsung Galaxy A34 5G',
  'SM-A256': 'Samsung Galaxy A25 5G',
  'SM-A156': 'Samsung Galaxy A15 5G',
  'SM-A155': 'Samsung Galaxy A15 4G',
  'SM-A057': 'Samsung Galaxy A05s',
  'SM-A055': 'Samsung Galaxy A05',
};

// Known Xiaomi model code prefixes
const XIAOMI_MODELS: Record<string, string> = {
  '2312DRA50G': 'Xiaomi Redmi Note 13 Pro 5G',
  '2311FRAF8G': 'Xiaomi Redmi Note 13 Pro 4G',
  '23129RAA4G': 'Xiaomi Redmi Note 13 5G',
  '23124RA7EO': 'Xiaomi Redmi Note 13 4G',
  '23090RA98G': 'Xiaomi Redmi 13C',
  '2311DRK48G': 'POCO X6 Pro 5G',
  '23049PCD8G': 'POCO F5',
  '24069PC21G': 'POCO F6 Pro',
  '2201116SG': 'Xiaomi Redmi Note 11',
  '22101316G': 'Xiaomi 13 Pro',
  '23127PN0CG': 'Xiaomi 14',
  '23116PN5BC': 'Xiaomi 14 Pro',
  '24030PN60G': 'Xiaomi 14 Ultra',
};

// Known OPPO model prefixes
const OPPO_MODELS: Record<string, string> = {
  'CPH2551': 'OPPO Find N3',
  'CPH2579': 'OPPO Reno 11 5G',
  'CPH2607': 'OPPO Reno 11 Pro 5G',
  'CPH2527': 'OPPO A78 5G',
  'CPH2565': 'OPPO A58',
  'CPH2577': 'OPPO A38',
  'CPH2343': 'OPPO Reno7 5G',
  'CPH2269': 'OPPO A16',
};

// Known Vivo model prefixes
const VIVO_MODELS: Record<string, string> = {
  'V2307': 'vivo V29 5G',
  'V2324': 'vivo X100 Pro',
  'V2250': 'vivo V27 5G',
  'V2111': 'vivo Y21',
  'V2204': 'vivo Y02',
  'V2237': 'vivo Y36',
  'V2318': 'vivo Y27',
};

/**
 * Detects the specific iPhone model based on screen dimensions and DPR in WebKit
 */
function detectIPhoneModel(w: number, h: number, dpr: number): string {
  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);

  if (minDim === 440 && maxDim === 956) return 'iPhone 16 Pro Max';
  if (minDim === 402 && maxDim === 874) return 'iPhone 16 Pro';
  if (minDim === 430 && maxDim === 932) return 'iPhone 15 Pro Max / 16 Plus';
  if (minDim === 393 && maxDim === 852) return 'iPhone 15 / 15 Pro / 16';
  if (minDim === 428 && maxDim === 926) return 'iPhone 14 Plus / 13 Pro Max / 12 Pro Max';
  if (minDim === 390 && maxDim === 844) return 'iPhone 14 / 13 / 13 Pro / 12 / 12 Pro';
  if (minDim === 414 && maxDim === 896) {
    return dpr >= 3 ? 'iPhone 11 Pro Max / XS Max' : 'iPhone 11 / XR';
  }
  if (minDim === 375 && maxDim === 812) {
    return dpr >= 3 ? 'iPhone 11 Pro / XS / X' : 'iPhone 12 mini / 13 mini';
  }
  if (minDim === 375 && maxDim === 667) {
    return 'iPhone SE (2nd/3rd gen) / iPhone 8';
  }
  if (minDim === 414 && maxDim === 736) return 'iPhone 8 Plus / 7 Plus';
  if (minDim === 360 && maxDim === 780) return 'iPhone 12 mini / 13 mini';

  return 'Apple iPhone';
}

/**
 * Detects iPad model
 */
function detectIPadModel(w: number, h: number): string {
  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);

  if (minDim === 1024 && maxDim === 1366) return 'iPad Pro 12.9"';
  if (minDim === 834 && maxDim === 1194) return 'iPad Pro 11"';
  if (minDim === 820 && maxDim === 1180) return 'iPad Air (5th/4th gen)';
  if (minDim === 768 && maxDim === 1024) return 'iPad / iPad mini';
  return 'Apple iPad';
}

/**
 * Extract phone model from Android User-Agent string
 */
function extractAndroidPhoneModel(ua: string): { model: string; brand: string } {
  // Check for Samsung SM- models
  const smMatch = ua.match(/SM-([A-Z0-9]+)/i);
  if (smMatch) {
    const fullCode = `SM-${smMatch[1]}`.toUpperCase();
    const prefix4 = fullCode.slice(0, 7); // e.g. SM-S928
    if (SAMSUNG_MODELS[prefix4]) {
      return { model: `${SAMSUNG_MODELS[prefix4]} (${fullCode})`, brand: 'Samsung' };
    }
    return { model: `Samsung Galaxy (${fullCode})`, brand: 'Samsung' };
  }

  // Check for Xiaomi / Redmi / POCO
  for (const [code, name] of Object.entries(XIAOMI_MODELS)) {
    if (ua.includes(code)) {
      return { model: name, brand: 'Xiaomi' };
    }
  }

  // Check for OPPO
  for (const [code, name] of Object.entries(OPPO_MODELS)) {
    if (ua.includes(code)) {
      return { model: name, brand: 'OPPO' };
    }
  }

  // Check for Vivo
  for (const [code, name] of Object.entries(VIVO_MODELS)) {
    if (ua.includes(code)) {
      return { model: name, brand: 'Vivo' };
    }
  }

  // Google Pixel
  const pixelMatch = ua.match(/Pixel\s?(\d[a-zA-Z0-9\s]*)/i);
  if (pixelMatch) {
    return { model: `Google Pixel ${pixelMatch[1].trim()}`, brand: 'Google' };
  }

  // Realme
  const rmxMatch = ua.match(/RMX(\d{4})/i);
  if (rmxMatch) {
    return { model: `Realme (RMX${rmxMatch[1]})`, brand: 'Realme' };
  }

  // General Android model extraction: look inside parenthesis e.g. (Linux; Android 14; <Model> Build/...)
  const androidModelMatch = ua.match(/Android\s+[\d.]+;\s*([^;)]+?)(?:\s+Build\/|\))/i);
  if (androidModelMatch && androidModelMatch[1]) {
    const rawModel = androidModelMatch[1].trim();
    if (rawModel && !rawModel.toLowerCase().includes('k')) {
      let brand = 'Android Phone';
      if (/samsung/i.test(rawModel)) brand = 'Samsung';
      else if (/xiaomi|redmi|poco/i.test(rawModel)) brand = 'Xiaomi';
      else if (/oppo/i.test(rawModel)) brand = 'OPPO';
      else if (/vivo/i.test(rawModel)) brand = 'Vivo';
      else if (/huawei|honor/i.test(rawModel)) brand = 'Huawei';
      else if (/oneplus/i.test(rawModel)) brand = 'OnePlus';
      else if (/sony/i.test(rawModel)) brand = 'Sony';
      return { model: rawModel, brand };
    }
  }

  return { model: 'Android Phone (ស្មាតហ្វូន)', brand: 'Android' };
}

/**
 * Main Detection Function
 */
export function detectCurrentDevice(): DetectedDeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      deviceTypeName: 'កុំព្យូទ័រ (PC)',
      phoneModel: 'Server / Node.js',
      brand: 'Server',
      os: 'Unknown',
      browser: 'Unknown',
      screenResolution: '0 × 0',
      isTouch: false,
      userAgent: '',
      formattedSummary: 'Server',
    };
  }

  const ua = navigator.userAgent || '';
  const width = window.screen?.width || window.innerWidth || 0;
  const height = window.screen?.height || window.innerHeight || 0;
  const dpr = window.devicePixelRatio || 1;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  let deviceTypeName = 'កុំព្យូទ័រ (PC)';
  let phoneModel = 'Desktop PC';
  let brand = 'PC';
  let os = 'Windows / Mac';
  let browser = 'Chrome';

  // 1. Detect OS
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    const isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const osMatch = ua.match(/OS (\d+[._]\d+([._]\d+)?)/);
    const osVer = osMatch ? osMatch[1].replace(/_/g, '.') : '17';

    if (isIPad) {
      deviceType = 'tablet';
      deviceTypeName = 'ថេប្លេត (iPad)';
      brand = 'Apple';
      os = `iPadOS ${osVer}`;
      phoneModel = detectIPadModel(width, height);
    } else {
      deviceType = 'mobile';
      deviceTypeName = 'ស្មាតហ្វូន (iPhone)';
      brand = 'Apple';
      os = `iOS ${osVer}`;
      phoneModel = detectIPhoneModel(width, height, dpr);
    }
  } else if (/Android/.test(ua)) {
    const osMatch = ua.match(/Android\s+([0-9.]+)/);
    const osVer = osMatch ? osMatch[1] : '14';
    os = `Android ${osVer}`;

    const isTablet = /Tablet|Tab/i.test(ua) || (Math.min(width, height) >= 600 && isTouch);
    if (isTablet) {
      deviceType = 'tablet';
      deviceTypeName = 'ថេប្លេត (Android Tablet)';
    } else {
      deviceType = 'mobile';
      deviceTypeName = 'ស្មាតហ្វូន (Android Phone)';
    }

    const { model, brand: parsedBrand } = extractAndroidPhoneModel(ua);
    phoneModel = model;
    brand = parsedBrand;
  } else if (/Windows/.test(ua)) {
    deviceType = 'desktop';
    deviceTypeName = 'កុំព្យូទ័រ (Windows PC)';
    brand = 'Microsoft Windows';
    if (ua.includes('Windows NT 10.0')) {
      // Windows 10 or 11
      os = 'Windows 11 / 10';
      phoneModel = 'Windows PC (Desktop/Laptop)';
    } else if (ua.includes('Windows NT 6.3')) {
      os = 'Windows 8.1';
      phoneModel = 'Windows 8.1 PC';
    } else if (ua.includes('Windows NT 6.1')) {
      os = 'Windows 7';
      phoneModel = 'Windows 7 PC';
    } else {
      os = 'Windows PC';
      phoneModel = 'Windows PC';
    }
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    deviceType = 'desktop';
    deviceTypeName = 'កុំព្យូទ័រ (Mac / MacBook)';
    brand = 'Apple';
    const macMatch = ua.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/);
    os = `macOS ${macMatch ? macMatch[1].replace(/_/g, '.') : 'Sonoma'}`;
    phoneModel = 'Apple MacBook / Mac Desktop';
  } else if (/CrOS/.test(ua)) {
    deviceType = 'desktop';
    deviceTypeName = 'ChromeOS';
    brand = 'Google';
    os = 'ChromeOS';
    phoneModel = 'Chromebook';
  } else if (/Linux/.test(ua)) {
    deviceType = 'desktop';
    deviceTypeName = 'Linux PC';
    brand = 'Linux';
    os = 'Linux (Ubuntu/Debian)';
    phoneModel = 'Linux Workstation';
  }

  // 2. Detect Browser
  if (/Edg\//.test(ua)) {
    const ver = ua.match(/Edg\/(\d+)/)?.[1] || '';
    browser = `Microsoft Edge ${ver}`;
  } else if (/Chrome\//.test(ua) && !/Chromium|Edg|SamsungBrowser|OPR/.test(ua)) {
    const ver = ua.match(/Chrome\/(\d+)/)?.[1] || '';
    browser = `Google Chrome ${ver}`;
  } else if (/SamsungBrowser\//.test(ua)) {
    const ver = ua.match(/SamsungBrowser\/(\d+\.\d+)/)?.[1] || '';
    browser = `Samsung Internet ${ver}`;
  } else if (/Safari\//.test(ua) && !/Chrome|Chromium|Android/.test(ua)) {
    const ver = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
    browser = `Apple Safari ${ver}`;
  } else if (/Firefox\//.test(ua)) {
    const ver = ua.match(/Firefox\/(\d+)/)?.[1] || '';
    browser = `Mozilla Firefox ${ver}`;
  } else if (/OPR\//.test(ua)) {
    const ver = ua.match(/OPR\/(\d+)/)?.[1] || '';
    browser = `Opera ${ver}`;
  }

  const screenResolution = `${width} × ${height} px${dpr > 1 ? ` (@${dpr}x)` : ''}`;

  let emoji = '💻';
  if (deviceType === 'mobile') emoji = '📱';
  if (deviceType === 'tablet') emoji = '📟';

  const formattedSummary = `${emoji} ${phoneModel} (${os} · ${browser})`;

  return {
    deviceType,
    deviceTypeName,
    phoneModel,
    brand,
    os,
    browser,
    screenResolution,
    isTouch,
    userAgent: ua,
    formattedSummary,
  };
}
