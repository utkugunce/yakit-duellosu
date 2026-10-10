import React, { useState, useEffect } from 'react';
import { X, Fuel, Receipt, Check, ArrowRight } from 'lucide-react';
import { FuelPurchaseRecord, CarSettings } from '../../types';

const POPULAR_STATIONS = ['Shell', 'Opet', 'Petrol Ofisi', 'BP', 'Total', 'Diğer'];

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

  if (!isOpen) return null;

  const handleLitersChange = (val: string) => {
    setLiters(val);
    const numL = parseFloat(val);
    const numP = parseFloat(pricePerLiter);
    if (!isNaN(numL) && !isNaN(numP) && numL > 0 && numP > 0) {
      setTotalAmount((Math.round(numL * numP * 100) / 100).toFixed(2));
    }
  };

  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    const numT = parseFloat(val);
    const numL = parseFloat(liters);
    const numP = parseFloat(pricePerLiter);

    if (!isNaN(numT) && numT > 0) {
      if (!isNaN(numL) && numL > 0) {
        setPricePerLiter((Math.round((numT / numL) * 100) / 100).toFixed(2));
      } else if (!isNaN(numP) && numP > 0) {
        setLiters((Math.round((numT / numP) * 100) / 100).toFixed(2));
      }
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const numL = parseFloat(liters);
    const numP = parseFloat(val);
    if (!isNaN(numL) && !isNaN(numP) && numL > 0 && numP > 0) {
      setTotalAmount((Math.round(numL * numP * 100) / 100).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numLiters = parseFloat(liters) || 0;
    const numTotal = parseFloat(totalAmount) || 0;
    const numPrice = parseFloat(pricePerLiter) || 0;

    if (numLiters <= 0) {
      alert('Lütfen fişteki alınan yakıt miktarını (Litre) girin!');
      return;
    }

    if (numTotal <= 0) {
      alert('Lütfen fişteki toplam tutarı (TL) girin!');
      return;
    }

    const refuel: FuelPurchaseRecord = {
      id: editingRefuel ? editingRefuel.id : `fuel-${Date.now()}`,
      date,
      liters: numLiters,
      totalAmount: numTotal,
      pricePerLiter: numPrice > 0 ? numPrice : Math.round((numTotal / numLiters) * 100) / 100,
      station: station.trim() || undefined,
      odometer: odometer ? parseFloat(odometer) : undefined,
      fullTank,
      notes: notes.trim() || undefined,
      createdAt: editingRefuel?.createdAt || new Date().toISOString(),
    };

    onSave(refuel);
    onClose();
  };

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
              {editingRefuel ? 'Fiş Kaydını Düzenle' : 'Benzin Fişi Kaydet'}
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Fişte yazan litre ve tutarı girin
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
          {/* Station Chips */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              İstasyon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_STATIONS.map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStation(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    station === st
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Liters & Total Amount side-by-side */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Alınan Yakıt (Litre) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    required
                    value={liters}
                    onChange={e => handleLitersChange(e.target.value)}
                    placeholder="35.5"
                    className="w-full px-3.5 py-2.5 text-base font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-mono text-neutral-400">L</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Ödenen Tutar (TL) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    required
                    value={totalAmount}
                    onChange={e => handleTotalChange(e.target.value)}
                    placeholder="1500"
                    className="w-full px-3.5 py-2.5 text-base font-bold font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-mono text-neutral-400">₺</span>
                </div>
              </div>
            </div>

            {/* Pump Unit Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Litre Pompa Fiyatı
                </span>
                <span className="text-[11px] font-mono text-neutral-400">TL / L</span>
              </div>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={pricePerLiter}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder="44.90"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Date & Current Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Tarih & Saat
              </label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Sayaç Kilometresi (Opsiyonel)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
                placeholder="Örn: 45200"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Full Tank Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                Tam Depo Dolduruldu mu?
              </span>
              <span className="text-[11px] text-neutral-400">
                Depo kapağı atana kadar doldurulduysa seçin
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFullTank(!fullTank)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                fullTank ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                  fullTank ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notes */}
          <div>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Fiş no veya not (opsiyonel)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{editingRefuel ? 'Fiş Kaydını Güncelle' : 'Fişi Kaydet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
