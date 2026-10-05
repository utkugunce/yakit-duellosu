import React, { useMemo } from 'react';
import {
  Trophy, Flame, TrendingDown, ArrowRight, Gauge, DollarSign,
  Fuel, Sparkles, Navigation2, CalendarDays
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Legend
} from 'recharts';
import { DailyLog, FuelPurchaseRecord } from '../types';
import {
  calculateDuel, calculateFunBadges,
  DRIVER_CONFIG
} from '../utils/duelAnalytics';
import { fireWinnerConfetti } from '../utils/confetti';

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
  const hasBothDrivers = duel.utkuStats.totalDays > 0 && duel.gozdeStats.totalDays > 0;

  const totalCarKm = Math.round(trips.reduce((acc, t) => acc + t.distance, 0) * 10) / 10;
  const totalCarFuel = Math.round(trips.reduce((acc, t) => acc + t.fuelConsumed, 0) * 10) / 10;
  const totalCarCost = Math.round(trips.reduce((acc, t) => acc + t.fuelCost, 0));
  const carAvgConsumption = totalCarKm > 0 ? Math.round((totalCarFuel / totalCarKm) * 100 * 10) / 10 : 0;

  const latestOdometer = useMemo(() => {
    let maxOdo = 0;
    for (const t of trips) {
      if (t.endOdometer > maxOdo) maxOdo = t.endOdometer;
    }
    for (const r of refuels) {
      if (r.odometer && r.odometer > maxOdo) maxOdo = r.odometer;
    }
    return maxOdo;
  }, [trips, refuels]);

  // Refuel metrics from receipts
  const totalFuelPurchasedLiters = Math.round(refuels.reduce((acc, r) => acc + r.liters, 0) * 10) / 10;
  const totalFuelPurchasedAmount = Math.round(refuels.reduce((acc, r) => acc + r.totalAmount, 0));

  // Chart data: chronological daily logs
  const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sortedTrips.slice(-12).map((t) => ({
    name: new Date(t.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    driver: t.driver,
    consumption: t.avgConsumption,
    utku: t.driver === 'utku' ? t.avgConsumption : null,
    gozde: t.driver === 'gozde' ? t.avgConsumption : null,
    distance: t.distance,
  }));

  // Side-by-side Driver Comparison Data for Bar Chart
  const driverComparisonData = [
    {
      metric: 'Ort. Tüketim (L/100km)',
      Utku: duel.utkuStats.avgConsumption,
      Gözde: duel.gozdeStats.avgConsumption,
    },
    {
      metric: 'En İyi Gün (L/100km)',
      Utku: duel.utkuStats.bestConsumption,
      Gözde: duel.gozdeStats.bestConsumption,
    },
  ];

  const winnerConfig = duel.winner && duel.winner !== 'tie' ? DRIVER_CONFIG[duel.winner] : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Duel Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-6 shadow-2xl border border-slate-700/60">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Duel */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 mt-0.5 sm:mt-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-amber-400">
                  BÜYÜK YAKIT DÜELLOSU
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/80 whitespace-nowrap">
                  {trips.length} Günlük Kayıt
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold tracking-tight mt-0.5">
                Kim Daha Çok Yakıyor?
              </h2>
            </div>
          </div>

          {/* Winner celebration badge / button */}
          {duel.winner && duel.winner !== 'tie' && winnerConfig && (
            <button
              onClick={() => fireWinnerConfetti()}
              className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-semibold hover:bg-amber-400/20 transition-all active:scale-95 shadow-sm"
              title="Kutlama konfetisi patlat!"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {hasBothDrivers
                  ? `Lider: ${winnerConfig.name} (%${duel.percentageDifference} Tasarruflu)`
                  : `Lider: ${winnerConfig.name}`}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            </button>
          )}
        </div>

        {/* Head-to-Head Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 pt-4 sm:pt-6">
          {/* Utku Card */}
          <div
            className={`p-3.5 sm:p-5 rounded-2xl backdrop-blur-md border transition-all ${
              duel.winner === 'utku'
                ? 'bg-sky-500/15 border-sky-400/50 shadow-lg shadow-sky-500/10'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2.5 mb-3.5">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {DRIVER_CONFIG.utku.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-bold text-white leading-tight">Utku</h3>
                    {hasBothDrivers && duel.winner === 'utku' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow-sm whitespace-nowrap">
                        <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> ŞAMPİYON
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-sky-200/80 mt-0.5 truncate">
                    {duel.utkuStats.totalDays} Gün • {duel.utkuStats.totalDistance} km
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 bg-white/5 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 block font-semibold leading-tight">
                  ORTALAMA
                </span>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  {duel.utkuStats.avgConsumption > 0 ? (
                    <>
                      <span className="text-xl sm:text-2xl font-black text-sky-400 leading-none">
                        {duel.utkuStats.avgConsumption}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium">L/100km</span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Henüz yok</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center pt-3 border-t border-white/10">
              <div className="bg-black/25 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Tüketilen</span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {duel.utkuStats.totalFuelConsumed} L
                </span>
              </div>
              <div className="bg-black/25 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Masraf</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  {duel.utkuStats.totalFuelCost.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="bg-black/25 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">En İyi Gün</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">
                  {duel.utkuStats.bestConsumption > 0 ? `${duel.utkuStats.bestConsumption} L` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Gözde Card */}
          <div
            className={`p-3.5 sm:p-5 rounded-2xl backdrop-blur-md border transition-all ${
              duel.winner === 'gozde'
                ? 'bg-pink-500/15 border-pink-400/50 shadow-lg shadow-pink-500/10'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2.5 mb-3.5">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {DRIVER_CONFIG.gozde.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-bold text-white leading-tight">Gözde</h3>
                    {hasBothDrivers && duel.winner === 'gozde' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow-sm whitespace-nowrap">
                        <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> ŞAMPİYON
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-pink-200/80 mt-0.5 truncate">
                    {duel.gozdeStats.totalDays} Gün • {duel.gozdeStats.totalDistance} km
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 bg-white/5 sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-xl border border-white/5 sm:border-0">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 block font-semibold leading-tight">
                  ORTALAMA
                </span>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  {duel.gozdeStats.avgConsumption > 0 ? (
                    <>
                      <span className="text-xl sm:text-2xl font-black text-pink-400 leading-none">
                        {duel.gozdeStats.avgConsumption}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium">L/100km</span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Henüz yok</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center pt-3 border-t border-white/10">
              <div className="bg-black/25 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Tüketilen</span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {duel.gozdeStats.totalFuelConsumed} L
                </span>
              </div>
              <div className="bg-black/25 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Masraf</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  {duel.gozdeStats.totalFuelCost.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="bg-black/25 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">En İyi Gün</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">
                  {duel.gozdeStats.bestConsumption > 0 ? `${duel.gozdeStats.bestConsumption} L` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Duel Verdict Callout */}
        {duel.differenceLitersPer100Km > 0 && winnerConfig && (
          <div className="relative z-10 mt-5 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white font-bold">{winnerConfig.name}</strong>, 100 kilometrede ortalama{' '}
                <strong className="text-emerald-400 font-bold">{duel.differenceLitersPer100Km} Litre</strong> daha az benzin tüketiyor!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shared Car Overall Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Gauge className="w-4 h-4 text-brand-500" />
            <span>Ortak Kilometre</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {totalCarKm.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          {latestOdometer > 0 && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Araç: {latestOdometer.toLocaleString('tr-TR')} km
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Fuel className="w-4 h-4 text-emerald-500" />
            <span>Ortak Tüketim</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {carAvgConsumption} <span className="text-xs font-normal text-slate-400">L/100km</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>Alınan Toplam Benzin</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {totalFuelPurchasedLiters > 0 ? totalFuelPurchasedLiters.toLocaleString('tr-TR') : totalCarFuel.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">L</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Navigation2 className="w-4 h-4 text-indigo-500" />
            <span>Toplam Benzin Tutarı</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {totalFuelPurchasedAmount > 0 ? totalFuelPurchasedAmount.toLocaleString('tr-TR') : totalCarCost.toLocaleString('tr-TR')}{' '}
            <span className="text-xs font-normal text-slate-400">₺</span>
          </div>
        </div>
      </div>

      {/* Fun Badges & Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Kupa & Rozetler</span>
          </h3>
          <span className="text-xs text-slate-500">Utku vs Gözde Performansları</span>
        </div>

        {badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {badges.map(badge => {
              const isUtku = badge.holder === 'utku';
              const isGozde = badge.holder === 'gozde';

              return (
                <div
                  key={badge.id}
                  className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {badge.title}
                  </span>

                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold">
                    {isUtku && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                        👨‍💻 Utku
                      </span>
                    )}
                    {isGozde && (
                      <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300">
                        👩‍💼 Gözde
                      </span>
                    )}
                    {!isUtku && !isGozde && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Berabere
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {badge.detail}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Kupa ve rozetler gün sonu sürüşleri kaydedildikçe burada açılacaktır. 🏆
          </div>
        )}
      </div>

      {/* Consumption Trend Chart (Utku vs Gözde) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Günlük Tüketim Trendi (L/100km)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gün sonlarında Utku (Mavi) ve Gözde'nin (Pembe) ortalama yakıt tüketimleri
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
              Utku
            </span>
            <span className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400">
              <span className="w-3 h-3 rounded-full bg-pink-500 inline-block"></span>
              Gözde
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} unit=" L" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                          <p className="font-bold text-slate-200">{data.name}</p>
                          <p className="text-slate-400">Mesafe: {data.distance} km</p>
                          <p className={data.driver === 'utku' ? 'text-sky-400 font-bold' : 'text-pink-400 font-bold'}>
                            Sürücü: {data.driver === 'utku' ? 'Utku' : 'Gözde'} • {data.consumption} L/100km
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="utku"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7' }}
                  connectNulls
                  name="Utku"
                />
                <Line
                  type="monotone"
                  dataKey="gozde"
                  stroke="#db2777"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#db2777' }}
                  connectNulls
                  name="Gözde"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Henüz grafik için yeterli kayıt yok
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side Driver Comparison Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Genel Performans Kıyaslaması
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ortalama ve en iyi gün sonu tüketim göstergeleri
          </p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={driverComparisonData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis unit=" L" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Utku" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gözde" fill="#db2777" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Daily Logs Quick Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Son Günlük Kayıtlar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              En son girilen gün sonu kayıtları
            </p>
          </div>
          <button
            onClick={onNavigateToTrips}
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Tüm Günleri Gör ({trips.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sortedTrips.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Henüz kaydedilmiş gün sonu sürüşü bulunmuyor. İlk sürüşünüzü "+ Gün Kaydet" butonu ile ekleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {sortedTrips.slice(-3).reverse().map(trip => {
              const isUtku = trip.driver === 'utku';
              return (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {isUtku ? DRIVER_CONFIG.utku.avatar : DRIVER_CONFIG.gozde.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(trip.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          isUtku ? 'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/60' : 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-950/60'
                        }`}>
                          {isUtku ? 'Utku' : 'Gözde'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {trip.distance} km • Araç: {trip.endOdometer.toLocaleString('tr-TR')} km
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {trip.avgConsumption} L/100km
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
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
