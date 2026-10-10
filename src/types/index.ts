export type Driver = 'utku' | 'gozde';

export interface DailyLog {
  id: string;
  driver: Driver; // Günün sürücüsü
  date: string; // Günün tarihi (YYYY-MM-DD veya YYYY-MM-DDTHH:mm)
  startOdometer: number; // Gün başı KM
  endOdometer: number; // Gün sonu KM
  distance: number; // O gün yapılan mesafe (km)
  avgConsumption: number; // Yol bilgisayarı gün sonu ortalaması (L/100km)
  avgSpeed?: number; // Yol bilgisayarı gün sonu ortalama hızı (km/h) (opsiyonel)
  fuelPrice: number; // Benzin litre fiyatı (TL/L)
  fuelConsumed: number; // O gün harcanan yakıt: (distance * avgConsumption) / 100
  fuelCost: number; // O günkü yakıt masrafı: fuelConsumed * fuelPrice
  costPerKm: number; // KM başına maliyet: fuelCost / distance
  notes?: string; // Gün sonu notu (opsiyonel)
  createdAt: string;
}

// Geriye dönük uyumluluk için alias
export type TripRecord = DailyLog;

export interface FuelPurchaseRecord {
  id: string;
  date: string;
  liters: number; // Kaç litre benzin alındı
  totalAmount: number; // Kaç TL'ye alındı
  pricePerLiter: number; // Litre fiyatı (TL/L)
  station?: string; // Benzinlik istasyonu (Shell, Opet vb.)
  odometer?: number; // Araç kilometresindeki değer (opsiyonel)
  fullTank?: boolean; // Depo fulllendi mi (opsiyonel)
  notes?: string;
  createdAt: string;
}

export interface CarSettings {
  carName: string;
  plate: string;
  fuelType: 'benzin' | 'dizel' | 'lpg' | 'hibrit';
  tankCapacity: number;
  currentFuelPrice: number; // TL/L default
  activeDriver: Driver;
  supabaseUrl?: string;
  supabaseKey?: string;
  syncEnabled?: boolean;
  lastSyncTime?: string;
}

export interface DriverStats {
  driver: Driver;
  name: string;
  avatar: string;
  color: string;
  totalDays: number; // Arabayı kullandığı gün sayısı
  totalDistance: number; // Toplam yapılan km
  totalFuelConsumed: number; // Toplam tüketilen litre
  totalFuelCost: number; // Toplam yakıt bedeli (TL)
  avgConsumption: number; // Ortalama L/100km
  avgCostPerKm: number; // Ortalama TL/km
  avgSpeed?: number; // Ortalama hız (km/h)
  bestConsumption: number; // En ekonomik günün tüketimi
  highestConsumption: number; // En yüksek günün tüketimi
}

export interface DuelComparison {
  winner: Driver | 'tie' | null;
  differenceLitersPer100Km: number; // difference in L/100km
  percentageDifference: number; // percentage savings
  utkuStats: DriverStats;
  gozdeStats: DriverStats;
}

export type ThemeMode = 'light' | 'dark' | 'system';
