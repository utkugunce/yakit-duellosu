import React, { useState, useEffect } from 'react';
import { X, Fuel, Receipt, CheckCircle2, Building2 } from 'lucide-react';
import { FuelPurchaseRecord, CarSettings } from '../../types';

const POPULAR_STATIONS = ['Shell', 'Opet', 'BP', 'Petrol Ofisi', 'Total', 'TP'];

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (refuel: FuelPurchaseRecord) => void;
  editingRefuel?: FuelPurchaseRecord | null;
  lastOdometer: number;
  settings: CarSettings;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRefuel,
  lastOdometer,
  settings,
}) => {
  const [date, setDate] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>(settings.currentFuelPrice.toString());
  const [station, setStation] = useState<string>('Shell');
  const [odometer, setOdometer] = useState<string>('');
  const [fullTank, setFullTank] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingRefuel) {
        setDate(editingRefuel.date);
        setLiters(editingRefuel.liters.toString());
        setTotalAmount(editingRefuel.totalAmount.toString());
        setPricePerLiter(editingRefuel.pricePerLiter.toString());
        setStation(editingRefuel.station || 'Shell');
        setOdometer(editingRefuel.odometer ? editingRefuel.odometer.toString() : '');
        setFullTank(editingRefuel.fullTank ?? true);
        setNotes(editingRefuel.notes || '');
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setDate(`${year}-${month}-${day}T${hours}:${mins}`);

        setLiters('');
        setTotalAmount('');
        setPricePerLiter(settings.currentFuelPrice.toString());
        setStation('Shell');
        setOdometer(lastOdometer > 0 ? lastOdometer.toString() : '');
        setFullTank(true);
        setNotes('');
      }
    }
  }, [isOpen, editingRefuel, lastOdometer, settings]);

  // When Liters changes, update Total based on price
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const numL = parseFloat(val);
    const numP = parseFloat(pricePerLiter);
    if (!isNaN(numL) && !isNaN(numP) && numL > 0 && numP > 0) {
      setTotalAmount((Math.round(numL * numP * 100) / 100).toFixed(2));
    }
  };

  // When Total Amount changes (directly from receipt), calculate Liters or Price
  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    const numT = parseFloat(val);
    const numL = parseFloat(liters);
    const numP = parseFloat(pricePerLiter);

    if (!isNaN(numT) && numT > 0) {
      if (!isNaN(numL) && numL > 0) {
        // If liters already entered, calculate exact price per liter on receipt
        setPricePerLiter((Math.round((numT / numL) * 100) / 100).toFixed(2));
      } else if (!isNaN(numP) && numP > 0) {
        // If price known, calculate liters
        setLiters((Math.round((numT / numP) * 100) / 100).toFixed(2));
      }
    }
  };

  // When Price per liter changes
  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const numL = parseFloat(liters);
    const numP = parseFloat(val);
    if (!isNaN(numL) && !isNaN(numP) && numL > 0 && numP > 0) {
      setTotalAmount((Math.round(numL * numP * 100) / 100).toFixed(2));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numL = parseFloat(liters);
    const numT = parseFloat(totalAmount);
    const numP = parseFloat(pricePerLiter) || (numT / numL);
    const numOdo = parseFloat(odometer) || undefined;

    if (isNaN(numL) || numL <= 0) {
      alert('Lütfen fişte yazan yakıt miktarını (Litre) girin!');
      return;
    }

    if (isNaN(numT) || numT <= 0) {
      alert('Lütfen fişte yazan toplam tutarı (TL) girin!');
      return;
    }

    const refuel: FuelPurchaseRecord = {
      id: editingRefuel ? editingRefuel.id : `fuel-${Date.now()}`,
      date,
      liters: Math.round(numL * 100) / 100,
      totalAmount: Math.round(numT * 100) / 100,
      pricePerLiter: Math.round(numP * 100) / 100,
      station: station.trim() || 'Benzinlik',
      odometer: numOdo,
      fullTank,
      notes: notes.trim(),
      createdAt: editingRefuel ? editingRefuel.createdAt : new Date().toISOString(),
    };

    onSave(refuel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRefuel ? 'Benzin Fişini Düzenle' : 'Benzin Fişi Kaydet'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fişteki litre, toplam tutar ve istasyon bilgilerini girin
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
          {/* Main Receipt Inputs (Liters & Total TL) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Liters */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alınan Benzin (Litre)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={liters}
                    onChange={e => handleLitersChange(e.target.value)}
                    placeholder="Örn: 35.50"
                    className="w-full px-3.5 py-2.5 pr-10 text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">L</span>
                </div>
              </div>

              {/* Total TL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Toplam Tutar (TL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={totalAmount}
                    onChange={e => handleTotalChange(e.target.value)}
                    placeholder="Örn: 1590.00"
                    className="w-full px-3.5 py-2.5 pr-10 text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">₺</span>
                </div>
              </div>
            </div>

            {/* Litre Price calculated / display */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Pompa Litre Fiyatı:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={pricePerLiter}
                  onChange={e => handlePriceChange(e.target.value)}
                  className="w-24 px-2 py-1 text-xs font-bold text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
                <span className="text-slate-400 font-medium">TL/L</span>
              </div>
            </div>
          </div>

          {/* Station Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Benzin İstasyonu / Marka</span>
            </label>
            <input
              type="text"
              value={station}
              onChange={e => setStation(e.target.value)}
              placeholder="Örn: Shell"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_STATIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStation(s)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    station === s
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date and KM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fiş Tarihi ve Saati
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alım Anındaki Araç KM (Opsiyonel)
              </label>
              <input
                type="number"
                step="any"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
                placeholder={lastOdometer > 0 ? lastOdometer.toString() : 'Örn: 45450'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Full tank toggle */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              id="fullTankToggle"
              checked={fullTank}
              onChange={e => setFullTank(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
            />
            <label htmlFor="fullTankToggle" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <span className="font-semibold">Depo fulllendi (Tabanca attı)</span>
            </label>
          </div>

          {/* Notes / Receipt No */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fiş No / Not (Opsiyonel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Örn: Fiş no: 0142 veya kredi kartı fişi"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {editingRefuel ? 'Değişiklikleri Kaydet' : 'Benzin Fişini Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
