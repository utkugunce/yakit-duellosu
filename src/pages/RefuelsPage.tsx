import React from 'react';
import { Fuel, Plus, Calendar, DollarSign, CreditCard, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { FuelPurchaseRecord } from '../types';
import { DRIVER_CONFIG } from '../utils/duelAnalytics';

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
  const utkuPaid = Math.round(
    refuels.reduce((acc, r) => (r.paidBy === 'utku' ? acc + r.totalAmount : r.paidBy === 'shared' ? acc + r.totalAmount / 2 : acc), 0)
  );
  const gozdePaid = Math.round(
    refuels.reduce((acc, r) => (r.paidBy === 'gozde' ? acc + r.totalAmount : r.paidBy === 'shared' ? acc + r.totalAmount / 2 : acc), 0)
  );

  const sortedRefuels = [...refuels].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Yakıt Alımları & Depo Takibi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Benzinlik harcamaları, fişler ve ödeme bölüşümü
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yakıt Alımı Ekle</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Toplam Harcanan
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {totalSpent.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">₺</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Toplam Alınan Yakıt
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalLiters.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">L</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 block mb-1">
            👨‍💻 Utku'nun Ödediği
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {utkuPaid.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">₺</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 block mb-1">
            👩‍💼 Gözde'nin Ödediği
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {gozdePaid.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">₺</span>
          </span>
        </div>
      </div>

      {/* Refuel List */}
      {sortedRefuels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Fuel className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Henüz yakıt alımı kaydedilmedi
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Benzin aldığınızda fişi kaydederek masrafların kimin tarafından ödendiğini takip edebilirsiniz.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Yakıt Alımını Ekle</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRefuels.map(refuel => {
            const isUtkuPayer = refuel.paidBy === 'utku';
            const isGozdePayer = refuel.paidBy === 'gozde';

            return (
              <div
                key={refuel.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {refuel.station || 'Benzinlik'}
                      </h4>

                      {/* Paid by chip */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isUtkuPayer
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : isGozdePayer
                            ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isUtkuPayer ? 'Utku Ödedi' : isGozdePayer ? 'Gözde Ödedi' : 'Ortak (50%-50%)'}
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

                      {refuel.odometer > 0 && (
                        <>
                          <span>•</span>
                          <span>KM: {refuel.odometer.toLocaleString('tr-TR')}</span>
                        </>
                      )}

                      <span>•</span>
                      <span>
                        {refuel.liters} Litre @ {refuel.pricePerLiter} TL/L
                      </span>
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
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
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
                          if (window.confirm('Bu yakıt alım kaydını silmek istediğinizden emin misiniz?')) {
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
