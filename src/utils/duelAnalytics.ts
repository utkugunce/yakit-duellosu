import { Driver, TripRecord, DriverStats, DuelComparison, RouteType } from '../types';

export const DRIVER_CONFIG = {
  utku: {
    name: 'Utku',
    avatar: '👨‍💻',
    color: '#0284c7', // Sky-600
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    accentClass: 'from-sky-500 to-blue-600',
    lightBg: 'bg-sky-50 dark:bg-sky-950/30',
  },
  gozde: {
    name: 'Gözde',
    avatar: '👩‍💼',
    color: '#db2777', // Pink-600
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-800',
    accentClass: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50 dark:bg-pink-950/30',
  }
};

export const ROUTE_TYPE_LABELS: Record<RouteType, { label: string; icon: string; desc: string }> = {
  city_heavy: { label: 'Şehir İçi Yoğun', icon: '🚦', desc: 'Dur-kalk yoğun trafik' },
  city_smooth: { label: 'Şehir İçi Akıcı', icon: '🚗', desc: 'Rahat şehir içi yol' },
  highway: { label: 'Şehir Dışı / Otoyol', icon: '🛣️', desc: 'Sabit hızlı uzun yol' },
  mixed: { label: 'Karma Güzergah', icon: '🔀', desc: 'Şehir içi & otoyol karışık' },
};

export function calculateDriverStats(
  driver: Driver,
  trips: TripRecord[]
): DriverStats {
  const driverTrips = trips.filter(t => t.driver === driver);
  const totalTrips = driverTrips.length;

  let totalDistance = 0;
  let totalFuelConsumed = 0;
  let totalFuelCost = 0;
  let bestConsumption = Infinity;
  let highestConsumption = 0;
  let ecoTripsCount = 0;

  for (const t of driverTrips) {
    totalDistance += t.distance;
    totalFuelConsumed += t.fuelConsumed;
    totalFuelCost += t.fuelCost;
    if (t.avgConsumption < bestConsumption) bestConsumption = t.avgConsumption;
    if (t.avgConsumption > highestConsumption) highestConsumption = t.avgConsumption;
    if (t.drivingStyle === 'eco') ecoTripsCount++;
  }

  const avgConsumption = totalDistance > 0 ? (totalFuelConsumed / totalDistance) * 100 : 0;
  const avgCostPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;

  return {
    driver,
    name: DRIVER_CONFIG[driver].name,
    avatar: DRIVER_CONFIG[driver].avatar,
    color: DRIVER_CONFIG[driver].color,
    totalTrips,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalFuelConsumed: Math.round(totalFuelConsumed * 100) / 100,
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    avgConsumption: Math.round(avgConsumption * 100) / 100,
    avgCostPerKm: Math.round(avgCostPerKm * 100) / 100,
    bestConsumption: bestConsumption === Infinity ? 0 : bestConsumption,
    highestConsumption,
    ecoTripsCount,
  };
}

