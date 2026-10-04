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

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL || '';
  const finalKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!finalUrl || !finalKey) return null;

  try {
    return createClient(finalUrl, finalKey);
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
      // If table yakit_duellosu doesn't exist, provide helpful message
      return { success: false, error: `Supabase Hatası: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Bilinmeyen bir hata oluştu' };
  }
}

export async function downloadFromSupabase(
  url: string,
  key: string
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
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Bulutta henüz kayıtlı araç verisi bulunamadı.' };
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
