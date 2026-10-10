import { Driver, DailyLog, DriverStats, DuelComparison, FuelPurchaseRecord } from '../types';

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

/**
 * Format km values to always have exactly 1 decimal digit (e.g. 42.5 km, 45100.0 km)
 */
export function formatKm(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0';
  return (Math.round(val * 10) / 10).toFixed(1);
}

/**
 * Determine the active pump fuel price.
 * Uses the latest refuel receipt's pricePerLiter, or fallback to 84.80.
 */
export function getEffectiveFuelPrice(
  refuels: FuelPurchaseRecord[],
  defaultPrice: number = 84.80
): number {
  if (!refuels || refuels.length === 0) return defaultPrice;
  const sorted = [...refuels].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0];
  if (latest && latest.pricePerLiter && latest.pricePerLiter > 0) {
    return latest.pricePerLiter;
  }
  return defaultPrice;
}

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

  let speedSum = 0;
  let speedCount = 0;

  for (const t of driverLogs) {
    totalDistance += t.distance;
    totalFuelConsumed += t.fuelConsumed;
    totalFuelCost += t.fuelCost;
    if (t.avgConsumption < bestConsumption) bestConsumption = t.avgConsumption;
    if (t.avgConsumption > highestConsumption) highestConsumption = t.avgConsumption;

    if (t.avgSpeed && t.avgSpeed > 0) {
      speedSum += t.avgSpeed;
      speedCount++;
    }
  }

  const avgConsumption = totalDistance > 0 ? (totalFuelConsumed / totalDistance) * 100 : 0;
  const avgCostPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;
  const avgSpeed = speedCount > 0 ? Math.round(speedSum / speedCount) : undefined;

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
    avgSpeed,
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
  type: 'champion' | 'record' | 'distance' | 'days' | 'speed';
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
  for (const t of logs) {
    if (t.avgConsumption < lowestLiters) {
      lowestLiters = t.avgConsumption;
      bestDayDriver = t.driver;
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
      ? `${formatKm(utkuStats.totalDistance)} km`
      : kmHolder === 'gozde'
        ? `${formatKm(gozdeStats.totalDistance)} km`
        : 'Eşit mesafe',
  });

  // 4. Hız Lideri (Ortalama Hız)
  let speedHolder: Driver | 'none' = 'none';
  let speedDetail = 'Hız kaydı yok';
  if (utkuStats.avgSpeed && gozdeStats.avgSpeed) {
    if (utkuStats.avgSpeed > gozdeStats.avgSpeed) {
      speedHolder = 'utku';
      speedDetail = `Ort. ${utkuStats.avgSpeed} km/h`;
    } else if (gozdeStats.avgSpeed > utkuStats.avgSpeed) {
      speedHolder = 'gozde';
      speedDetail = `Ort. ${gozdeStats.avgSpeed} km/h`;
    } else {
      speedDetail = `Eşit (${utkuStats.avgSpeed} km/h)`;
    }
  } else if (utkuStats.avgSpeed) {
    speedHolder = 'utku';
    speedDetail = `Ort. ${utkuStats.avgSpeed} km/h`;
  } else if (gozdeStats.avgSpeed) {
    speedHolder = 'gozde';
    speedDetail = `Ort. ${gozdeStats.avgSpeed} km/h`;
  }
  badges.push({
    id: 'speed-master',
    title: 'Hız Lideri',
    type: 'speed',
    holder: speedHolder,
    detail: speedDetail,
  });

  // 5. Direksiyon Başı Gün Sayısı
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

export interface ExpenseShare {
  utkuCost: number;
  gozdeCost: number;
  totalCost: number;
  utkuPercentage: number;
  gozdePercentage: number;
  utkuDistance: number;
  gozdeDistance: number;
  totalDistance: number;
  utkuDistancePct: number;
  gozdeDistancePct: number;
  differenceCost: number;
  costPayerMore: Driver | 'tie';
}

