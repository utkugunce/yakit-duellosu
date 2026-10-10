import React, { useState } from 'react';
import { Gauge, CalendarDays, Receipt, SlidersHorizontal, Plus, Fuel } from 'lucide-react';

export type ActiveTab = 'duel' | 'trips' | 'refuels' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTripModal: () => void;
  onOpenFuelModal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenTripModal,
  onOpenFuelModal,
}) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const tabs = [
    { id: 'duel' as ActiveTab, label: 'Düello', icon: Gauge },
    { id: 'trips' as ActiveTab, label: 'Günlük', icon: CalendarDays },
    { id: 'refuels' as ActiveTab, label: 'Fişler', icon: Receipt },
    { id: 'settings' as ActiveTab, label: 'Ayarlar', icon: SlidersHorizontal },
  ];

  const handleActionClick = () => {
    if (onOpenFuelModal) {
      setIsActionMenuOpen(prev => !prev);
    } else {
      onOpenTripModal();
    }
  };

  return (
    <>
      {/* Desktop Top Sub-Navigation Tabs */}
      <div className="hidden md:block border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex space-x-1 py-1.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Quick Actions */}
          <div className="flex items-center gap-2">
            {onOpenFuelModal && (
              <button
                type="button"
                onClick={onOpenFuelModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                <span>Benzin Fişi</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenTripModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm hover:opacity-90 active:scale-98 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gün Kaydet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Sheet Backdrop */}
      {isActionMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsActionMenuOpen(false)}
        />
      )}

      {/* Mobile Quick Action Popup Menu */}
      {isActionMenuOpen && (
        <div className="md:hidden fixed bottom-24 inset-x-4 z-50 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl animate-sheet-up space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-2 py-0.5 uppercase tracking-wider">
            Yeni Kayıt Ekle
          </div>
          <button
            type="button"
            onClick={() => {
              setIsActionMenuOpen(false);
              onOpenTripModal();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Gün Kaydet</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Gün sonu kilometre ve ortalama tüketim</div>
            </div>
          </button>

          {onOpenFuelModal && (
            <button
              type="button"
              onClick={() => {
                setIsActionMenuOpen(false);
                onOpenFuelModal();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">Benzin Fişi Kaydet</div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">İstasyondan alınan litre ve tutar</div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Mobile Bottom Dock (Native iOS Tab Bar standard) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl border-t border-neutral-200/80 dark:border-neutral-800/80 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-5 items-center px-2 pt-2 pb-1 max-w-lg mx-auto">
          {/* Tab 1: Düello */}
          <button
            type="button"
            onClick={() => onSelectTab('duel')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'duel'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Gauge className={`w-5 h-5 transition-transform ${activeTab === 'duel' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Düello</span>
          </button>

          {/* Tab 2: Günlük Kayıtlar */}
          <button
            type="button"
            onClick={() => onSelectTab('trips')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'trips'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <CalendarDays className={`w-5 h-5 transition-transform ${activeTab === 'trips' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Günler</span>
          </button>

          {/* Center Elevated Action Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleActionClick}
              className={`w-11 h-11 -mt-3 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isActionMenuOpen
                  ? 'bg-neutral-800 text-white rotate-45'
                  : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-neutral-950/20'
              }`}
              title="Kayıt Ekle"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Benzin Fişleri */}
          <button
            type="button"
            onClick={() => onSelectTab('refuels')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'refuels'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Receipt className={`w-5 h-5 transition-transform ${activeTab === 'refuels' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Yakıt</span>
          </button>

          {/* Tab 4: Ayarlar */}
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'settings'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <SlidersHorizontal className={`w-5 h-5 transition-transform ${activeTab === 'settings' ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-1 tracking-tight">Ayarlar</span>
          </button>
        </div>
      </nav>
    </>
  );
};
