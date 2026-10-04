import React from 'react';
import { Swords, CalendarDays, Receipt, Settings, Plus } from 'lucide-react';

export type ActiveTab = 'duel' | 'trips' | 'refuels' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTripModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenTripModal,
}) => {
  const tabs = [
    { id: 'duel' as ActiveTab, label: 'Düello', icon: Swords },
    { id: 'trips' as ActiveTab, label: 'Günlük Kayıtlar', icon: CalendarDays },
    { id: 'refuels' as ActiveTab, label: 'Benzin Fişleri', icon: Receipt },
    { id: 'settings' as ActiveTab, label: 'Ayarlar', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sub-Nav Header Tabs */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex space-x-1 py-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Fixed Nav Bar with FAB */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Left tabs: Düello & Günlük Kayıtlar */}
          <button
            onClick={() => onSelectTab('duel')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'duel' ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Swords className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Düello</span>
          </button>

          <button
            onClick={() => onSelectTab('trips')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'trips' ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Günlük</span>
          </button>

          {/* Center FAB: Gün Kaydet */}
          <div className="flex items-center justify-center px-1">
            <button
              onClick={onOpenTripModal}
              className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Günün Kaydını Ekle"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Right tabs: Benzin Fişleri & Ayarlar */}
          <button
            onClick={() => onSelectTab('refuels')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'refuels' ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Fişler</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'settings' ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Ayarlar</span>
          </button>
        </div>
      </nav>
    </>
  );
};
