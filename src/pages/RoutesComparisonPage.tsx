import React, { useState } from 'react';
import {
  Route, Trophy, MapPin, Calculator, Sparkles, ArrowRight,
  TrendingUp, TrendingDown, HelpCircle, Gauge
} from 'lucide-react';
import { TripRecord, CarSettings } from '../types';
import {
  calculateRouteComparisons, calculateRouteTypeComparisons,
  DRIVER_CONFIG, calculateDriverStats
} from '../utils/duelAnalytics';

interface RoutesComparisonPageProps {
  trips: TripRecord[];
  settings: CarSettings;
}

export const RoutesComparisonPage: React.FC<RoutesComparisonPageProps> = ({
  trips,
  settings,
}) => {
  const routeComparisons = calculateRouteComparisons(trips);
  const routeTypeComparisons = calculateRouteTypeComparisons(trips);

  const utkuStats = calculateDriverStats('utku', trips, []);
  const gozdeStats = calculateDriverStats('gozde', trips, []);

  // Simulator state
  const [simDistance, setSimDistance] = useState<string>('50');
  const [simRouteName, setSimRouteName] = useState<string>('Ev ➔ İş');

  const numSimDist = parseFloat(simDistance) || 0;
  const utkuSimFuel = utkuStats.avgConsumption > 0 ? (numSimDist * utkuStats.avgConsumption) / 100 : 0;
  const utkuSimCost = utkuSimFuel * settings.currentFuelPrice;

  const gozdeSimFuel = gozdeStats.avgConsumption > 0 ? (numSimDist * gozdeStats.avgConsumption) / 100 : 0;
  const gozdeSimCost = gozdeSimFuel * settings.currentFuelPrice;

  const simDiffCost = Math.abs(utkuSimCost - gozdeSimCost);
  const simWinner = utkuSimCost < gozdeSimCost ? 'utku' : gozdeSimCost < utkuSimCost ? 'gozde' : 'tie';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Güzergah & Rota Analizi
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aynı ve farklı rotalarda Utku ve Gözde'nin tüketim performansları
        </p>
      </div>

      {/* Simulator Card: Kim Sürerse Kaç Para Yakar? */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-800/50 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 text-brand-300">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Rota Simülatörü: "Direksiyona Kim Geçsin?"
            </h3>
            <p className="text-xs text-brand-200/80">
              Gideceğiniz mesafeyi girin; Utku ve Gözde'nin geçmiş ortalamalarına göre yakıt maliyetini hesaplayalım
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Gidilecek Mesafe (KM)
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                value={simDistance}
                onChange={e => setSimDistance(e.target.value)}
                placeholder="Örn: 80"
                className="w-full px-3 py-2 pr-10 text-sm font-bold rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-300 font-semibold">km</span>
            </div>
            {/* Quick distance buttons */}
            <div className="flex gap-1.5 mt-2">
              {['18', '35', '75', '150', '300'].map(km => (
                <button
                  key={km}
                  onClick={() => setSimDistance(km)}
                  className={`px-2 py-0.5 text-[10px] rounded-lg border transition-colors ${
                    simDistance === km
                      ? 'bg-white/20 border-white text-white font-bold'
                      : 'border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          </div>

          {/* Side by side results */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            {/* Utku's prediction */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-sky-400/30 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{DRIVER_CONFIG.utku.avatar}</span>
                <span className="text-xs font-bold text-sky-300">Utku Sürerse</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {Math.round(utkuSimCost).toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-300">₺</span>
              </div>
              <p className="text-[11px] text-sky-200/80 mt-0.5">
                {utkuSimFuel.toFixed(1)} L Benzin • ({utkuStats.avgConsumption} L/100km)
              </p>
            </div>

            {/* Gözde's prediction */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-pink-400/30 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{DRIVER_CONFIG.gozde.avatar}</span>
                <span className="text-xs font-bold text-pink-300">Gözde Sürerse</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {Math.round(gozdeSimCost).toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-300">₺</span>
              </div>
              <p className="text-[11px] text-pink-200/80 mt-0.5">
                {gozdeSimFuel.toFixed(1)} L Benzin • ({gozdeStats.avgConsumption} L/100km)
              </p>
            </div>
          </div>
        </div>

        {/* Simulator Verdict */}
        {numSimDist > 0 && simWinner !== 'tie' && (
          <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between text-xs sm:text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                Bu rotada direksiyona{' '}
                <strong className="text-amber-300 font-bold">
                  {simWinner === 'utku' ? 'Utku' : 'Gözde'}
                </strong>{' '}
                geçerse{' '}
                <strong className="text-emerald-400 font-bold">
                  {Math.round(simDiffCost).toLocaleString('tr-TR')} ₺
                </strong>{' '}
                daha tasarruflu olursunuz!
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Head-to-Head Comparison on Exact Routes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Aynı Güzergahlarda Tüketim Düellosu</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              İkinizin de sürdüğü rotalarda hanginizin tüketimi daha düşük?
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {routeComparisons.length} Farklı Rota
          </span>
        </div>

        {routeComparisons.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            Henüz rota karşılaştırması yapacak veri bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routeComparisons.map(item => {
              const hasBoth = item.utkuCount > 0 && item.gozdeCount > 0;
              const isUtkuWinner = item.winner === 'utku';
              const isGozdeWinner = item.winner === 'gozde';

              return (
                <div
                  key={item.routeName}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5"
                >
                  {/* Route Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-brand-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.routeName}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Toplam {item.totalTrips} sürüş
                        </span>
                      </div>
                    </div>

                    {/* Winner badge for route */}
                    {hasBoth && item.winner !== 'tie' && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isUtkuWinner
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                      }`}>
                        <Trophy className="w-3 h-3 text-amber-500" />
                        {isUtkuWinner ? 'Utku Kazandı' : 'Gözde Kazandı'} (-{item.diffLiters} L)
                      </span>
                    )}

                    {hasBoth && item.winner === 'tie' && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        🤝 Berabere
                      </span>
                    )}

                    {!hasBoth && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                        {item.utkuCount > 0 ? 'Sadece Utku sürdü' : 'Sadece Gözde sürdü'}
                      </span>
                    )}
                  </div>

                  {/* Side by side comparison bars */}
                  <div className="space-y-2 pt-1">
                    {/* Utku bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                          <span>{DRIVER_CONFIG.utku.avatar}</span>
                          <span>Utku ({item.utkuCount} kez)</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.utkuAvg > 0 ? `${item.utkuAvg} L/100km` : '—'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (item.utkuAvg / 12) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Gözde bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                          <span>{DRIVER_CONFIG.gozde.avatar}</span>
                          <span>Gözde ({item.gozdeCount} kez)</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.gozdeAvg > 0 ? `${item.gozdeAvg} L/100km` : '—'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-pink-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (item.gozdeAvg / 12) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Route Type Analysis Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-500" />
            <span>Yol Tipleri ve Trafik Şartlarına Göre Liderlik</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kim nerede daha iyi araç kullanıyor?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {routeTypeComparisons.map(item => {
            const hasData = item.utkuAvg > 0 || item.gozdeAvg > 0;
            return (
              <div
                key={item.type}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                  </div>
                </div>

                {hasData ? (
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sky-600 dark:text-sky-400 font-medium">Utku:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.utkuAvg > 0 ? `${item.utkuAvg} L` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600 dark:text-pink-400 font-medium">Gözde:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.gozdeAvg > 0 ? `${item.gozdeAvg} L` : '—'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Daha Ekonomik:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.winner === 'utku' ? 'Utku 🏆' : item.winner === 'gozde' ? 'Gözde 🏆' : item.winner === 'tie' ? 'Eşit' : '—'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">Henüz bu tipte sürüş yok</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
