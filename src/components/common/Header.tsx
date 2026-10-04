import React from 'react';
import { Fuel, Plus, Sun, Moon, Cloud, RefreshCw, Car } from 'lucide-react';
import { Driver, CarSettings } from '../../types';
import { DRIVER_CONFIG } from '../../utils/duelAnalytics';
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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo and Car Info */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Yakıt Düellosu
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Car className="w-3 h-3 mr-1 text-slate-400" />
                {settings.plate || settings.carName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Utku & Gözde • Tüketim Takibi
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Driver Switcher Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => onSelectDriver('utku')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDriver === 'utku'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Aktif sürücüyü Utku yap"
            >
              <span>{DRIVER_CONFIG.utku.avatar}</span>
              <span className="hidden xs:inline">Utku</span>
            </button>
            <button
              onClick={() => onSelectDriver('gozde')}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDriver === 'gozde'
                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Aktif sürücüyü Gözde yap"
            >
              <span>{DRIVER_CONFIG.gozde.avatar}</span>
              <span className="hidden xs:inline">Gözde</span>
            </button>
          </div>

          {/* Quick Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenFuelModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <Fuel className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Benzin Fişi</span>
            </button>

            <button
              onClick={onOpenTripModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gün Kaydet</span>
            </button>
          </div>

          {/* Cloud Sync Status / Button */}
          {hasCloudSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-800 transition-colors relative"
              title={settings.lastSyncTime ? `Son Eşitleme: ${new Date(settings.lastSyncTime).toLocaleTimeString('tr-TR')}` : 'Bulut Eşitle'}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              ) : (
                <>
                  <Cloud className="w-4 h-4 text-emerald-500" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </>
              )}
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Açık Mod' : 'Karanlık Mod'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
