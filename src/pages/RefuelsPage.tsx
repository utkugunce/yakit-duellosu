import React from 'react';
import { Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
            Benzin Fişleri
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            İstasyondan alınan yakıtlar ve pompa fiyatları
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Fiş Ekle</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Toplam Yakıt
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {totalLiters}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">L</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Toplam Tutar
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {totalSpent.toLocaleString('tr-TR')}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">TL</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mb-0.5">
            Ort. Fiyat
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
              {avgPricePerLiter}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">TL/L</span>
          </div>
        </div>
      </div>

      {/* Receipts Feed */}
      {sortedRefuels.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 text-center space-y-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Henüz kaydedilmiş bir benzin fişi yok.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>İlk Fişi Kaydet</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedRefuels.map(refuel => {
            return (
              <div
                key={refuel.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Station & Date */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                        {refuel.station || 'İstasyon'}
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {new Date(refuel.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center gap-2 flex-wrap">
                      <span>Pompa: {refuel.pricePerLiter} TL/L</span>
                      {refuel.odometer && refuel.odometer > 0 && (
                        <>
                          <span>•</span>
                          <span>Sayaç: {refuel.odometer.toLocaleString('tr-TR')} km</span>
                        </>
                      )}
                      {refuel.fullTank && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Tam Depo
                          </span>
                        </>
                      )}
                    </div>

                    {refuel.notes && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic pt-0.5">
                        "{refuel.notes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Liters & Total Amount */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 dark:text-white tabular-nums">
                        {refuel.liters}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">Litre</span>
                    </div>

                    <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                      {refuel.totalAmount.toLocaleString('tr-TR')} ₺
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => onEditRefuel(refuel)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Bu benzin fişi kaydını silmek istediğinizden emin misiniz?')) {
                            onDeleteRefuel(refuel.id);
                          }
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
