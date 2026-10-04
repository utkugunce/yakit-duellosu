import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Plus, Calendar, ArrowUpDown, Trash2, Edit2,
  Navigation, Fuel, Snowflake, Leaf, Zap
} from 'lucide-react';
import { Driver, TripRecord, RouteType } from '../types';
import { DRIVER_CONFIG, ROUTE_TYPE_LABELS } from '../utils/duelAnalytics';

interface TripsPageProps {
  trips: TripRecord[];
  onOpenAddModal: () => void;
  onEditTrip: (trip: TripRecord) => void;
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
  const [routeTypeFilter, setRouteTypeFilter] = useState<'all' | RouteType>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'consumption_asc' | 'consumption_desc' | 'distance_desc'>('date_desc');

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      // Driver filter
      if (driverFilter !== 'all' && t.driver !== driverFilter) return false;
      // Route type filter
      if (routeTypeFilter !== 'all' && t.routeType !== routeTypeFilter) return false;
      // Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesRoute = t.routeName.toLowerCase().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q) || false;
        if (!matchesRoute && !matchesNotes) return false;
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
  }, [trips, driverFilter, routeTypeFilter, search, sortBy]);

  const utkuTripsCount = trips.filter(t => t.driver === 'utku').length;
  const gozdeTripsCount = trips.filter(t => t.driver === 'gozde').length;

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top action and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sürüş Geçmişi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Utku ve Gözde'nin gerçekleştirdiği tüm yolculuklar
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Sürüş Ekle</span>
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
            Tüm Sürüşler ({trips.length})
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
            <span>Utku ({utkuTripsCount})</span>
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
            <span>Gözde ({gozdeTripsCount})</span>
          </button>
        </div>

        {/* Search & Sort Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rota veya not ara..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Route Type Filter */}
          <div>
            <select
              value={routeTypeFilter}
              onChange={e => setRouteTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">Tüm Yol Tipleri</option>
              <option value="city_heavy">🚦 Şehir İçi Yoğun</option>
              <option value="city_smooth">🚗 Şehir İçi Akıcı</option>
              <option value="highway">🛣️ Şehir Dışı / Otoyol</option>
              <option value="mixed">🔀 Karma</option>
            </select>
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
              <option value="consumption_asc">En Az Tüketen (Tasarruflu)</option>
              <option value="consumption_desc">En Çok Tüketen</option>
              <option value="distance_desc">En Uzun Mesafe (KM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Navigation className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Eşleşen sürüş bulunamadı
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Arama filtrenizi temizleyebilir veya yeni bir sürüş kaydı oluşturabilirsiniz.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-xl shadow-sm hover:bg-brand-700"
          >
            <Plus className="w-4 h-4" />
            <span>Sürüş Kaydet</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map(trip => {
            const isUtku = trip.driver === 'utku';
            const routeMeta = ROUTE_TYPE_LABELS[trip.routeType];

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
                  {/* Left: Driver, Route and Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">
                        {isUtku ? DRIVER_CONFIG.utku.avatar : DRIVER_CONFIG.gozde.avatar}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {trip.routeName}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isUtku
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                        }`}
                      >
                        {isUtku ? 'Utku' : 'Gözde'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {routeMeta.icon} {routeMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(trip.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span>•</span>

                      <span>
                        Sayaç: {trip.startOdometer} ➔ {trip.endOdometer} km ({trip.distance} km)
                      </span>

                      {trip.ac === 'on' && (
                        <span className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 text-[11px] font-medium">
                          <Snowflake className="w-3 h-3" /> Klima Açık
                        </span>
                      )}

                      {trip.drivingStyle === 'eco' && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                          <Leaf className="w-3 h-3" /> Eko Sürüş
                        </span>
                      )}

                      {trip.drivingStyle === 'sport' && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                          <Zap className="w-3 h-3" /> Dinamik
                        </span>
                      )}
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
                        <span>{trip.fuelConsumed} L</span>
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
                          if (window.confirm(`"${trip.routeName}" sürüş kaydını silmek istediğinizden emin misiniz?`)) {
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
