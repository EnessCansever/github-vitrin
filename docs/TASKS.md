# Görevler ve kabul kriterleri

Kaynak: [başlangıç sözleşmesi](../RepoVitrin-Codex-Proje-Sozlesmesi.md). `[x]` yalnız doğrulanan tamamlanmış işi, `[ ]` açık işi gösterir. Aşamalar kullanıcı geçiş mesajıyla ilerler.

## İlk yayına kalan kapsam — 31 Ekim 2026

A5.1 Story/yatay görünümleri kullanıcı tarafından kabul edildi. Yerel HEAD **0f3d6c5570e7a6bdade0d3b44ac253102ca4c4d9**, feat: add Developer ID share cards. **GitHub Actions CI #11 başarılı** bilgisi kullanıcı ekran görüntüsüne dayanan doğrulamadır; bu tur bağımsız uzak sorgu yapılmadı.

Aşağıdaki tek tablo mevcut uygulamayla sınırlı kapsam incelemesidir; kendiliğinden uygulama/test yetkisi vermez. Kullanıcının sonraki mesajıyla yalnız aşağıdaki A4.3a veri katmanı yetkilendirildi. **İlk yayın**, daha dar bir sürüm açıkça onaylanmadığı için sözleşmenin v1 / A0–A6 teslimi olarak ele alındı. “Sonraki dilim”, “v1 sonrası sürüm” demek değildir. A7 gerçek dağıtım/ölçüm yayından sonra gelir; BACKLOG dışındaki v1 işleri sessizce oraya taşınmaz. Numaralar önerilen sıra ve bağımlılık referanslarıdır, yeni kabul edilmiş aşama numaraları değildir.

