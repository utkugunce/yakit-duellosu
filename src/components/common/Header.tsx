import React from 'react';
import { Sun, Moon, Cloud, RefreshCw, Car } from 'lucide-react';
import { Driver, CarSettings } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabaseSync';

interface HeaderProps {
  settings: CarSettings;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSelectDriver: (driver: Driver) => void;
  onOpenTripModal: () => void;
  onOpenFuelModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isDarkMode,
  onToggleTheme,
  onSelectDriver,
  onOpenTripModal,
  onOpenFuelModal,
  onSync,
  isSyncing,
}) => {
  const activeDriver = settings.activeDriver;
  const hasCloudSync = isSupabaseConfigured(settings);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-[#09090b]/85 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Car Plate */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0 shadow-sm">
            <span className="font-mono text-xs font-bold tracking-tighter">YD</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-900 dark:text-white truncate">
                Yakıt Düellosu
              </span>
              {hasCloudSync && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                  title="Supabase Bulut Senkronizasyonu Aktif"
                />
              )}
            </div>

            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 truncate flex items-center gap-1">
              <Car className="w-3 h-3 text-neutral-400 shrink-0" />
              <span>{settings.plate || settings.carName}</span>
            </span>
          </div>
        </div>

        {/* Right: Driver Toggle & Quick Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* iOS Segmented Driver Pill */}
          <div className="inline-flex p-0.5 rounded-xl bg-neutral-200/70 dark:bg-neutral-800/80 border border-neutral-300/40 dark:border-neutral-700/40">
            <button
              type="button"
              onClick={() => onSelectDriver('utku')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-xs font-medium transition-all ${
                activeDriver === 'utku'
                  ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 shadow-sm font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              <span>Utku</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDriver('gozde')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-xs font-medium transition-all ${
                activeDriver === 'gozde'
                  ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Gözde</span>
            </button>
          </div>

          {/* Cloud Sync trigger */}
          {hasCloudSync && (
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
              title="Bulut Verilerini Eşitle"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          )}

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
            title={isDarkMode ? 'Açık Mod' : 'Karanlık Mod'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
