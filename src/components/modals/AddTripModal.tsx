import React, { useState, useEffect } from 'react';
import { X, Fuel, Plus, Minus, ArrowRight } from 'lucide-react';
import { Driver, DailyLog, CarSettings } from '../../types';

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
  const baseOdometer = editingTrip
    ? editingTrip.startOdometer
    : lastOdometer > 0
    ? lastOdometer
    : 45000;

  const [driver, setDriver] = useState<Driver>(settings.activeDriver);
  const [date, setDate] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [carOdometer, setCarOdometer] = useState<string>('');
  const [avgConsumption, setAvgConsumption] = useState<string>('6.5');
  const [fuelPrice, setFuelPrice] = useState<string>(settings.currentFuelPrice.toString());
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingTrip) {
        setDriver(editingTrip.driver);
        setDate(editingTrip.date.slice(0, 10));
        setDistance(editingTrip.distance.toString());
        setCarOdometer(editingTrip.endOdometer.toString());
        setAvgConsumption(editingTrip.avgConsumption.toString());
        setFuelPrice(editingTrip.fuelPrice.toString());
        setNotes(editingTrip.notes || '');
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
        setDriver(settings.activeDriver);
        setDistance('');
        setCarOdometer('');
        setAvgConsumption('6.5');
        setFuelPrice(settings.currentFuelPrice.toString());
        setNotes('');
      }
    }
  }, [isOpen, editingTrip, lastOdometer, settings]);

  if (!isOpen) return null;

  const handleDistanceChange = (val: string) => {
    setDistance(val);
    const numDist = parseFloat(val);
    if (!isNaN(numDist) && numDist > 0 && baseOdometer > 0) {
      setCarOdometer((baseOdometer + numDist).toString());
    }
  };

  const handleCarOdometerChange = (val: string) => {
    setCarOdometer(val);
    const numCar = parseFloat(val);
    if (!isNaN(numCar) && numCar > baseOdometer) {
      setDistance((Math.round((numCar - baseOdometer) * 10) / 10).toString());
    }
  };

  const calculatedDistance = parseFloat(distance) || 0;
  const numConsumption = parseFloat(avgConsumption) || 0;
  const numPrice = parseFloat(fuelPrice) || settings.currentFuelPrice;

  const fuelConsumed = Math.round(((calculatedDistance * numConsumption) / 100) * 100) / 100;
  const fuelCost = Math.round(fuelConsumed * numPrice * 100) / 100;
  const costPerKm = calculatedDistance > 0 ? Math.round((fuelCost / calculatedDistance) * 100) / 100 : 0;

  const handleStepConsumption = (delta: number) => {
    const current = parseFloat(avgConsumption) || 6.5;
    const next = Math.max(1.0, Math.min(25.0, Math.round((current + delta) * 10) / 10));
    setAvgConsumption(next.toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (calculatedDistance <= 0) {
      alert('Lütfen bugün yapılan mesafeyi (KM) girin!');
      return;
    }

    if (numConsumption <= 0) {
      alert('Lütfen gün sonu ortalama tüketimini girin (L/100km)!');
      return;
    }

    const finalEndOdo = carOdometer ? parseFloat(carOdometer) : baseOdometer + calculatedDistance;
    const finalStartOdo = editingTrip ? editingTrip.startOdometer : baseOdometer;

    const trip: DailyLog = {
      id: editingTrip ? editingTrip.id : `day-${Date.now()}`,
      driver,
      date,
      startOdometer: finalStartOdo,
      endOdometer: finalEndOdo,
      distance: calculatedDistance,
      avgConsumption: numConsumption,
      fuelPrice: numPrice,
      fuelConsumed,
      fuelCost,
      costPerKm,
      notes: notes.trim() || undefined,
      createdAt: editingTrip?.createdAt || new Date().toISOString(),
    };

    onSave(trip);
    onClose();
  };

  const consumptionPresets = ['5.8', '6.2', '6.5', '7.0', '7.6'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white dark:bg-neutral-900 rounded-t-[28px] sm:rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-sheet-up sm:animate-slide-up z-10">
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              {editingTrip ? 'Günlük Kaydı Düzenle' : 'Gün Sonu Kaydı'}
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Bugün yapılan km ve ortalama tüketim
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 pb-safe">
          {/* Driver Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Bugün Arabayı Kim Kullandı?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDriver('utku')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  driver === 'utku'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Utku</span>
              </button>

              <button
                type="button"
                onClick={() => setDriver('gozde')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  driver === 'gozde'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Gözde</span>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Tarih
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white font-medium outline-none focus:border-neutral-900 dark:focus:border-white"
            />
          </div>

          {/* Distance & Car Odometer with Auto-Calculation */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Kilometre & Mesafe
              </span>
              {baseOdometer > 0 && (
                <span className="text-[11px] font-mono text-neutral-400">
                  Önceki: {baseOdometer.toLocaleString('tr-TR')} km
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                  Yapılan Yol (KM) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    required
                    value={distance}
                    onChange={e => handleDistanceChange(e.target.value)}
                    placeholder="35.0"
                    className="w-full px-3 py-2 text-xs font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] font-mono text-neutral-400">km</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                  Araç Kilometresi *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    value={carOdometer}
                    onChange={e => handleCarOdometerChange(e.target.value)}
                    placeholder={baseOdometer > 0 ? (baseOdometer + 35).toString() : '45035'}
                    className="w-full px-3 py-2 text-xs font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] font-mono text-neutral-400">km</span>
                </div>
              </div>
            </div>

            {calculatedDistance > 0 && (
              <div className="text-right text-[11px] text-neutral-500 dark:text-neutral-400">
                Bugün yapılan: <strong className="text-neutral-900 dark:text-white font-mono">{calculatedDistance} km</strong>
              </div>
            )}
          </div>

          {/* Average Fuel Consumption Stepper */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Yol Bilgisayarı Ortalaması (L/100km)
              </label>
              <span className="text-[11px] font-mono text-neutral-400">Gösterge</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepConsumption(-0.1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                title="-0.1 Azalt"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  required
                  value={avgConsumption}
                  onChange={e => setAvgConsumption(e.target.value)}
                  className="w-full text-center py-2 text-xl font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono text-neutral-400 pointer-events-none">L/100km</span>
              </div>

              <button
                type="button"
                onClick={() => handleStepConsumption(0.1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:scale-95 transition-all"
                title="+0.1 Artır"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {consumptionPresets.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAvgConsumption(val)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                    avgConsumption === val
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/80'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Live Summary Preview Card */}
          {calculatedDistance > 0 && numConsumption > 0 && (
            <div className="p-3 rounded-xl bg-neutral-900 text-white dark:bg-neutral-800/80 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Yaklaşık: <strong className="text-white font-mono">{fuelConsumed} Litre</strong>
                </span>
              </div>
              <div className="font-mono font-bold text-emerald-400">
                ~{fuelCost.toLocaleString('tr-TR')} ₺ ({costPerKm} ₺/km)
              </div>
            </div>
          )}

          {/* Notes (Optional) */}
          <div>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Günün notu (opsiyonel: köprü trafiği, yağmur vb.)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
            />
          </div>

          {/* Sticky Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{editingTrip ? 'Değişiklikleri Kaydet' : 'Günün Kaydını Tamamla'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
