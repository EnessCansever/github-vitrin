# Görevler ve kabul kriterleri

Kaynak: [başlangıç sözleşmesi](../RepoVitrin-Codex-Proje-Sozlesmesi.md). `[x]` yalnız doğrulanan tamamlanmış işi, `[ ]` açık işi gösterir. Aşamalar kullanıcı geçiş mesajıyla ilerler.

## A0 — Sözleşme/kurulum: yerel kabul kriterleri tamamlandı

### A0-BELGE — önceki turda tamamlandı

- [x] Ana sözleşmenin tamamını oku; mevcut dosyaları ve Git durumunu incele.
- [x] docs/design/reference.png görselini incele; kaynakları koru.
- [x] AGENTS.md ve sekiz docs belgesini oluştur; kapsamı, mimariyi, puanlamayı, tasarımı ve çalışma kurallarını aktar.
- [x] Görsel ayrışmalarını, açık kararları ve kullanıcı talimatının sözleşmedeki başlangıç/commit maddelerine etkisini kaydet.
- [x] Belge kapsamı, yerel bağlantılar ve özgün dosyaların değişmediğini doğrula.
- [x] STATUS ve TASKS dosyalarını gerçek sonuçla güncelle.

### A0 — proje kurulumu: tamamlandı (27 Ekim 2026)

- [x] Kullanıcı belge commit'ini ve sonraki A0 kurulum yetkisini verdi.
- [x] Git çalışma alanı, HEAD 5ca7d9d ve origin doğrulandı; mevcut kullanıcı değişikliği yoktu.
- [x] Node/npm ve Next.js uyumluluğunu resmi kaynaklardan doğrula; doğrudan paketleri ve lockfile'ı kilitle.
- [x] Mevcut kökte App Router, React, TypeScript strict ve Tailwind kurulumu; yalnız npm ve tek lockfile.
- [x] Marka/config ve temel CSS tokenlarını merkezileştir; yalnız geliştirme durumu sayfası ekle.
- [x] .gitignore kurallarını koru, güvenli boş env örneği ve secret gerektirmeyen CI tanımı ekle.
- [x] dev/build/start/lint/typecheck komutları; temiz kurulumda tip üretimini doğrula.
- [x] npm ci, lint, typecheck ve production build başarılı; sonuçlar STATUS.md'de.
- [x] Geliştirme sayfasında HTTP 200 ve beklenen HTML içeriğini doğrula; sunucuyu kapat.
- [x] README kurulumu, kalıcı kod standartları ve değişen kod incelemesini tamamla.
- [x] Kaynak sözleşme/görselin korunduğunu, Git staging yapılmadığını ve diff biçimini doğrula.

**A0 yerel kabul kriterleri sağlandı.** fcd3718 commit’i gönderildi; kullanıcı GitHub Actions CI başarısını bildirdi. Ürün tamamlanmadı; CI bu oturumda uzaktan yeniden sorgulanmadı.

### A0 — ESLint uyumluluk incelemesi: tamamlandı (28 Ekim 2026)

- [x] Kurulu Next/ESLint/eklenti tam sürümlerini ve transitif çözümlemeyi doğrula.
- [x] Üç somut ESLint 10 peer engelini ve Node uyumluluğunu registry metadatasından kontrol et.
- [x] Runtime ile peer desteğini ayır; yalıtılmış ESLint 10 denemesini ve Next'in API uyarlamasını incele.
- [x] Güncel stabil paketlerde küçük uyumlu yükseltme bulunmadığını kaydet; mevcut paket/config dosyalarını koru (D011).
- [x] npm ci, lint, typecheck ve production build sonuçlarını STATUS'a kaydet; uzak CI sonucu iddia etme.

### Takip işleri — tamamlandı sayılmayanlar

- [x] Kullanıcı A0 fcd3718 için GitHub Actions CI başarısını bildirdi; kaynak kullanıcı beyanı olarak STATUS’a kaydedildi.
- [ ] Next lint eklentileriyle uyumlu desteklenen ESLint zinciri çıktığında değerlendir; 9.39.5 bakım desteği sonlanma uyarısını force/override ile gizleme (D008, D011). 28 Ekim incelemesi yapıldı; üç eklentinin ESLint 10 peer engeli sürüyor.
- [x] Kullanıcı A0 commit/push bilgisini ve yalnız A1 ilk bölüm için açık çalışma yetkisini verdi.

## A1 — ana sayfa ve demo kullanıcı tarafından görsel olarak kabul edildi; kalan kapsam açık

A1’in tüm kabul kriterleri henüz sağlanmadı. Her anlamlı işten sonra STATUS/TASKS güncellenir ve commit geçiş kapısı uygulanır. A2–A7 başlamadı.

### A1.1 — ana sayfa + örnek sonuç (bu turun kapsamı)