export function calculateExpenseShare(logs: DailyLog[]): ExpenseShare {
  const utkuStats = calculateDriverStats('utku', logs);
  const gozdeStats = calculateDriverStats('gozde', logs);

  const totalCost = utkuStats.totalFuelCost + gozdeStats.totalFuelCost;
  const utkuPercentage = totalCost > 0 ? Math.round((utkuStats.totalFuelCost / totalCost) * 100) : 50;
  const gozdePercentage = totalCost > 0 ? 100 - utkuPercentage : 50;

  const totalDistance = utkuStats.totalDistance + gozdeStats.totalDistance;
  const utkuDistancePct = totalDistance > 0 ? Math.round((utkuStats.totalDistance / totalDistance) * 100) : 50;
  const gozdeDistancePct = totalDistance > 0 ? 100 - utkuDistancePct : 50;

  const diff = Math.abs(utkuStats.totalFuelCost - gozdeStats.totalFuelCost);
  const costPayerMore = utkuStats.totalFuelCost > gozdeStats.totalFuelCost
    ? 'utku'
    : gozdeStats.totalFuelCost > utkuStats.totalFuelCost
    ? 'gozde'
    : 'tie';

  return {
    utkuCost: utkuStats.totalFuelCost,
    gozdeCost: gozdeStats.totalFuelCost,
    totalCost,
    utkuPercentage,
    gozdePercentage,
    utkuDistance: utkuStats.totalDistance,
    gozdeDistance: gozdeStats.totalDistance,
    totalDistance,
    utkuDistancePct,
    gozdeDistancePct,
    differenceCost: Math.round(diff),
    costPayerMore,
  };
}

export interface WeekdayWeekendStats {
  weekdayAvgConsumption: number;
  weekendAvgConsumption: number;
  weekdayDistance: number;
  weekendDistance: number;
  weekdayCost: number;
  weekendCost: number;
  weekdayCount: number;
  weekendCount: number;
}

export function calculateWeekdayWeekendStats(logs: DailyLog[]): WeekdayWeekendStats {
  let weekdayDist = 0;
  let weekdayFuel = 0;
  let weekdayCost = 0;
  let weekdayCount = 0;

  let weekendDist = 0;
  let weekendFuel = 0;
  let weekendCost = 0;
  let weekendCount = 0;

  for (const log of logs) {
    const day = new Date(log.date).getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = day === 0 || day === 6;

    if (isWeekend) {
      weekendDist += log.distance;
      weekendFuel += log.fuelConsumed;
      weekendCost += log.fuelCost;
      weekendCount++;
    } else {
      weekdayDist += log.distance;
      weekdayFuel += log.fuelConsumed;
      weekdayCost += log.fuelCost;
      weekdayCount++;
    }
  }

  const weekdayAvg = weekdayDist > 0 ? Math.round((weekdayFuel / weekdayDist) * 100 * 10) / 10 : 0;
  const weekendAvg = weekendDist > 0 ? Math.round((weekendFuel / weekendDist) * 100 * 10) / 10 : 0;

  return {
    weekdayAvgConsumption: weekdayAvg,
    weekendAvgConsumption: weekendAvg,
    weekdayDistance: Math.round(weekdayDist * 10) / 10,
    weekendDistance: Math.round(weekendDist * 10) / 10,
    weekdayCost: Math.round(weekdayCost),
    weekendCost: Math.round(weekendCost),
    weekdayCount,
    weekendCount,
  };
}

export function calculatePotentialSavings(logs: DailyLog[], fuelPrice: number = 84.80): {
  potentialLitersSaved: number;
  potentialMoneySaved: number;
  moreEconomicalDriver: Driver | 'tie';
} {
  const utkuStats = calculateDriverStats('utku', logs);
  const gozdeStats = calculateDriverStats('gozde', logs);

  if (utkuStats.totalDays === 0 || gozdeStats.totalDays === 0) {
    return { potentialLitersSaved: 0, potentialMoneySaved: 0, moreEconomicalDriver: 'tie' };
  }

  const diffConsumption = Math.abs(utkuStats.avgConsumption - gozdeStats.avgConsumption);
  if (diffConsumption < 0.05) {
    return { potentialLitersSaved: 0, potentialMoneySaved: 0, moreEconomicalDriver: 'tie' };
  }

  const higherDriverStats = utkuStats.avgConsumption > gozdeStats.avgConsumption ? utkuStats : gozdeStats;
  const moreEconomicalDriver: Driver = utkuStats.avgConsumption < gozdeStats.avgConsumption ? 'utku' : 'gozde';

  const savedLiters = (higherDriverStats.totalDistance * diffConsumption) / 100;
  const savedMoney = savedLiters * fuelPrice;

  return {
    potentialLitersSaved: Math.round(savedLiters * 10) / 10,
    potentialMoneySaved: Math.round(savedMoney),
    moreEconomicalDriver,
  };
}
