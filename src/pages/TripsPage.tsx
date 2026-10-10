import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Calendar, Trash2, Edit2, Gauge, X
} from 'lucide-react';
import { Driver, DailyLog } from '../types';
import { formatKm } from '../utils/duelAnalytics';

interface TripsPageProps {
  trips: DailyLog[];
  onOpenAddModal: () => void;
  onEditTrip: (trip: DailyLog) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripsPage: React.FC<TripsPageProps> = ({
  trips,
  onOpenAddModal,
  onEditTrip,
  onDeleteTrip,
}) => {
  const [search, setSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | Driver>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'consumption_asc' | 'consumption_desc' | 'distance_desc'>('date_desc');

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      if (driverFilter !== 'all' && t.driver !== driverFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesDate = t.date.toLowerCase().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q) || false;
        if (!matchesDate && !matchesNotes) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'consumption_asc') return a.avgConsumption - b.avgConsumption;
      if (sortBy === 'consumption_desc') return b.avgConsumption - a.avgConsumption;
      if (sortBy === 'distance_desc') return b.distance - a.distance;
      return 0;
    });
  }, [trips, driverFilter, search, sortBy]);

  const utkuDaysCount = trips.filter(t => t.driver === 'utku').length;
  const gozdeDaysCount = trips.filter(t => t.driver === 'gozde').length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            Günlük Kayıtlar
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Gün sonu araç kullanım ve tüketim geçmişi
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Gün Kaydet</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2.5">
        {/* iOS Segmented Tabs */}
        <div className="grid grid-cols-3 p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setDriverFilter('all')}
            className={`py-1.5 rounded-lg transition-all ${
              driverFilter === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            Tümü ({trips.length})
          </button>
          <button
            type="button"
            onClick={() => setDriverFilter('utku')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              driverFilter === 'utku'
                ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 font-semibold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Utku ({utkuDaysCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setDriverFilter('gozde')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              driverFilter === 'gozde'
                ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Gözde ({gozdeDaysCount})</span>
          </button>
        </div>

        {/* Search & Sort Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tarih veya notlarda ara..."
              className="w-full pl-8.5 pr-8 py-2 text-xs rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-2 text-xs rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none font-medium"
          >
            <option value="date_desc">En Yeni</option>
            <option value="date_asc">En Eski</option>
            <option value="consumption_asc">En Düşük L/100km</option>
            <option value="consumption_desc">En Yüksek L/100km</option>
            <option value="distance_desc">En Çok KM</option>
          </select>
        </div>
      </div>

      {/* Trips Feed */}
      {filteredTrips.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 text-center space-y-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Kriterlere uygun gün kaydı bulunamadı.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>İlk Günü Kaydet</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTrips.map(trip => {
            const isUtku = trip.driver === 'utku';
            return (
              <div
                key={trip.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Driver dot, date, distance */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isUtku ? 'bg-sky-500' : 'bg-rose-500'}`} />
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {isUtku ? 'Utku' : 'Gözde'}
                      </span>
                      <span className="text-[11px] text-neutral-400">•</span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {new Date(trip.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          weekday: 'short',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {formatKm(trip.distance)} km
                      </span>
                      <span>•</span>
                      <span>{formatKm(trip.startOdometer)} ➔ {formatKm(trip.endOdometer)} km</span>
                      {trip.avgSpeed && trip.avgSpeed > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium">{trip.avgSpeed} km/h</span>
                        </>
                      )}
                    </div>

                    {trip.notes && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic pt-0.5">
                        "{trip.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Telemetry consumption & actions */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 dark:text-white tabular-nums">
                        {trip.avgConsumption}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">L/100km</span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-400">
                      {trip.fuelConsumed} L • <span className="text-neutral-700 dark:text-neutral-200 font-semibold">{trip.fuelCost.toLocaleString('tr-TR')} ₺</span>
                    </div>

                    {/* Edit & Delete row */}
                    <div className="flex items-center justify-end gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => onEditTrip(trip)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Bu gün kaydını silmek istediğinizden emin misiniz?')) {
                            onDeleteTrip(trip.id);
                          }
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
