import React, { useState } from 'react';
import {
  Settings, Car, Cloud, Database, Download, Upload, RefreshCw,
  Plus, X, Check, Copy, ExternalLink, HelpCircle, AlertTriangle
} from 'lucide-react';
import { CarSettings, TripRecord, FuelPurchaseRecord } from '../types';
import { DEFAULT_CAR_SETTINGS } from '../data/mockData';
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

  const handleSaveCarSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    showToast('Araç ayarları başarıyla kaydedildi!', 'success');
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
        showToast(`Başarıyla ${imported.trips.length} sürüş ve ${imported.refuels.length} yakıt alımı içe aktarıldı!`, 'success');
      } catch (err: any) {
        showToast(err?.message || 'Geçersiz JSON dosyası', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAllData = () => {
    if (window.confirm('TÜM sürüş ve yakıt alım kayıtları silinecek! Devam etmek istiyor musunuz?')) {
      onSetTrips([]);
      onSetRefuels([]);
      showToast('Tüm veriler temizlendi.', 'info');
    }
  };

  const [testingStatus, setTestingStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'warning' | 'error';
    message?: string;
  }>({ status: 'idle' });

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

-- Okuma ve yazmaya izin verin (Anonim erişim):
ALTER TABLE yakit_duellosu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON yakit_duellosu;
CREATE POLICY "Allow all access" ON yakit_duellosu FOR ALL USING (true) WITH CHECK (true);

-- Canlı anlık eşitleme (Realtime) desteğini açın:
ALTER PUBLICATION supabase_realtime ADD TABLE yakit_duellosu;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showToast('SQL şeması kopyalandı!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Uygulama & Araç Ayarları
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ortak araç yapılandırması, bulut eşitleme ve veri yönetimi
        </p>
      </div>

      {/* 1. Car & Default Fuel Settings */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Araç & Yakıt Bilgileri
            </h3>
            <p className="text-xs text-slate-500">
              Formlarda otomatik doldurulan araç varsayılanları
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCarSettings} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Araç Adı / Modeli
              </label>
              <input
                type="text"
                value={formData.carName}
                onChange={e => setFormData({ ...formData, carName: e.target.value })}
                placeholder="Örn: Bizim Araba / Clio 1.0"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plaka
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={e => setFormData({ ...formData, plate: e.target.value })}
                placeholder="Örn: 34 GZ 1024"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yakıt Türü
              </label>
              <select
                value={formData.fuelType}
                onChange={e => setFormData({ ...formData, fuelType: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="benzin">Benzin</option>
                <option value="dizel">Dizel</option>
                <option value="lpg">LPG</option>
                <option value="hibrit">Hibrit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Güncel Benzin Litre Fiyatı (TL/L)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentFuelPrice}
                onChange={e => setFormData({ ...formData, currentFuelPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all"
            >
              Araç Bilgilerini Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* 2. Cloud Sync (Supabase for Utku & Gözde) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                İki Telefon Arasında Eşitleme (Supabase)
              </h3>
              <p className="text-xs text-slate-500">
                Utku ve Gözde'nin kendi telefonlarından ortak arabaya sürüş girebilmesi için ücretsiz bulut senkronizasyonu
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline shrink-0"
          >
            <span>Supabase'e Git</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Nasıl Kurulur? (Sadece 1 Dakika):</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-800 dark:text-blue-300">
            <li>Ücretsiz bir <strong>Supabase</strong> projesi oluşturun.</li>
            <li>Supabase SQL Editor'a aşağıdaki tek satırlık tablo kodunu yapıştırıp "Run"a basın.</li>
            <li>Supabase ayarlarından aldığınız <strong>Project URL</strong> ve <strong>anon Public Key</strong>'i buraya veya Netlify ortam değişkenlerine (<code>VITE_SUPABASE_URL</code>) girin.</li>
            <li>Artık ikinizin girdiği tüm sürüşler otomatik olarak ortak havuzda senkronize olur!</li>
          </ol>
        </div>

        {/* Inputs */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={formData.supabaseUrl || ''}
              onChange={e => setFormData({ ...formData, supabaseUrl: e.target.value })}
              placeholder="https://xyzabcdef.supabase.co"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={formData.supabaseKey || ''}
              onChange={e => setFormData({ ...formData, supabaseKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Message */}
          {testingStatus.status !== 'idle' && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              testingStatus.status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : testingStatus.status === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : testingStatus.status === 'testing'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {testingStatus.status === 'testing' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {testingStatus.status === 'success' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              {testingStatus.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              {testingStatus.status === 'error' && <X className="w-3.5 h-3.5 text-rose-500" />}
              <span>{testingStatus.message || 'Bağlantı kontrol ediliyor...'}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings(formData);
                  showToast('Supabase anahtarları kaydedildi!', 'success');
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl transition-colors hover:bg-slate-800 dark:hover:bg-slate-100"
              >
                Anahtarları Kaydet
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingStatus.status === 'testing'}
                className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingStatus.status === 'testing' ? 'animate-spin' : ''}`} />
                <span>Bağlantıyı Test Et</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSyncUpload}
                disabled={isSyncing}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Buluta Yükle</span>
              </button>
              <button
                type="button"
                onClick={onSyncDownload}
                disabled={isSyncing}
                className="px-3.5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Buluttan İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* SQL Schema helper box */}
        <div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Supabase SQL Tablo Kodu:</span>
            <button
              onClick={handleCopySql}
              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1"
            >
              {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
            </button>
          </div>
          <pre className="text-[10px] font-mono bg-black/40 p-2.5 rounded-lg overflow-x-auto text-emerald-400">
            {sqlCode}
          </pre>
        </div>
      </div>

      {/* 4. Data Backup & Reset */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Veri Yedekleme ve Yönetim
            </h3>
            <p className="text-xs text-slate-500">
              Sürüş kayıtlarınızı JSON olarak indirin, yükleyin veya sıfırlayın
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-brand-500" />
            <span>Tüm Verileri İndir (JSON Yedek)</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Yedekten Geri Yükle (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Reset All */}
          <button
            onClick={handleClearAllData}
            className="sm:col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Tüm Kayıtları Temizle</span>
          </button>
        </div>
      </div>

      {/* 5. Netlify Deployment Note */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <ExternalLink className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">Netlify Dağıtımı Hakkında:</span>
          <p className="mt-0.5 text-[11px]">
            Bu proje Netlify ile %100 uyumlu olarak hazırlanmıştır (<code>netlify.toml</code> ve <code>_redirects</code> dahil). Projeyi GitHub reponuza push edip Netlify'a bağladığınızda 1 dakikada yayına alabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};
