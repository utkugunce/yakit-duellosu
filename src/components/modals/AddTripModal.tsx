import React, { useState, useEffect } from 'react';
import { X, Calculator, Sparkles, Navigation2, Flame } from 'lucide-react';
import { Driver, TripRecord, RouteType, DrivingStyle, ACState, CarSettings } from '../../types';
import { DRIVER_CONFIG, ROUTE_TYPE_LABELS } from '../../utils/duelAnalytics';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: TripRecord) => void;
  editingTrip?: TripRecord | null;
  lastOdometer: number;
  settings: CarSettings;
}

export const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrip,
  lastOdometer,
  settings,
}) => {
  const [driver, setDriver] = useState<Driver>(settings.activeDriver);
  const [date, setDate] = useState<string>('');
  const [routeName, setRouteName] = useState<string>('');
  const [routeType, setRouteType] = useState<RouteType>('city_heavy');
  const [inputMode, setInputMode] = useState<'odometer' | 'distance'>('odometer');
  const [startOdo, setStartOdo] = useState<string>('');
  const [endOdo, setEndOdo] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [avgConsumption, setAvgConsumption] = useState<string>('6.5');
  const [fuelPrice, setFuelPrice] = useState<string>(settings.currentFuelPrice.toString());
  const [drivingStyle, setDrivingStyle] = useState<DrivingStyle>('normal');
  const [ac, setAc] = useState<ACState>('off');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingTrip) {
        setDriver(editingTrip.driver);
        setDate(editingTrip.date);
        setRouteName(editingTrip.routeName);
        setRouteType(editingTrip.routeType);
        setStartOdo(editingTrip.startOdometer.toString());
        setEndOdo(editingTrip.endOdometer.toString());
        setDistance(editingTrip.distance.toString());
        setAvgConsumption(editingTrip.avgConsumption.toString());
        setFuelPrice(editingTrip.fuelPrice.toString());
        setDrivingStyle(editingTrip.drivingStyle);
        setAc(editingTrip.ac);
        setNotes(editingTrip.notes || '');
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setDate(`${year}-${month}-${day}T${hours}:${mins}`);

        setDriver(settings.activeDriver);
        setRouteName(settings.commonRoutes[0] || 'Ev ➔ İş');
        setRouteType('city_heavy');
        setStartOdo(lastOdometer > 0 ? lastOdometer.toString() : '45000');
        setEndOdo('');
        setDistance('');
        setAvgConsumption('6.8');
        setFuelPrice(settings.currentFuelPrice.toString());
        setDrivingStyle('normal');
        setAc('off');
        setNotes('');
        setInputMode('odometer');
      }
    }
  }, [isOpen, editingTrip, lastOdometer, settings]);

  // Sync distance and odometers
  const numStart = parseFloat(startOdo) || 0;
  const numEnd = parseFloat(endOdo) || 0;
  const calculatedDistance = inputMode === 'odometer'
    ? Math.max(0, Math.round((numEnd - numStart) * 10) / 10)
    : parseFloat(distance) || 0;

  const numConsumption = parseFloat(avgConsumption) || 0;
  const numPrice = parseFloat(fuelPrice) || settings.currentFuelPrice;

  const fuelConsumed = Math.round(((calculatedDistance * numConsumption) / 100) * 100) / 100;
  const fuelCost = Math.round(fuelConsumed * numPrice * 100) / 100;
  const costPerKm = calculatedDistance > 0 ? Math.round((fuelCost / calculatedDistance) * 100) / 100 : 0;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalStart = numStart;
    let finalEnd = numEnd;
    let finalDist = calculatedDistance;

    if (inputMode === 'distance') {
      finalDist = parseFloat(distance) || 0;
      finalStart = numStart;
      finalEnd = numStart + finalDist;
    } else {
      if (numEnd <= numStart) {
        alert('Bitiş kilometresi başlangıç kilometresinden büyük olmalıdır!');
        return;
      }
    }

    if (finalDist <= 0) {
      alert('Lütfen geçerli bir sürüş mesafesi girin!');
      return;
    }

    if (numConsumption <= 0) {
      alert('Lütfen ortalama yakıt tüketimini girin (L/100km)!');
      return;
    }

    const trip: TripRecord = {
      id: editingTrip ? editingTrip.id : `trip-${Date.now()}`,
      driver,
      date,
      routeName: routeName.trim() || 'Genel Sürüş',
      routeType,
      startOdometer: finalStart,
      endOdometer: finalEnd,
      distance: finalDist,
      avgConsumption: numConsumption,
      fuelPrice: numPrice,
      fuelConsumed,
      fuelCost,
      costPerKm,
      drivingStyle,
      ac,
      notes: notes.trim(),
      createdAt: editingTrip ? editingTrip.createdAt : new Date().toISOString(),
    };

    onSave(trip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Navigation2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTrip ? 'Sürüş Kaydını Düzenle' : 'Yeni Sürüş Kaydet'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Araba yolculuğunun detaylarını ve tüketimini girin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Driver Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Direksiyonda Kim Vardı?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDriver('utku')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-sm transition-all ${
                  driver === 'utku'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-lg">{DRIVER_CONFIG.utku.avatar}</span>
                <span>Utku</span>
              </button>

              <button
                type="button"
                onClick={() => setDriver('gozde')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-sm transition-all ${
                  driver === 'gozde'
                    ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-lg">{DRIVER_CONFIG.gozde.avatar}</span>
                <span>Gözde</span>
              </button>
            </div>
          </div>

          {/* Route presets & text input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Güzergah / Rota Adı
            </label>
            <input
              type="text"
              required
              value={routeName}
              onChange={e => setRouteName(e.target.value)}
              placeholder="Örn: Ev ➔ İş, Kadıköy Sahil..."
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {/* Quick route chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {settings.commonRoutes.map((route, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRouteName(route)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                    routeName === route
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {route}
                </button>
              ))}
            </div>
          </div>

          {/* Route Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Yol / Trafik Durumu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(ROUTE_TYPE_LABELS) as RouteType[]).map(typeKey => {
                const item = ROUTE_TYPE_LABELS[typeKey];
                const isSelected = routeType === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setRouteType(typeKey)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-base mb-0.5">{item.icon}</span>
                    <span className="text-[11px] leading-tight font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kilometers / Distance Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kilometre & Mesafe
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('odometer')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    inputMode === 'odometer'
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Sayaç ile
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('distance')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    inputMode === 'distance'
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Direkt KM
                </button>
              </div>
            </div>

            {inputMode === 'odometer' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Başlangıç KM
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={startOdo}
                    onChange={e => setStartOdo(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Bitiş KM (Varış)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={endOdo}
                    onChange={e => setEndOdo(e.target.value)}
                    placeholder={startOdo ? (parseFloat(startOdo) + 20).toString() : '45120'}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Yapılan Yol Mesafesi (KM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={distance}
                  onChange={e => setDistance(e.target.value)}
                  placeholder="Örn: 24.5"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">
              <span>Hesaplanan Sürüş:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {calculatedDistance.toLocaleString('tr-TR')} km
              </span>
            </div>
          </div>

          {/* Consumption & Fuel Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ort. Tüketim (Yol Bilgisayarı)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="25"
                  required
                  value={avgConsumption}
                  onChange={e => setAvgConsumption(e.target.value)}
                  className="w-full px-3 py-2 pr-16 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">
                  L/100km
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Benzin Litre Fiyatı
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fuelPrice}
                  onChange={e => setFuelPrice(e.target.value)}
                  className="w-full px-3 py-2 pr-12 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">
                  TL/L
                </span>
              </div>
            </div>
          </div>

          {/* Driving Style and AC Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sürüş Tarzı
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['eco', 'normal', 'sport'] as DrivingStyle[]).map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setDrivingStyle(style)}
                    className={`py-1.5 text-xs rounded-lg border capitalize font-medium transition-colors ${
                      drivingStyle === style
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {style === 'eco' ? 'Eco 🌱' : style === 'normal' ? 'Normal' : 'Sport ⚡'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Klima Durumu
              </label>
              <button
                type="button"
                onClick={() => setAc(ac === 'on' ? 'off' : 'on')}
                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  ac === 'on'
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 text-cyan-700 dark:text-cyan-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{ac === 'on' ? '❄️ Klima Açıktı' : '🚫 Klima Kapalıydı'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-slate-800 dark:to-brand-950/40 border border-brand-200 dark:border-brand-900/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-2">
              <Calculator className="w-4 h-4" />
              <span>Bu Sürüşün Yakıt Hesabı:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Tüketilen Yakıt</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {fuelConsumed.toLocaleString('tr-TR')} L
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Tahmini Masraf</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {fuelCost.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">KM Başı</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {costPerKm.toLocaleString('tr-TR')} ₺/km
                </span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarih ve Saat
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notlar (Opsiyonel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Trafik, hava durumu vb."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {editingTrip ? 'Değişiklikleri Kaydet' : 'Sürüşü Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
