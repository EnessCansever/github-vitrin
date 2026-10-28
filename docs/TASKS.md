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

## A1 — tasarım kabul kriterleri karşılandı

Ana sözleşme §11’deki A1 kabul kriterleri, önceki doğrulama kayıtları ve son kullanıcı bildirimi birlikte değerlendirilerek karşılandı. Kullanıcı repo seçimi, analiz durumları ve demo gezinmesine görsel kabul verdi; native durum menüsünde klavyeyle seçenek değişimini kontrol edip çalıştığını bildirdi (28 Ekim 2026). Bunlar kullanıcı incelemesi/bildirimidir; bu tur yeni Codex tarayıcı testi yapılmadı. 3912059 commit/push ve uzak CI başarısı son kullanıcı mesajıyla bildirildi. A2.1 veri katmanı için yetki verildi; A3–A7 başlamadı.

### A1.1 — ana sayfa + örnek sonuç (kullanıcı kabulü verildi)

- [x] Referansı gerçekten incele; mevcut Git durumunu ve kullanıcı değişikliklerini kontrol et.
- [x] Ortak marka, TR/EN seçimi, ana başlık, etiketli giriş, sabit demo eylemi ve Keşfet → Düzelt → Paylaş anlatımı.
- [x] next-intl ve mesaj dosyaları; iki yönde aynı sayfada dil değişimi.
- [x] /demo: kurmaca profil/repolar, örnek etiketi, tip/puan, iki bulgu ve açık demo kanıtları.
- [x] İlk görev, iki ek görev, pasif paylaşım/yeniden analiz; kategori accordion'larında 23 check ve gerekçeler.
- [x] 77,5 toplamın ve Gizli Cevher koşullarının sözleşmeyle tutarlılığını kontrol et; gerçek motor yazma.
- [x] Merkezi tokenlar, native details, focus/label/skip-link, uzun metin için sarma kuralları.
- [x] Lint, typecheck ve production build; dört TR/EN sayfa yanıtı; dört dil değişimi form POST'u.
- [x] Mesaj anahtarı eşleşmesi, hesaplanan renk kontrastları, değişen kod ve Git diff incelemesi.
- [x] Önceki ana sayfa/demo için kalan 360/768 görüntü ve taşma kontrolleri A1.2 sırasında tamamlandı; kullanıcı A1.1 masaüstü/mobil kabulü korunuyor.
- [x] Son revizyonda temiz Chrome ile 320px ve uzun ad taşması kontrol edildi.
- [x] Son revizyonda temiz Chrome ile Tab/Shift+Tab, Enter/Space, focus ve TR/EN metinler kontrol edildi.
- [x] Kullanıcı A1.1 bölümünü a78abde ile gönderdi, CI başarısını bildirdi ve yalnız A1 repo seçimi/durumları için devam yetkisi verdi.

**A1.1 ana sayfa ve demo için kullanıcı masaüstü ve mobil ekranları kendisi inceleyerek görsel kabul verdi (28 Ekim 2026).**

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

Bu A1.1 kabulü kullanıcı incelemesidir. a78abde commit/push ve CI başarısı kullanıcı tarafından bildirildi; sonraki yetki yalnız aşağıdaki A1.2 kapsamınadır.

### A1.2 — repo seçimi ve analiz durumları (bu turun kapsamı)

