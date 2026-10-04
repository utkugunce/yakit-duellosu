import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TripRecord, FuelPurchaseRecord, CarSettings } from '../types';

export interface CloudPayload {
  id?: string;
  room_id: string; // e.g. "utku_gozde_car"
  trips_json: string;
  refuels_json: string;
  settings_json: string;
  updated_at: string;
}

export function getSupabaseConfig(settings?: Partial<CarSettings>): { url: string; key: string } {
  const url = (settings?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '').trim();
  const key = (settings?.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  return { url, key };
}

export function isSupabaseConfigured(settings?: Partial<CarSettings>): boolean {
  const { url, key } = getSupabaseConfig(settings);
  return Boolean(url && key);
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const finalUrl = (url || import.meta.env.VITE_SUPABASE_URL || '').trim();
  const finalKey = (key || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (!finalUrl || !finalKey) return null;

  if (cachedClient && lastUsedUrl === finalUrl && lastUsedKey === finalKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(finalUrl, finalKey);
    lastUsedUrl = finalUrl;
    lastUsedKey = finalKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function uploadToSupabase(
  url: string,
  key: string,
  data: { trips: TripRecord[]; refuels: FuelPurchaseRecord[]; settings: CarSettings }
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient(url, key);
  if (!client) return { success: false, error: 'Supabase URL veya API Anahtarı eksik!' };

  try {
    const payload: CloudPayload = {
      room_id: 'utku_gozde_car',
      trips_json: JSON.stringify(data.trips),
      refuels_json: JSON.stringify(data.refuels),
      settings_json: JSON.stringify(data.settings),
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('yakit_duellosu')
      .upsert(payload, { onConflict: 'room_id' });

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          error: 'Supabase tablosu ("yakit_duellosu") bulunamadı. Lütfen Ayarlar sekmesindeki SQL kodunu Supabase SQL Editor\'da çalıştırın.'
        };
      }
      return { success: false, error: `Supabase Hatası: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Bilinmeyen bir hata oluştu' };
  }
}

export async function downloadFromSupabase(
  url?: string,
  key?: string
): Promise<{
  success: boolean;
  data?: { trips: TripRecord[]; refuels: FuelPurchaseRecord[]; settings?: Partial<CarSettings> };
  error?: string;
}> {
  const client = getSupabaseClient(url, key);
  if (!client) return { success: false, error: 'Supabase URL veya API Anahtarı eksik!' };

  try {
    const { data, error } = await client
      .from('yakit_duellosu')
      .select('*')
      .eq('room_id', 'utku_gozde_car')
      .maybeSingle();

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          error: 'Supabase tablosu bulunamadı. Lütfen Ayarlar sekmesindeki SQL kodunu Supabase SQL Editor\'da çalıştırın.'
        };
      }
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Bulutta henüz kayıtlı veri bulunamadı. Önce "Buluta Yükle"ye tıklayarak ilk veriyi gönderebilirsiniz.' };
    }

    const trips: TripRecord[] = JSON.parse(data.trips_json || '[]');
    const refuels: FuelPurchaseRecord[] = JSON.parse(data.refuels_json || '[]');
    const settings: Partial<CarSettings> = JSON.parse(data.settings_json || '{}');

    return {
      success: true,
      data: { trips, refuels, settings }
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Veriler indirilirken hata oluştu' };
  }
}

export function subscribeToSupabaseChanges(
  url: string,
  key: string,
  onUpdate: (data: { trips: TripRecord[]; refuels: FuelPurchaseRecord[]; settings?: Partial<CarSettings> }) => void
): () => void {
  const client = getSupabaseClient(url, key);
  if (!client) return () => {};

  try {
    const channel = client
      .channel('yakit_duellosu_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yakit_duellosu', filter: 'room_id=eq.utku_gozde_car' },
        payload => {
          const row = payload.new as any;
          if (row && row.trips_json) {
            try {
              const trips = JSON.parse(row.trips_json || '[]');
              const refuels = JSON.parse(row.refuels_json || '[]');
              const settings = JSON.parse(row.settings_json || '{}');
              onUpdate({ trips, refuels, settings });
            } catch (e) {
              console.error('Realtime parse hatası:', e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription hatası:', err);
    return () => {};
  }
}

export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ connected: boolean; tableExists: boolean; message: string }> {
  const client = getSupabaseClient(url, key);
  if (!client) {
    return {
      connected: false,
      tableExists: false,
      message: 'Supabase URL veya API Anahtarı eksik.'
    };
  }

  try {
    const { error } = await client
      .from('yakit_duellosu')
      .select('room_id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          connected: true,
          tableExists: false,
          message: 'Supabase API bağlantısı başarılı, ancak "yakit_duellosu" tablosu henüz açılmamış. Aşağıdaki SQL kodunu çalıştırın.'
        };
      }
      return {
        connected: false,
        tableExists: false,
        message: `Supabase Bağlantı Hatası: ${error.message}`
      };
    }

    return {
      connected: true,
      tableExists: true,
      message: 'Supabase bağlantısı ve "yakit_duellosu" tablosu sorunsuz çalışıyor!'
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: err?.message || 'Supabase sunucusuna ulaşılamadı.'
    };
  }
}
