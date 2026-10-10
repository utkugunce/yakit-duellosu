import React, { useState, useEffect } from 'react';
import { X, Fuel, ArrowRight } from 'lucide-react';
import { Driver, DailyLog, CarSettings } from '../../types';
import { formatKm } from '../../utils/duelAnalytics';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: DailyLog) => void;
  editingTrip?: DailyLog | null;
  lastOdometer: number;
  settings: CarSettings;
  effectiveFuelPrice?: number;
}

export const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrip,
  lastOdometer,
  settings,
  effectiveFuelPrice = 84.80,
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
  const [avgSpeed, setAvgSpeed] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const activeFuelPrice = editingTrip?.fuelPrice || effectiveFuelPrice || settings.currentFuelPrice || 84.80;

  useEffect(() => {
    if (isOpen) {
      if (editingTrip) {
        setDriver(editingTrip.driver);
        setDate(editingTrip.date.slice(0, 10));
        setDistance(editingTrip.distance.toString());
        setCarOdometer(editingTrip.endOdometer.toString());
        setAvgConsumption(editingTrip.avgConsumption.toString());
        setAvgSpeed(editingTrip.avgSpeed ? editingTrip.avgSpeed.toString() : '');
        setNotes(editingTrip.notes || '');
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
        setDriver(settings.activeDriver);
        setDistance('');
        setCarOdometer('');
        setAvgConsumption('6.5');
        setAvgSpeed('');
        setNotes('');
      }
    }
  }, [isOpen, editingTrip, lastOdometer, settings]);

  if (!isOpen) return null;

  const handleDistanceChange = (val: string) => {
    setDistance(val);
    const numDist = parseFloat(val);
    if (!isNaN(numDist) && numDist > 0 && baseOdometer > 0) {
      setCarOdometer((Math.round((baseOdometer + numDist) * 10) / 10).toString());
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
  const numSpeed = avgSpeed ? parseFloat(avgSpeed) : undefined;

  const fuelConsumed = Math.round(((calculatedDistance * numConsumption) / 100) * 100) / 100;
  const fuelCost = Math.round(fuelConsumed * activeFuelPrice * 100) / 100;
  const costPerKm = calculatedDistance > 0 ? Math.round((fuelCost / calculatedDistance) * 100) / 100 : 0;

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
      avgSpeed: numSpeed && numSpeed > 0 ? numSpeed : undefined,
      fuelPrice: activeFuelPrice,
      fuelConsumed,
      fuelCost,
      costPerKm,
      notes: notes.trim() || undefined,
      createdAt: editingTrip?.createdAt || new Date().toISOString(),
    };

    onSave(trip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-sheet-up sm:animate-slide-up z-10">
        {/* Mobile Swipe Handle */}
        <div className="sm:hidden pt-2 pb-0.5 flex justify-center">
          <div className="w-8 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              {editingTrip ? 'Günlük Kaydı Düzenle' : 'Gün Sonu Kaydı'}
            </h2>
            <p className="text-[11px] text-neutral-400">
              Bugünkü kilometre ve yol bilgisayarı değerleri
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Ultra Compact */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1">
          {/* Driver & Date Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-0.5">
              <button
                type="button"
                onClick={() => setDriver('utku')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  driver === 'utku'
                    ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Utku</span>
              </button>
              <button
                type="button"
                onClick={() => setDriver('gozde')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  driver === 'gozde'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Gözde</span>
              </button>
            </div>

            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
            />
          </div>

          {/* Distance & Car Odometer Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
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
                  className="w-full pl-3 pr-8 py-2 text-xs font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-mono text-neutral-400">km</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  Araç KM *
                </label>
                {baseOdometer > 0 && (
                  <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[80px]">
                    Önce: {formatKm(baseOdometer)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  required
                  value={carOdometer}
                  onChange={e => handleCarOdometerChange(e.target.value)}
                  placeholder={baseOdometer > 0 ? (baseOdometer + 35).toString() : '45035'}
                  className="w-full pl-3 pr-8 py-2 text-xs font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                />
                <span className="absolute right-2.5 top-2 text-[10px] font-mono text-neutral-400">km</span>
              </div>
            </div>
          </div>

          {/* Average Consumption & Average Speed Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Ort. Tüketim (L/100km) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  required
                  value={avgConsumption}
                  onChange={e => setAvgConsumption(e.target.value)}
                  placeholder="6.5"
                  className="w-full pl-3 pr-14 py-2 text-xs font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                />
                <span className="absolute right-2 top-2 text-[10px] font-mono text-neutral-400">L/100km</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Ortalama Hız (km/h)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={avgSpeed}
                  onChange={e => setAvgSpeed(e.target.value)}
                  placeholder="Örn: 42"
                  className="w-full pl-3 pr-11 py-2 text-xs font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                />
                <span className="absolute right-2 top-2 text-[10px] font-mono text-neutral-400">km/h</span>
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Not (opsiyonel: köprü trafiği, klima vb.)"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
            />
          </div>

          {/* Live Summary Strip */}
          {calculatedDistance > 0 && numConsumption > 0 && (
            <div className="px-3 py-2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-800 border border-neutral-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Fuel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>~{fuelConsumed.toFixed(1)} L</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 text-[11px]">{activeFuelPrice.toFixed(2)} ₺/L</span>
              </div>
              <div className="font-bold text-emerald-400">
                ~{fuelCost.toLocaleString('tr-TR')} ₺ ({costPerKm.toFixed(2)} ₺/km)
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{editingTrip ? 'Değişiklikleri Kaydet' : 'Günün Kaydını Tamamla'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
