import { Driver, DailyLog, DriverStats, DuelComparison } from '../types';

export const DRIVER_CONFIG = {
  utku: {
    name: 'Utku',
    initial: 'U',
    avatar: 'U',
    color: '#0284c7', // Sky-600
    badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    accentClass: 'from-sky-500 to-blue-600',
    lightBg: 'bg-sky-50 dark:bg-sky-950/30',
  },
  gozde: {
    name: 'Gözde',
    initial: 'G',
    avatar: 'G',
    color: '#e11d48', // Rose-600
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    accentClass: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50 dark:bg-rose-950/30',
  }
};

export function calculateDriverStats(
  driver: Driver,
  logs: DailyLog[]
): DriverStats {
  const driverLogs = logs.filter(t => t.driver === driver);
  const totalDays = driverLogs.length;

  let totalDistance = 0;
  let totalFuelConsumed = 0;
  let totalFuelCost = 0;
  let bestConsumption = Infinity;
  let highestConsumption = 0;

  for (const t of driverLogs) {
    totalDistance += t.distance;
    totalFuelConsumed += t.fuelConsumed;
    totalFuelCost += t.fuelCost;
    if (t.avgConsumption < bestConsumption) bestConsumption = t.avgConsumption;
    if (t.avgConsumption > highestConsumption) highestConsumption = t.avgConsumption;
  }

  const avgConsumption = totalDistance > 0 ? (totalFuelConsumed / totalDistance) * 100 : 0;
  const avgCostPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;

  return {
    driver,
    name: DRIVER_CONFIG[driver].name,
    avatar: DRIVER_CONFIG[driver].avatar,
    color: DRIVER_CONFIG[driver].color,
    totalDays,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalFuelConsumed: Math.round(totalFuelConsumed * 100) / 100,
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    avgConsumption: Math.round(avgConsumption * 100) / 100,
    avgCostPerKm: Math.round(avgCostPerKm * 100) / 100,
    bestConsumption: bestConsumption === Infinity ? 0 : bestConsumption,
    highestConsumption,
  };
}

export function calculateDuel(logs: DailyLog[]): DuelComparison {
  const utkuStats = calculateDriverStats('utku', logs);
  const gozdeStats = calculateDriverStats('gozde', logs);

  let winner: Driver | 'tie' | null = null;
  let differenceLitersPer100Km = 0;
  let percentageDifference = 0;

  if (utkuStats.totalDays > 0 && gozdeStats.totalDays > 0) {
    const diff = utkuStats.avgConsumption - gozdeStats.avgConsumption;
    differenceLitersPer100Km = Math.round(Math.abs(diff) * 100) / 100;

    const maxVal = Math.max(utkuStats.avgConsumption, gozdeStats.avgConsumption);
    if (maxVal > 0) {
      percentageDifference = Math.round((differenceLitersPer100Km / maxVal) * 1000) / 10;
    }

    if (Math.abs(diff) < 0.05) {
      winner = 'tie';
    } else if (utkuStats.avgConsumption < gozdeStats.avgConsumption) {
      winner = 'utku';
    } else {
      winner = 'gozde';
    }
  } else if (utkuStats.totalDays > 0) {
    winner = 'utku';
  } else if (gozdeStats.totalDays > 0) {
    winner = 'gozde';
  }

  return {
    winner,
    differenceLitersPer100Km,
    percentageDifference,
    utkuStats,
    gozdeStats,
  };
}

export interface FunBadge {
  id: string;
  title: string;
  type: 'champion' | 'record' | 'distance' | 'days';
  holder: Driver | 'none';
  detail: string;
}

export function calculateFunBadges(logs: DailyLog[]): FunBadge[] {
  if (logs.length === 0) return [];

  const utkuStats = calculateDriverStats('utku', logs);
  const gozdeStats = calculateDriverStats('gozde', logs);

  const badges: FunBadge[] = [];

  // 1. Tasarruf Lideri
  let championHolder: Driver | 'none' = 'none';
  let championDetail = 'Henüz yeterli veri yok';
  if (utkuStats.totalDays > 0 && gozdeStats.totalDays > 0) {
    if (utkuStats.avgConsumption < gozdeStats.avgConsumption) {
      championHolder = 'utku';
      championDetail = `Ortalama ${utkuStats.avgConsumption} L/100km`;
    } else {
      championHolder = 'gozde';
      championDetail = `Ortalama ${gozdeStats.avgConsumption} L/100km`;
    }
  }
  badges.push({
    id: 'eco-champion',
    title: 'Tasarruf Lideri',
    type: 'champion',
    holder: championHolder,
    detail: championDetail,
  });

  // 2. En Düşük Tüketim Rekoru
  let bestDayDriver: Driver | 'none' = 'none';
  let lowestLiters = Infinity;
  let bestDate = '';
  for (const t of logs) {
    if (t.avgConsumption < lowestLiters) {
      lowestLiters = t.avgConsumption;
      bestDayDriver = t.driver;
      bestDate = t.date;
    }
  }
  badges.push({
    id: 'record-trip',
    title: 'Rekor Gün',
    type: 'record',
    holder: bestDayDriver,
    detail: bestDayDriver !== 'none' ? `${lowestLiters} L/100km` : 'Henüz kayıt yok',
  });

  // 3. Mesafe Lideri
  let kmHolder: Driver | 'none' = 'none';
  if (utkuStats.totalDistance > gozdeStats.totalDistance && utkuStats.totalDistance > 0) {
    kmHolder = 'utku';
  } else if (gozdeStats.totalDistance > utkuStats.totalDistance && gozdeStats.totalDistance > 0) {
    kmHolder = 'gozde';
  }
  badges.push({
    id: 'road-master',
    title: 'Mesafe Lideri',
    type: 'distance',
    holder: kmHolder,
    detail: kmHolder === 'utku'
      ? `${utkuStats.totalDistance} km`
      : kmHolder === 'gozde'
        ? `${gozdeStats.totalDistance} km`
        : 'Eşit mesafe',
  });

  // 4. Direksiyon Başı Gün Sayısı
  let daysHolder: Driver | 'none' = 'none';
  if (utkuStats.totalDays > gozdeStats.totalDays) {
    daysHolder = 'utku';
  } else if (gozdeStats.totalDays > utkuStats.totalDays) {
    daysHolder = 'gozde';
  }
  badges.push({
    id: 'days-master',
    title: 'En Çok Kullanan',
    type: 'days',
    holder: daysHolder,
    detail: daysHolder === 'utku'
      ? `${utkuStats.totalDays} gün`
      : daysHolder === 'gozde'
        ? `${gozdeStats.totalDays} gün`
        : 'Eşit',
  });

  return badges;
}