- [x] Referansı gerçekten incele; mevcut Git durumunu ve kullanıcı değişikliklerini kontrol et.
- [x] Ortak marka, TR/EN seçimi, ana başlık, etiketli giriş, sabit demo eylemi ve Keşfet → Düzelt → Paylaş anlatımı.
- [x] next-intl ve mesaj dosyaları; iki yönde aynı sayfada dil değişimi.
- [x] /demo: kurmaca profil/repolar, örnek etiketi, tip/puan, iki bulgu ve açık demo kanıtları.
- [x] İlk görev, iki ek görev, pasif paylaşım/yeniden analiz; kategori accordion'larında 23 check ve gerekçeler.
- [x] 77,5 toplamın ve Gizli Cevher koşullarının sözleşmeyle tutarlılığını kontrol et; gerçek motor yazma.
- [x] Merkezi tokenlar, native details, focus/label/skip-link, uzun metin için sarma kuralları.
- [x] Lint, typecheck ve production build; dört TR/EN sayfa yanıtı; dört dil değişimi form POST'u.
- [x] Mesaj anahtarı eşleşmesi, hesaplanan renk kontrastları, değişen kod ve Git diff incelemesi.
- [ ] Tam A1 için 360/390/768/1440 ekran görüntüsü kriterinin kalanını doğrula; mevcut ana sayfa/demo için kullanıcı masaüstü ve mobil görsel kabulü verildi, bu onay belirtilmeyen viewport kontrollerini yapılmış saymaz.
- [x] Son revizyonda temiz Chrome ile 320px ve uzun ad taşması kontrol edildi.
- [x] Son revizyonda temiz Chrome ile Tab/Shift+Tab, Enter/Space, focus ve TR/EN metinler kontrol edildi.
- [ ] Kullanıcı görünümü inceleyip “commit attım, devam” demeden A1’in kalanına geçme.

**A1.1 ana sayfa ve demo için kullanıcı masaüstü ve mobil ekranları kendisi inceleyerek görsel kabul verdi (28 Ekim 2026). A1’in bütünü tamamlanmadı.**

### A1.1 görsel revizyon — kullanıcı görsel kabulü verildi

- [x] Kullanıcının yedi mevcut ekran görüntüsünü referans panoyla karşılaştır.
- [x] Dikey boşlukları azalt; 1440×900 içinde başlık/gerçek sonuç önizlemesi/ana eylemi doğrula.
- [x] Ortak sonuç kartı: kurmaca kullanıcı, tip, 77,5, üç kategori, repo bulgusu ve rapor bağlantısı.
- [x] Demo özetini kartta birleştir; kaynak ve teknik gerekçeleri açılıma taşı; TR/EN sadeleştir.
- [x] Mobil sonuç/bulgu/ilk görev/paylaşım/kategori/diğer görev sırasını doğrula.
- [x] Kurulu Chrome'un ayrı eklentisiz profilinde 390×844 ve 1440×900 TR/EN ekranlarını al ve incele.
- [x] 320px, uzun adlar ve açık details ile iki dil/iki sayfada taşma kontrolü.
- [x] Gerçek dil seçimi tıklamaları, Tab/Shift+Tab, Enter/Space, focus ve üç kategori kontrolü.
- [x] Tam hydration diff'ini incele; temiz profilde hatasızlığı ve data-yd DOM müdahalesiyle yeniden üretimi doğrula. Uyarı gizleme ekleme.
- [x] Son lint/typecheck/build, dosya koruma ve diff kontrolü; fixture/puan/bağımlılık değişmedi.
- [x] Kullanıcı masaüstü ve mobil ekranları kendisi inceleyerek yalnız ana sayfa ve demo görünümünü kabul etti (28 Ekim 2026).

Bu kabul kullanıcı incelemesidir; bu tur yeni otomatik/tarayıcı testi yapılmadı. A1'in bütünü ve sonraki aşamalar açık; “commit attım, devam” mesajı bekleniyor.

### A1 Tasarım — toplam kabul kriterleri:


- [ ] /demo içinde açık örnek verilerle ana sayfa, repo seçimi, mobil sonuç, kanıt/accordion, tüm durumlar, TR/EN.
- [ ] 360/390/768/1440 screenshot incelemesi; klavye, kontrast, uzun metin.

### A2 GitHub:

- [ ] Public adapter, normalize, aday seçimi, pinned fallback, timeout/rate limit/unknown.
- [ ] Gerçek public profil smoke testi; eksik token halinde açık kurulum hatası.

### A3 Puanlama:

- [ ] Saf kurallar + fixture testleri; her bulgunun kanıtı; kategori aritmetiği.
- [ ] Unknown ve dil bağımsızlığı, repo sayısı, eksik README, boş hesap, GraphQL partial testleri.

### A4 Depolama/karşılaştırma:

- [ ] Snapshot, cache, atomik throttle, lock, TTL; uyumlu/uyumsuz karşılaştırma testleri.
- [ ] Yenilemenin GitHub verisini gerçekten yeniden aldığı ve cache sonucunu yeni ilerleme saymadığı doğrulanır.

### A5 Paylaşım:

- [ ] İlk/gelişim PNG, 3 boyut, TR/EN, OG metadata server-rendered.
- [ ] Yalnız açık kullanıcı işlemiyle shareReport; expiry/silme; anonim incognito link.
- [ ] İndirilen resim gerçek boyutu ve Türkçe karakterleri doğrulanır.
- [ ] "İndirildi", "bağlantı kopyalandı", "paylaşım menüsü açıldı" ayrılır; Instagram'a otomatik post iddiası yok.

### A6 Yayın kalitesi:

- [ ] Kritik Playwright akışları, erişilebilirlik, üretim build, güvenlik/secret taraması.
- [ ] Gerçek hesaplarda manuel doğruluk kontrolü; bilinen sınırlar.
- [ ] README: kurulum, mimari, scoring gerekçesi, testler, ekranlar, demo.
- [ ] Yayın yetkisi varsa deploy/smoke; yoksa deploy için somut hazır paket.

### A7 Dağıtım:

- [ ] Küçük kullanıcı denemesi, bulgu doğruluğu ve paylaşım deneyimi geri bildirimi.
- [ ] Anonim aggregate ölçümler; gerçek veriye dayanan CV anlatımı. Trafik gelmeden "viral" sonucu çıkarılmaz.