| İş ve sözleşme/belge maddesi | Mevcut durum ve uygulamadaki kanıt | İlk yayın / sonraki sürüm | Bağımlılık ve önerilen uygulama sırası |
| --- | --- | --- | --- |
| **1. Dağıtık atomik throttle; session + güvenilir proxy IP türevi, profil/kapsam yenileme sınırı** — Sözleşme §7, §9, §11 A4; ARCHITECTURE Depolama/paylaşım/sınırlar | **Kısmi.** [rate-limits.ts](../src/lib/db/rate-limits.ts) atomik sayaç/expiry/TTL ve güvenli sonuç katmanını sağlar; 36 secretsız test ve ayrı gerçek Atlas eşzamanlılık kontrolü geçti. [analysis/actions.ts](../src/features/analysis/actions.ts) henüz sayacı çağırmıyor; HMAC/session/proxy politikası yok. [github/transport.ts](../src/lib/github/transport.ts) sınırları yalnız tek GitHub işlemine aittir. | **V1 ilk yayın için zorunlu.** Mevcut client limitleri dağıtık abuse koruması değildir. | **1:** küçük rateLimits veri katmanı bu dilimde uygulandı; sonra getRepos/analyze, rapor/kart ve ileride paylaşım girişlerine uygun limit entegrasyonu. IP'nin güvenilir kaynağı/ortam ayarı entegrasyondan önce belirlenmeli; ham IP/token loglanmamalı. |
| **2. İşlem kilidi, aynı isteği birleştirme ve sunucu eşzamanlılık sınırları** — §7, §9, §11 A4 | **Açık.** LiveAnalysis/ProfileSearch/CardStudio ref guard'ları yalnız ilgili istemcinin çift tıklamasını/geç yanıtını engelliyor. DB'de requestLocks ve süreçler arası birleştirme yok. | **V1 ilk yayın için zorunlu.** | **2**, 1 üzerine; kilit kimliği/kapsamı, expiry ve hata sonrası bırakma davranışı. Server belleği tek başına dağıtık kilit sayılmaz. |
| **3. 15 dakikalık analysisCache + gerçek yenileme/veri zamanı ayrımı** — §4, §6–7, §11 A4; PRODUCT Önce–sonra | **Açık.** analyze her çağrıda GitHub'dan veri alıp motoru çalıştırıyor; analysisCache yok. Snapshot okuma önbellek değildir. | **V1 ilk yayın için zorunlu.** | **3**, 1–2 ile birlikte; user ID/login + repo seti/scopeHash + rulesVersion anahtarı, TTL ve okuma expiry denetimi. Cache sonucu yeni analiz/gelişim gibi sunulmamalı; zorunlu yenilemenin gerçekten veri aldığı test edilmeli. |
| **4. Uyumlu snapshot karşılaştırması ve sınırlı cihaz geçmişi** — §2, §6, §11 A4; PRODUCT Önce–sonra | **Açık.** [snapshot-schema.ts](../src/lib/db/snapshot-schema.ts) kimlik/repo seti/scopeHash/rulesVersion/complete durumunu saklıyor; karşılaştırma fonksiyonu, seçim/sunum ve localStorage geçmişi yok. | **V1 ilk yayın planında zorunlu; v2/backlog değil.** | **4**, 3 sonrası: aynı kullanıcı + aynı repo seti + aynı sürüm + iki complete rapor. Incomplete/uyumsuz kapsamı reddet; yalnız doğrulanmış check fail→pass farkından gelişim çıkar. Cihaz geçmişi sınırlı erişim kimlikleridir, hesap sistemi değildir. |
| **5. Açık kullanıcı işlemiyle ayrı shareReports oluşturma/okuma/silme** — §2, §7, §9, §11 A5 | **Açık.** [snapshots.ts](../src/lib/db/snapshots.ts) yalnız 30 günlük analysisSnapshots oluşturuyor. [reportHref](../src/features/reports/link.ts) okuma tokenını fragment'te taşıyor. 90 günlük ayrı paylaşım kopyası, yönetim/silme tokenı ve silme akışı yok. | **V1 ilk yayın için zorunlu.** A4.2 bağlantısı bunun yerine geçmez. | **5**, 1–2 ve mevcut snapshot üzerine: kullanıcı onayı, en az 128-bit paylaşım kimliği, 90 gün expiry + okuma kontrolü, DB'de yönetim tokenı hash'i/cihazda token, origin/limit ve anonim incognito erişim/silme testleri. |
| **6. Server-rendered OG metadata ve erişilebilir OG görseli** — §2–3, §7, §11 A5 | **Açık.** [reports/[id]/page.tsx](../src/app/reports/[id]/page.tsx) genel noindex kabuğu; rapor JS sonrasında loadReport ile okunuyor. [cards/actions.ts](../src/features/cards/actions.ts) PNG'yi POST yanıtında döndürüyor. Root metadata'da rapora ait openGraph alanı/public OG rotası yok. | **V1 ilk yayın planında zorunlu.** İndirilebilir 1200×630 PNG, otomatik OG değildir. | **6**, 5 ve yayın adresi üzerine. Bot fragment'teki private tokenı sunucuya gönderemez; tokenı query/path'e taşımak yerine ayrı paylaşım kaydından SSR metadata/görsel sunulmalı. GET/OG yeni GitHub/puanlama başlatmamalı, expiry/silme korunmalı. |
| **7. 1080×1350 gönderi ve gelişim kartları; üç format/TR–EN doğrulaması** — §2, §8, §11 A5; DESIGN | **Kısmi.** [cardFormats](../src/features/cards/types.ts) yalnız Story 1080×1920/yatay 1200×630; iki ilk analiz kartı kabul edildi. Gönderi boyutu ve gerçek gelişim kartı yok. | **V1 ilk yayın planında zorunlu; A5.1 dışındaki sonraki dilimlerdir.** | **7:** ilk analiz gönderi formatı bağımsız küçük dilim olabilir; gelişim PNG'si 4'e bağlıdır. Her format ayrı kompozisyon, gerçek boyut/TR karakter/uzun ad ve önerisiz durum kontrolleri gerekir. |
| **8. Rapor/format/dil/templateVersion bazlı görsel cache** — §7; ARCHITECTURE Depolama/paylaşım/sınırlar | **Açık.** generateCard her seferinde renderCard çağırıyor. Font/doku promise'leri veya CardStudio'nun tek önizlemesi kalıcı görsel cache değildir. | **V1 kapsamı; ilk yayın planında açık zorunlu iş.** | **8**, 5–7'nin erişim/sürüm sınırlarıyla; rapor kimliği + format + locale + templateVersion, TR/EN ayrımı. Cache erişim kontrolünü veya süresi dolan/silinen kaydı aşmamalı; tanımlanmamış ek saklama süresi uydurulmaz. |
| **9. Kısa TR/EN gizlilik ve metodoloji sayfaları** — §5, §9; SCORING/PRODUCT | **Açık.** Skor kapsamı kısa UI notlarında ve belgelerde mevcut; src/app altında /methodology veya gizlilik sayfası yok. | **V1 ilk yayın için zorunlu.** | **9**, veri/paylaşım süreleri net uygulandıktan sonra: public kapsam, snapshot için 30 gün, analiz cache için 15 dakika ve shareReports için 90 günlük saklama kuralları, veri/puan/tespit sınırları ve sahiplik iddiasının sınırı. |
| **10. Yayın güvenliği/operasyon incelemesi ve eksik korumalar** — §7, §9, §11 A6; DECISIONS D011 | **Kısmi.** Zod, sabit API hostu, boyutlar, server-only secret ve güvenli hata DTO'ları var. GitHub deadline'ı 20s, DB timeout'u ayrı; tüm action için 20s sınırı doğrulanmış değil. CorrelationId/tür/süre log düzeni ve uçtan uca concurrency kontrolü yok. ESLint 9 EOL sınırlaması açık. | **A6 yayın öncesi zorunlu inceleme/kapanış.** ESLint için zorunlu major yükseltme kararı verilmedi; destek/uyumluluk ve bilinen risk yeniden değerlendirilmeli. | **10**, 1–8'den sonra; toplam süre/hosting uyumu, hata/log redaksiyonu, origin/mutasyon, token/IP/README sızıntısı, secret ve bağımlılık güvenlik taraması. CI yeşili bu incelemenin yerine geçmez. |
| **11. Kalıcı kritik Playwright akışları ve erişilebilirlik kontrolleri** — §3, §8, §11 A6 | **Kısmi.** [CI](../.github/workflows/ci.yml) npm ci/test/lint/typecheck/build çalıştırıyor; mevcut testler Vitest. Playwright/axe kurulumu veya E2E CI işi yok. Önceki Chrome/CDP kontrolleri yerel tarihsel kanıt. | **A6 ilk yayın için zorunlu.** Tüm test araçlarını sırf liste için kurmak gerekmez; sözleşmedeki kritik akış/erişilebilirlik kapsamı tamamlanmalı. | **11**, kullanıcı akışları sabitlenince; secret/ağ gerektirmeyen deterministik CI, ayrıca kontrollü gerçek bağlantı kontrolleri. Yeni paylaşım/karşılaştırma ve hata durumları dahil. |
| **12. Farklı gerçek public hesaplarda doğruluk ve final README** — §5, §11 A6 | **Kısmi.** EnessCansever gerçek analiz/kanıt smoke'ları ve önceki testler STATUS'ta; README kurulum/mimari/sınırları anlatıyor, ürün hâlâ geliştirmede. Son yayın paketinin farklı hesap/ekran/demo kanıtları tamam değil. | **A6 ilk yayın için zorunlu.** | **12**, 3–11 sonrası; yapısal tespit sınırlarını koruyarak manuel örneklem, yalnız doğrulanmış özellik/screenshot/demo ve kurulum açıklaması. Örnek bir canlı puan sabit hedef değildir. |
| **13. Fiziksel telefonda mobil indirme/okunurluk ve paylaşım kontrolü** — §2, §8, §11 A5–A7; STATUS A5.1 doğrulama sınırları | **Doğrulanmadı.** Yerel Chrome indirme/PNG boyutu ve mobil emülasyon kanıtı var; fiziksel telefona kaydetme veya sosyal platformda paylaşma kanıtı yok. | Mobil indirme/okunurluk **A6 yayın kalite kontrolünde açık**. Gerçek platform paylaşım/geri bildirim deneyi **A7**; sözleşme belirli telefon/OS matrisi veya Instagram API/otomatik post zorunluluğu koymuyor. | **13**, nihai kart/bağlantı akışından sonra. Dosya indirme isteği, gerçekten kaydetme, link kopyalama, varsa paylaşım menüsü açma ve gerçek gönderi ayrı sonuçlardır; cihaz kapsamı/sonuç ayrıca kaydedilir. |
| **14. Yayın hedefi/ortamları ve yetkili deploy + smoke** — §3, §9, §11 A6; DECISIONS D006 | **Açık.** Yerel GitHub/Atlas geliştirme kanıtı var; üretim Vercel/Atlas bölgesi/plan/limit/env ve deploy smoke kanıtı yok. site config'te RepoVitrin ve boş Instagram adresi var; final domain belirlenmedi. | **İlk yayın için zorunlu.** Marka değiştirmek veya Instagram adresi eklemek zorunlu değildir; uydurulmaz. | Hedef/domain/plan/timeout/proxy kararları **1 entegrasyonu ve 6'dan önce**, ortam hazırlığı diğer işlerle paralel. **14:** 1–13 kapanınca ve ayrı yayın yetkisiyle deploy/smoke; yetki yoksa incelemeye hazır somut paket, yayın yapıldı sayılmaz. |
| **15. Küçük kullanıcı denemesi ve anonim aggregate ölçümler** — §1, §7, §11 A7 | **Açık.** aggregateEvents/olay toplama yok; gerçek kullanıcı denemesi/başarı metriği kanıtı yok. Mevcut indirme bildirimi olay ölçüm altyapısı değildir. | **A7 dağıtım işi, ilk deploy sonrasında; v2'ye taşınmış değildir.** Ölçüm hazırlığı ilk trafik planıyla birlikte ele alınmalı. | **15**, 14 sonrası/ilk dağıtımla; kullanıcı adı/IP tutmadan günlük olay sayıları, gerçek fayda/paylaşım geri bildirimi. Kart indirme gerçek paylaşım veya viral başarı sayılmaz. |
| **16. Gerçek v1 dışı işler** — §2, §6; BACKLOG | Hesap/cihazlar arası hesap geçmişi, ödeme, sıralama, AI analiz, otomatik GitHub yazma, ayrıntılı kod kalitesi, çoklu tema, fork/org kapsamı ve dış demo çalışırlık taraması v1 dışında. | **İlk yayın için zorunlu değil.** Ancak ayrı kullanıcı kararıyla sonraki sürüm; karşılaştırma/OG/cache bu gruba dahil değildir. | Sıra verilmedi, uygulama yetkisi yok. Yeni Redux/Redis/kuyruk/servis ihtiyacı varsayılmaz. |

