# Görevler ve kabul kriterleri

Kaynak: [başlangıç sözleşmesi](../RepoVitrin-Codex-Proje-Sozlesmesi.md). `[x]` yalnız doğrulanan tamamlanmış işi, `[ ]` açık işi gösterir. Aşamalar kullanıcı geçiş mesajıyla ilerler.

## A0 — Sözleşme/kurulum: devam ediyor

### A0-BELGE — bu turun kapsamı

- [x] Ana sözleşmenin tamamını oku; mevcut dosyaları ve Git durumunu incele.
- [x] docs/design/reference.png görselini incele; kaynakları koru.
- [x] AGENTS.md ve sekiz docs belgesini oluştur; kapsamı, mimariyi, puanlamayı, tasarımı ve çalışma kurallarını aktar.
- [x] Görsel ayrışmalarını, açık kararları ve kullanıcı talimatının sözleşmedeki başlangıç/commit maddelerine etkisini kaydet.
- [x] Belge kapsamı, yerel bağlantılar ve özgün dosyaların değişmediğini doğrula.
- [x] STATUS ve TASKS dosyalarını gerçek sonuçla güncelle.

### A0 — kalan kurulum işleri: başlanmadı

- [ ] Kullanıcının “commit attım, devam” mesajından sonra kalan A0 kapsamına geç.
- [ ] Git deposu durumunu yeniden incele; repo hazırlığını o turdaki yetkiyle ele al.
- [ ] Node LTS ve stabil uyumlu paket sürümlerini resmi kaynaklardan doğrula; tam sürümleri kilitle.
- [ ] Sabit stack ile uygulama kurulumu, npm ve tek lockfile.
- [ ] Güvenli env örneği, .env.local gitignore ve CI.
- [ ] typecheck, lint ve build başarılı; sonuçları kaydet.

**A0 toplam kabulü henüz sağlanmadı.** Belge teslimi uygulamanın tamamlanması anlamına gelmez.

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

