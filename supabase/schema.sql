-- =========================================================================
-- Yakıt Düellosu (Utku & Gözde) - Supabase Kurulum Şeması
-- Bu kodu Supabase Dashboard -> SQL Editor (New Query) kısmına yapıştırıp RUN'a basın.
-- =========================================================================

-- 1. Tabloyu oluştur
CREATE TABLE IF NOT EXISTS yakit_duellosu (
  room_id TEXT PRIMARY KEY,
  trips_json TEXT,
  refuels_json TEXT,
  settings_json TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Herkesin okuyup yazabilmesi için erişim izni (RLS) ver
ALTER TABLE yakit_duellosu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON yakit_duellosu;
CREATE POLICY "Allow all access" ON yakit_duellosu FOR ALL USING (true) WITH CHECK (true);

-- 3. Canlı anlık senkronizasyon (Supabase Realtime) desteğini aç
-- (Böylece Utku gün kaydettiğinde Gözde'nin ekranı anında yenilenir)
ALTER PUBLICATION supabase_realtime ADD TABLE yakit_duellosu;