Örnek 10 analiz/10 dakika ve 60s yenileme değerleri kaynakta **başlangıç/config örneğidir**, bu tur kesin üretim kotası ilan edilmedi. Nihai sınırlar hosting ve kullanım bağlamında doğrulanır. Fiziksel telefon, ekran okuyucu veya sosyal platform için tanımlanmamış bir cihaz sayısı ya da otomatik paylaşım entegrasyonu icat edilmedi.

**Önceki küçük dilim önerisinin durumu:** Kullanıcı atomik throttle veri katmanını yetkilendirdi; A4.3a aşağıda işlendi. Uçlara entegrasyon, session/IP/proxy, kilit/cache ve yayın hâlâ açık; bu tur sonraki işe geçilmez. Örnek kotalar ürün sabiti yapılmadı.

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

### A3 Puanlama — teknik motor ve gerçek sonuç dilimi; kabul edildi

- [x] Saf kurallar + sentetik fixture testleri; her check için ID/scope/sürüm/durum/earned/max/kanıt/öneri anahtarı; 20/30/50 kategori aritmetiği ve yuvarlama.
- [x] Unknown/dil bağımsızlığı, 1/3 eşdeğer repo, kesirli ortalama, missing/boş/unknown README, sıfır/uygunsuz/yinelenen repo ve GraphQL partial kökenli unknown davranışı.
- [x] unified/remark-parse AST; sınırlı TR/EN alias'ları, bölüm sınırları, içerik koşulları, referans link/görsel ve güvenilmeyen HTML/protokol sınırları SCORING'de belgeli.
- [x] Yalnız tam analizde öncelikli profil tipi, >=80 eşiği ve check referansları; en fazla üç benzersiz doğrulanmış görev, max/N etkisi ve sabit eşitlik sırası.
- [x] UI demo fixture'ı değiştirmeden 23 check ve 15 + 22,5 + 40 = 77,5 doğrulaması; editoryal öneri sırası farkı kaydedildi.
- [x] Saflık, aynı sonuç, donmuş girdinin korunması, ağ/saat/rastgelelik kullanmama ve TR/EN mesaj anahtarları testleri.
- [x] A3 motor ve dar revizyon: 8 dosya/228 test (ilk motor 197 + 31 yeni regresyon); lint, typecheck, production build ve diff kontrolleri başarılı. Sonuçlar STATUS'ta kayıtlı.
- [x] Gerçek seçim → yeniden doğrulanan profil/repo → adapter README/metadata → saf motor → Developer ID gerçek sonuç bağlantısı. Kullanıcı bu dilimi açıkça yetkilendirdi; sıfır seçim pasif, 1–3 seçim gerçek analizi başlatır.
- [x] İlk gerçek smoke: EnessCansever/jobfit-tr/fixora/barber gerçek ID ve kapsamı adapter üzerinden doğrulandı; tek client bütçesinde complete, 20 + 23,3 + 30 = 73,3, Vitrin Yapımda. Profil/üç proje README found; bu önceki motor sonucudur.
- [x] Aynı okunan README metninde fixora demo, jobfit kurulum/teknoloji ve ek amaç/kullanım/bölüm sınırı örnekleri satır ve Blob SHA ile karşılaştırıldı; ayrıntılar STATUS'ta. Amaç/kullanım kaçırmaları belgelenmiş alias/bölüm sınırıdır; içerik gerçekten yok sayılmadı, puan/kural değiştirilmedi.
- [x] İlk smoke çalıştırıcısı kaldırıldı; normal test/CI ve UI değişmedi. Yalnız ilk belge smoke turunda kod değişmediğinden geniş kontroller tekrarlanmadı; sonraki kod revizyonunun kontrolleri ayrıca yapıldı.
- [x] Kullanıcı yanlış negatifler için dar revizyon yetkisi verdi; genel TR/EN amaç başlıkları, sınırlı numara önekleri, backend/frontend kurulum ve çalıştırma alias'ları eklendi. Bölüm sınırları, ağırlıklar, tip öncelikleri ve demo fixture korundu; proje adına özel kalıp yok.
- [x] TR/EN kanıt metinleri yapısal eşleşme başarısızlığını kesin içerik yokluğundan ayırıyor; görevler mevcut içeriği ekle/düzenle seçeneğini kapsıyor. readme.missing/empty ile doğrulanmış veri durumu ayrı; unknown ve null aritmetiği değişmedi.
- [x] Genel başlık/numara için olumlu ve ilgisiz başlık/komşu bölüm için olumsuz sentetik regresyonlar; gerçek README'ler fixture'a kopyalanmadı, yeni bağımlılık eklenmedi.
- [x] Yerel kontroller sonrası aynı üç repo tek client ile yeniden alındı; aynı normalize girdide eski/yeni gerçek motor karşılaştırması: complete 73,3 → 90, README 30 → 46,7; 5 fail→pass. SHA'lar önceki smoke ile de aynı. Değişim tespit düzeltmesi, profil gelişimi değildir.
- [x] Jobfit usage fail sınırı korundu; Kurulum komutu komşu Kullanım bölümüne taşınmadı. Kalan sınır ve yeni ölçülü görev metni STATUS'ta. Geçici çalıştırıcı ve önceki kaynak kopyaları kaldırıldı.
- [x] Dar revizyonu içeren motor paketi ee7328e ile commitlendi; kullanıcı yeni gerçek analiz/arayüz dilimine açık yetki verdi.
- [x] ee7328e motor commit'i için uzak CI başarısı kullanıcı tarafından sağlanan ekran görüntüsü doğrulaması olarak kaydedildi; bağımsız uzak sorgu yapılmadı. Yeni arayüz diliminin CI sonucu değildir.