export function calculateDuel(trips: TripRecord[]): DuelComparison {
  const utkuStats = calculateDriverStats('utku', trips);
  const gozdeStats = calculateDriverStats('gozde', trips);

  let winner: Driver | 'tie' | null = null;
  let differenceLitersPer100Km = 0;
  let percentageDifference = 0;

  if (utkuStats.totalTrips > 0 && gozdeStats.totalTrips > 0) {
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
  } else if (utkuStats.totalTrips > 0) {
    winner = 'utku';
  } else if (gozdeStats.totalTrips > 0) {
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

export interface RouteComparisonItem {
  routeName: string;
  totalTrips: number;
  utkuCount: number;
  gozdeCount: number;
  utkuAvg: number;
  gozdeAvg: number;
  winner: Driver | 'tie' | 'none';
  diffLiters: number;
}

export function calculateRouteComparisons(trips: TripRecord[]): RouteComparisonItem[] {
  const routeMap = new Map<string, { utkuTrips: TripRecord[]; gozdeTrips: TripRecord[] }>();

  for (const t of trips) {
    const key = t.routeName.trim();
    if (!routeMap.has(key)) {
      routeMap.set(key, { utkuTrips: [], gozdeTrips: [] });
    }
    const item = routeMap.get(key)!;
    if (t.driver === 'utku') item.utkuTrips.push(t);
    else item.gozdeTrips.push(t);
  }

  const result: RouteComparisonItem[] = [];

  for (const [routeName, data] of routeMap.entries()) {
    const utkuDist = data.utkuTrips.reduce((acc, t) => acc + t.distance, 0);
    const utkuFuel = data.utkuTrips.reduce((acc, t) => acc + t.fuelConsumed, 0);
    const utkuAvg = utkuDist > 0 ? (utkuFuel / utkuDist) * 100 : 0;

    const gozdeDist = data.gozdeTrips.reduce((acc, t) => acc + t.distance, 0);
    const gozdeFuel = data.gozdeTrips.reduce((acc, t) => acc + t.fuelConsumed, 0);
    const gozdeAvg = gozdeDist > 0 ? (gozdeFuel / gozdeDist) * 100 : 0;

    let winner: Driver | 'tie' | 'none' = 'none';
    let diffLiters = 0;

    if (data.utkuTrips.length > 0 && data.gozdeTrips.length > 0) {
      const diff = utkuAvg - gozdeAvg;
      diffLiters = Math.round(Math.abs(diff) * 100) / 100;
      if (Math.abs(diff) < 0.1) winner = 'tie';
      else if (utkuAvg < gozdeAvg) winner = 'utku';
      else winner = 'gozde';
    }

    result.push({
      routeName,
      totalTrips: data.utkuTrips.length + data.gozdeTrips.length,
      utkuCount: data.utkuTrips.length,
      gozdeCount: data.gozdeTrips.length,
      utkuAvg: Math.round(utkuAvg * 10) / 10,
      gozdeAvg: Math.round(gozdeAvg * 10) / 10,
      winner,
      diffLiters,
    });
  }

  // Sort by most trips
  return result.sort((a, b) => b.totalTrips - a.totalTrips);
}

export interface RouteTypeComparisonItem {
  type: RouteType;
  label: string;
  icon: string;
  utkuAvg: number;
  gozdeAvg: number;
  utkuKm: number;
  gozdeKm: number;
  winner: Driver | 'tie' | 'none';
}

export function calculateRouteTypeComparisons(trips: TripRecord[]): RouteTypeComparisonItem[] {
  const types: RouteType[] = ['city_heavy', 'city_smooth', 'highway', 'mixed'];

  return types.map(t => {
    const meta = ROUTE_TYPE_LABELS[t];
    const utkuTrips = trips.filter(tr => tr.driver === 'utku' && tr.routeType === t);
    const gozdeTrips = trips.filter(tr => tr.driver === 'gozde' && tr.routeType === t);

    const utkuDist = utkuTrips.reduce((acc, item) => acc + item.distance, 0);
    const utkuFuel = utkuTrips.reduce((acc, item) => acc + item.fuelConsumed, 0);
    const utkuAvg = utkuDist > 0 ? (utkuFuel / utkuDist) * 100 : 0;

    const gozdeDist = gozdeTrips.reduce((acc, item) => acc + item.distance, 0);
    const gozdeFuel = gozdeTrips.reduce((acc, item) => acc + item.fuelConsumed, 0);
    const gozdeAvg = gozdeDist > 0 ? (gozdeFuel / gozdeDist) * 100 : 0;

    let winner: Driver | 'tie' | 'none' = 'none';
    if (utkuTrips.length > 0 && gozdeTrips.length > 0) {
      if (Math.abs(utkuAvg - gozdeAvg) < 0.1) winner = 'tie';
      else if (utkuAvg < gozdeAvg) winner = 'utku';
      else winner = 'gozde';
    }

    return {
      type: t,
      label: meta.label,
      icon: meta.icon,
      utkuAvg: Math.round(utkuAvg * 10) / 10,
      gozdeAvg: Math.round(gozdeAvg * 10) / 10,
      utkuKm: Math.round(utkuDist),
      gozdeKm: Math.round(gozdeDist),
      winner,
    };
  });
}

export interface FunBadge {
  id: string;
  title: string;
  icon: string;
  holder: Driver | 'none';
  detail: string;
}

export function calculateFunBadges(trips: TripRecord[]): FunBadge[] {
  if (trips.length === 0) return [];

  const utkuTrips = trips.filter(t => t.driver === 'utku');
  const gozdeTrips = trips.filter(t => t.driver === 'gozde');

  const utkuStats = calculateDriverStats('utku', trips);
  const gozdeStats = calculateDriverStats('gozde', trips);

  const badges: FunBadge[] = [];

  // 1. Tasarruf Şampiyonu
  let championHolder: Driver | 'none' = 'none';
  let championDetail = 'Henüz yeterli veri yok';
  if (utkuStats.totalTrips > 0 && gozdeStats.totalTrips > 0) {
    if (utkuStats.avgConsumption < gozdeStats.avgConsumption) {
      championHolder = 'utku';
      championDetail = `Ortalama ${utkuStats.avgConsumption} L/100km ile lider!`;
    } else {
      championHolder = 'gozde';
      championDetail = `Ortalama ${gozdeStats.avgConsumption} L/100km ile lider!`;
    }
  }
  badges.push({
    id: 'eco-champion',
    title: 'Tasarruf Şampiyonu',
    icon: '🏆',
    holder: championHolder,
    detail: championDetail,
  });

  // 2. En Ekonomik Tek Sürüş Rekoru
  let bestTripDriver: Driver | 'none' = 'none';
  let lowestLiters = Infinity;
  let bestTripRoute = '';
  for (const t of trips) {
    if (t.avgConsumption < lowestLiters) {
      lowestLiters = t.avgConsumption;
      bestTripDriver = t.driver;
      bestTripRoute = t.routeName;
    }
  }
  badges.push({
    id: 'record-trip',
    title: 'Rekor Tek Sürüş',
    icon: '⭐',
    holder: bestTripDriver,
    detail: bestTripDriver !== 'none' ? `${lowestLiters} L/100km (${bestTripRoute})` : 'Henüz sürüş yok',
  });

  // 3. Kilometre Kaşifi
  let kmHolder: Driver | 'none' = 'none';
  if (utkuStats.totalDistance > gozdeStats.totalDistance && utkuStats.totalDistance > 0) {
    kmHolder = 'utku';
  } else if (gozdeStats.totalDistance > utkuStats.totalDistance && gozdeStats.totalDistance > 0) {
    kmHolder = 'gozde';
  }
  badges.push({
    id: 'road-master',
    title: 'Kilometre Kaşifi',
    icon: '🛣️',
    holder: kmHolder,
    detail: kmHolder === 'utku'
      ? `Utku: ${utkuStats.totalDistance} km yaptı`
      : kmHolder === 'gozde'
        ? `Gözde: ${gozdeStats.totalDistance} km yaptı`
        : 'Eşit mesafe',
  });

  // 4. Klima Sever
  const utkuACCount = utkuTrips.filter(t => t.ac === 'on').length;
  const gozdeACCount = gozdeTrips.filter(t => t.ac === 'on').length;
  const utkuACRatio = utkuTrips.length > 0 ? utkuACCount / utkuTrips.length : 0;
  const gozdeACRatio = gozdeTrips.length > 0 ? gozdeACCount / gozdeTrips.length : 0;
  let acHolder: Driver | 'none' = 'none';
  if (utkuACRatio > gozdeACRatio && utkuACCount > 0) acHolder = 'utku';
  else if (gozdeACRatio > utkuACRatio && gozdeACCount > 0) acHolder = 'gozde';
  badges.push({
    id: 'ac-lover',
    title: 'Klima Tutkunu',
    icon: '❄️',
    holder: acHolder,
    detail: acHolder === 'utku'
      ? `Sürüşlerinin %${Math.round(utkuACRatio * 100)}'inde klima açıktı`
      : acHolder === 'gozde'
        ? `Sürüşlerinin %${Math.round(gozdeACRatio * 100)}'sinde klima açıktı`
        : 'Klima kullanımı dengeli',
  });

  // 5. Eko Mod Ustası
  let ecoHolder: Driver | 'none' = 'none';
  if (utkuStats.ecoTripsCount > gozdeStats.ecoTripsCount && utkuStats.ecoTripsCount > 0) {
    ecoHolder = 'utku';
  } else if (gozdeStats.ecoTripsCount > utkuStats.ecoTripsCount && gozdeStats.ecoTripsCount > 0) {
    ecoHolder = 'gozde';
  }
  badges.push({
    id: 'eco-master',
    title: 'Eko Sürüş Ustası',
    icon: '🌱',
    holder: ecoHolder,
    detail: ecoHolder === 'utku'
      ? `Utku ${utkuStats.ecoTripsCount} kez eko sürüş yaptı`
      : ecoHolder === 'gozde'
        ? `Gözde ${gozdeStats.ecoTripsCount} kez eko sürüş yaptı`
        : 'Eko sürüşler dengeli',
  });

  return badges;
}
