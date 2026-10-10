import React, { useState } from 'react';
import {
  TrendingDown, ArrowRight, Gauge, DollarSign,
  Fuel, Award, Calendar, CheckCircle2, ChevronRight,
  Zap, Trophy, Sparkles, Clock, Compass, BarChart3,
  Percent, ArrowUpRight, ShieldCheck, Flame
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { DailyLog, FuelPurchaseRecord } from '../types';
import {
  calculateDuel, calculateFunBadges,
  calculateExpenseShare, calculateWeekdayWeekendStats,
  calculatePotentialSavings,
  DRIVER_CONFIG, formatKm, getEffectiveFuelPrice
} from '../utils/duelAnalytics';

interface DuelDashboardPageProps {
  trips: DailyLog[];
  refuels: FuelPurchaseRecord[];
  onNavigateToTrips: () => void;
}

export const DuelDashboardPage: React.FC<DuelDashboardPageProps> = ({
  trips,
  refuels,
  onNavigateToTrips,
}) => {
  const [chartMetric, setChartMetric] = useState<'consumption' | 'distance' | 'speed'>('consumption');

  const duel = calculateDuel(trips);
  const badges = calculateFunBadges(trips);
  const expenseShare = calculateExpenseShare(trips);
  const weekdayWeekend = calculateWeekdayWeekendStats(trips);
  const effectiveFuelPrice = getEffectiveFuelPrice(refuels, 84.80);
  const savings = calculatePotentialSavings(trips, effectiveFuelPrice);

  const totalCarKm = Math.round(trips.reduce((acc, t) => acc + t.distance, 0) * 10) / 10;
  const totalCarFuel = Math.round(trips.reduce((acc, t) => acc + t.fuelConsumed, 0) * 10) / 10;
  const totalCarCost = Math.round(trips.reduce((acc, t) => acc + t.fuelCost, 0));

  // Refuel metrics from receipts
  const totalFuelPurchasedLiters = Math.round(refuels.reduce((acc, r) => acc + r.liters, 0) * 10) / 10;
  const totalFuelPurchasedAmount = Math.round(refuels.reduce((acc, r) => acc + r.totalAmount, 0));

  // Chart data: chronological daily logs
  const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sortedTrips.slice(-12).map((t) => ({
    name: new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    driver: t.driver,
    utkuConsumption: t.driver === 'utku' ? t.avgConsumption : null,
    gozdeConsumption: t.driver === 'gozde' ? t.avgConsumption : null,
    utkuDistance: t.driver === 'utku' ? t.distance : 0,
    gozdeDistance: t.driver === 'gozde' ? t.distance : 0,
    utkuSpeed: t.driver === 'utku' && t.avgSpeed ? t.avgSpeed : null,
    gozdeSpeed: t.driver === 'gozde' && t.avgSpeed ? t.avgSpeed : null,
  }));

  const hasData = trips.length > 0;
  const utkuAvg = duel.utkuStats.avgConsumption;
  const gozdeAvg = duel.gozdeStats.avgConsumption;

  // Telemetry comparison matrix rows
  const telemetryMatrix = [
    {
      label: 'Ortalama Tüketim',
      unit: 'L/100km',
      utkuVal: utkuAvg > 0 ? utkuAvg.toFixed(1) : '—',
      gozdeVal: gozdeAvg > 0 ? gozdeAvg.toFixed(1) : '—',
      utkuWins: utkuAvg > 0 && (gozdeAvg === 0 || utkuAvg < gozdeAvg),
      gozdeWins: gozdeAvg > 0 && (utkuAvg === 0 || gozdeAvg < utkuAvg),
    },
    {
      label: 'KM Başı Maliyet',
      unit: '₺/km',
      utkuVal: duel.utkuStats.avgCostPerKm > 0 ? `${duel.utkuStats.avgCostPerKm.toFixed(2)} ₺` : '—',
      gozdeVal: duel.gozdeStats.avgCostPerKm > 0 ? `${duel.gozdeStats.avgCostPerKm.toFixed(2)} ₺` : '—',
      utkuWins: duel.utkuStats.avgCostPerKm > 0 && (duel.gozdeStats.avgCostPerKm === 0 || duel.utkuStats.avgCostPerKm < duel.gozdeStats.avgCostPerKm),
      gozdeWins: duel.gozdeStats.avgCostPerKm > 0 && (duel.utkuStats.avgCostPerKm === 0 || duel.gozdeStats.avgCostPerKm < duel.utkuStats.avgCostPerKm),
    },
    {
      label: 'Toplam Yakıt Tüketimi',
      unit: 'L',
      utkuVal: `${duel.utkuStats.totalFuelConsumed.toFixed(1)} L`,
      gozdeVal: `${duel.gozdeStats.totalFuelConsumed.toFixed(1)} L`,
      utkuWins: false,
      gozdeWins: false,
    },
    {
      label: 'Toplam Yapılan Yol',
      unit: 'km',
      utkuVal: `${formatKm(duel.utkuStats.totalDistance)} km`,
      gozdeVal: `${formatKm(duel.gozdeStats.totalDistance)} km`,
      utkuWins: duel.utkuStats.totalDistance > duel.gozdeStats.totalDistance,
      gozdeWins: duel.gozdeStats.totalDistance > duel.utkuStats.totalDistance,
    },
    {
      label: 'Ortalama Seyir Hızı',
      unit: 'km/h',
      utkuVal: duel.utkuStats.avgSpeed ? `${duel.utkuStats.avgSpeed} km/h` : '—',
      gozdeVal: duel.gozdeStats.avgSpeed ? `${duel.gozdeStats.avgSpeed} km/h` : '—',
      utkuWins: (duel.utkuStats.avgSpeed || 0) > (duel.gozdeStats.avgSpeed || 0),
      gozdeWins: (duel.gozdeStats.avgSpeed || 0) > (duel.utkuStats.avgSpeed || 0),
    },
    {
      label: 'En Ekonomik Gün Rekoru',
      unit: 'L/100km',
      utkuVal: duel.utkuStats.bestConsumption > 0 ? `${duel.utkuStats.bestConsumption.toFixed(1)} L` : '—',
      gozdeVal: duel.gozdeStats.bestConsumption > 0 ? `${duel.gozdeStats.bestConsumption.toFixed(1)} L` : '—',
      utkuWins: duel.utkuStats.bestConsumption > 0 && (duel.gozdeStats.bestConsumption === 0 || duel.utkuStats.bestConsumption < duel.gozdeStats.bestConsumption),
      gozdeWins: duel.gozdeStats.bestConsumption > 0 && (duel.utkuStats.bestConsumption === 0 || duel.gozdeStats.bestConsumption < duel.utkuStats.bestConsumption),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* 1. Main Telemetry Head-to-Head Card */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-6 shadow-xs">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold block">
              ORTALAMA TÜKETİM DÜELLOSU
            </span>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Utku vs Gözde
            </h2>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
            {trips.length} Günlük Kayıt
          </span>
        </div>

        {/* Head-to-Head Telemetry Display */}
        <div className="pt-5 pb-3">
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Utku's Side */}
            <div className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
              duel.winner === 'utku'
                ? 'bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50'
                : 'bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800/60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    U
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Utku</span>
                </div>
                {duel.winner === 'utku' && (
                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                    Lider
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {utkuAvg > 0 ? utkuAvg.toFixed(1) : '—'}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">L/100km</span>
              </div>

              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 truncate">
                {duel.utkuStats.totalDays} gün • {formatKm(duel.utkuStats.totalDistance)} km{duel.utkuStats.avgSpeed ? ` • ${duel.utkuStats.avgSpeed} km/h` : ''}
              </div>
            </div>

            {/* Gözde's Side */}
            <div className={`p-3.5 sm:p-4 rounded-2xl transition-all ${
              duel.winner === 'gozde'
                ? 'bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50'
                : 'bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-100 dark:border-neutral-800/60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    G
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">Gözde</span>
                </div>
                {duel.winner === 'gozde' && (
                  <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                    Lider
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {gozdeAvg > 0 ? gozdeAvg.toFixed(1) : '—'}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">L/100km</span>
              </div>

              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 truncate">
                {duel.gozdeStats.totalDays} gün • {formatKm(duel.gozdeStats.totalDistance)} km{duel.gozdeStats.avgSpeed ? ` • ${duel.gozdeStats.avgSpeed} km/h` : ''}
              </div>
            </div>
          </div>

          {/* Efficiency Verdict Pill */}
          {duel.differenceLitersPer100Km > 0 && duel.winner && duel.winner !== 'tie' ? (
            <div className="mt-3.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-300 truncate">
                  <strong className="text-neutral-900 dark:text-white">
                    {duel.winner === 'utku' ? 'Utku' : 'Gözde'}
                  </strong>{' '}
                  100 km'de ortalama{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {duel.differenceLitersPer100Km} Litre
                  </strong>{' '}
                  daha tasarruflu
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                %{duel.percentageDifference}
              </span>
            </div>
          ) : (
            <div className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500 py-1">
              {!hasData ? 'İlk sürüşleri girdikçe karşılaştırma burada hesaplanacak' : 'İki sürücü de eşit tüketimde'}
            </div>
          )}

          {/* Savings Simulation Pill */}
          {savings.potentialLitersSaved > 0 && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-[11px] flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>
                💡 Araç hep daha tasarruflu sürücünün ortalamasıyla sürülsaydı, şu ana kadar <strong>~{savings.potentialLitersSaved} Litre</strong> (~<strong>{savings.potentialMoneySaved.toLocaleString('tr-TR')} ₺</strong>) daha az yakıt harcanırdı.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Telemetry Metrics Grid (Bento) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Toplam Mesafe
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {formatKm(totalCarKm)}
            </span>
            <span className="text-xs text-neutral-400 font-mono">km</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Harcanan Yakıt
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {totalCarFuel}
            </span>
            <span className="text-xs text-neutral-400 font-mono">L</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Tahmini Masraf
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {totalCarCost.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs text-neutral-400 font-mono">TL</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Alınan Benzin
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {totalFuelPurchasedLiters}
            </span>
            <span className="text-xs text-neutral-400 font-mono">L</span>
          </div>
        </div>
      </div>

      {/* 3. Benzin Masrafı & Mesafe Payı Çubuğu (Expense & Usage Share) */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Yakıt Masraf & Mesafe Payı
            </h3>
            <span className="text-[11px] text-neutral-400">Aracı kim ne kadar kullandı ve masraf kime ait?</span>
          </div>
          <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400">
            Toplam: {expenseShare.totalCost.toLocaleString('tr-TR')} ₺
          </span>
        </div>

        {/* Expense share progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Utku %{expenseShare.utkuPercentage} ({expenseShare.utkuCost.toLocaleString('tr-TR')} ₺)</span>
            </span>
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span>Gözde %{expenseShare.gozdePercentage} ({expenseShare.gozdeCost.toLocaleString('tr-TR')} ₺)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </span>
          </div>

          <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              className="bg-sky-500 transition-all duration-500"
              style={{ width: `${expenseShare.utkuPercentage}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${expenseShare.gozdePercentage}%` }}
            />
          </div>

          {expenseShare.differenceCost > 0 && expenseShare.costPayerMore !== 'tie' && (
            <div className="text-right text-[11px] text-neutral-400">
              Fark:{' '}
              <strong className="text-neutral-700 dark:text-neutral-300">
                {expenseShare.costPayerMore === 'utku' ? 'Utku' : 'Gözde'} {expenseShare.differenceCost.toLocaleString('tr-TR')} ₺
              </strong>{' '}
              daha fazla yakıt harcadı
            </div>
          )}
        </div>

        {/* Distance share breakdown */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-neutral-400">Mesafe Dağılımı:</span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-sky-600 dark:text-sky-400 font-medium">
              Utku: {formatKm(expenseShare.utkuDistance)} km (%{expenseShare.utkuDistancePct})
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              Gözde: {formatKm(expenseShare.gozdeDistance)} km (%{expenseShare.gozdeDistancePct})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Ayrıntılı Telemetry Karşılaştırma Matrisi (Detailed Comparison) */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            Detaylı Sürücü Karşılaştırması
          </h3>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Utku</span>
            </span>
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Gözde</span>
            </span>
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
          {telemetryMatrix.map((row, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-neutral-600 dark:text-neutral-400 text-xs font-medium min-w-0">
                {row.label}
              </span>

              <div className="flex items-center gap-4 font-mono font-bold shrink-0">
                <span className={`px-2 py-0.5 rounded-lg text-xs ${
                  row.utkuWins
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-800'
                    : 'text-neutral-800 dark:text-neutral-200'
                }`}>
                  {row.utkuVal}
                </span>

                <span className="text-neutral-300 dark:text-neutral-700 text-[10px]">vs</span>

                <span className={`px-2 py-0.5 rounded-lg text-xs ${
                  row.gozdeWins
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 ring-1 ring-rose-300 dark:ring-rose-800'
                    : 'text-neutral-800 dark:text-neutral-200'
                }`}>
                  {row.gozdeVal}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Çok Modlu İnteraktif Grafik (Trend & Telemetry Chart) */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              {chartMetric === 'consumption' && 'Tüketim Trendi (L/100km)'}
              {chartMetric === 'distance' && 'Günlük Sürüş Mesafesi (km)'}
              {chartMetric === 'speed' && 'Ortalama Hız Seyri (km/h)'}
            </h3>
            <span className="text-[11px] text-neutral-400">Son gün sonu telemetri verileri</span>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-[11px] font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('consumption')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartMetric === 'consumption'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Tüketim (L)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('distance')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartMetric === 'distance'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Mesafe (KM)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('speed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartMetric === 'speed'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Hız (km/h)
            </button>
          </div>
        </div>

        {/* Legend indicator */}
        <div className="flex items-center gap-3 text-xs font-medium pt-1">
          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Utku</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Gözde</span>
          </span>
        </div>

        {/* Chart View */}
        <div className="h-48 sm:h-56 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'distance' ? (
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                  <YAxis unit="km" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="utkuDistance" fill="#0284c7" radius={[4, 4, 0, 0]} name="Utku (km)" />
                  <Bar dataKey="gozdeDistance" fill="#e11d48" radius={[4, 4, 0, 0]} name="Gözde (km)" />
                </BarChart>
              ) : chartMetric === 'speed' ? (
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                  <YAxis unit="km/h" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Line type="monotone" dataKey="utkuSpeed" stroke="#0284c7" strokeWidth={2} dot={{ r: 3, fill: '#0284c7' }} connectNulls name="Utku (km/h)" />
                  <Line type="monotone" dataKey="gozdeSpeed" stroke="#e11d48" strokeWidth={2} dot={{ r: 3, fill: '#e11d48' }} connectNulls name="Gözde (km/h)" />
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                  <YAxis unit="L" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                  <Line type="monotone" dataKey="utkuConsumption" stroke="#0284c7" strokeWidth={2} dot={{ r: 3, fill: '#0284c7' }} connectNulls name="Utku" />
                  <Line type="monotone" dataKey="gozdeConsumption" stroke="#e11d48" strokeWidth={2} dot={{ r: 3, fill: '#e11d48' }} connectNulls name="Gözde" />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              Grafik için en az 1 günlük sürüş kaydı girilmelidir
            </div>
          )}
        </div>
      </div>

      {/* 6. Hafta İçi vs Hafta Sonu Sürüş Analizi */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            Hafta İçi vs Hafta Sonu Analizi
          </h3>
          <span className="text-[11px] text-neutral-400">Şehir içi / iş trafiği vs hafta sonu kaçışları</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Weekday */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                🏢 Hafta İçi
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {weekdayWeekend.weekdayCount} gün
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block">Ortalama Tüketim</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {weekdayWeekend.weekdayAvgConsumption > 0 ? `${weekdayWeekend.weekdayAvgConsumption} L` : '—'}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200/40 dark:border-neutral-700/40 flex justify-between">
              <span>{formatKm(weekdayWeekend.weekdayDistance)} km</span>
              <span>{weekdayWeekend.weekdayCost.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          {/* Weekend */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                🌳 Hafta Sonu
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {weekdayWeekend.weekendCount} gün
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block">Ortalama Tüketim</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
                {weekdayWeekend.weekendAvgConsumption > 0 ? `${weekdayWeekend.weekendAvgConsumption} L` : '—'}
              </span>
            </div>

            <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200/40 dark:border-neutral-700/40 flex justify-between">
              <span>{formatKm(weekdayWeekend.weekendDistance)} km</span>
              <span>{weekdayWeekend.weekendCost.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Düello Rozetleri & Başarımlar (Fun Badges) */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Düello Başarımları
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">Kim hangi unvanı elinde tutuyor?</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {badges.map(badge => {
            const isUtku = badge.holder === 'utku';
            const isGozde = badge.holder === 'gozde';

            return (
              <div
                key={badge.id}
                className="p-3 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {badge.title}
                  </span>
                  {isUtku ? (
                    <span className="w-5 h-5 rounded-md bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      U
                    </span>
                  ) : isGozde ? (
                    <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      G
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                      —
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-400">
                  {badge.detail}
                </div>

                <div className="text-[10px] text-neutral-400">
                  {isUtku ? '👑 Utku önde' : isGozde ? '👑 Gözde önde' : 'Henüz lider yok'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Recent Daily Logs List */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            Son Günlük Kayıtlar
          </h3>
          <button
            type="button"
            onClick={onNavigateToTrips}
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center gap-0.5"
          >
            <span>Tümü ({trips.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sortedTrips.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Henüz gün sonu sürüşü girilmedi. Alttaki "+" butonuna dokunarak günün kaydını ekleyin.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {sortedTrips.slice(-4).reverse().map(trip => {
              const isUtku = trip.driver === 'utku';
              return (
                <div key={trip.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isUtku
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {isUtku ? 'U' : 'G'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {isUtku ? 'Utku' : 'Gözde'}
                        </span>
                        <span className="text-[11px] text-neutral-400">•</span>
                        <span className="text-[11px] text-neutral-400 truncate">
                          {new Date(trip.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 block truncate">
                        {formatKm(trip.distance)} km{trip.avgSpeed ? ` (${trip.avgSpeed} km/h)` : ''} • {formatKm(trip.startOdometer)} ➔ {formatKm(trip.endOdometer)} km
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white block tabular-nums">
                      {trip.avgConsumption} L/100km
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {trip.fuelCost.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