### A3 gerçek analiz ve sonuç arayüzü — bu dilim

- [x] Temiz Git başlangıcı/HEAD ee7328e, AGENTS ve ilgili belgeler; motorun kullanıcı tarafından sağlanan uzak CI doğrulamasını kaydet.
- [x] Analyze Server Action: strict/byte/seçim tekilliği doğrulaması; profile ID/login ve repo ID/owner/public/archive/fork yeniden doğrulama; istemciden metadata/puan/bulgu kabul etmeme.
- [x] İşlem başına yeni client ve ortak bütçe; gerçek profil/README/selected metadata'dan motor girdisi. Report checkedAt/rulesVersion ve güvenli serileştirilebilir kanıt/öneri çıktısı.
- [x] Gerçek score/category/type/reason/check/evidence ve en çok üç görev + motor etkisi; arayüzde yeniden skor veya sıralama yok. Developer ID IdentityCard ortak, demo fixture ve editoryal içerik korunur.
- [x] Pending/çift gönderim/ref guard, eski yanıtları atma, güvenli hata/gerçek retry ve profil/seçime geri dönüş; incomplete null toplam/tip, bilinen kategori ve bulguları koruma.
- [x] TR/EN'de sonuç/veri zamanı/seçili ID korunumu; dil değişimi yeni analiz başlatmıyor. Tam yenileme kalıcılığı veya kalıcı rapor linki iddiası yok.
- [x] 38 yeni deterministik test (35 action + 3 render); toplam 10 dosya/266 test. Geçersiz/tamper/scope, complete/incomplete, DTO güvenliği, ortak/fresh bütçe ve sonuç sunumu. Lint/typecheck/build ve diff kontrolü sonuçları STATUS'ta.
- [x] Temiz Chrome/CDP gerçek EnessCansever formu ve üç proje analizi, skorun motordan gelmesi, native Enter/Space/focus/accordion, üç/sıfır seçimi, geri dönüş, geç yanıt ve ağ kesintisi/gerçek retry kontrolleri.
- [x] TR/EN sonuç ve seçim korunumu, 320/390/768/1440 taşma ve uzun adlar, reduced-motion; mobil/masaüstü görüntüleri incelendi. Incomplete tarayıcıda canlı veriyle zorlanmadı; deterministik render testinde doğrulandı.
- [x] Dar A3 revizyonu: tüm sayfalarda ortak tam genişlikli sticky header; mobil/masaüstü opak zemin, ince sınır, TR/EN ve skip link erişimi; scroll-padding/margin ile başlık/Tab odağı payı.
- [x] Yeni gerçek sonuç mount'unda 520ms kart, 80+600ms gerçek kategori dolulukları ve 140+420ms detay girişi; başlangıçtan gerçek metin/puan, null kategoride sahte doluluk yok. Mevcut CSS/reduced-motion, yeni bağımlılık yok.
- [x] Profil başarı parent/child ve Strict Mode çift scroll'u giderildi; aynı başlığa tek focus/scroll. Yeni sonuç başlığı odaklanır, raporun tamamı live region değildir.
- [x] Gerçek Chrome/CDP: dört sayfada mobil/masaüstü uzun scroll, 320px taşma, native Tab/Space ve header altında kalan hedefin otomatik görünmesi. Gerçek analiz ilk/yeni giriş, TR/EN'de aynı DOM/istek korunumu ve reduced-motion doğrudan görünüm ölçüldü.
- [x] Mobil ilk giriş ve masaüstü yeni analiz kısa gerçek ekran kayıtları alındı; timestamp'li kare ve opacity/transform ölçümleriyle incelendi. Normal giriş ~689ms; locale/accordion tekrar başlatmadı, reduced-motion yeni animasyon üretmedi. Incomplete canlı hareket kontrolü yapılmadı.
- [x] Dar revizyon sonrası mevcut 266 test, lint, typecheck, production build ve diff/koruma kontrolü; motor/adapter/action/fixture/puan/öneri sırası değişmedi. Sonuçlar STATUS'ta kayıtlıdır.
- [x] Yeni gerçek sonuç görünümü, sticky header ve giriş hareketi için kullanıcı kabulü alındı (29 Ekim 2026, kullanıcı bildirimi).
- [x] Kullanıcı 5ad54fb commit/push bilgisini verdi; uzak CI başarısı kullanıcı ekran görüntüsüyle sağlanan doğrulama olarak kaydedildi. Bu tur bağımsız uzak sorgu yapılmadı.

