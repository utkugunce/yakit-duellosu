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
  driver: Driver; // Kim aldı
  paidBy: Driver | 'shared'; // Kim ödedi
  date: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  odometer: number;
  station: string;
  fullTank: boolean;
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
  totalSpentOnRefuel: number; // TL paid at pump
  ecoTripsCount: number;
}

export interface DuelComparison {
  winner: Driver | 'tie' | null;
  differenceLitersPer100Km: number; // difference in L/100km
  percentageDifference: number; // percentage savings
  utkuStats: DriverStats;
  gozdeStats: DriverStats;
  costBalance: {
    utkuPaidAtPump: number;
    gozdePaidAtPump: number;
    utkuConsumedValue: number;
    gozdeConsumedValue: number;
    debtor: Driver | 'settled';
    debtAmount: number;
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';
