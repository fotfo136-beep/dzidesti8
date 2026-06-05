// LocalStorage keys
export const STORAGE_KEYS = {
  RECEIPTS: "estim8_receipts",
  QUOTES: "estim8_quotes",
  SETTINGS: "estim8_settings",
} as const;

// Generic localStorage helpers
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
}

// Clear all app data
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(removeFromStorage);
}

// Export data for backup
export function exportData(): {
  receipts: unknown[];
  quotes: unknown[];
  settings: unknown;
  exportDate: string;
} {
  return {
    receipts: getFromStorage(STORAGE_KEYS.RECEIPTS, []),
    quotes: getFromStorage(STORAGE_KEYS.QUOTES, []),
    settings: getFromStorage(STORAGE_KEYS.SETTINGS, null),
    exportDate: new Date().toISOString(),
  };
}

// Import data from backup
export function importData(data: { receipts?: unknown[]; quotes?: unknown[]; settings?: unknown }): boolean {
  try {
    if (data.receipts) {
      saveToStorage(STORAGE_KEYS.RECEIPTS, data.receipts);
    }
    if (data.quotes) {
      saveToStorage(STORAGE_KEYS.QUOTES, data.quotes);
    }
    if (data.settings) {
      saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    }
    return true;
  } catch {
    return false;
  }
}
