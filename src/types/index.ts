export type Driver = 'utku' | 'gozde';

export type RouteType = 'city_heavy' | 'city_smooth' | 'highway' | 'mixed';

export type DrivingStyle = 'eco' | 'normal' | 'sport';

export type ACState = 'on' | 'off';

export interface TripRecord {
  id: string;
  driver: Driver;
  date: string; // ISO date string YYYY-MM-DDTHH:mm
  routeName: string; // e.g. "Ev -> İş"
  routeType: RouteType;
  startOdometer: number;
  endOdometer: number;
  distance: number; // km
  avgConsumption: number; // L/100km
  fuelPrice: number; // TL/L
  fuelConsumed: number; // calculated: (distance * avgConsumption) / 100
  fuelCost: number; // calculated: fuelConsumed * fuelPrice
  costPerKm: number; // calculated: fuelCost / distance
  drivingStyle: DrivingStyle;
  ac: ACState;
  notes?: string;
  createdAt: string;
}

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
  commonRoutes: string[];
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
  totalTrips: number;
  totalDistance: number; // km
  totalFuelConsumed: number; // Liters
  totalFuelCost: number; // TL
  avgConsumption: number; // L/100km weighted average
  avgCostPerKm: number; // TL/km
  bestConsumption: number; // Lowest L/100km
  highestConsumption: number; // Highest L/100km
  ecoTripsCount: number;
}

export interface DuelComparison {
  winner: Driver | 'tie' | null;
  differenceLitersPer100Km: number; // difference in L/100km
  percentageDifference: number; // percentage savings
  utkuStats: DriverStats;
  gozdeStats: DriverStats;
}

export type ThemeMode = 'light' | 'dark' | 'system';
