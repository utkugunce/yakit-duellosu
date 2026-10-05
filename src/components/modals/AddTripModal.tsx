import React, { useState, useEffect } from 'react';
import { X, CalendarDays, Calculator, Gauge } from 'lucide-react';
import { Driver, DailyLog, CarSettings } from '../../types';
import { DRIVER_CONFIG } from '../../utils/duelAnalytics';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: DailyLog) => void;
  editingTrip?: DailyLog | null;
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
  const [distance, setDistance] = useState<string>('');
  const [carOdometer, setCarOdometer] = useState<string>('');
  const [baseOdometer, setBaseOdometer] = useState<number>(0);
  const [avgConsumption, setAvgConsumption] = useState<string>('6.5');
  const [fuelPrice, setFuelPrice] = useState<string>(settings.currentFuelPrice.toString());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingTrip) {
        setDriver(editingTrip.driver);
        setDate(editingTrip.date.slice(0, 10));
        setBaseOdometer(editingTrip.startOdometer);
        setDistance(editingTrip.distance.toString());
        setCarOdometer(editingTrip.endOdometer.toString());
        setAvgConsumption(editingTrip.avgConsumption.toString());
        setFuelPrice(editingTrip.fuelPrice.toString());
        setNotes(editingTrip.notes || '');
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);

        setDriver(settings.activeDriver);
        setBaseOdometer(lastOdometer);
        setDistance('');
        setCarOdometer(lastOdometer > 0 ? lastOdometer.toString() : '');
        setAvgConsumption('6.5');
        setFuelPrice(settings.currentFuelPrice.toString());
        setNotes('');
      }
    }
  }, [isOpen, editingTrip, lastOdometer, settings]);

  const handleDistanceChange = (val: string) => {
    setDistance(val);
    const distNum = parseFloat(val);
    if (!isNaN(distNum) && distNum >= 0) {
      if (baseOdometer > 0) {
        const newOdo = Math.round((baseOdometer + distNum) * 10) / 10;
        setCarOdometer(newOdo.toString());
      }
    } else if (val === '') {
      if (baseOdometer > 0) {
        setCarOdometer(baseOdometer.toString());
      }
    }
  };

  const handleCarOdometerChange = (val: string) => {
    setCarOdometer(val);
    const odoNum = parseFloat(val);
    if (!isNaN(odoNum)) {
      if (baseOdometer > 0 && odoNum >= baseOdometer) {
        const newDist = Math.round((odoNum - baseOdometer) * 10) / 10;
        setDistance(newDist.toString());
      }
    }
  };

  const calculatedDistance = parseFloat(distance) || 0;
  const numConsumption = parseFloat(avgConsumption) || 0;
  const numPrice = parseFloat(fuelPrice) || settings.currentFuelPrice;

  const fuelConsumed = Math.round(((calculatedDistance * numConsumption) / 100) * 100) / 100;
  const fuelCost = Math.round(fuelConsumed * numPrice * 100) / 100;
  const costPerKm = calculatedDistance > 0 ? Math.round((fuelCost / calculatedDistance) * 100) / 100 : 0;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const distNum = parseFloat(distance) || 0;
    if (distNum <= 0) {
      alert('Lütfen bugün yapılan mesafeyi (KM) girin!');
      return;
    }

    let finalEnd = parseFloat(carOdometer) || 0;
    if (finalEnd <= 0 && baseOdometer > 0) {
      finalEnd = baseOdometer + distNum;
    }

    if (finalEnd <= 0) {
      alert('Lütfen arabanın kaç kilometrede olduğunu girin!');
      return;
    }

    let finalStart = baseOdometer > 0 ? baseOdometer : Math.max(0, finalEnd - distNum);
    if (finalEnd < finalStart) {
      finalStart = Math.max(0, finalEnd - distNum);
    }

    if (numConsumption <= 0) {
      alert('Lütfen gün sonu ortalama yakıt tüketimini girin (L/100km)!');
      return;
    }

    const trip: DailyLog = {
      id: editingTrip ? editingTrip.id : `day-${Date.now()}`,
      driver,
      date,
      startOdometer: Math.round(finalStart * 10) / 10,
      endOdometer: Math.round(finalEnd * 10) / 10,
      distance: Math.round(distNum * 10) / 10,
      avgConsumption: numConsumption,
      fuelPrice: numPrice,
      fuelConsumed,
      fuelCost,
      costPerKm,
      notes: notes.trim(),
      createdAt: editingTrip ? editingTrip.createdAt : new Date().toISOString(),
    };

    onSave(trip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTrip ? 'Günlük Kaydı Düzenle' : 'Gün Sonu Kaydı (Gün Kaydet)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bugün yapılan km ve gün sonu tüketimini kaydedin
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
              Bugün Arabayı Kim Kullandı?
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

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Günün Tarihi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            />
          </div>

          {/* Kilometers / Distance Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kilometre & Mesafe
                </span>
              </div>
              {baseOdometer > 0 && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  Önceki Araç: {baseOdometer.toLocaleString('tr-TR')} km
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Direct Distance */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bugün Yapılan Yol (Direkt KM) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={distance}
                    onChange={e => handleDistanceChange(e.target.value)}
                    placeholder="Örn: 35.0"
                    className="w-full px-3 py-2 pr-12 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs font-medium text-slate-400 pointer-events-none">
                    km
                  </span>
                </div>
              </div>

              {/* Car Odometer */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arabanın Kilometresi (Araç Sayacı) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    value={carOdometer}
                    onChange={e => handleCarOdometerChange(e.target.value)}
                    placeholder={baseOdometer > 0 ? (baseOdometer + 35).toString() : 'Örn: 45035'}
                    className="w-full px-3 py-2 pr-12 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-brand-600 dark:text-brand-400"
                  />
                  <span className="absolute right-3 top-2 text-xs font-medium text-slate-400 pointer-events-none">
                    km
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">
              <span>Bugün Yapılan Mesafe:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {calculatedDistance.toLocaleString('tr-TR')} km
              </span>
            </div>
          </div>

          {/* Consumption & Fuel Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gün Sonu Ortalama Tüketim
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

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-slate-800 dark:to-brand-950/40 border border-brand-200 dark:border-brand-900/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-2">
              <Calculator className="w-4 h-4" />
              <span>Günün Yakıt Özeti:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Tüketilen Benzin</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {fuelConsumed.toLocaleString('tr-TR')} L
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Günün Masrafı</span>
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Günün Notu (Opsiyonel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Örn: İşe gidiş dönüş, yoğun trafik, otoyol vb."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
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
              {editingTrip ? 'Değişiklikleri Kaydet' : 'Günü Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
