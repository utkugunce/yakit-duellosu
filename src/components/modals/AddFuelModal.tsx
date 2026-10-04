import React, { useState, useEffect } from 'react';
import { X, Fuel, CreditCard, CheckCircle2 } from 'lucide-react';
import { Driver, FuelPurchaseRecord, CarSettings } from '../../types';
import { DRIVER_CONFIG } from '../../utils/duelAnalytics';

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
  const [driver, setDriver] = useState<Driver>(settings.activeDriver);
  const [paidBy, setPaidBy] = useState<Driver | 'shared'>(settings.activeDriver);
  const [date, setDate] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>(settings.currentFuelPrice.toString());
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [odometer, setOdometer] = useState<string>('');
  const [station, setStation] = useState<string>('Shell');
  const [fullTank, setFullTank] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingRefuel) {
        setDriver(editingRefuel.driver);
        setPaidBy(editingRefuel.paidBy);
        setDate(editingRefuel.date);
        setLiters(editingRefuel.liters.toString());
        setPricePerLiter(editingRefuel.pricePerLiter.toString());
        setTotalAmount(editingRefuel.totalAmount.toString());
        setOdometer(editingRefuel.odometer.toString());
        setStation(editingRefuel.station);
        setFullTank(editingRefuel.fullTank);
        setNotes(editingRefuel.notes || '');
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setDate(`${year}-${month}-${day}T${hours}:${mins}`);

        setDriver(settings.activeDriver);
        setPaidBy(settings.activeDriver);
        setLiters('');
        setPricePerLiter(settings.currentFuelPrice.toString());
        setTotalAmount('');
        setOdometer(lastOdometer > 0 ? lastOdometer.toString() : '');
        setStation('Shell');
        setFullTank(true);
        setNotes('');
      }
    }
  }, [isOpen, editingRefuel, lastOdometer, settings]);

  // Handle auto-calculating total amount from liters and price
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const numL = parseFloat(val);
    const numP = parseFloat(pricePerLiter);
    if (!isNaN(numL) && !isNaN(numP) && numL > 0 && numP > 0) {
      setTotalAmount((Math.round(numL * numP * 100) / 100).toString());
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const numL = parseFloat(liters);
    const numP = parseFloat(val);
    if (!isNaN(numL) && !isNaN(numP) && numL > 0 && numP > 0) {
      setTotalAmount((Math.round(numL * numP * 100) / 100).toString());
    }
  };

  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    const numT = parseFloat(val);
    const numP = parseFloat(pricePerLiter);
    if (!isNaN(numT) && !isNaN(numP) && numT > 0 && numP > 0) {
      setLiters((Math.round((numT / numP) * 100) / 100).toString());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numL = parseFloat(liters);
    const numP = parseFloat(pricePerLiter);
    const numT = parseFloat(totalAmount) || (numL * numP);
    const numOdo = parseFloat(odometer) || lastOdometer;

    if (isNaN(numL) || numL <= 0) {
      alert('Lütfen geçerli bir yakıt litresi girin!');
      return;
    }

    if (isNaN(numP) || numP <= 0) {
      alert('Lütfen geçerli bir litre fiyatı girin!');
      return;
    }

    const refuel: FuelPurchaseRecord = {
      id: editingRefuel ? editingRefuel.id : `fuel-${Date.now()}`,
      driver,
      paidBy,
      date,
      liters: Math.round(numL * 100) / 100,
      pricePerLiter: Math.round(numP * 100) / 100,
      totalAmount: Math.round(numT * 100) / 100,
      odometer: numOdo,
      station,
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
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRefuel ? 'Yakıt Alımını Düzenle' : 'Yakıt Alımı / Depo Doldurma'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alınan benzin ve ödeme detaylarını kaydedin
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
          {/* Driver & Payer */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Depoyu Kim Doldurdu?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDriver('utku')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    driver === 'utku'
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{DRIVER_CONFIG.utku.avatar}</span>
                  <span>Utku</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDriver('gozde')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    driver === 'gozde'
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-700 dark:text-pink-300 ring-1 ring-pink-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{DRIVER_CONFIG.gozde.avatar}</span>
                  <span>Gözde</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Ödemeyi Kim Yaptı? (Masraf Bölüşümü İçin)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaidBy('utku')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                    paidBy === 'utku'
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 font-semibold ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Utku Ödedi
                </button>
                <button
                  type="button"
                  onClick={() => setPaidBy('gozde')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                    paidBy === 'gozde'
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-700 dark:text-pink-300 font-semibold ring-1 ring-pink-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Gözde Ödedi
                </button>
                <button
                  type="button"
                  onClick={() => setPaidBy('shared')}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                    paidBy === 'shared'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Ortak (50%-50%)
                </button>
              </div>
            </div>
          </div>

          {/* Liters, Price, and Total */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  Alınan Miktar (Litre)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={liters}
                    onChange={e => handleLitersChange(e.target.value)}
                    placeholder="Örn: 35.5"
                    className="w-full px-3 py-2 pr-8 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400">L</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  Litre Fiyatı (TL/L)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={pricePerLiter}
                    onChange={e => handlePriceChange(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-2.5 top-2 text-xs text-slate-400">TL</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                Toplam Tutar (TL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={totalAmount}
                  onChange={e => handleTotalChange(e.target.value)}
                  placeholder="Örn: 1590"
                  className="w-full px-3 py-2 pr-10 text-base font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">₺</span>
              </div>
            </div>
          </div>

          {/* Station and Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yakıt İstasyonu
              </label>
              <input
                type="text"
                value={station}
                onChange={e => setStation(e.target.value)}
                placeholder="Örn: Shell"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {POPULAR_STATIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStation(s)}
                    className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alım Anındaki Araç KM
              </label>
              <input
                type="number"
                step="any"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
                placeholder={lastOdometer > 0 ? lastOdometer.toString() : '45350'}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Depo tüketim doğrulaması için önerilir
              </p>
            </div>
          </div>

          {/* Full Tank Toggle */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              id="fullTankCheckbox"
              checked={fullTank}
              onChange={e => setFullTank(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
            />
            <label htmlFor="fullTankCheckbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <span className="font-semibold">Depo fulllendi (Tabanca attı)</span>
              <span className="block text-[10px] text-slate-400">Gerçek depo tüketimini doğrulamak için kullanılır</span>
            </label>
          </div>

          {/* Date & Notes */}
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
                Not (Opsiyonel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Örn: Nakit ödendi / Fiş no"
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
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {editingRefuel ? 'Değişiklikleri Kaydet' : 'Yakıt Alımını Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
