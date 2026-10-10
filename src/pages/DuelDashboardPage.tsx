import React from 'react';
import {
  TrendingDown, ArrowRight, Gauge, DollarSign,
  Fuel, Award, Calendar, CheckCircle2, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';
import { DailyLog, FuelPurchaseRecord } from '../types';
import {
  calculateDuel, calculateFunBadges,
  DRIVER_CONFIG
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
  const duel = calculateDuel(trips);
  const badges = calculateFunBadges(trips);

  const totalCarKm = Math.round(trips.reduce((acc, t) => acc + t.distance, 0) * 10) / 10;
  const totalCarFuel = Math.round(trips.reduce((acc, t) => acc + t.fuelConsumed, 0) * 10) / 10;
  const totalCarCost = Math.round(trips.reduce((acc, t) => acc + t.fuelCost, 0));

  // Refuel metrics from receipts
  const totalFuelPurchasedLiters = Math.round(refuels.reduce((acc, r) => acc + r.liters, 0) * 10) / 10;
  const totalFuelPurchasedAmount = Math.round(refuels.reduce((acc, r) => acc + r.totalAmount, 0));

  // Chart data: chronological daily logs
  const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sortedTrips.slice(-10).map((t) => ({
    name: new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    driver: t.driver,
    utku: t.driver === 'utku' ? t.avgConsumption : null,
    gozde: t.driver === 'gozde' ? t.avgConsumption : null,
    distance: t.distance,
  }));

  const hasData = trips.length > 0;
  const utkuAvg = duel.utkuStats.avgConsumption;
  const gozdeAvg = duel.gozdeStats.avgConsumption;

  // Visual ratio calculation for the head-to-head bar
  let utkuRatio = 50;
  let gozdeRatio = 50;
  if (utkuAvg > 0 && gozdeAvg > 0) {
    const total = utkuAvg + gozdeAvg;
    // Lower consumption gets slightly more visual advantage bar
    utkuRatio = Math.round((gozdeAvg / total) * 100);
    gozdeRatio = 100 - utkuRatio;
  }

  return (
    <div className="space-y-4 animate-fade-in">
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
                {duel.utkuStats.totalDays} gün • {duel.utkuStats.totalDistance} km
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
                {duel.gozdeStats.totalDays} gün • {duel.gozdeStats.totalDistance} km
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
              {totalCarKm}
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

      {/* 3. Daily Consumption Trend Line Chart */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Tüketim Trendi (L/100km)
            </h3>
            <span className="text-[11px] text-neutral-400">Son gün sonu kayıtları</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Utku</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Gözde</span>
            </span>
          </div>
        </div>

        <div className="h-48 sm:h-56 w-full pt-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  itemStyle={{ padding: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="utku"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0284c7' }}
                  connectNulls
                  name="Utku"
                />
                <Line
                  type="monotone"
                  dataKey="gozde"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#e11d48' }}
                  connectNulls
                  name="Gözde"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              Grafik için en az 1 günlük sürüş kaydı girilmelidir
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Daily Logs List */}
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
                        {trip.distance} km • {trip.startOdometer} ➔ {trip.endOdometer} km
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
