import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TripRecord, FuelPurchaseRecord, CarSettings, Driver, ThemeMode
} from './types';
import {
  loadTripsFromStorage, saveTripsToStorage,
  loadRefuelsFromStorage, saveRefuelsToStorage,
  loadSettingsFromStorage, saveSettingsToStorage
} from './lib/storage';
import {
  uploadToSupabase, downloadFromSupabase,
  getSupabaseConfig, isSupabaseConfigured,
  subscribeToSupabaseChanges
} from './lib/supabaseSync';
import { Header } from './components/common/Header';
import { Navigation, ActiveTab } from './components/common/Navigation';
import { ToastProvider, useToast } from './components/common/Toast';
import { AddTripModal } from './components/modals/AddTripModal';
import { AddFuelModal } from './components/modals/AddFuelModal';

// Pages
import { DuelDashboardPage } from './pages/DuelDashboardPage';
import { TripsPage } from './pages/TripsPage';
import { RefuelsPage } from './pages/RefuelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { getEffectiveFuelPrice, formatKm } from './utils/duelAnalytics';

function AppContent() {
  const { showToast } = useToast();

  const [trips, setTrips] = useState<TripRecord[]>(() => loadTripsFromStorage());
  const [refuels, setRefuels] = useState<FuelPurchaseRecord[]>(() => loadRefuelsFromStorage());
  const [settings, setSettings] = useState<CarSettings>(() => loadSettingsFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('duel');

  // Modals state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripRecord | null>(null);

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [editingRefuel, setEditingRefuel] = useState<FuelPurchaseRecord | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('yakit_duellosu_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode to <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yakit_duellosu_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yakit_duellosu_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Keep localStorage updated
  const updateTrips = useCallback((newTrips: TripRecord[]) => {
    setTrips(newTrips);
    saveTripsToStorage(newTrips);
  }, []);

  const updateRefuels = useCallback((newRefuels: FuelPurchaseRecord[]) => {
    setRefuels(newRefuels);
    saveRefuelsToStorage(newRefuels);
  }, []);

  const updateSettings = useCallback((newSettings: CarSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  }, []);

  // Compute latest odometer
  const lastOdometer = useMemo(() => {
    let maxOdo = 0;
    for (const t of trips) {
      if (t.endOdometer > maxOdo) maxOdo = t.endOdometer;
    }
    for (const r of refuels) {
      if (r.odometer && r.odometer > maxOdo) maxOdo = r.odometer;
    }
    return maxOdo;
  }, [trips, refuels]);

  // Compute effective fuel price (from latest refuel or fallback 84.80)
  const effectiveFuelPrice = useMemo(() => {
    return getEffectiveFuelPrice(refuels, settings.currentFuelPrice || 84.80);
  }, [refuels, settings.currentFuelPrice]);

  // Automatic Supabase Hydration & Realtime Subscription
  useEffect(() => {
    const { url, key } = getSupabaseConfig(settings);
    if (!url || !key) return;

    // 1. Initial silent sync on mount
    downloadFromSupabase(url, key).then(result => {
      const data = result.data;
      if (result.success && data) {
        if (data.trips && data.trips.length > 0) updateTrips(data.trips);
        if (data.refuels && data.refuels.length > 0) updateRefuels(data.refuels);
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings, lastSyncTime: new Date().toISOString() }));
        }
      }
    });

    // 2. Realtime subscription: auto-update when the other driver adds/modifies logs
    const unsubscribe = subscribeToSupabaseChanges(url, key, data => {
      if (data.trips) updateTrips(data.trips);
      if (data.refuels) updateRefuels(data.refuels);
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings, lastSyncTime: new Date().toISOString() }));
      }
      showToast('Buluttan yeni kayıtlar anlık olarak güncellendi! ☁️', 'info');
    });

    // 3. Tab visibility listener (refresh when returning to tab on phone)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        downloadFromSupabase(url, key).then(result => {
          const data = result.data;
          if (result.success && data) {
            if (data.trips && data.trips.length > 0) updateTrips(data.trips);
            if (data.refuels && data.refuels.length > 0) updateRefuels(data.refuels);
          }
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.supabaseUrl, settings.supabaseKey, updateTrips, updateRefuels]);

  // Handle active driver switch
  const handleSelectDriver = (driver: Driver) => {
    const updated = { ...settings, activeDriver: driver };
    updateSettings(updated);
    showToast(`Aktif sürücü ${driver === 'utku' ? 'Utku 👨‍💻' : 'Gözde 👩‍💼'} olarak seçildi.`, 'info');
  };

  // Trip save handler
  const handleSaveTrip = (trip: TripRecord) => {
    let nextTrips: TripRecord[];
    if (editingTrip) {
      nextTrips = trips.map(t => (t.id === trip.id ? trip : t));
      showToast('Günün kaydı güncellendi!', 'success');
    } else {
      nextTrips = [trip, ...trips];
      showToast(`Günün kaydı eklendi (${formatKm(trip.distance)} km, ${trip.avgConsumption} L/100km)`, 'success');
    }
    updateTrips(nextTrips);
    setEditingTrip(null);

    // Auto-sync if configured
    const { url, key } = getSupabaseConfig(settings);
    if (url && key) {
      handleSyncUploadSilent(nextTrips, refuels, settings);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    const nextTrips = trips.filter(t => t.id !== tripId);
    updateTrips(nextTrips);
    showToast('Gün kaydı silindi.', 'info');

    const { url, key } = getSupabaseConfig(settings);
    if (url && key) {
      handleSyncUploadSilent(nextTrips, refuels, settings);
    }
  };

  // Refuel save handler
  const handleSaveRefuel = (refuel: FuelPurchaseRecord) => {
    let nextRefuels: FuelPurchaseRecord[];
    if (editingRefuel) {
      nextRefuels = refuels.map(r => (r.id === refuel.id ? refuel : r));
      showToast('Yakıt alım kaydı güncellendi!', 'success');
    } else {
      nextRefuels = [refuel, ...refuels];
      showToast(`Yakıt alımı kaydedildi (${refuel.liters} L - ${refuel.totalAmount} ₺)`, 'success');
    }
    updateRefuels(nextRefuels);
    setEditingRefuel(null);

    const { url, key } = getSupabaseConfig(settings);
    if (url && key) {
      handleSyncUploadSilent(trips, nextRefuels, settings);
    }
  };

  const handleDeleteRefuel = (refuelId: string) => {
    const nextRefuels = refuels.filter(r => r.id !== refuelId);
    updateRefuels(nextRefuels);
    showToast('Yakıt alım kaydı silindi.', 'info');

    const { url, key } = getSupabaseConfig(settings);
    if (url && key) {
      handleSyncUploadSilent(trips, nextRefuels, settings);
    }
  };

  // Cloud Sync
  const handleSyncUpload = async () => {
    const { url, key } = getSupabaseConfig(settings);
    if (!url || !key) {
      showToast('Lütfen önce Ayarlar sekmesinden Supabase bilgilerinizi girin!', 'error');
      return;
    }

    setIsSyncing(true);
    const result = await uploadToSupabase(url, key, {
      trips,
      refuels,
      settings
    });
    setIsSyncing(false);

    if (result.success) {
      const now = new Date().toISOString();
      updateSettings({ ...settings, lastSyncTime: now });
      showToast('Veriler başarıyla buluta yüklendi!', 'success');
    } else {
      showToast(result.error || 'Buluta yükleme başarısız oldu.', 'error');
    }
  };

  const handleSyncUploadSilent = async (
    t: TripRecord[],
    r: FuelPurchaseRecord[],
    s: CarSettings
  ) => {
    const { url, key } = getSupabaseConfig(s);
    if (!url || !key) return;
    try {
      await uploadToSupabase(url, key, { trips: t, refuels: r, settings: s });
    } catch (err) {
      console.warn('Silent sync error:', err);
    }
  };

  const handleSyncDownload = async () => {
    const { url, key } = getSupabaseConfig(settings);
    if (!url || !key) {
      showToast('Lütfen önce Ayarlar sekmesinden Supabase bilgilerinizi girin!', 'error');
      return;
    }

    setIsSyncing(true);
    const result = await downloadFromSupabase(url, key);
    setIsSyncing(false);

    if (result.success && result.data) {
      updateTrips(result.data.trips);
      updateRefuels(result.data.refuels);
      if (result.data.settings) {
        updateSettings({ ...settings, ...result.data.settings, lastSyncTime: new Date().toISOString() });
      }
      showToast('En güncel veriler buluttan indirildi!', 'success');
    } else {
      showToast(result.error || 'Buluttan indirme başarısız oldu.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        settings={settings}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onSelectDriver={handleSelectDriver}
        onOpenTripModal={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onOpenFuelModal={() => {
          setEditingRefuel(null);
          setIsFuelModalOpen(true);
        }}
        onSync={handleSyncDownload}
        isSyncing={isSyncing}
      />

      {/* Navigation Subbar (Desktop tabs & Mobile bottom bar) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenTripModal={() => {
          setEditingTrip(null);
          setIsTripModalOpen(true);
        }}
        onOpenFuelModal={() => {
          setEditingRefuel(null);
          setIsFuelModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 pt-3 pb-24 md:pb-12">
        {activeTab === 'duel' && (
          <DuelDashboardPage
            trips={trips}
            refuels={refuels}
            onNavigateToTrips={() => setActiveTab('trips')}
          />
        )}

        {activeTab === 'trips' && (
          <TripsPage
            trips={trips}
            onOpenAddModal={() => {
              setEditingTrip(null);
              setIsTripModalOpen(true);
            }}
            onEditTrip={trip => {
              setEditingTrip(trip);
              setIsTripModalOpen(true);
            }}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {activeTab === 'refuels' && (
          <RefuelsPage
            refuels={refuels}
            onOpenAddModal={() => {
              setEditingRefuel(null);
              setIsFuelModalOpen(true);
            }}
            onEditRefuel={refuel => {
              setEditingRefuel(refuel);
              setIsFuelModalOpen(true);
            }}
            onDeleteRefuel={handleDeleteRefuel}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={updateSettings}
            trips={trips}
            refuels={refuels}
            onSetTrips={updateTrips}
            onSetRefuels={updateRefuels}
            onSyncUpload={handleSyncUpload}
            onSyncDownload={handleSyncDownload}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Trip Modal */}
      <AddTripModal
        isOpen={isTripModalOpen}
        onClose={() => {
          setIsTripModalOpen(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        editingTrip={editingTrip}
        lastOdometer={lastOdometer}
        settings={settings}
        effectiveFuelPrice={effectiveFuelPrice}
      />

      {/* Fuel Purchase Modal */}
      <AddFuelModal
        isOpen={isFuelModalOpen}
        onClose={() => {
          setIsFuelModalOpen(false);
          setEditingRefuel(null);
        }}
        onSave={handleSaveRefuel}
        editingRefuel={editingRefuel}
        lastOdometer={lastOdometer}
        settings={settings}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
