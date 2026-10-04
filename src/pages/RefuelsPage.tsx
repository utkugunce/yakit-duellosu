import React from 'react';
import { Fuel, Plus, Calendar, Trash2, Edit2, CheckCircle2, Receipt, Gauge } from 'lucide-react';
import { FuelPurchaseRecord } from '../types';

interface RefuelsPageProps {
  refuels: FuelPurchaseRecord[];
  onOpenAddModal: () => void;
  onEditRefuel: (refuel: FuelPurchaseRecord) => void;
  onDeleteRefuel: (refuelId: string) => void;
}

export const RefuelsPage: React.FC<RefuelsPageProps> = ({
  refuels,
  onOpenAddModal,
  onEditRefuel,
  onDeleteRefuel,
}) => {
  const totalSpent = Math.round(refuels.reduce((acc, r) => acc + r.totalAmount, 0));
  const totalLiters = Math.round(refuels.reduce((acc, r) => acc + r.liters, 0) * 10) / 10;
  const avgPricePerLiter = totalLiters > 0 ? (Math.round((totalSpent / totalLiters) * 100) / 100).toFixed(2) : '0';

  const sortedRefuels = [...refuels].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Alınan Benzin & Fiş Kayıtları
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Benzinlikten alınan yakıt fişleri ve toplam harcamalar
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Benzin Fişi Ekle</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Toplam Alınan Benzin
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalLiters.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">L</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Toplam Benzin Harcaması
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {totalSpent.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">₺</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Ortalama Litre Fiyatı
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {avgPricePerLiter} <span className="text-xs font-normal text-slate-400">TL/L</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Kayıtlı Fiş Sayısı
          </span>
          <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
            {refuels.length} <span className="text-xs font-normal text-slate-400">Adet</span>
          </span>
        </div>
      </div>

      {/* Refuel List */}
      {sortedRefuels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Henüz benzin fişi kaydedilmedi
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Benzin aldığınızda fişteki litre ve tutarı kaydederek araca ne kadar yakıt alındığını takip edebilirsiniz.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Fişi Ekle</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRefuels.map(refuel => {
            return (
              <div
                key={refuel.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {refuel.station || 'Benzinlik'}
                      </h4>

                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {refuel.liters} Litre
                      </span>

                      {refuel.fullTank && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Tam Depo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(refuel.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span>•</span>
                      <span>
                        Litre Fiyatı: {refuel.pricePerLiter} TL/L
                      </span>

                      {refuel.odometer && refuel.odometer > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            {refuel.odometer.toLocaleString('tr-TR')} km
                          </span>
                        </>
                      )}
                    </div>

                    {refuel.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{refuel.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                        {refuel.totalAmount.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditRefuel(refuel)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Bu benzin fişi kaydını silmek istediğinizden emin misiniz?')) {
                            onDeleteRefuel(refuel.id);
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
