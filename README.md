# ⛽ Yakıt Düellosu (Utku & Gözde)

Utku ve Gözde'nin ortak kullandıkları arabada **kimin daha az/çok benzin tükettiğini**, **farklı rotalarda (şehir içi yoğun, akıcı, otoyol)** tüketim farklarını ve **yakıt masraf bölüşümünü** ölçmek, kıyaslamak için özel olarak geliştirilmiş modern web uygulaması.

Tasarımı ve deneyimi [yakittakippro](https://github.com/utkugunce/yakittakippro) projesinden ilham alınarak geliştirilmiştir.

---

## 🌟 Öne Çıkan Özellikler

1. **Büyük Düello Ekranı (Utku vs Gözde):**
   - **Genel Tüketim Lideri:** Ortalama L/100km karşılaştırması ve tasarruf yüzdesi.
   - **Kutlama Efekti:** Şampiyon için animasyonlu konfeti kutlaması 🎉.
   - **Adil Masraf Dengesi (Hesap Kapatma):** Kimin pompada ne kadar ödediği, kimin gerçekte ne kadar benzin tükettiği ve kimin kime kaç ₺ borçlu olduğunun adil hesabı!
   - **Kupa & Eğlenceli Rozetler:** *Tasarruf Şampiyonu*, *En Ekonomik Tek Sürüş*, *Kilometre Kaşifi*, *Klima Tutkunu*, *Depo Finansörü*.

2. **Güzergah & Rota Analizi:**
   - **Aynı Güzergahlarda Tüketim Düellosu:** Örneğin *"Ev ➔ İş"* rotasında Utku ne yakmış, Gözde ne yakmış?
   - **Yol Şartlarına Göre Liderlik:** Şehir içi yoğun dur-kalk, şehir içi akıcı, otoyol.
   - **"Direksiyona Kim Geçsin?" Rota Simülatörü:** Gidilecek mesafeyi girin, iki sürücünün geçmiş verilerine göre ne kadar yakacağını ve ne kadar tasarruf edileceğini hesaplasın.

3. **Hızlı ve Kolay Sürüş Girişi (Mobile-First):**
   - Arabadan indiğinizde 10 saniyede sürüş kaydedin.
   - Son kilometre otomatik hafızadan gelir, sadece yeni KM'yi veya mesafeyi yazın.
   - Sık kullanılan rota butonları (Ev ➔ İş, İş ➔ Ev vb.) tek tıkla seçilir.
   - Yol durumu, sürüş tarzı (Eco, Normal, Sport), klima durumu (Açık/Kapalı) ve anında canlı maliyet hesabı.

4. **Yakıt Alımı & Depo Takibi:**
   - Kim aldı, kim ödedi (Utku, Gözde veya Ortak 50-50).
   - Litre ve litre fiyatından anında tutar hesabı, istasyon seçimi ve depo fulleme kontrolü.

5. **Senkronizasyon (İki Telefon Arasında Paylaşım):**
   - **Supabase Entegrasyonu:** Hem Ayarlar menüsünden doğrudan API anahtarları girilebilir, hem de Netlify ortam değişkenleri (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ile bağlanabilir.
   - **Çevrimdışı & Yerel Depolama (LocalStorage):** İnternet yokken de tam çalışır.
   - **JSON Yedekleme:** Tek tıkla tüm verileri dışa aktarma ve içe aktarma.
   - **Demo Veriler:** Tek tıkla gerçekçi örnek sürüşleri yükleyip deneyimleme.

---

## 🚀 Netlify Üzerinde Yayınlama

Proje doğrudan Netlify için yapılandırılmıştır (`netlify.toml` ve `public/_redirects` hazır durumdadır):

1. Bu projeyi GitHub reponuza push edin:
   ```bash
   git init
   git add .
   git commit -m "feat: Yakıt Düellosu uygulaması"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
   git push -u origin main
   ```
2. [Netlify](https://netlify.com) hesabınıza giriş yapıp **Add new site > Import an existing project** seçin.
3. GitHub reponuzu seçin:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. (Opsiyonel) Eğer Supabase bulut eşitlemesini ortam değişkeni olarak vermek isterseniz **Site configuration > Environment variables** kısmına:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   ekleyin. (Bunları eklemeseniz bile uygulama içerisindeki **Ayarlar** sayfasından da girebilirsiniz!)

---

## ⚡ Yerel Geliştirme (Local Dev)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı derleme testi
npm run build
```
