import React, { useState } from 'react';
import {
  Car, Cloud, Database, Download, Upload, RefreshCw,
  Check, Copy, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { CarSettings, TripRecord, FuelPurchaseRecord } from '../types';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../lib/storage';
import { testSupabaseConnection, isSupabaseConfigured } from '../lib/supabaseSync';
import { useToast } from '../components/common/Toast';

interface SettingsPageProps {
  settings: CarSettings;
  onUpdateSettings: (newSettings: CarSettings) => void;
  trips: TripRecord[];
  refuels: FuelPurchaseRecord[];
  onSetTrips: (trips: TripRecord[]) => void;
  onSetRefuels: (refuels: FuelPurchaseRecord[]) => void;
  onSyncUpload: () => void;
  onSyncDownload: () => void;
  isSyncing: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  trips,
  refuels,
  onSetTrips,
  onSetRefuels,
  onSyncUpload,
  onSyncDownload,
  isSyncing,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CarSettings>({ ...settings });
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSqlExpanded, setIsSqlExpanded] = useState(false);

  const [testingStatus, setTestingStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'warning' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const hasCloudSync = isSupabaseConfigured(settings);

  const handleSaveCarSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    showToast('Araç ayarları kaydedildi!', 'success');
  };

  const handleTestConnection = async () => {
    setTestingStatus({ status: 'testing' });
    const res = await testSupabaseConnection(formData.supabaseUrl, formData.supabaseKey);
    if (res.connected && res.tableExists) {
      setTestingStatus({ status: 'success', message: res.message });
      showToast('Supabase bağlantısı ve tablo başarılı!', 'success');
    } else if (res.connected && !res.tableExists) {
      setTestingStatus({ status: 'warning', message: res.message });
      showToast(res.message, 'warning');
    } else {
      setTestingStatus({ status: 'error', message: res.message });
      showToast(res.message, 'error');
    }
  };

  const sqlCode = `-- Supabase SQL Editor'da tek sefer çalıştırın (New Query -> Run):
CREATE TABLE IF NOT EXISTS yakit_duellosu (
  room_id TEXT PRIMARY KEY,
  trips_json TEXT,
  refuels_json TEXT,
  settings_json TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE yakit_duellosu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON yakit_duellosu;
CREATE POLICY "Allow all access" ON yakit_duellosu FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE yakit_duellosu;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showToast('SQL kodu kopyalandı!', 'success');
  };

  const handleExportJSON = () => {
    const jsonStr = exportAllDataAsJSON(trips, refuels, settings);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yakit_duellosu_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Yedek JSON dosyası indirildi!', 'success');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const imported = importAllDataFromJSON(content);
        onSetTrips(imported.trips);
        onSetRefuels(imported.refuels);
        if (imported.settings) {
          onUpdateSettings({ ...settings, ...imported.settings });
          setFormData({ ...settings, ...imported.settings });
        }
        showToast(`${imported.trips.length} gün ve ${imported.refuels.length} fiş geri yüklendi!`, 'success');
      } catch (err: any) {
        showToast(err?.message || 'Geçersiz JSON dosyası', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllData = () => {
    if (window.confirm('TÜM sürüş ve yakıt kayıtları silinecek! Devam etmek istiyor musunuz?')) {
      onSetTrips([]);
      onSetRefuels([]);
      showToast('Tüm veriler temizlendi.', 'info');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
          Ayarlar & Yönetim
        </h2>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Araç konfigürasyonu, bulut eşitleme ve veri yedekleme
        </p>
      </div>

      {/* 1. Vehicle & Pump Defaults */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-neutral-500" />
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            Araç & Yakıt Bilgileri
          </h3>
        </div>

        <form onSubmit={handleSaveCarSettings} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Araç Adı / Modeli
              </label>
              <input
                type="text"
                value={formData.carName}
                onChange={e => setFormData({ ...formData, carName: e.target.value })}
                placeholder="Örn: Renault Clio"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Plaka
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={e => setFormData({ ...formData, plate: e.target.value })}
                placeholder="34 GZ 1024"
                className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Yakıt Türü
              </label>
              <select
                value={formData.fuelType}
                onChange={e => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none font-medium"
              >
                <option value="benzin">Benzin</option>
                <option value="dizel">Dizel</option>
                <option value="lpg">LPG</option>
                <option value="hibrit">Hibrit</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Güncel Pompa Fiyatı (TL/L)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentFuelPrice}
                onChange={e => setFormData({ ...formData, currentFuelPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl shadow-xs hover:opacity-90 active:scale-98 transition-all"
            >
              Araç Bilgilerini Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* 2. Cloud Sync (Supabase) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Bulut Senkronizasyonu (Supabase)
            </h3>
          </div>

          {hasCloudSync && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Aktif & Canlı
            </span>
          )}
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Utku ve Gözde'nin telefonları arasında ortak araç havuzunu anlık senkronize eder.
        </p>

        {/* Inputs */}
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={formData.supabaseUrl || ''}
              onChange={e => setFormData({ ...formData, supabaseUrl: e.target.value })}
              placeholder="https://xyz.supabase.co"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={formData.supabaseKey || ''}
              onChange={e => setFormData({ ...formData, supabaseKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white outline-none"
            />
          </div>

          {testingStatus.status !== 'idle' && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              testingStatus.status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
            }`}>
              <span>{testingStatus.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings(formData);
                  showToast('Anahtarlar kaydedildi!', 'success');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl"
              >
                Kaydet
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingStatus.status === 'testing'}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${testingStatus.status === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Et</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSyncUpload}
                disabled={isSyncing}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Buluta Yükle</span>
              </button>
              <button
                type="button"
                onClick={onSyncDownload}
                disabled={isSyncing}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Buluttan İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible SQL Schema block */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setIsSqlExpanded(!isSqlExpanded)}
            className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 py-1"
          >
            <span>Supabase SQL Tablo Kodu</span>
            {isSqlExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isSqlExpanded && (
            <div className="mt-2 p-3 rounded-xl bg-neutral-900 text-neutral-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400">Tek sefer çalıştırın:</span>
                <button
                  onClick={handleCopySql}
                  className="px-2 py-0.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono bg-black/40 p-2 rounded-lg overflow-x-auto text-emerald-400">
                {sqlCode}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 3. Data Backup & Reset */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-neutral-500" />
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
            Veri Yedekleme & Sıfırlama
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tüm Verileri İndir (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Yedekten Geri Yükle (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleClearAllData}
            className="sm:col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Tüm Kayıtları Temizle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