- [x] AGENTS ve proje belgelerini oku; temiz çalışma alanı ve HEAD a78abde doğrula; önceki kabul/CI bilgisini kaydet.
- [x] /demo/select: kurmaca profil ve dört uygun örnek repo, gerçek checkbox, seçili kimlik dizisi ve 1–3 sınırı.
- [x] Üçte seçilmemişler pasif, seçililer kaldırılabilir; sıfırda devam pasif ve gerekçeli.
- [x] Repo adı/açıklama/dil/pinned göstergesi ve uzun metin sarma; yeni puan üretmeyen doğru adlandırılmış devam.
- [x] Dil değişiminde sıfır, iki farklı kimlik ve üç seçimin korunduğunu gerçek tarayıcıda doğrula.
- [x] /demo/states: loading, kullanıcı yok, uygun repo yok, ağ/servis, rate-limit ve partial örnekleri; elle seçim, TR/EN ve durum bildirimi.
- [x] Loading otomatik geçişsiz; sahte yüzde/reset süresi/retry yok; partial toplam/tip üretmiyor ve bilinen bulguyu koruyor.
- [x] Sabit /demo kopyalanmadı; /demo'ya yalnız seçim bağlantısı eklendi. Gerçek GitHub/MongoDB/AI/API/PNG ve yeni paket eklenmedi.
- [x] Lint/typecheck/build, 320/360/390/768/1440 taşma, uzun ad, gerçek checkbox Space/Tab/Shift+Tab ve focus kontrolleri.
- [x] Yeni ekranların TR/EN mobil/masaüstü görüntülerini alıp incele; mevcut ana sayfa/demo için 360/768 regresyon kontrollerini tamamla.
- [x] Native durum select menüsünde klavyeyle seçenek değişimi çalışıyor: kullanıcı kendisi kontrol ettiğini bildirdi. Önceki headless CDP doğrulama açığı kullanıcı bildirimiyle kapatıldı; yeni otomatik test sonucu değildir.
- [x] Kullanıcı repo seçimi ve analiz durumlarına görsel kabul verdi. İşlev kontrolleri önceki kayıtlarda; native menü klavye doğrulaması kullanıcı bildirimidir.
- [x] Kullanıcı 3912059 commit/push ve CI başarısını bildirdi; yalnız A2 ilk veri katmanı bölümü için açık devam yetkisi verdi.

A1.2 uygulaması, önceki yerel kontroller ve kullanıcı görsel kabulü tamam. Native menü klavye kontrolü kullanıcı bildirimiyle doğrulandı; A2.1 geçişi son kullanıcı mesajıyla yetkilendirildi.

### A1.2 bağlantı hiyerarşisi revizyonu — kullanıcı görsel kabulü verildi

- [x] Üç demo sayfasının üstüne ortak kompakt gezinme; yalnız demo sayfalarında, aktif aria-current + renk dışı işaretler.
- [x] Ana/ikincil/yardımcı link hiyerarşisi; mevcut dolu mavi korunur, ortak mavi ikincil stil ve sakin geri linkleri.
- [x] /demo altındaki seçim geçişini ikincil eylem yap; üstten aynı ekrana erişim sağla.
- [x] Semantik link, hover, mavi focus ve aktif durum; mint gezinmede yok, disabled paylaşım değişmedi.
- [x] TR/EN üç sayfa arası 12 yönlü geçiş, üç geri dönüş, aynı sayfada dil ve seçim korunumu.
- [x] TR/EN 390px/1440px ekranlarını alıp incele; 320px taşma kontrolü.
- [x] Son lint, typecheck, production build ve dosya koruma/diff kontrolleri.
- [x] Kullanıcı demo gezinmesine görsel kabul verdi; kaynak kullanıcının son bildirimidir (28 Ekim 2026).

Bu revizyon yalnız gezinme/sunum içindir; fixture, puan ve analiz davranışı korunur. Görsel kabul ve native menü klavye kontrolüne ilişkin kullanıcı bildirimleri kaydedildi.

### A1 Tasarım — toplam kabul kriterleri:


- [x] /demo altında açık örnek verilerle ana sayfa, repo seçimi, mobil sonuç, kanıt/accordion, tüm durumlar, TR/EN arayüzleri uygulandı; gerçek entegrasyon yok.
- [x] 360/390/768/1440 screenshot/taşma, checkbox/focus, kontrast ve uzun metin kontrolleri önceki kayıtlarda doğrulandı. Yeni ekranlar ve gezinme kullanıcı tarafından görsel olarak kabul edildi; native menü klavye kontrolü kullanıcı bildirimiyle kapatıldı.

A1 kabul incelemesi: iki ana kriter de karşılandı; tamamlanmamış A1 tasarım kabul maddesi kalmadı. 3912059 commit/push ve CI başarısı kullanıcı bildirimi olarak kaydedildi; yalnız A2.1 yetkilendirildi. ESLint 9 takip işi A0 araç sınırlaması olarak açık kalır; A1 tasarım kriteri değildir.

### A2 GitHub — A2.1 veri katmanı ve A2.2 gerçek seçim