Kaynak sözleşme §11 A3'ün iki teknik maddesi motor/test paketiyle karşılandı; gerçek sonuç dilimi yerelde doğrulandı. **Kullanıcı mevcut A3 görünümünü kabul etti, 5ad54fb commit/push ve uzak CI kapıları kullanıcı doğrulamasıyla kapandı; A3 kabul kriterleri tamamlandı.** Canlı incomplete hareket/görsel kontrolünün yapılmamış olduğu önceki test sınırı korunur; deterministik null/unknown testleri geçerlidir. 1.0.0'da not_applicable kullanılmaz; ileride aritmetiği tanımlanmadan payda değiştirilemez. Yalnız aşağıdaki A4.1 dilimi yetkilendirildi.

### A4 Depolama/karşılaştırma:

- [ ] Snapshot, cache, atomik throttle, lock, TTL; uyumlu/uyumsuz karşılaştırma testleri.
- [ ] Yenilemenin GitHub verisini gerçekten yeniden aldığı ve cache sonucunu yeni ilerleme saymadığı doğrulanır.

### A4.1 — snapshot modeli ve sunucu saklama/okuma (ilk sınırlı dilim)

- [x] AGENTS ve ilgili belgeler; temiz Git/HEAD 5ad54fb, A3 kabul kriterleri ve kullanıcı ekran görüntüsüyle uzak CI doğrulaması kaydı.
- [x] MongoDB native driver 7.7.0 stabil sürüm/Node uyumunu resmi kaynak ve paket metadatasıyla doğrula; npm/lock tam sürüm. Sistem Node'u değiştirme.
- [x] Mevcut Report için strict snapshotVersion=1 şeması; ayrı rulesVersion, profil kimliği, repo seti/hash, fetchedAt karşılığı checkedAt, puan/check/kanıt/tip/görevleri koru. Mesaj anahtarları/parametreleri dil bağımsız, token/ham README/API/çeviri yok.
- [x] Complete/incomplete/null ve check/scope/kategori/görev referansları; geçersiz kayıtları hem oluşturma hem okumada reddet. Motoru yeniden çalıştırma.
- [x] Server-only createSnapshot/readSnapshot; immutable insert, UUID ve ayrı 256-bit read token/hash; kimlik tek başına erişim vermez. Public endpoint veya action bağlantısı yok.
- [x] Çağrı anında env/bağlantı, process/HMR havuz paylaşımı; güvenli configuration/unavailable/invalid_report/invalid_record hataları. Başarısız bağlantı temizliği ve sonradan açık çağrıda tekrar deneme.
- [x] Sözleşmedeki 30 gün TTL: expiresAt=createdAt+30 gün, unique _id ve idempotent expiry indeksi; okuma expiry filtresi. Yeni varsayımsal silme/indeks politikası yok.
- [x] Şema/kayıt dönüşümü/bozuk veri/null/token/expiry/güvenli DB hatası ve havuz için deterministik mock testler. ignoreUndefined:true ve gerçek BSON codec ile ağsız complete/incomplete dönüşüm; gerçek MongoDB entegrasyonu sayılmaz, test/CI DB ağı veya secret gerektirmez.
- [x] Son kontroller: 13 dosya/311 test (45 yeni DB davranışı), lint, typecheck, Mongo/GitHub env değerleri boş production build ve diff/koruma başarılı; index boş. Gerçek sonuçlar STATUS'ta.
- [x] .env.example boş MONGODB_URI/MONGODB_DB, README kullanıcı kurulum adımı ve PRODUCT/ARCHITECTURE/DECISIONS kayıtları. Gerçek env açılmadı/değiştirilmedi.
- [x] Gerçek Atlas smoke: kullanıcı MONGODB_DB satırını kaydettikten sonra mevcut modüllerle repovitrin_dev bağlantısı/indeks/create/read, complete 86,7 ve bütün rapor alanlarının korunması, yanlış token/bulunmayan kimlik null, incomplete toplam/tip null ve bilinen bulgular doğrulandı. Başka DB'ye erişim yok; URI/token/hash yazdırılmadı.
- [x] Üçüncü sentetik kaydın süresi geçince DB'de mevcutken uygulama okumasının null döndürmesi; expiresAt:1 / expireAfterSeconds:0 ve _id_ indeksi doğrulandı. Fiziksel otomatik TTL silinmesi gözlenmedi; indeks varlığı silinme kanıtı değildir.
- [x] Yalnız bu çalıştırmada oluşturulan üç kayıt kimlik/scope ile ayrı ayrı silindi ve bulunamadıkları doğrulandı; geçici çalıştırıcı kaldırıldı, dev sunucusu korundu. Kod/test/paket değişmediğinden geniş kontroller tekrarlanmadı; belge diff/index ve başlangıç dosya koruması kontrol edildi. UUID'ler/sonuçlar STATUS'ta.
- [x] A4.1 f81b46c commit'i doğrulandı; uzak CI başarısı kullanıcı ekran görüntüsüyle sağlanan doğrulama olarak kaydedildi. Önceki yerel/Atlas kanıtıyla A4.1 kapandı; A4.2'ye yalnız yeni kullanıcı mesajıyla geçildi.

A4.1 uygulaması A4'ün bütünü değildir. Action yazımı/rapor adresi aşağıdaki A4.2 kapsamında; cache, karşılaştırma, dağıtık throttle/lock, sosyal paylaşım/yayın açık kalır.

### A4.2 — gerçek analiz kaydı ve tokenlı rapor adresi

