-- Yakıt Düellosu: herkese açık erişimi kapat, sadece izinli e-postalar okuyup yazabilsin.
-- Supabase Dashboard -> SQL Editor'da çalıştırın (yeni sürüm yayına çıktıktan SONRA).

-- 1. İzinli kullanıcılar listesi (sadece SQL Editor / service_role yönetir)
CREATE TABLE IF NOT EXISTS public.yakit_duellosu_allowed_users (
  email TEXT PRIMARY KEY
);
ALTER TABLE public.yakit_duellosu_allowed_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.yakit_duellosu_allowed_users FROM anon, authenticated;

INSERT INTO public.yakit_duellosu_allowed_users (email) VALUES
  ('utkugunce@gmail.com'),
  ('celik.gozdec@gmail.com')
ON CONFLICT DO NOTHING;

-- 2. Giriş yapan kişi listede mi?
CREATE OR REPLACE FUNCTION public.yakit_duellosu_is_allowed()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.yakit_duellosu_allowed_users
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
REVOKE ALL ON FUNCTION public.yakit_duellosu_is_allowed() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.yakit_duellosu_is_allowed() TO authenticated;

-- 3. Eski "herkese açık" politikayı kaldır, yerine izinli kullanıcı politikaları
ALTER TABLE public.yakit_duellosu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON public.yakit_duellosu;
DROP POLICY IF EXISTS "Allowed users read" ON public.yakit_duellosu;
DROP POLICY IF EXISTS "Allowed users insert" ON public.yakit_duellosu;
DROP POLICY IF EXISTS "Allowed users update" ON public.yakit_duellosu;

CREATE POLICY "Allowed users read" ON public.yakit_duellosu
  FOR SELECT TO authenticated USING (public.yakit_duellosu_is_allowed());
CREATE POLICY "Allowed users insert" ON public.yakit_duellosu
  FOR INSERT TO authenticated WITH CHECK (public.yakit_duellosu_is_allowed());
CREATE POLICY "Allowed users update" ON public.yakit_duellosu
  FOR UPDATE TO authenticated
  USING (public.yakit_duellosu_is_allowed())
  WITH CHECK (public.yakit_duellosu_is_allowed());

-- 4. Açık tablo izinleri (Supabase 30 Ekim 2026 değişikliği için de gerekli)
REVOKE ALL ON public.yakit_duellosu FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.yakit_duellosu TO authenticated;