- [x] AGENTS/belgeler, temiz Git durumu ve HEAD 3912059 kontrolü; A1 kabul incelemesi ve kullanıcı CI bildirimi.
- [x] Zod ile kişisel kullanıcı adı/HTTPS veya şemasız github.com profil URL normalizasyonu; desteklenmeyen path/host/credential reddi; sunucuda zorunlu kullanım.
- [x] Public profil, ayrı profil README'si, uygun pinned ve güncel repo adayları; owner/public/archive/fork filtreleri, sayfalama ve en fazla 100 aday.
- [x] Erişilebilir boş pinned listesi ile unknown ayrımı; güncel aday fallback'i ortak hata bilgisini gizlemez.
- [x] 1–3 benzersiz seçilmiş repo kimliği/adı doğrulaması; güncel metadata ve README erişimi.
- [x] Proje README missing öncesi metadata yeniden doğrulama; profil yokluğunda hatasız nullable GraphQL alanlarını kontrol et; kapsam/kimlik kaybı, auth/rate-limit/ağ/timeout, GraphQL errors/partial ve büyük/kesilmiş içerik unknown/hata kalır.
- [x] Sunucu token sınırı; kullanım anında açık configuration hatası; imports/build/demo/testler gerçek token gerektirmez.
- [x] Ortak 20 saniye/40 istek, istek başına 8 saniye, 1 MiB JSON ve 256 KiB README sınırı; gerçek rate-limit bilgisi ve durdurma; kör retry yok.
- [x] Vitest davranış testleri, npm test ve secretsız CI adımı; README/env/mimari/karar güncellemesi.
- [x] Temiz npm ci, npm test, lint, typecheck ve production build; kod ve koruma/diff incelemesi (sonuçlar STATUS'ta).
- [x] Mevcut adapter ile EnessCansever üzerinde gerçek public smoke: profil başarılı, pinned available/6, 14 uygun aday, profil README found, seçilen jobfit-tr metadata başarılı ve README found. Tek GitHubClient/ortak bütçe; gerçek env yalnız runtime'da yüklendi. Gerçek hata yanıtları bu smoke'ta üretilmedi; hata ayrımı önceki deterministik testlerde doğrulandı.
- [x] Kullanıcı 590f4c7 A2.1 commit/push ve uzak CI başarısını bildirdi; yalnız aşağıdaki A2.2 gerçek profil/seçim akışını yetkilendirdi.
- [x] A2.1 kullanıcı commit/devam kapısı 590f4c7 ve açık A2.2 talimatıyla geçildi; sonraki kapı A2.2 altında açık.

Profil README yokluğu aşağıdaki revizyonla hatasız nullable GraphQL verisi üzerinden doğrulanır; belirsiz REST 404/errors/partial unknown kalır. EnessCansever olumlu public akışı smoke testiyle doğrulandı; diğer hesap/hata senaryoları canlı denenmiş sayılmaz. A4 dağıtık limit/cache ve A3 puanlama bu bölümün kabul kapsamı değildir.

### A2.1 kaynak incelemesi düzeltmesi — yalnız README ve rate-limit

- [x] Profil README'sinin bilinen public yokluğunu missing; auth/ağ/partial/belirsiz yanıtı unknown ayır. Hata içeren nullable alanı yokluk sayma.
- [x] Proje eligible filtresi/genel README araması yerine aynı adlı public repoda kök README.md; arşiv/fork sınırı uygulama; private içerik okuma.
- [x] Boş dosyayı found + boş text olarak koru; profil gösterimi iddiası üretme. Boyut/kodlama/yol/SHA ve kimlik güvenliklerini koru.
- [x] REST/core ve GraphQL primary limitlerini ayır; header kaynağı/eksik header/gerçek reset davranışını düzelt.
- [x] GraphQL HTTP 200 RATE_LIMITED kaydı; secondary/belirsiz kısıt her iki API'de korunur; ortak 20 saniye/40 istek değişmez.
- [x] Hatalı eski test beklentilerini düzelt; yeni profil/limit davranış testleri, npm test, lint, typecheck ve production build (sonuçlar STATUS'ta).
- [x] Gerçek GitHub smoke kontrolü yapıldı (28 Ekim 2026): beş adım tek client ile başarılı, yalnız güvenli özet kaydedildi. Geçici çalıştırıcı kaldırıldı; uygulama kodu değişmedi, normal npm test/CI gerçek ağı çalıştırmaz.
- [x] A2.1 inceleme/commit sonrası 590f4c7 ve A2.2 kullanıcı mesajı alındı; kapsam yalnız profil/seçim olarak genişledi.

### A2.2 — ana sayfa formu ve gerçek repo seçimi

- [x] AGENTS/belgeler ve temiz Git başlangıcı; HEAD 590f4c7, son uzak CI başarısı kullanıcı bildirimi olarak kaydedildi.
- [x] Gerçek form: mevcut profileInput, username/URL, Enter, etiket/hata/pending, aynı pending için çift gönderim engeli ve ayrı görünür demo linki.
- [x] Tek Server Action; sunucuda Zod + 256 UTF-8 byte girdi, Next 8 KiB body, işlem başına yeni client ve 20 saniye/40 istek sınırı. Error/raw API/token istemciye gitmez.
- [x] Public profil/link/monogram; uygun pinlerden ve sonra en güncel adaylardan üçe kadar ön seçim; unknown pinned ve 100 aday kapsam bilgisi.
- [x] Ortak RepoPicker gerçek veriye bağlandı; ID dizisiyle 1–3/sıfır sınırı, pasif puanlama ve gerçek/demo ayrımı. README analizi/puanlama/sonuç yok.
- [x] Aynı sayfada TR/EN ve seçim korunumu; locale/re-render yeni GitHub isteği üretmiyor. Yeni aramada eski state temizleniyor; gecikmiş eski yanıt atılıyor.
- [x] Ortak StatePanel ile gerçek loading/notFound/empty/network/rateLimit/configuration ve gerçek yeniden deneme. Demo fallback/sahte ilerleme yok.
- [x] Sunucu akışı mock HTTP ile test edildi: geçersiz/oversize, başarı/ön seçim/DTO, boş kapsam, güvenli hata eşlemesi, pinned unknown/alt istek timeout'u, yeni client ömrü ve 100 aday.
- [x] Toplam 138 deterministik test, lint, typecheck, production build; client bundle sunucu sınırı ve diff/koruma kontrolü.
- [x] Temiz Chrome'da gerçek EnessCansever username/URL, 14 aday; üç/sıfır/kaldırma/Space/focus, duplicate submit, dilde state ve çağrı sayısı, ikinci kullanıcı octocat, gecikmeli yanıt ve hata sonrası gerçek retry.
- [x] TR/EN 390×844 ve 1440×900 görüntüleri incelendi; 320/390/768/1440 ve uzun ad taşması, demo seçimi/durumları kontrol edildi. 9 KiB body denemesi 8 KiB limitinde reddedildi (geliştirme Server Action HTTP 500 içinde dahili body-limit hatası).
- [x] Kullanıcı mevcut A2.2 gerçek profil ve repo seçimi akışını kabul etti (28 Ekim 2026, kullanıcı bildirimi). Yeni A / Developer ID tasarım uygulaması bu kabulün parçası değildir; henüz başlamadı.
- [x] A2.2 c3aa1fe commit/push ve uzak CI başarısı kullanıcı tarafından bildirildi; yeni tasarım diliminin CI sonucu değildir.
- [x] Kullanıcı D021 ilk tasarım dilimine açık yetki verdi; A3 puanlamaya veya başka işe geçiş yetkisi verilmedi.

A2 kaynak sözleşme §11 teknik kabul incelemesi: public adapter/normalizasyon/aday-pinned fallback/timeout-rate-limit-unknown ve gerçek public profil smoke + açık token yapılandırma hatası kriterleri karşılandı. Mevcut A2.2 gerçek profil/seçim akışının kullanıcı kabulü alındı. Karşılanmamış A2 ürün/teknik kabul maddesi tespit edilmedi; A2.2 commit/push ve uzak CI c3aa1fe için kullanıcı tarafından bildirildi. A / Developer ID yönü D021'de kayıtlıdır; aşağıdaki ilk uygulama dilimi yetkilendirildi, puanlama sözleşmesi değişmez. Puanlama A3, dağıtık abuse/cache A4 ve public deployment bu turun işi değildir.

### D021 — Developer ID ilk tasarım dilimi (kullanıcı görsel kabulü verildi)

- [x] AGENTS/DESIGN/DECISIONS/STATUS/TASKS ve ilgili kapsamı oku; HEAD c3aa1fe ve beklenen kullanıcı referans eklemesini doğrula.
- [x] docs/design/developer-id-concept.png gerçek görselini incele; bu dilimde görsel önceliğini kaydet, eski referansı koru.
- [x] Ana sayfa TR/EN başlık, form ve örnek rapor bağlantısını yeni grafik dile taşı; gerçek form/seçim davranışını koru.
- [x] Ortak ResultSummary: sıcak kâğıt kimliği, fixture kimliği/tipi/77,5 ve Profil 15/20, Projeler 22,5/30, README 40/50; /demo düz, hero masaüstünde kontrollü açılı/askılı.
- [x] Merkezi tokenlar/yerel lisanslı TR fontları ve küçük lime tip mührü; rastgele seri/meslek/başarı/doğrulanmışlık yok; eski kart stilleri değiştirildi.
- [x] Tek iterasyon CSS girişleri, hover/press, native accordion + hafif içerik geçişi; reduced-motion altında kaldırma; hareket bağımlılığı yok.
- [x] npm test 138, lint, typecheck ve production build; Türkçe cmap glyph ve yerel font/kontrast kontrolü.
- [x] Gerçek EnessCansever formu 14 aday, üç sınırı/kaldırma, TR/EN ID korunumu, disabled gerçek puanlama ve demo navigasyonu.
- [x] TR/EN 390×844 ve 1440×900 görüntüleri; diğer demo görselleri; dört sayfada 320/390/768/1000/1440 taşma, uzun ad, focus, native Space/Enter ve üç kategori/kanıt kontrolleri.
- [x] Reduced-motion, tek iterasyon/locale'de tekrar etmeme, soğuk font yüklemesinde home/1440 yerel layout shift 0; console/runtime hatası yok.
- [x] Kullanıcı Developer ID ilk tasarım dilimine görsel kabul verdi; açılış animasyonunu kontrol ettiğini ve sürekli hareket olmadığını bildirdi (kullanıcı incelemesi, 28 Ekim 2026).
- [x] Kullanıcı isteğiyle yalnız TR/EN placeholder kısaltıldı: “GitHub kullanıcı adın” / “Your GitHub username”. Profil URL desteği mevcut etiketlerde korunur.
- [x] Placeholder düzeltmesi sonrası npm run lint ve npm run typecheck geçti; bu tur başka tasarım değişikliği yapılmadı.
- [x] Kullanıcı Developer ID değişikliklerini 7025b91 ile commit edip gönderdiğini ve GitHub Actions başarısını bildirdi; kaynak kullanıcı bildirimi, bu tur bağımsız uzak sorgu yapılmadı.
- [x] Kullanıcı yeni açık mesajıyla yalnız A3 puanlama motoruna geçiş yetkisi verdi; tasarım/kapsam genişletilmedi.

Bu dilim yalnız ana sayfa ve ortak demo üst kimliğidir; tüm uygulama yeniden tasarlanmış sayılmaz. Ürün/puanlama/backend sözleşmeleri ve gerçek seçim tasarımı korunur. Yeni public yayın veya paylaşım PNG üretimi yapılmadı.

### A3 Puanlama — motor dilimi; gerçek sonuç arayüz bağlantısı açık

- [x] Saf kurallar + sentetik fixture testleri; her check için ID/scope/sürüm/durum/earned/max/kanıt/öneri anahtarı; 20/30/50 kategori aritmetiği ve yuvarlama.
- [x] Unknown/dil bağımsızlığı, 1/3 eşdeğer repo, kesirli ortalama, missing/boş/unknown README, sıfır/uygunsuz/yinelenen repo ve GraphQL partial kökenli unknown davranışı.
- [x] unified/remark-parse AST; sınırlı TR/EN alias'ları, bölüm sınırları, içerik koşulları, referans link/görsel ve güvenilmeyen HTML/protokol sınırları SCORING'de belgeli.
- [x] Yalnız tam analizde öncelikli profil tipi, >=80 eşiği ve check referansları; en fazla üç benzersiz doğrulanmış görev, max/N etkisi ve sabit eşitlik sırası.
- [x] UI demo fixture'ı değiştirmeden 23 check ve 15 + 22,5 + 40 = 77,5 doğrulaması; editoryal öneri sırası farkı kaydedildi.
- [x] Saflık, aynı sonuç, donmuş girdinin korunması, ağ/saat/rastgelelik kullanmama ve TR/EN mesaj anahtarları testleri.
- [x] A3 motor ve dar revizyon: 8 dosya/228 test (ilk motor 197 + 31 yeni regresyon); lint, typecheck, production build ve diff kontrolleri başarılı. Sonuçlar STATUS'ta kayıtlı.
- [ ] Gerçek seçim → adapter README/metadata → motor → sonuç ekranı bağlantısı; bu tur yetkilendirilmedi/uygulanmadı. Mevcut UI puanlama devamı pasif kalır.
- [x] İlk gerçek smoke: EnessCansever/jobfit-tr/fixora/barber gerçek ID ve kapsamı adapter üzerinden doğrulandı; tek client bütçesinde complete, 20 + 23,3 + 30 = 73,3, Vitrin Yapımda. Profil/üç proje README found; bu önceki motor sonucudur.
- [x] Aynı okunan README metninde fixora demo, jobfit kurulum/teknoloji ve ek amaç/kullanım/bölüm sınırı örnekleri satır ve Blob SHA ile karşılaştırıldı; ayrıntılar STATUS'ta. Amaç/kullanım kaçırmaları belgelenmiş alias/bölüm sınırıdır; içerik gerçekten yok sayılmadı, puan/kural değiştirilmedi.
- [x] İlk smoke çalıştırıcısı kaldırıldı; normal test/CI ve UI değişmedi. Yalnız ilk belge smoke turunda kod değişmediğinden geniş kontroller tekrarlanmadı; sonraki kod revizyonunun kontrolleri ayrıca yapıldı.
- [x] Kullanıcı yanlış negatifler için dar revizyon yetkisi verdi; genel TR/EN amaç başlıkları, sınırlı numara önekleri, backend/frontend kurulum ve çalıştırma alias'ları eklendi. Bölüm sınırları, ağırlıklar, tip öncelikleri ve demo fixture korundu; proje adına özel kalıp yok.
- [x] TR/EN kanıt metinleri yapısal eşleşme başarısızlığını kesin içerik yokluğundan ayırıyor; görevler mevcut içeriği ekle/düzenle seçeneğini kapsıyor. readme.missing/empty ile doğrulanmış veri durumu ayrı; unknown ve null aritmetiği değişmedi.
- [x] Genel başlık/numara için olumlu ve ilgisiz başlık/komşu bölüm için olumsuz sentetik regresyonlar; gerçek README'ler fixture'a kopyalanmadı, yeni bağımlılık eklenmedi.
- [x] Yerel kontroller sonrası aynı üç repo tek client ile yeniden alındı; aynı normalize girdide eski/yeni gerçek motor karşılaştırması: complete 73,3 → 90, README 30 → 46,7; 5 fail→pass. SHA'lar önceki smoke ile de aynı. Değişim tespit düzeltmesi, profil gelişimi değildir.
- [x] Jobfit usage fail sınırı korundu; Kurulum komutu komşu Kullanım bölümüne taşınmadı. Kalan sınır ve yeni ölçülü görev metni STATUS'ta. Geçici çalıştırıcı ve önceki kaynak kopyaları kaldırıldı.
- [ ] Dar revizyonu içeren aynı A3 motor paketinin kullanıcı incelemesi; henüz commitlenmedi, ayrı belge commit'i kapsamı gibi sunulmaz.
- [ ] Bu motor diliminin kullanıcı commit/push ve yeni uzak CI doğrulaması. 7025b91 önceki tasarım commit'idir; yeni motorun CI kanıtı değildir.

A3'ün tamamı bitti sayılmaz. 1.0.0'da not_applicable kullanılmaz; ileride kullanımı/aritmetiği tanımlanmadan payda değiştirilemez. MongoDB/karşılaştırma A4, paylaşım A5 kapsamındadır.

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

