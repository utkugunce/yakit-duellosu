import { TripRecord, FuelPurchaseRecord, CarSettings } from '../types';
import { DEFAULT_CAR_SETTINGS } from '../data/mockData';

const STORAGE_KEYS = {
  TRIPS: 'yakit_duellosu_trips_v2',
  REFUELS: 'yakit_duellosu_refuels_v2',
  SETTINGS: 'yakit_duellosu_settings',
  THEME: 'yakit_duellosu_theme',
  INITIALIZED_V2: 'yakit_duellosu_cleaned_v2',
};

// Auto-clean old mock data on first load of v2
function ensureStorageCleaned(): void {
  try {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED_V2)) {
      // Remove old mock entries from v1 keys
      localStorage.removeItem('yakit_duellosu_trips');
      localStorage.removeItem('yakit_duellosu_refuels');
      localStorage.removeItem(STORAGE_KEYS.TRIPS);
      localStorage.removeItem(STORAGE_KEYS.REFUELS);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED_V2, 'true');
    }
  } catch (err) {
    console.error('Failed to clean old storage:', err);
  }
}

ensureStorageCleaned();

export function loadSettingsFromStorage(): CarSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_CAR_SETTINGS;
    return { ...DEFAULT_CAR_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings:', err);
    return DEFAULT_CAR_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: CarSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadTripsFromStorage(): TripRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIPS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load trips:', err);
    return [];
  }
}

export function saveTripsToStorage(trips: TripRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save trips:', err);
  }
}

export function loadRefuelsFromStorage(): FuelPurchaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFUELS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load refuels:', err);
    return [];
  }
}

export function saveRefuelsToStorage(refuels: FuelPurchaseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REFUELS, JSON.stringify(refuels));
  } catch (err) {
    console.error('Failed to save refuels:', err);
  }
}

export function exportAllDataAsJSON(
  trips: TripRecord[],
  refuels: FuelPurchaseRecord[],
  settings: CarSettings
): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      trips,
      refuels
    },
    null,
    2
  );
}

export function importAllDataFromJSON(jsonString: string): {
  trips: TripRecord[];
  refuels: FuelPurchaseRecord[];
  settings?: CarSettings;
} {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed.trips)) {
    throw new Error('Geçersiz JSON verisi: sürüş kayıtları bulunamadı.');
  }
  return {
    trips: parsed.trips,
    refuels: Array.isArray(parsed.refuels) ? parsed.refuels : [],
    settings: parsed.settings
  };
}
