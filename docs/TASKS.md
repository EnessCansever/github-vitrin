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

**A0 yerel kabul kriterleri sağlandı.** Ürün tamamlanmadı. CI iş akışı oluşturuldu; uzak çalışması henüz doğrulanmadı.

### A0 — ESLint uyumluluk incelemesi: tamamlandı (28 Ekim 2026)

- [x] Kurulu Next/ESLint/eklenti tam sürümlerini ve transitif çözümlemeyi doğrula.
- [x] Üç somut ESLint 10 peer engelini ve Node uyumluluğunu registry metadatasından kontrol et.
- [x] Runtime ile peer desteğini ayır; yalıtılmış ESLint 10 denemesini ve Next'in API uyarlamasını incele.
- [x] Güncel stabil paketlerde küçük uyumlu yükseltme bulunmadığını kaydet; mevcut paket/config dosyalarını koru (D011).
- [x] npm ci, lint, typecheck ve production build sonuçlarını STATUS'a kaydet; uzak CI sonucu iddia etme.

### Takip işleri — tamamlandı sayılmayanlar

- [ ] Kullanıcı commit/push sonrasında GitHub Actions sonucunu doğrula; yerel sonucu uzak CI başarısı sayma.
- [ ] Next lint eklentileriyle uyumlu desteklenen ESLint zinciri çıktığında değerlendir; 9.39.5 bakım desteği sonlanma uyarısını force/override ile gizleme (D008, D011). 28 Ekim incelemesi yapıldı; üç eklentinin ESLint 10 peer engeli sürüyor.
- [ ] Kullanıcının “commit attım, devam” mesajını bekle; A1'e kendiliğinden geçme.

## A1–A7 — başlanmadı

Aşağıdaki kriterlerin hiçbiri tamamlandı sayılmamıştır. Her aşamadan sonra STATUS/TASKS güncellenir ve commit geçiş kapısı uygulanır.

### A1 Tasarım:

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

