import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Calendar, Trash2, Edit2, CalendarDays, Gauge
} from 'lucide-react';
import { Driver, DailyLog } from '../types';
import { DRIVER_CONFIG } from '../utils/duelAnalytics';

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
      // Driver filter
      if (driverFilter !== 'all' && t.driver !== driverFilter) return false;
      // Search text
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
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top action and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Günlük Kayıtlar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Utku ve Gözde'nin gün gün araç kullanım ve tüketim geçmişi
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Gün Kaydet</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Driver Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
          <button
            onClick={() => setDriverFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              driverFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tüm Günler ({trips.length})
          </button>
          <button
            onClick={() => setDriverFilter('utku')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              driverFilter === 'utku'
                ? 'bg-sky-500 text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
            }`}
          >
            <span>{DRIVER_CONFIG.utku.avatar}</span>
            <span>Utku ({utkuDaysCount} gün)</span>
          </button>
          <button
            onClick={() => setDriverFilter('gozde')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              driverFilter === 'gozde'
                ? 'bg-pink-500 text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-pink-600'
            }`}
          >
            <span>{DRIVER_CONFIG.gozde.avatar}</span>
            <span>Gözde ({gozdeDaysCount} gün)</span>
          </button>
        </div>

        {/* Search & Sort Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tarih veya not ara..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="date_desc">En Yeni Tarih</option>
              <option value="date_asc">En Eski Tarih</option>
              <option value="consumption_asc">En Az Tüketen Gün (Tasarruflu)</option>
              <option value="consumption_desc">En Çok Tüketen Gün</option>
              <option value="distance_desc">En Çok KM Yapılan Gün</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Kayıt bulunamadı
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Günün sonunda araba kullanımınızı kaydetmek için aşağıdaki butonu kullanabilirsiniz.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl shadow-sm hover:bg-brand-700"
          >
            <Plus className="w-4 h-4" />
            <span>Gün Kaydet</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map(trip => {
            const isUtku = trip.driver === 'utku';

            return (
              <div
                key={trip.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Left accent indicator */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isUtku ? 'bg-sky-500' : 'bg-pink-500'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
                  {/* Left: Driver, Date and Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">
                        {isUtku ? DRIVER_CONFIG.utku.avatar : DRIVER_CONFIG.gozde.avatar}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          {new Date(trip.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            weekday: 'long',
                          })}
                        </span>
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isUtku
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                        }`}
                      >
                        {isUtku ? 'Utku Kullandı' : 'Gözde Kullandı'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {trip.distance} km yol yapıldı
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        Araç: {trip.endOdometer.toLocaleString('tr-TR')} km
                      </span>
                    </div>

                    {trip.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/40 inline-block">
                        "{trip.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Fuel Metrics and Action Buttons */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="flex items-baseline gap-1 sm:justify-end">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {trip.avgConsumption}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">L/100km</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 sm:justify-end">
                        <span>{trip.fuelConsumed} L Benzin</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {trip.fuelCost.toLocaleString('tr-TR')} ₺
                        </span>
                        <span>({trip.costPerKm} ₺/km)</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTrip(trip)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Bu günün kaydını silmek istediğinizden emin misiniz?')) {
                            onDeleteTrip(trip.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