- [x] Belgeler/temiz Git/HEAD f81b46c ve kullanıcı ekran görüntüsüyle A4.1 uzak CI kapanışı.
- [x] Analyze yalnız sunucu adapter/motor çıktısını kaydeder; complete/incomplete/30 gün/token hash sözleşmesi, strict seçim ve kimlik doğrulama korunur. Client raporu/puanı reddedilir.
- [x] Saved yanıtta token fragment'li /reports/[id] adresi; başarısız kayıtta hesaplanmış sonucu koruma, açık uyarı ve güncel GitHub verisiyle yeni analiz/kayıt. Çift gönderim/ref guard navigation öncesinde sürer; server memory cache eklenmez.
- [x] Strict id/token loadReport action'ı, hash/ham kayıt dönmeme; missing/expired/invalid ortak güvenli durum, DB/configuration hatasında ayrı unavailable ve gerçek read retry.
- [x] Mevcut Developer ID kartı/kanıt/görevler; stored notu, UTC veri zamanı ve 30 günlük expiresAt. Refresh/dil yalnız snapshot okur/korur, yeni GitHub/puanlama yok. Yeni analiz eski snapshot'ı değiştirmeden ana forma döner.
- [x] Clipboard gerçek başarı/hata, API yoksa label'lı elle copy; linki bilen erişimi notu. Fragment URL/token log/metadata'ya eklenmez; force-dynamic/noindex/no-referrer/private no-store gerçek production başlıklarıyla doğrulandı.
- [x] 19 yeni secretsız test: sunucu kayıt kaynağı/failure/incomplete/fresh retry ve client raporu reddi; okuma erişim/hata/DTO/fragment, iki dil stored render. Toplam 14 dosya/330; lint/typecheck/secretless build başarılı.
- [x] Gerçek EnessCansever → Atlas kayıt → rapor → full reload/TR↔EN; salt erişimde server GitHub sayacı 22'de kaldı. Yanlış token/nonexistent/expired ve sentetik incomplete durumları.
- [x] Ayrı production process'inde DB ayarı boş hatası; read missing'e dönüşmedi, gerçek read retry toparlandı. Save failure ve browser offline retry eski raporu korudu; normal sunucuya dönüp yeni analiz/kayıt yaptı. İlk snapshot okunabilir kaldı; token/URI çıktısı yok.
- [x] TR 390×844/EN 1440×900 ve incomplete mobil görselleri incelendi; 320/390/768/1440, uzun adlar, Tab/Space/focus/sticky ve reduced-motion. Giriş olay/timing ~667ms, dilde tekrar yok.
- [x] Yalnız bu turun 4 UUID'si için temizlik/yokluk doğrulaması: üç kayıt ayrı silindi, expired zaten yoktu. İnceleme için tutulan kayıt yok. Kullanıcı dev sunucusu korundu; geçici araçlar/profil/loglar kaldırıldı. Son diff/index/koruma kontrolü STATUS'ta.
- [x] Kullanıcı mevcut A4.2 görünümünü kabul etti (29 Ekim 2026, kullanıcı görsel incelemesi).
- [x] Kullanıcı normal Chrome profilindeki hydration farkının yalnız data-yd-* nitelikleri olduğunu ve gizli pencerede uyarının oluşmadığını doğruladı. Olası eklenti/DOM müdahalesi; kesin neden ve eklenti adı doğrulanmadı. Bu tur bağımsız tarayıcı testi veya uygulama kodu değişikliği yok; suppressHydrationWarning eklenmedi.
- [x] A4.2 257acff9b8a86d62db5a8beda94f0bf68f42d6b4 commit/push; uzak CI başarısı kullanıcının ilettiği Codex public API doğrulaması olarak kaydedildi ([run 40792217446](https://github.com/EnessCansever/github-vitrin/actions/runs/40792217446)). Bu tur bağımsız sorgulanmadı.

A4.2 yerel/canlı kontrolleri, kullanıcı görsel kabulü, commit/push ve kullanıcı tarafından sağlanan uzak CI doğrulaması tamam. Hydration karşılaştırması kullanıcı bildirimidir; olası eklenti müdahalesi kesin teşhis değildir. Kabul kaydı turunda yalnız belge diff kontrolü yapıldı. Yeni saved yanıtı uygulama turunda özel olarak geciktirilmedi; mevcut ref guard ve önceki A3 kanıtı korunur, yeni gecikme testi gibi sunulmaz. A4'ün cache/atomic throttle/lock/karşılaştırma kabul maddeleri tamamlanmadı. Kullanıcının yeni açık mesajıyla yalnız aşağıdaki A5.1 yetkilendirildi; yayın yoktur.

### A4.3a — atomik istek sayacı veri katmanı (31 Ekim 2026)

- [x] AGENTS, mimari/karar/durum/görev ve sözleşme §7/§9 incelendi; temiz başlangıç HEAD 95c9881, index boş. Yeni kullanıcı mesajı yalnız bu dilimi yetkilendirdi; önceki belge commit'i için uzak CI sonucu verilmedi/varsayılmadı.
- [x] server-only consumeRateLimit: çağırandan strict opak 64 hex key, pozitif güvenli tamsayı limit/windowMs; geçersiz Date aralığı reddi. Varsayılan kota, IP/session üretimi veya yeni bağımlılık yok.
- [x] Tek belgede atomik pipeline/upsert; MongoDB $$NOW, ilk kabulde başlayan sabit pencere, yalnız kabulde count artışı, limitte ret ve sabit expiry. Aynı aktif anahtarda değişen politika invalid_limit; süresi dolunca yeni politika uygulanabilir.
- [x] Unique _id ile oluşturma yarışı; yalnız duplicate-key için tek non-upsert kurtarma, kayıp kayıt/ikinci hata unavailable. Ağ/timeout belirsiz yazımında uygulama retry yok. Majority write concern; mevcut lazy bağlantı/havuz/timeout korunur.
- [x] Açık RateLimitResult: allowed/remaining/resetAt/retryAt; ret remaining=0, kabul retryAt=null. configuration/unavailable/invalid_record/invalid_limit ayrı StorageError; ham hata veya key loglanmaz.
- [x] İdempotent rate_limit_expiry: expiresAt:1, expireAfterSeconds:0; her tüketimde pipeline expiry denetimi. TTL silinme zamanına bağımlı doğruluk yok; ekstra unique/index/collection framework yok.
- [x] 36 secretsız test: kararlar/sınır, anahtar ayrımı, yenilenen pencere yanıtı, eşzamanlı mock sonuçları/oluşturma çakışması, sınırlı kurtarma, farklı politika ve girdi/kayıt/DB hataları. Mock Mongo atomikliğini veya gerçek TTL'yi kanıtlamaz.
- [x] Ayrı geçici çalıştırıcıyla gerçek geliştirme Atlas: 30 eşzamanlı ilk çağrıda 10 kabul/20 ret; 1 tüketim sonrası 30 çağrıda 9 kabul/21 ret; sayaç 10'da kaldı. Farklı key, politika çakışması, DB'de hâlâ duran expired kaydın yenilenmesi ve kısa gerçek pencere kabul/ret/yenilenmesi doğrulandı.
- [x] Gerçek unique _id/TTL indeksleri kontrol edildi. Yalnız bu çalıştırmanın dört geçici kaydı ayrı _id filtreleriyle silindi, 4/4 yokluğu doğrulandı; anahtarlar/env değerleri raporlanmadı, geçici çalıştırıcı/derlenmiş kopyalar kaldırıldı. Fiziksel TTL silinmesi ve çoklu process/failover testi yapılmadı.
- [x] Son kaynakta 19 dosya/391 test, lint, typecheck ve boş GitHub/Mongo/signing env ile webpack production build geçti. Diff ve korunan kapsam kontrol edildi; index boş.
- [x] Varsayılan npm run build: kullanıcı kendi VS Code terminalinde başarılı olduğunu bildirdi (31 Ekim 2026); kullanıcı tarafından sağlanan yerel doğrulamadır. Önceki Codex Turbopack kontrolü iki denemede yerel port bind ortam kısıtıyla tamamlanamadı; bu uygulama hatası sayılmaz, webpack kontrolünden ayrı korunur. Codex build/test tekrarı veya uzak CI doğrulaması değildir.
- [ ] Dilim commit/push ve yeni uzak CI doğrulaması kullanıcıdan beklenir.

Bu build kabul kaydı turunda yalnız STATUS/TASKS ve belge diff kontrolü; kod/build yapılandırması veya önceki A4.3a paketi değiştirilmedi, testler tekrarlanmadı. Birleşik A4.3a commit kapsamı STATUS'tadır; yerel kontroller tamam, commit/push/uzak CI kapısı açıktır.

Bu yalnız veri katmanıdır; Server Action/rapor/PNG entegrasyonu, session/IP/proxy, dağıtık analiz kilidi, cache ve UI uygulanmadı. A4 genel kabul kriterleri açık. Son test/lint/typecheck/build/diff sonuçları STATUS'ta; kullanıcı yeni mesajı olmadan devam edilmez.

### A5 Paylaşım:

- [ ] İlk/gelişim PNG, 3 boyut, TR/EN, OG metadata server-rendered.
- [ ] Yalnız açık kullanıcı işlemiyle shareReport; expiry/silme; anonim incognito link.
- [ ] Tüm üç formatın indirilen resim boyutu ve Türkçe karakterleri doğrulanır. A5.1 Story/yatay geçti; 1080×1350 henüz uygulanmadı.
- [ ] "İndirildi", "bağlantı kopyalandı", "paylaşım menüsü açıldı" ayrılır; Instagram'a otomatik post iddiası yok.

### A5.1 — ilk kart, önizleme ve iki PNG formatı — kabul/commit/CI kapandı

- [x] Belgeler/temiz başlangıç HEAD 257acff ve A4.2 CI kaynağı ayrımı; A4'ün cache/karşılaştırma/dağıtık limit maddeleri açık bırakıldı.
- [x] Yalnız kayıtlı/süresi geçmemiş complete rapor için id/token/format strict Server Action; mevcut readSnapshot erişim/expiry doğrulaması, istemci skor/rapor reddi ve güvenli hata ayrımı. Incomplete client ve sunucuda engellenir.
- [x] Ayrı Story 1080×1920 ve yatay 1200×630 kompozisyonları; yerel Barlow/IBM Plex ve statik Manrope fontlarıyla Developer ID kobalt afiş kimliği. Config marka/yazar, profil tipi/login/puan/kategori/UTC tarih/kapsam/ilk öneri/hedef. Önerisiz durumda görev uydurulmaz.
- [x] Belirgin rapor eylemi, native format seçimi, aynı PNG ile preview/download, TR/EN, pending/çift tıklama/yanıt kimliği ve güvenli retry. Token path/query, metadata, görsel, dosya adı veya QR'a eklenmez; public OG route yoktur.
- [x] 25 yeni secretsız test; toplam **18 dosya / 355 test**. Veri eşleme/öneri sırası/null engeli, erişim/expiry/storage/render hata kodları, client rapor reddi, TR/EN incomplete sunumu ve gerçek renderer PNG boyutları. CI gerçek GitHub/Atlas gerektirmez. Lint/typecheck/secretsız build/diff başarılı.
- [x] Gerçek EnessCansever → Atlas raporu → iki format preview ve tarayıcı indirme; PNG byte eşitliği ve IHDR boyutları doğrulandı. TR/EN/refresh kartı yeni GitHub çağrısı üretmedi (önce 23→23; son server process'inde 0). Snapshot ve expiresAt değişmedi.
- [x] Kontrollü bekleyen gerçek action'da ikinci tıklama yeni istek oluşturmadı; native Tab/radio ve 3px focus. Browser offline kart isteğinde güvenli hata/eski download yok; online retry toparlandı. Gerçek Atlas incomplete raporda açıklamalı disabled eylem ve resim yok.
- [x] PNG'ler gerçekten açıldı: TR/EN, dört profil tipi/39 karakter login/100 karakter repo/100 puan önerisiz sentetik düzenler. 390×844 ve 1440×900 preview ekranları incelendi; 320/390/768/1440 taşma 0. Üç demo sayfası mobilde taşmasız ve indirmesiz kaldı. Fiziksel cihaz/sosyal platform denemesi değildir.
- [x] Kullanıcının geçerli görsel revizyonuyla referans sağ panel gerçekten açıldı; koyu arayüz/krem kimlik ile kobalt paylaşım afişi DESIGN/D030'da ayrıldı. Önceki krem PNG'ye kabul verilmedi.
- [x] Dev krem başlık, nötr lime mühür, sabit SVG baskı dokusu; kart mesajlarında iki dilde başlık satırları, doğru puan etiketi/katılım çağrısı. Statik Manrope 500 body/öneri fontu; resmi kaynak/lisans/SHA kayıtlı, UI değişken fontu korunuyor.
- [x] 16 yeni sentetik PNG'de gerçek ölçüler, TR/EN/dört tip/39 karakter kullanıcı/100 karakter repo/ondalık/100 puan/önerisiz durum kontrolü. Tam çözünürlük açılışı ve referansla 390 CSS px yan yana Chrome incelemesi yapıldı; teknik/görsel inceleme kullanıcı kabulü değildir.
- [x] Revizyon sonrası tests/cards 25; tüm testler 355, lint/typecheck/secretsız build/diff geçti. Renderer tekrar üretim byte eşitliği/girdi değişmezliği doğrulandı. Başlangıç hash'leriyle action/preview/erişim/ana sayfa/rapor/motor/adapter/fixture korunumu; önceki PNG'ler duruyor.
- [x] Bu revizyonda canlı GitHub/Atlas veya uygulama indirme/klavye akışı tekrarlanmadığı açık kaydedildi; önceki işlev kanıtı ve mevcut testler korunuyor. Fiziksel cihaz/sosyal platform/yeni CI doğrulaması yoktur.
- [x] Story için sağ referans panel ayrı kırpılıp ölçüldü; gerçek font advance değerleriyle sıkı iki/üç satırlı başlık, referansa bağlı mühür oranı, tek kategori şeridi ve sade destekleyici yerleşim. D031/DESIGN ölçüleri kayıtlı.
- [x] Story homojen noktaları yerine yazısız yerel deterministik kâğıt malzemesi, sabit renk/alpha maskesi ve hafif mürekkep aşınması; yeni bağımlılık/runtime üretim yok. Yatay kaynak ve karşılaştırılabilir PNG byte eşitliği korundu.
- [x] Yeni TR/EN Story/uzun ad/100/önerisiz varyantlar ve aynı 390px referans karşılaştırması ayrı /tmp dizininde açılarak incelendi; boyut/güvenli alan kontrolü, 355 test, lint/typecheck/build/diff geçti. Canlı servis/uygulama akışı bu tur tekrarlanmadı; önceki çıktılar korundu.
- [x] Story mühür/doku ince ayarı: iki dilde açık metin kutusu/satır yüksekliği ve küçülme/kırılma koruması; aynı doku maskelerinin yoğunluğu azaltıldı. 12 yeni Story/mühür kırpımı ve TR/EN/uzun ad 390px görünümleri açıldı; tam mühür metni/başlık ayrımı kontrol edildi. İlgili 25 test, lint/typecheck/build/diff geçti; yeni davranış testi eklenmedi. Yatay PNG byte eşit, diğer uygulama dosyaları korundu.
- [x] Kullanıcının genel kompozisyon/başlık yönünü uygun bulduğu kaydedildi; bu tam Story/A5.1 görsel kabulü sayılmadı. Bildirilen önceki kesilme yerel eski dosyada birebir üretilemedi; kök neden doğrulandı denmedi.
- [x] Kullanıcının doku/normal TR görünümünü uygun bulduğu kaydedildi; bu alanlar korundu. Uzun tam kart geri bildirimi önceki mühür kırpımı kontrolünden ayrı ele alındı.
- [x] Üç satırlı Story başlık/mühür alan ayrımı, en az 16px alt boşluk ve mühürün sonra çizilmesi; uzun düzen footer'ında tarih/kapsam mevcut fontla 8px aralıklı ayrı satırlar. Eski kutu örtüşmesi ölçüldü; harf kaybı/footer bitişmesinin birebir kök nedeni doğrulandı denmedi.
- [x] Dört tip × TR/EN tam kartlar ve iki uzun EN varyantı açılarak PROFILE yedi harfi/footer ayrımı kontrol edildi; 11 PNG boyutu/güvenli alanı doğrulandı. Normal TR ve yatay byte eşit. Son 25 kart testi/lint/typecheck/build/diff geçti; yeni davranış testi yok. OCR servisi sonuç vermedi, OCR başarısı kaydedilmedi.
- [x] Story kullanıcı görsel kabulü — 31 Ekim 2026 açık kullanıcı bildirimi; önceki ajan değerlendirmelerinden bağımsızdır.
- [x] 31 Ekim açık kullanıcı yetkisiyle yatay 1200×630 afiş ayrı kompozisyonda uygulandı: aynı yerel doku/font, ayrık başlık/puan/mühür alanları, kategori şeridi ve boşluklu footer. Uzun adlar/iki dil/dört tip/ondalık/100/önerisiz 16 tam PNG ve 390px kopyalar incelendi.
- [x] 16 aynı girdide Story byte eşitliği; mevcut doku asset'i/veri/güvenlik/indirme/UI dosyalarının korunumu. 355 test, lint/typecheck/build/diff geçti; yeni dependency veya görsel davranış testi yok.
- [x] Son uzun EN Story mühür/başlık/footer doğruluğu kullanıcı bildirimi olarak kaydedildi; Story tasarımı değiştirilmedi, bu kayıt A5.1 genel kabulü sayılmadı.
- [x] Yatay kart kullanıcı görsel kabulü — 31 Ekim 2026 açık kullanıcı bildirimi.
- [x] Kullanıcı A5.1 Story/yatay görünümlerini kabul etti; yalnız iki formatlı önizleme/indirme dilimi kapandı. Fiziksel telefon/sosyal paylaşım ve tüm A5 kabulü çıkarılmadı.
- [x] Kullanıcı 0f3d6c5 — feat: add Developer ID share cards commit'ini ve GitHub Actions CI #11 başarısını bildirdi. Tam SHA yerel HEAD ile doğrulandı; uzak CI kaynağı kullanıcı ekran görüntüsüdür, bağımsız API kontrolü değildir.

Bu dilim A5'in bütünü değildir: 1080×1350, gelişim/önce-sonra kartı, otomatik OG ve ayrı shareReports/sosyal paylaşım açık. A4'ün açık kabul kriterleri kapanmaz; public deployment yoktur. PNG indirme, sosyal paylaşım veya fiziksel cihazda kaydetme başarısı olarak kaydedilmedi. Son temizlik/dosya/inceleme artifact'leri STATUS'tadır. A5.1 kullanıcı kabulü/commit/CI kapandı; kalan kapsam yukarıdaki tek tabloda, yeni uygulama yetkisi beklenir.

### A6 Yayın kalitesi:

- [ ] Kritik Playwright akışları, erişilebilirlik, üretim build, güvenlik/secret taraması.
- [ ] Gerçek hesaplarda manuel doğruluk kontrolü; bilinen sınırlar.
- [ ] README: kurulum, mimari, scoring gerekçesi, testler, ekranlar, demo.
- [ ] Yayın yetkisi varsa deploy/smoke; yoksa deploy için somut hazır paket.

### A7 Dağıtım:

- [ ] Küçük kullanıcı denemesi, bulgu doğruluğu ve paylaşım deneyimi geri bildirimi.
- [ ] Anonim aggregate ölçümler; gerçek veriye dayanan CV anlatımı. Trafik gelmeden "viral" sonucu çıkarılmaz.

