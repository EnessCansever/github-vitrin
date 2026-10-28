# Güncel durum

Son güncelleme: 28 Ekim 2026 (Europe/Istanbul).

## Aktif aşama

**D021 Developer ID — ilk tasarım dilimine kullanıcı görsel kabulü verildi.** Kullanıcı açılış animasyonunu da kontrol ettiğini ve sürekli hareket olmadığını bildirdi. Bu kayıt kullanıcı incelemesidir. İstenen tek küçük düzeltme TR/EN placeholder kısaltmasıdır; profil URL desteği alan etiketinde korunur. Yeni tasarımın uzak CI sonucu henüz doğrulanmadı; c3aa1fe başarısı önceki kullanıcı bildirimidir. A3/puanlama ve sonraki aşamalara geçilmedi.

## Kullanıcı kabulü ve placeholder düzeltmesi — 28 Ekim 2026

- Kullanıcı Developer ID'nin ilk tasarım dilimine görsel kabul verdi; açılış animasyonunda sürekli hareket bulunmadığını kendisi kontrol edip bildirdi. Bu tur yeni Codex tarayıcı/animasyon kontrolü yapılmış sayılmaz.
- Placeholder TR “GitHub kullanıcı adın”, EN “Your GitHub username” olarak kısaltıldı. Mevcut TR/EN alan etiketi profil URL'sinin kabul edildiğini açıklamaya devam eder. Doğrulama, veri akışı ve diğer tasarım kuralları değişmedi.
- Bu turun kapsamı yalnız iki mesaj dosyası ve STATUS/TASKS kabul kayıtlarıdır. Önceki bekleyen dosyalar korunur. Yeni uzak CI doğrulanmadı olarak açık kalır; yeni commit/push veya A3 geçişi yapılmış sayılmaz.
- Bu tur npm run lint (max-warnings=0) ve npm run typecheck (Next tip üretimi dahil) başarılı. git diff --check geçti; index boş. Yalnız metin değişikliği için test/build veya canlı GitHub kontrolleri yeniden çalıştırılmadı. Stage/commit/push yapılmadı.



## Önceki kayıt — Developer ID ilk tasarım dilimi — 28 Ekim 2026

### Uygulananlar

- Yeni referans gerçek dosyası açılıp incelendi; bu tur görsel yönde önceki referansın önüne geçti. İki dosya da korundu. Konseptteki farklı kategori/puan, meslek, seri numarası ve başarı iddiaları ürün arayüzüne taşınmadı.
- Ana sayfa TR “Kodun var. İz bırak.” / EN “Write code. Leave a mark.”; neredeyse siyah zemin, kobalt gerçek form eylemi, sade üç adım ve ayrı görünür demo linki. Gerçek arama/seçim bileşeni veya Server Action değiştirilmedi.
- ResultSummary aynı demo fixture/config üzerinden sıcak kâğıt kartı üretir: kurmaca mira-sample, Gizli Cevher, 77,5; Profil 15/20, Projeler 22,5/30, README 40/50. Mühür küçük lime profil tipidir, onay değildir. HTML/CSS/SVG kullanılır; konsept resmi arayüz yerine kullanılmaz. /demo düz ve native gerekçe/kanıt/kategori ayrıntılarına uyumludur; hero yalnız masaüstünde 5 derece açı ve CSS askı/klips taşır. Mobilde düzleşir.
- Merkezi tokenlar güncellendi; eski summary/score/preview CSS yerini yeni kimlik kurallarına bıraktı. Barlow Condensed 800, Manrope variable ve IBM Plex Mono 400, yerel font dosyaları ve SIL OFL lisanslarıyla eklendi. Yeni npm bağımlılığı yoktur.
- CSS başlık 420ms/kart 500ms tek giriş, kısa buton hover/press ve hafif details içerik/chevron geri bildirimi. Native açılma yüksekliği korunur. Reduced-motion bütün animasyon/transition ve hareketli buton transformunu kaldırır; içerik baştan okunur. SSR/rastgele state eklenmedi.

### Kontroller

| Kontrol | Gerçek sonuç |
| --- | --- |
| npm test | 5 dosyada 138 mevcut deterministik test başarılı; tasarım için test sayısı artırılmadı. |
| npm run lint / typecheck | Başarılı; strict ve max-warnings=0 korunuyor. |
| npm run build | Son uygulama koduyla başarılı; aynı beş route, yerel fontlar, yeni endpoint/adapter/puanlama yok. |
| Gerçek form / seçim | Temiz Chrome'da EnessCansever 14 aday; üç seçim sınırı ve kaldırma geçti. Dil değişiminde seçili ID'ler korundu; yalnız locale POST'u, yeni arama POST'u yok. Gerçek puanlama devamı pasif. |
| Görseller | TR/EN ana sayfa/demo 390×844 ve 1440×900 görüntüleri alındı ve incelendi. /demo/select ve /demo/states görüntüleri de görsel olarak incelendi. Ana form mobil ve masaüstünde ilk ekranda erişilebilir. |
| Taşma | /, /demo, /demo/select, /demo/states × 320/390/768/1000/1440: yatay taşma yok. Uzatılmış kullanıcı adı da taşmadı. Demo kartı transform=none. |
| Klavye / detaylar | Input focus 3px; kart gerekçesi native Space ile açılıp Enter ile kapandı, summary focus 3px. Üç kategori ve repo kanıtı açıldı; pasif paylaşım/yeniden analiz pasif kaldı. İlk CDP Enter ölçümü doğrulanmadı; ek native Space/Enter kontrolüyle doğrulandı (focus.json). Uyarı/erişilebilirlik gizleme eklenmedi. |
| Hareket | Hero başlık/kart iterasyon=1, kart süresi .5s. Locale değişiminde giriş yeniden başlama sayısı 0. Reduced-motion altında animasyon/transition yok. Ayrı soğuk-font home/1440 testinde ölçülen layout shift 0; bütün ağ/cihazlar için garanti değildir. |
| Tipografi / kontrast | Üç TTF cmap tablosunda ÇçĞğİıÖöŞşÜü var. Font servisine 0 harici istek. Kontrol edilen metin kontrastları en düşük 6,50:1; ana eylem 6,54, kart 13,92, mühür 12,79, seçili repo 13,05, disabled 8,44. |
| Runtime / koruma | Son tarayıcı kontrollerinde 0 console/runtime hatası. Backend, fixture, kategori/puan, paket/lockfile ve kaynak sözleşme değişmedi. git diff --check geçti; index boş. Gerçek env dosyası görüntülenmedi/değiştirilmedi. |
| Uzak CI | c3aa1fe başarısı kullanıcı bildirimi; yeni tasarım kodu GitHub Actions üzerinde henüz doğrulanmadı. |

Tarayıcı, kurulu Chrome'un ayrı /tmp/repovitrin-developer-id-chrome profilinde CDP ile kullanıldı. Kullanıcının mevcut localhost:3000 sunucusu korunuyor; yalnız kontrol için açılan Chrome kapatıldı. Geçici kontrol scriptleri repoya eklenmedi ve kaldırıldı. Görüntüler/ölçümler /tmp/repovitrin-id-review içinde; birleşik son kayıt final-checks.json'dur. Rapora eklenen ana sayfa ve mobil demo görüntüleri bu gerçek ekranlardır; paylaşım PNG sistemi değildir.

### Açık kalanlar ve durma noktası

- **Yeni Developer ID tasarımı için kullanıcı kabulü bekleniyor.** Önceki A2.2 işlev kabulü veya referans yön seçimi bu uygulamanın görsel kabulü sayılmaz. Bu dilim tüm uygulamayı yeniden yazmaz; seçim ekranları yalnız ortak token/font uyumu açısından kontrol edildi.
- Kullanıcının yeni commit/push ve yeni uzak CI sonucu beklenir. Stage/commit/push/yayın yapılmadı.
- A3 puanlama, README analizi, MongoDB/kalıcı cache, gerçek paylaşım/PNG ve public yayın kapsam dışı kaldı. Mevcut yerel kullanım/public yayın sınırlamaları sürer.
- Değişen kod sade isim/yorum/tekrar/soyutlama açısından incelendi; hareket bağımlılığı, generic altyapı veya backend refactor yoktur. Görsel inceleme sonrası açık kullanıcı mesajı olmadan başka işe geçilmez.

Yerel kontrollerle commit incelemesine hazır; görsel kabul kullanıcıya aittir. Öneri: `feat: introduce Developer ID visual identity`.

Commit kapsamı: AGENTS.md, README.md, docs/{DESIGN,DECISIONS,STATUS,TASKS}.md; kullanıcı eklemesi docs/design/developer-id-concept.png; src/app/{globals.css,layout.tsx,fonts/*}; src/components/result-summary.tsx; src/messages/{tr,en}.json. Eski referans, fixture/puanlama ve gerçek veri akışı dosyaları korunur. İnceleme: npm run dev → http://localhost:3000/ ve /demo. Kullanıcı kabulü için duruldu.


## Önceki kayıt — A2.2 kullanıcı kabulü ve tasarım yönü kaydı — 28 Ekim 2026

Kullanıcı **mevcut A2.2 gerçek profil ve repo seçimi akışına kabul verdi**. Bu kayıt kullanıcı bildirimidir; bu tur yeni tarayıcı incelemesi, uygulama testi veya uzak CI kontrolü yapılmadı. Kabul mevcut çalışan veri akışını kapsar; ilerideki A / Developer ID tasarımının uygulanmış veya kabul edilmiş olduğu anlamına gelmez.

Kaynak sözleşme §11 A2 ve TASKS kabul maddeleri yeniden karşılaştırıldı:

| A2 kabul kriteri | Kanıt ve durum |
| --- | --- |
| Public adapter, normalizasyon, aday seçimi, pinned fallback, timeout/rate-limit/unknown | Önceki A2.1/A2.2 uygulama ve deterministik test kayıtlarıyla karşılandı. Mevcut form/seçim akışı ayrıca kullanıcı tarafından kabul edildi. |
| Gerçek public profil smoke ve eksik token halinde açık kurulum hatası | EnessCansever gerçek adapter/form kontrolleri ve eksik token için deterministik configuration testiyle karşılandı. |

**Karşılanmamış A2 ürün/teknik kabul maddesi tespit edilmedi.** Commit/push ve bu yeni değişikliklerin uzak CI sonucu açık süreç maddeleri olarak TASKS'ta korunur; 590f4c7 başarısı yeni A2.2 CI sonucu gibi kullanılmaz. Dağıtık abuse koruması ve yayın A4/ilgili yayın aşamasına, puanlama A3'e aittir; A2 kabulü bunları tamamlanmış saymaz.

A / Developer ID seçimi D021'e kaydedildi: çalışan veri akışı korunacak; konsept görselindeki kategori isimleri/puanlar ürün kuralı değildir; SCORING sözleşmesi değişmeyecek. Tasarım ayrı bir aşamada uygulanacak ve henüz başlamadı. Sonraki aşamaya geçilmez.

Bu tur yalnız docs/STATUS.md, docs/TASKS.md ve docs/DECISIONS.md güncellendi. Önceki commit edilmemiş dosyalar korundu; uygulama kodu, stil, mesajlar, fixture ve puanlar değiştirilmedi. Belge tutarlılığı/diff ve diğer dosyaların korunması kontrol edildi; uygulama kontrolleri gereksiz yere tekrarlanmadı. Stage/commit/push yapılmadı.

Mevcut A2.2 paketi kayıtlı yerel kontroller ve kullanıcı kabulüyle commit incelemesine hazır. Önceki birleşik öneri korunur: `feat: connect profile form to live repository selection`; bu tur eklenen belge kapsamı STATUS/TASKS/DECISIONS'tır. Kullanıcının commit ve açık devam mesajı bekleniyor.


## Önceki kayıt — A2.2 sonuçları — 28 Ekim 2026

### Tamamlananlar ve kararlar

- Home formu username/desteklenen profil URL'siyle çalışır; etiket, yerel Zod hatası, Enter, gerçek pending ve ref guard ile aynı pending gönderimin tekrarı engellenir. Ana eylem “Projelerimi getir”; ayrı ikincil demo linki ve açık örnek 77,5 önizlemesi korunur.
- Tek getRepos Server Action getProfile/getPinned/getCandidates çağırır. İstemcide ve sunucuda mevcut profileInput kullanılır; ham girdi <=256 UTF-8 byte, framework body <=8 KiB. Her işlemde yeni client, ortak 20 saniye/40 istek; kullanıcı seçim süresine yayılmaz. Next'in aynı-origin kontrolü korunur. Secret/ham API/Error istemciye gönderilmez; yalnız küçük public DTO ve güvenli hata kodları.
- Gerçek seçim aynı sayfada ayrı bölgede açılır. Güvenli monogram/profil linki, pinned + recent ilk üç ID, 1–3/sıfır sınırı, unknown pinned ve 100 aday kapsam notları vardır. Gerçek devam pasif puanlama bilgisidir; kullanıcı sabit örnek puana yönlendirilmez. Demo fixture'ları/puanları değişmedi.
- Dil değişimi mevcut client state'ini korur ve yeni GitHub çağrısı başlatmaz. Alan değişimi eski sonucu/seçimi temizler; istek kimliği geç eski yanıtı reddeder. Backend çağrısının iptali vaat edilmez. Sonuç/hata başlığı focus alır ve bölge başına kaydırılır.
- Ortak RepoPicker/StatePanel kullanıldı; demo description çevirisi server page'de çözülür, gerçek açıklamalar data'dır. Yeni bağımlılık/store/workflow/cache yoktur. Pinned alt isteği timeout olursa aynı client'ın kalan bütçesinde aday erişimi yapılabilir; global deadline, auth, budget ve secondary/belirsiz rate-limit sınırları korunur.
- README analizi, profil README getirme, puanlama, sonuç/snapshot, MongoDB, paylaşım veya Route Handler eklenmedi. Server Action yeni ağ girişidir; dağıtık abuse koruması değildir. Public deployment yapılmadı ve bu akış henüz public yayına hazır sayılmaz.

### Gerçek doğrulama sonuçları

| Kontrol | Sonuç |
| --- | --- |
| npm test | 5 dosyada 138 test geçti; 20 yeni Server Action davranış testi. Mock fetch; CI token/GitHub erişimi istemez. |
| npm run lint / typecheck | İkisi de son kodla geçti; strict ve max-warnings=0. |
| npm run build | Son kodla geçti; beş route korundu, ek Route Handler yok. Turbopack için izinli ortam kullanıldı. |
| Client sınırı | Production static JS içinde GITHUB_TOKEN adı ve adapter pinned sorgusu yok; server-only adapter istemciye taşınmadı. Gerçek .env.local dosyası açılmadı/değiştirilmedi/loglanmadı. |
| Gerçek form | Temiz ayrı Chrome profilinde EnessCansever username ve HTTPS URL + Enter; 14 public aday, üç pinned ön seçim. Bekleme gerçek, aynı pending'e iki ek submit denemesi yalnız bir arama POST'u üretti. |
| Seçim/klavye | Üçte seçilmemişler disabled; seçili kaldırılabiliyor; sıfırda açıklama ve disabled devam. Space/focus kontrolü geçti. Sonuç başlığı focus ve y=20px ile görünür. |
| Dil / yeniden render | TR↔EN aynı sayfa, seçilen ID'ler korundu; locale POST'u dışında yeni arama POST'u yok. |
| Yeni kullanıcı / yarış | octocat araması eski profil/seçimleri temizledi. EnessCansever yanıtı CDP'de kontrollü geciktirilip yeni octocat araması başlatıldı; geç eski profil hiç gösterilmedi. |
| Gerçek retry | Tarayıcıda ilk yerel action isteği kontrollü ağ hatasına düşürüldü; network yüzeyi açıldı. Retry yeni gerçek POST/GitHub adapter çağrısıyla EnessCansever seçimini getirdi. Bu kontrollü tarayıcı ağ kesintisidir; gerçek GitHub servis arızası iddiası değildir. |
| Body sınırı | 9 KiB deneme action POST'u reddedildi; yanıtta yalnız boolean olarak 8kb body-limit nedeni doğrulandı. Geliştirme Next Server Action yanıtı HTTP 500, dahili hata 413; özel API statüsü veya başarı gibi sunulmadı. |
| Görsel / taşma | TR/EN 390×844 ve 1440×900 görüntüleri alınıp incelendi. 320/390/768/1440 ve yapay uzatılmış isim/açıklamada taşma yok. Masaüstü ana CTA ilk 900px'de. Yeni tasarım kullanıcı tarafından henüz kabul edilmedi. |
| Demo regresyonu | /demo/select dört repo/iki ilk seçim ve /demo/states linki; /demo/states altı seçenek geçti. Fikstür, skor, ana demo raporu korunuyor. |
| Runtime / koruma | Son temiz tarayıcı kontrollerinde 0 console/runtime hatası. git diff --check geçti; index boş. Paket/lockfile, gerçek env, kaynak sözleşme/görsel, PRODUCT/SCORING ve fixture'lar değişmedi. |
| Uzak CI | 590f4c7 başarısı kullanıcı bildirimi; yeni A2.2 kodu GitHub Actions üzerinde henüz çalıştırılmadı. |

Tarayıcı: kurulu Chrome, ayrı /tmp/repovitrin-a22-chrome profili ve CDP; mevcut localhost:3000 kullanıcı sunucusu kullanıldı/kapatılmadı. Ekran ve güvenli ölçümler /tmp/repovitrin-a22-review içinde. Geçici CDP scriptleri kaldırıldı, test altyapısına yeni araç eklenmedi; kendi Chrome işlemi kapatıldı.

### Kalanlar ve durma noktası

- A2 kaynak sözleşmesinin iki teknik kriteri (public adapter/normalize/aday/pinned fallback/timeout-rate-limit-unknown; gerçek public smoke + açık eksik-token hatası) A2.1+A2.2 kanıtlarıyla karşılandı. Yeni A2.2 kullanıcı akışı/görsel kabulü ve yeni push CI doğrulaması hâlâ beklenir; A2'nin bütünü kullanıcı kabulü almış sayılmaz.
- Pinned-unknown uyarısı, 100 aday ve gerçek auth/rate-limit/boş repo durumları mock testlerle doğrulandı; bu özel servis yanıtları canlı hesapta zorla üretilmiş sayılmaz. Gerçek olumlu arama ve kontrollü tarayıcı bağlantı hatası/retry doğrulandı.
- Kalıcı/dağıtık throttle/cache/lock ve public yayın korumaları A4/ilgili yayın aşamasına kalır. Bu tur yayın yok; mevcut işlem/girdi sınırları bunların yerine geçmez. Sürmekte olan eski sunucu isteği client state'inden silinse de otomatik iptal edilmiş sayılmaz.
- Yeni puanlama/README analizine veya başka aşamaya kullanıcı mesajı olmadan geçilmez. Kullanıcı incelemesi ve commit bekleniyor.

Bu A2.2 değişikliği yerel kontrollerle commit incelemesine hazır; görsel/akış kabulü kullanıcıdan bekleniyor. Önerilen commit: `feat: connect profile form to live repository selection`.

Commit kapsamı: AGENTS.md, README.md, next.config.ts; src/app/{page.tsx,globals.css,demo/select/page.tsx}; src/features/analysis/{actions.ts,selection.ts,profile-search.tsx,repo-picker.tsx,analysis-states.tsx}; src/lib/github/client.ts; src/messages/{tr,en}.json; tests/github/actions.test.ts; docs/{ARCHITECTURE,DESIGN,DECISIONS,STATUS,TASKS}.md. Stage/commit/push/yayın yapılmadı. Yerelde `npm run dev`, inceleme http://localhost:3000/; demo yolları bağımsızdır.


## Önceki kayıt — A2.1 gerçek bağlantı smoke sonucu — 28 Ekim 2026, 15:44 +03

Kullanıcının yetkisiyle, `.env.local` değeri yalnız Node runtime'da `--env-file=.env.local` üzerinden yüklendi. Dosya görüntülenmedi/değiştirilmedi; token, Authorization header, ham istek/hata veya README içeriği yazdırılmadı. `git check-ignore .env.local` çıktısı `.env.local`; ignore kontrolü geçti.

| Adım | Güvenli gerçek sonuç |
| --- | --- |
| Profil — getProfile | EnessCansever, başarılı |
| Pinned — getPinned | available; 6 uygun pinned repo |
| Adaylar — getCandidates | 14 uygun public aday; limited=false |
| Profil README — getProfileReadme | found |
| Seçilen repo — getSelected | jobfit-tr; metadata başarılı; README found |

Tüm gerçek çağrılar tek GitHubClient örneğinde yapıldı; mevcut ortak 20 saniye/40 istek bütçesi değiştirilmedi. Fetch doğrudan çağrılıp adapter atlanmadı. Deterministik testlerin setup/mock fetch kodları, Vitest veya fixture'ları yüklenmedi. Mevcut TypeScript derleyicisi yalnız geçici runtime yüklemesi için kullanıldı; Node react-server koşulu server-only işaretini gerçek sunucu bağlamında çözdü. Yeni bağımlılık, uygulama kodu, public/debug endpointi, npm komutu veya CI adımı eklenmedi. Profilde/repoda değişiklik yapılmadı; salt okunur sorgular kullanıldı.

İlk geçici yükleyici denemesi `runtime_setup / unexpected_runtime` güvenli koduyla GitHub isteği göndermeden durdu. Geçici yükleme mevcut TypeScript derleyicisiyle düzeltildi; adapter koduna müdahale edilmedi. Son gerçek denemede yapılandırma, izin, ağ veya uygulama hatası görülmedi. Geçici çalıştırıcı ve kontrol dosyaları iş sonunda kaldırıldı; normal npm test/CI'a gerçek ağ smoke testi eklenmedi.

Smoke öncesi/sonrası dosya hash kontrolünde uygulama/bağımlılık ve önceki bekleyen dosyalar değişmedi. Bu tur yalnız STATUS/TASKS sonucu ile README'deki eski “smoke yapılmadı” ifadeleri güncellendi. git diff --check geçti, index boş. Kod değişmediğinden npm test/lint/typecheck/build tekrar çalıştırılmadı; önceki 118 deterministik test ve build kayıtları tarihsel sonuç olarak korunuyor.

Bu sonuç yalnız EnessCansever hesabındaki olumlu public erişim akışıdır. Gerçek auth/rate-limit/eksik veri hata yanıtları bu smoke sırasında üretilmedi; bu ayrımlar önceki deterministik testlerde doğrulandı. found, dosyanın okunmasıdır; GitHub profilinde görsel gösterim doğrulanmadı. Arayüz bağlantısı, puanlama ve sonraki aşamalar uygulanmadı. Yeni uzak CI ancak kullanıcı push'undan sonra doğrulanabilir. A2'nin bütünü tamamlanmış sayılmadı.

Mevcut A2.1 paketi bu gerçek smoke sonucu ve önceki yerel kontrollerle commit incelemesine hazır. Birleşik öneri: `feat: add validated public GitHub data adapter`. Bu turun belge kapsamı docs/STATUS.md, docs/TASKS.md ve README.md; önceki A2.1 dosyaları ayrıca korunuyor. Stage/commit/push yapılmadı; sonraki aşamaya geçmeden duruldu.


## Önceki kayıt — A2.1 kaynak incelemesi düzeltmesi — 28 Ekim 2026

Başlangıçta önceki A2.1 dosyaları commit edilmemişti; HEAD 3912059 ve index boştu. Bu dosyalar korundu. Yetki yalnız profil README yokluğu/kapsamı ve REST–GraphQL limit ayrımını düzeltmekti. A1 kabulü, arayüz, fixture puanları, bağımlılıklar ve CI davranışı bu revizyonda değiştirilmedi.

### Düzeltilen davranışlar

- Profil README artık proje eligible filtresini veya genel repo README aramasını kullanmıyor. Hatasız nullable GraphQL repo/kök object yokluğu missing; errors/partial, eksik alan, auth/ağ/rate-limit ve belirsiz REST 404 unknown kalıyor. Bilinen private/boş repo public profil README yokluğudur; private README içeriği istenmez. Bu, aday repo listesinin no_repos durumu değildir.
- Public, aynı adlı repo için yalnız varsayılan dalın sabit commit'indeki kök README.md okunur. Arşiv/fork sınırlaması uygulanmaz. Profil/repo ID, dosya yolu ve Blob SHA doğrulanır; ortak decode fonksiyonu base64, gerçek byte, UTF-8 ve 256 KiB korumalarını taşır. Boş dosya found + boş text olur. GitHub profilinde gösterim doğrulanmış sayılmaz; resmi koşullar README/ARCHITECTURE'de kaynaklıdır.
- REST/core ve GraphQL primary bakiyeleri/blokları ayrıldı; header kaynağı dikkate alınır. Secondary ve bilinmeyen kısıtlar iki API'yi de durdurur. GraphQL HTTP 200 RATE_LIMITED sonraki istekler için transport'a kaydedilir. Eksik header önceki primary veriyi silmez. Gerçek reset geçince eski blok bırakılır; bilinmeyen reset uydurulmaz. Eski primary reset yeni secondary kısıtı kaldırmaz.
- Ortak 20 saniye/40 istek ve tek sunucu işlemi ömrü korundu; global singleton yoktur. Aynı işlemde GraphQL primary limitinden bağımsız REST aday erişimi mümkün, secondary/belirsiz limitte mümkün değildir. Kör retry veya API değiştirerek secondary limit aşma yoktur.

### Son kontroller

| Kontrol | Sonuç |
| --- | --- |
| npm test | 4 dosyada 118 deterministik test başarılı; gerçek GitHub isteği yapılmadı. |
| npm run lint | Başarılı; max-warnings=0. |
| npm run typecheck | Başarılı; Next tip üretimi dahil. |
| npm run build | Son düzeltmelerle başarılı; Turbopack port ihtiyacı için izinli çalıştırma. Mevcut beş route korundu, yeni endpoint yok. |
| Kod incelemesi | Yalnız değişen adapter/test kodu; ortak decode ve somut kaynak kayıtları, yeni katman/bağımlılık yok. Gereksiz test-state getter'ı bırakılmadı; testler çağrı/sonuç üzerinden doğrular. |
| Koruma | git diff --check geçti; index boş. Kaynak sözleşme, referans, arayüz/fixture ve önceki kurulum dosyaları korundu. |

Ek testler: bilinen public yokluk, auth/ağ/partial, kök README yokken docs aramasına geçmeme, arşiv/fork public profil reposu, boş dosya, kapsam/kimlik kaybı, iki yönlü primary bağımsızlığı, HTTP 200 GraphQL limiti, secondary/belirsiz blok, header yokluğu ve gerçek reset/retry-after davranışı. Önceki sürekli unknown beklentisi ve tüm API'leri bloklayan primary beklentisi kaldırıldı.

**Gerçek GitHub smoke testi yapılmadı; gerçek env/token dosyaları açılmadı.** Canlı nullable/error yanıtları, profil/pinned/README erişimi sonraki yetkilendirilmiş smoke kontrolünde doğrulanmalı. Gerçek profil gösterimi iddia edilmez. Yeni uzak CI sonucu yok; 3912059 CI başarısı önceki kullanıcı bildirimidir. A2'nin tamamı, arayüz bağlantısı ve sonraki aşamalar açık kalır.

Bu sınırlı düzeltme ve önceki A2.1 paketi yerel kontrollerle commit incelemesine hazırdır. Revizyon kapsamı: src/lib/github/{client,schemas,errors,transport}.ts, tests/github/{client.test,fixtures,profile-readme.test,rate-limit.test}.ts, README.md ve docs/{ARCHITECTURE,DECISIONS,STATUS,TASKS}.md. Önceki A2.1 kurulum dosyaları commit edilmemiş hâliyle korunur. Birleşik A2.1 önerisi: `feat: add validated public GitHub data adapter`. Stage/commit/push yapılmadı; kullanıcı incelemesi için duruldu.

## Önceki kayıt — A2.1 ilk veri katmanı teslimi

### İlk teslim sonucu — 28 Ekim 2026

### Tamamlananlar

- AGENTS ve proje belgeleri/kaynak A1–A2 kriterleri okundu. Belgelerde açık A1 tasarım kabul maddesi yok; native menü klavye doğrulaması ve görsel kabul kullanıcı bildirimidir. Eski AGENTS/README kapsam ifadeleri bu yeni yetkiye göre güncellendi.
- Zod girdi normalizasyonu ve sunucuda zorunlu doğrulama; kullanıcı adı, şemasız/HTTPS github.com profil URL'si. Repo yolu, başka domain, credential, port/query/hash, encoded/normalize edilecek path ve geçersiz adlar reddedilir. Normal kişisel hesap adı kapsamı resmi GitHub kaynaklarıyla doğrulandı.
- Server-only GitHubClient/transport: public profil, profil README, uygun pinned, sayfalı/en fazla 100 uygun aday ve 1–3 benzersiz seçilmiş repo için metadata/README. Pinler önce, sonra güncelleme sırası; ID ile tekrarlar ayıklanır. Owner kimliği/public/archive/fork kontrolü yapılır.
- Pinned boş/unknown, kullanıcı yok/uygun repo yok, dosya missing/erişim unknown, configuration/auth/rate-limit/network/timeout/service/GraphQL errors/partial ayrı tutulur. GraphQL HTTP 200 errors başarı sayılmaz. README 404 sonrası repo kimliği/kapsamı/default branch yeniden doğrulanır.
- Ortak 20 saniye/40 istek, istek başına 8 saniye, 1 MiB JSON ve 256 KiB README limitleri. Kesilmiş içerik tam sayılmaz; rate-limit bilgisi gerçek yanıttan gelir, görülen limit aynı transport'ta yeni isteği durdurur. Kör retry, keyfi URL fetch, README render, demo fallback yok.
- Zod 4.6.7, server-only 0.0.1, Vitest 5.0.5 eklendi; Node 22.13.0 korundu. npm test ve CI test adımı hazır. Fine-grained public read token kurulumu README'de resmi kaynaklarla anlatıldı. Gerçek env dosyası/token açılmadı, yazdırılmadı veya yazılmadı.

### Son doğrulamalar

| Kontrol | Gerçek sonuç |
| --- | --- |
| npm ci | Başarılı; audit 0 vulnerability. Önceden bilinen ESLint 9 EOL uyarısı sürüyor. |
| npm test | 2 dosyada 77 test başarılı; gerçek fetch her testte stub, token test değeri. Gerçek GitHub bağlantısı değildir. |
| npm run lint | Başarılı; max-warnings=0, kural kapatma yok. |
| npm run typecheck | Başarılı; Next tip üretimi dahil. İlk test fixture'ındaki readonly tip uyuşmazlığı düzeltilerek tekrar geçti. |
| npm run build | Son kod ve temiz npm ci sonrasında başarılı. Aynı beş uygulama route'u; yeni endpoint yok. |
| Build ortam sorunu | İlk sandbox build port izniyle başarısız oldu; izinli deneme de bozuk önbelleği kullandı. Yalnız üretilmiş .next build/cache/server/static temizlenip izinli aynı komutla geçti; .next/dev ve kaynaklar korundu, bundler değiştirilmedi. |
| Davranış testleri | Girdi reddi/normalizasyonu, sayfalama/kapsam/100 sınırı, pinned boş–hata ve fallback, gerçek README missing/erişim kaybı, auth/rate-limit/ağ, GraphQL errors/partial, timeout/deadline/istek bütçesi, boyut/base64/kesilmiş içerik, sabit endpoint/redirect reddi doğrulandı. |
| Kod ve koruma | Değişen kodda isimlendirme/tekrar/yorum/soyutlama incelemesi yapıldı; gerekçesiz any/assertion, lint disable, sessiz catch ve kullanılmayan bağımlılık yok. Arayüz, fixture, mesaj, sözleşme ve referans değişmedi. git diff --check geçti; index boş. |
| Uzak CI | 3912059 başarısı yalnız kullanıcı bildirimi. Bu turdaki test adımı/yeni kod GitHub Actions üzerinde henüz doğrulanmadı. |

### Açık işler ve sınırlar

- Gerçek hesap smoke testi yapılmadı. Kullanıcı kendisi public erişimli fine-grained tokenı ignore edilen .env.local içine ekleyebilir; sonraki yetkilendirilmiş kontrolde profil/pinned/adaylar/profil ve proje README'leri doğrulanmalı. Token eklemek arayüzde gerçek analiz açmaz.
- Profil reposunun kendisindeki belirsiz 404 de repo_unavailable/unknown kalır. Bu dosyanın yokluğunu kanıtlamaz; özellikle profil reposu bulunmayan hesaplarda gerçek smoke testinde incelenmelidir. Şüpheli veri için puanlanabilir yokluk üretilmedi.
- Aday taraması ortak bütçeyi tüketirse kısmi aday listesini tam başarı saymaz; request_budget/timeout verir. 100 adayda limited ihtiyatlıdır, gerçek toplam repo sayısı değildir.
- Ortak bütçe yalnız tek GitHubClient işlemi içindir; deployment-geneli rate-limit/cache/lock A4'ün açık işidir. Kullanıcı akışı/API bağlantısı, puanlama, MongoDB, AI ve paylaşım bu tur eklenmedi. A2'nin bütünü tamamlanmadı.
- UI değişmediği için bu tur tarayıcı/görsel kontrol tekrarlanmadı. Mevcut kullanıcı dev sunucusu kapatılmadı. Sonraki iş kullanıcı incelemesi ve açık devam mesajına bağlıdır.

Bu bölüm, canlı smoke testi açıkça bekleyen sınırlı kapsamıyla commit incelemesine hazır. Öneri: `feat: add validated public GitHub data adapter`.

Commit kapsamı: AGENTS.md, README.md, .env.example, package.json, package-lock.json, .github/workflows/ci.yml, vitest.config.mjs, src/lib/github/{input,schemas,errors,transport,client}.ts, tests/setup.ts, tests/github/{input.test,client.test,fixtures}.ts, docs/{ARCHITECTURE,DECISIONS,STATUS,TASKS}.md. Gerçek env, node_modules ve .next kapsam dışı. Stage/commit/push yapılmadı; sonraki bölüm için duruldu.


## Önceki kayıt — A1 son kullanıcı kabulü ve kriter incelemesi — 28 Ekim 2026

Kullanıcı **repo seçimi, analiz durumları ve demo gezinmesine görsel kabul verdi**. Native durum menüsünü klavyeyle kendisinin kontrol ettiğini ve seçenek değişiminin çalıştığını bildirdi. Bu iki kayıt **kullanıcı incelemesi/bildirimi** olarak tutulur; Codex'in bu tur yaptığı bir tarayıcı testi olarak sunulmaz. Önceki headless native menü doğrulama açığı bu bildirimle kapandı.

Ana sözleşme §11 A1 maddeleri, TASKS ve DESIGN'daki önceki uygulama/doğrulama kayıtlarıyla karşılaştırıldı:

| A1 kabul kriteri | Kanıt ve sonuç |
| --- | --- |
| Açık örnek verilerle ana sayfa, repo seçimi, mobil sonuç, kanıt/accordion, tüm durumlar, TR/EN | Önceki A1.1/A1.2 uygulama ve kontrol kayıtları; ana sayfa/demo için önceki kullanıcı kabulü, repo seçimi/durumlar/gezinme için son kullanıcı kabulü. Karşılandı. |
| 360/390/768/1440 screenshot incelemesi; klavye, kontrast, uzun metin | Önceki temiz Chrome ekran/taşma/klavye/focus kayıtları ve kontrast hesapları; eksik native menü klavye doğrulaması son kullanıcı bildirimiyle kapatıldı. Karşılandı. |

**Tamamlanmamış A1 tasarım kabul maddesi kalmadı.** A1 kabulü ürünün veya gerçek entegrasyonların tamamlanması anlamına gelmez. A2–A7 başlamadı. DESIGN ve aşağıdaki geçmiş kayıtlardaki “kabul bekliyor / native menü kontrolü açık” ifadeleri önceki durumu anlatır; en güncel kabul kaydı bu bölüm ve TASKS'tır. Kullanıcı talimatı gereği diğer belgeler bu tur değiştirilmedi.

Açık kalan süreç/takip işleri:

- Henüz commit edilmemiş A1.2/gezinme değişikliklerinin commit/push işlemi kullanıcıya ait; yapılmış sayılmadı.
- Bu yeni değişikliklerin uzak CI sonucu henüz yok. a78abde için daha önce bildirilen başarı yeni değişikliklerin CI sonucu olarak kullanılmaz.
- Kullanıcının “commit attım, devam” mesajı olmadan A2'ye geçilmez; TASKS geçiş kapısı açık bırakıldı.
- ESLint 9 bakım desteği takip işi açık kalır; A1 tasarım kabul kriteri değildir.

Bu tur yalnız STATUS.md ve TASKS.md güncellendi. Uygulama kodu/fixture/bağımlılık değiştirilmedi. Uygulama testleri veya tarayıcı kontrolleri yeniden çalıştırılmadı; yalnız belge tutarlılığı, git diff biçimi ve diğer dosyaların korunması kontrol edildi. Stage, commit veya push yapılmadı.

A1 değişiklikleri kayıtlı kontroller ve kullanıcı kabulüyle commit'e hazır. Önceki öneri: `feat: add demo repository selection and analysis states`. Bu son belge turunun kapsamı yalnız docs/STATUS.md ve docs/TASKS.md'dir; önceki bekleyen uygulama dosyaları ayrıca korunur. A2 öncesinde dur.

## Önceki kayıt — A1.2 gezinme revizyonu — 28 Ekim 2026


Kullanıcı henüz commit atmadı; kapsam yalnız bağlantı hiyerarşisi ve demo sayfaları arası gezinmedir. Başlangıçta önceki A1.2 dosyaları çalışma alanındaydı; HEAD a78abde, index boş. Bu dosyalar korunarak çalışıldı.

### Değişenler

- Ortak server DemoNav, /demo, /demo/select ve /demo/states üstünde örnek rapor / proje seçimi / analiz durumları linklerini gösterir. current prop'u yalnız aktif sayfayı belirtir; yeni client state/route katmanı eklenmedi.
- Aktif link aria-current=page, onay simgesi, alt çizgi ve çerçeve/zeminle belirgin. Mobil üç sütun metin sarmasıyla çalışır. Genel site header'ı ve ana site navigasyonu değişmedi.
- Ana eylem mevcut dolu mavi kalır. Önemli ikincil linkler ortak açık mavi yüzey/çerçeve/ok stilini kullanır. /demo alt seçim bağlantısı ve durum sayfasındaki önemli geri/örnek rapor geçişleri bu stildedir. Yardımcı text-link/back-link alt çizgili ve sakindir.
- Link ve dil gezinmesi focus'u mavi; mint gezinmede kullanılmaz. Disabled paylaşım/yeniden analiz, puanlar ve fixture'lar değişmedi. Sayfa değiştiren eylemler anchor/Next Link olarak kaldı.
- Yalnız DemoNav için dört TR/EN mesajı eklendi; önceki metinler korundu. Yeni bağımlılık veya API eklenmedi.

### Kontroller

| Kontrol | Sonuç |
| --- | --- |
| npm run lint / typecheck / build | Son stil/token haliyle üçü de başarılı |
| Üç sayfa TR/EN gezinmesi | Her dilden altı yön, toplam 12 gerçek link tıklaması; doğru URL ve tek aria-current=page geçti |
| Geri dönüş | Rapor→ana sayfa, seçim→rapor, durumlar→seçim gerçek linklerle geçti |
| Dil ve state | Üç sayfada TR↔EN aynı URL; özel repo seçimleri dil değişiminde korundu |
| Semantik/klavye | Tüm gezinme anchor; Tab ile bir sonraki link, Enter ile geçiş; alt seçim eyleminde Enter geçti. Link focus 3px mavi. |
| Hover | Gerçek pointer hareketinde ikincil zemin rgb(23,38,66)→rgb(32,55,99); focus görüntüsü ayrıca incelendi |
| Responsive/görsel | Üç sayfa × TR/EN × 320/390/1440 genişliğinde taşma yok; tüm üst linkler viewport içinde. 390 ve 1440 ekranları alınıp temsilî TR/EN mobil/masaüstü görüntüleri araçla incelendi. |
| Ayrım/koruma | Ana sayfada demo-nav yok, ana demo linki /demo; global header değişmedi. Pasif paylaşım butonları disabled. |
| Runtime/ağ | Temiz Chrome oturumunda 0 console/runtime hatası, 0 harici HTTP isteği |
| Kontrast | İkincil metin/zemin 13,79:1; hover 10,74:1; çerçeve/zemin 3,26:1 |
| Dosya/index/diff | Tur başlangıcı hash'leriyle fixture/analiz/seçim davranışı ve bağımlılık koruması; TR/EN anahtar eşliği; git diff --check geçti, index boş |

Kurulu Chrome ayrı /tmp/repovitrin-demo-nav-chrome profiliyle kullanıldı; kullanıcı profili değiştirilmedi. Kullanıcının localhost:3000 sunucusu yeniden kullanıldı ve kapatılmadı. Görseller/ölçümler /tmp/repovitrin-demo-nav-review altında; geçici kontrol script'i repoya eklenmedi. Yeni test altyapısı veya uzak CI çalışması yok.

### İnceleme ve durma noktası

**Kullanıcı görsel kabulü henüz verilmedi; bu revizyon veya A1 toplamı kabul edilmiş/tamamlanmış sayılmaz.** Önceki native durum select menüsünün gerçek kullanıcı klavye kontrolü hâlâ açık; bu tur kapsamı dışında olduğu için kapatılmadı.

İncele: http://localhost:3000/demo, http://localhost:3000/demo/select, http://localhost:3000/demo/states. Sunucu kapalıysa `npm run dev`.

Bu tur değişenler: yeni src/components/demo-nav.tsx; üç demo page.tsx, src/features/analysis/analysis-states.tsx (yalnız link sınıfları), globals.css, tr/en mesajları; docs/DESIGN.md, STATUS.md, TASKS.md. Önceki A1.2 değişiklikleri ayrıca duruyor. Teknik kontroller geçti; görsel kabul bekleniyor. Stage/commit/push yapılmadı. Kullanıcı incelemesi için dur; sonraki işe geçme.

## A1.2 — repo seçimi ve durumlar — 28 Ekim 2026

### Başlangıç ve yetki

- HEAD `a78abde feat: add bilingual landing page and demo report`; git status/diff ve index başlangıçta temizdi. Kullanıcı değişikliği yoktu.
- Kullanıcı a78abde commit/push, **GitHub Actions CI başarısı** ve ana sayfa/demo masaüstü/mobil görsel kabulünü bildirdi. CI bu oturumda API'den yeniden sorgulanmadı. Yeni A1.2 değişiklikleri için uzak CI sonucu yok.
- Görev TASKS'taki A1 repo seçimi ve tüm durumlar maddeleriyle eşleştirildi. Yetki yalnız A1 arayüzüdür; A2'ye geçilmez.

### Yapılanlar

- `/demo/select`: mira-sample profili ve dört kurmaca repo. İlk iki sabitlenmiş repo seçili başlar. İsim, açıklama, ana dil, pinned ve gerçek checkbox gösterilir. Seçimler sample-101…104 kimlikleriyle state'tedir; sayı türetilir.
- En fazla üç seçim; sınırda seçilmemişler disabled, seçililer kaldırılabilir. Sıfırda devam disabled ve gerekçe görünür. Dil değişiminde sıfır/özel iki kimlik/üç seçim korunur.
- Devam yalnız “Analiz ekranı örneklerini gör” adıyla `/demo/states` açar; seçimlerden skor/rapor üretmez. `/demo` sabit 77,5 örneği olarak kalır; sonuna sade seçim bağlantısı eklendi. Ana sayfa kodu/bağlantısı korunuyor.
- `/demo/states`: elle seçilen altı örnek; loading, kullanıcı bulunamadı, uygun public repo yok, ağ/servis hatası, rate-limit, eksik analiz. Polite/atomic status alanı ve doğru geri dönüş bağlantıları var. Native select etiketli ve focus görünür.
- Loading statik kalır; otomatik başarı, sahte yüzde/zaman/reset geri sayımı yok. Yeniden deneme gerçekmiş gibi sunulmaz. Partial yalnız bir bilinen bulguyu korur; toplam skor/profil tipi göstermez. Sabit başarılı örneğe ayrı açıklamalı link verilir.
- Fixture'lar bileşenlerden ayrı, iki küçük Client Component yalnız sayfa mesajlarını alır. Yeni bağımlılık/store/workflow motoru, API route, GitHub/MongoDB/AI veya PNG yok.
- Mevcut CSS kuralları değiştirilmeden yeni ekranlara ait stiller eklendi. Önceki ana sayfa, ResultSummary, root layout, locale action, puan fixture'ı, paket/lock/config, kaynak sözleşme ve referans görseli korundu.

### Doğrulama

| Kontrol | Gerçek sonuç |
| --- | --- |
| npm run lint | Başarılı; --max-warnings=0 |
| npm run typecheck | Başarılı |
| npm run build | Başarılı; /, /demo, /demo/select ve /demo/states server-render |
| Seçim davranışı, temiz Chrome | İlk iki ID, seçim/kaldırma, 0/3 sınırları, limitte kaldırabilme ve dördüncüye geçmeme doğrulandı. |
| Dil değişimi, gerçek tıklamalar | Sıfır, ilk seçimden farklı iki ID ve üç seçim TR/EN değişiminde korundu; durum örneği de locale değişiminde aynı kaldı. |
| Checkbox klavye/focus | Gerçek Space ile seç/kaldır, Tab/Shift+Tab ve 3px outline geçti. |
| Altı durum | Select change olayıyla her örnek görüntülendi; loading beklemede kaldı, partial bulgu tuttu ve normal skor/tip üretmedi; devam yalnız durum sayfasını açtı. |
| Tarayıcı console / network | Temiz Chrome kontrolünde 0 runtime/console hatası ve 0 harici HTTP isteği. Yerel Next navigasyonu/dil işlemleri analiz isteği sayılmadı. |
| Taşma | Yeni iki sayfa × TR/EN × 320/360/390/768/1440: scrollWidth <= viewport. Uzun repo adlarıyla tekrar geçti. Altı durum ayrıca iki dilde 320px'de geçti. |
| Görsel inceleme | Yeni ekranlarda 360/390/768/1440 TR/EN görüntüleri kaydedildi; mobil/masaüstü ve altı durumdan temsilî görüntüler araçla açılıp incelendi. Önceki ana sayfa/demo 360/768 regresyon görüntüleri ve ölçümleri alındı. |
| Mesaj / koruma / diff | TR/EN anahtar eşliği, eski mesajların korunması, paket/config/fixture korunması ve git diff --check doğrulandı. Index boş. |

Kurulu Chrome ayrı temiz `/tmp/repovitrin-a1-selection-chrome` profiliyle kullanıldı; kullanıcı Chrome profili okunmadı/değiştirilmedi. Kullanıcının localhost:3000 dev sunucusu yeniden kullanıldı ve kapatılmadı. Geçici CDP script'leri repoya eklenmedi; yeni test altyapısı kurulmadı. Vitest/RTL/Playwright/axe çalıştırılmış gibi raporlanmıyor. Bu kontroller kalıcı test suite'i değildir. Görüntü/ölçüm çıktıları `/tmp/repovitrin-a1-selection-review/` altında, commit kapsamı dışındadır.

### Açık kalanlar ve sınırlar

- Native select menüsünde klavyeyle seçenek değiştirme, macOS headless CDP denemelerinde doğrulanamadı. Etiket, odak ve 3px focus geçiyor; altı duruma geçiş DOM change olayıyla kontrol edildi. Bu sonuç native menünün gerçek kullanıcı klavye kontrolü yerine sayılmadı. Kullanıcı yeni sayfada Tab + yön tuşları/Enter ile kontrol etmeli.
- Yeni repo seçimi ve durum ekranları **kullanıcı görsel/işlevsel kabulünü bekliyor**. Önceki ana sayfa/demo kabulü geçerli; yeni ekranları kapsadığı varsayılmıyor. Bu nedenle A1 toplam kabulü henüz kapanmadı.
- Yeni A1.2 uzak CI sonucu yok. ESLint 9 bakım desteği sınırlaması D011'deki haliyle sürüyor. Gerçek servis davranışı, limit/reset/yeniden deneme ve normalizasyon A2+ kapsamıdır; bu tur doğrulanmadı.

### İnceleme ve commit

- http://localhost:3000/demo/select — 0/3 sınırı, kaldırma, farklı ID seçimleri ve TR/EN korunumu.
- http://localhost:3000/demo/states — altı durumu elle değiştir; özellikle native menünün klavye kullanımını ve partial puansızlığını incele.
- http://localhost:3000/demo — sabit rapor ve yeni seçim bağlantısı. Sunucu kapalıysa `npm run dev`.

Kod ve belirtilen yerel kontroller commit hazırlığına uygun; native menü kontrolü ve yeni kullanıcı kabulü açık. Önerilen commit: `feat: add demo repository selection and analysis states`.

Commit kapsamı: AGENTS.md, README.md; docs/ARCHITECTURE.md, DESIGN.md, DECISIONS.md, TASKS.md, STATUS.md; src/app/demo/page.tsx, src/app/demo/select/page.tsx, src/app/demo/states/page.tsx, src/app/globals.css; src/features/analysis/repo-picker.tsx, analysis-states.tsx, selection-demo.ts, state-demo.ts; src/messages/tr.json, en.json.

Stage/commit/push yapılmadı. Kullanıcı incelemesi için dur; “commit attım, devam” demeden başka işe veya A2'ye geçme.

## Kullanıcı görsel kabulü — 28 Ekim 2026

Kullanıcı masaüstü ve mobil ekranları kendisi incelediğini belirterek **A1’in yalnız ana sayfa ve demo bölümüne görsel kabul verdi**. Bu kayıt kullanıcı tarafından yapılan görsel incelemeye dayanır; yeni bir Codex tarayıcı testi veya tüm A1 kabul kriterlerinin tamamlanması anlamına gelmez.

Bu tur yalnız STATUS.md ve TASKS.md içindeki kabul durumu güncellendi. Uygulama kodu değiştirilmedi; uygulama testleri yeniden çalıştırılmadı. A1’in kalan işleri açık; sonraki işe geçilmedi. Stage, commit veya push yapılmadı. Kullanıcının “commit attım, devam” mesajı bekleniyor.

## A1.1 görsel revizyon — 28 Ekim 2026

Kapsam yalnız mevcut ana sayfa ve demo düzeltmesidir. Revizyon başladığında kullanıcı henüz A1 commit'i atmamış ve görsel kabul vermemişti; son kullanıcı kabulü yukarıda kayıtlıdır. HEAD fcd3718; başlangıçtaki önceki A1 değişiklikleri korunarak çalışıldı.

### Bu tur değişenler

- Header 94px yerine minimum 76px; masaüstü hero üst boşluğu 90px yerine 40px. İçerik sabit yükseklik/overflow ile kırpılmadı. Başlık büyük kaldı, “profilin / profile” ifadesi mevcut marka mavisiyle vurgulandı.
- `src/components/result-summary.tsx` iki yerde gerçekten kullanılan ortak sonuç sunumudur. Ana sayfa önizlemesinde kurmaca kullanıcı, Gizli Cevher, 77,5, üç kompakt kategori, repo adlı bulgu ve rapor bağlantısı var; pazarlama paneli kaldırıldı.
- Demo kimlik/tip/puan/değerlendirme tek sınırlı kartta toplandı. Teknik tip gerekçesi ve kural sürümü açılıma taşındı; kaynak alanları bulgu kanıtının içinde kaldı.
- İlk görev “paper-lantern projesine canlı demo bağlantısı ekle.” olarak sadeleştirildi. TR/EN kısa metinler birlikte güncellendi; tekrar eden uyarılar azaltıldı. Örnek etiketi, kısa demo açıklaması ve puan sınırı notu korunuyor.
- CSS mevcut kurallar düzenlenerek güncellendi; eski pazarlama önizlemesinin kullanılmayan stilleri kaldırıldı. Yeni animasyon, backend veya bağımlılık eklenmedi.
- **Fixture, puanlama, paket/lock/config, layout/i18n işlevi, ana sözleşme ve referans görseli bu tur değişmedi**; tur başlangıcı SHA-256 karşılaştırmasıyla kontrol edildi.

### Tarayıcı ve işlev kontrolleri

Özel browser MCP aracı yoktu; kurulu Google Chrome bulundu. Yeni bağımlılık veya tarayıcı indirmeden, ayrı `/tmp/repovitrin-a1-clean-chrome` profiliyle headless Chrome ve DevTools Protocol kullanıldı. Kullanıcının kişisel profili okunmadı/değiştirilmedi. Kullanıcının çalışan localhost:3000 sunucusu yeniden kullanıldı ve kapatılmadı.

- TR/EN iki sayfada **1440×900 ve 390×844** ekran görüntüleri alındı ve araçla açılıp görsel olarak incelendi. 390px alt görev/paylaşım/kategori bölümü ve klavye odaklı kanıt görüntüsü ayrıca incelendi.
- Masaüstü ana sayfada demo eyleminin alt kenarı y=622px; sonuç önizlemesinin alt kenarı TR y=585px, EN y=563px. Başlık, kart ve ana eylem 900px viewport içinde. Mobilde içerik doğal akışla kaydırılır.
- İki sayfa × iki dil × 1440/390/320 genişliklerinde document scrollWidth = viewport genişliği. Uzun adlar DOM'a yalnız test sırasında verilerek ve tüm details açılarak taşma yeniden kontrol edildi; geçti. Fixture değiştirilmedi.
- Gerçek tarayıcıda her iki sayfada TR→EN ve EN→TR buton tıklamaları: doğru dil, aynı sayfa. Native kanıt ve üç kategori açılımı korundu.
- Tab odağı skip link → marka → TR → EN → geri → tip gerekçesi → örnek kanıt sırasıyla ilerledi; Shift+Tab geri döndü. Kanıt Enter ile açıldı, Space ile kapandı; üç kategori Enter ile açıldı, bir kategoride Space ile kapanma da kontrol edildi. Hesaplanan focus outline 3px; odak görüntüsü incelendi.
- 390px bölüm konumlarıyla sonuç özeti → bulgular → ilk görev → paylaşım durumu → kategoriler → diğer görevler sırası doğrulandı.
- Kontrol script'leri yalnız /tmp içinde kullanıldı; repo içine geçici test dosyası veya yeni test altyapısı eklenmedi. Ekranlar `/tmp/repovitrin-a1-review/` altında inceleme çıktısıdır, commit kapsamına alınmaz.

### Hydration araştırması

Tam hata `.next/dev/logs/next-development.log` içinden okundu: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.` Diff, RootLayout html üzerinde sunucu çıktısında olmayan `data-yd-metadata-content-site="common"` ve `data-yd-content-ready="true"` niteliklerini gösteriyor. Aynı günlükte uygulama kaynaklarında olmayan `[debug-metadata] enter inject script test` satırı da var.

1. Değişiklik öncesi temiz, eklentisiz Chrome profilinde / ve /demo: bu nitelikler yok, console/runtime hatası yok.
2. Değişiklik sonrası iki dil/iki sayfa işlev ve viewport denemelerinde de console/runtime hatası yok.
3. Aynı data-yd nitelikleri yalnız test için hydration öncesi CDP ile eklendiğinde aynı hydration diff'i yeniden üretildi.
4. Test enjeksiyonu kaldırılıp iki sayfa yeniden açılınca yine 0 hata ve data-yd niteliği yok.

Sonuç: incelenen uyarı uygulama dışı DOM müdahalesine bağlıdır; belirli eklentinin adı tespit edilmedi. Kullanıcının normal profilindeki müdahale kaldırılmadıkça o profilde uyarı sürebilir. Uygulamaya suppressHydrationWarning, devIndicators ayarı, console filtreleme veya hata gizleme eklenmedi. Kontrollü yeniden üretim günlüğündeki beklenen hata yeni uygulama regresyonu değildir.

### Son kontroller ve kalanlar

| Kontrol | Sonuç |
| --- | --- |
| npm run lint | Başarılı |
| npm run typecheck | Başarılı |
| npm run build | Başarılı; / ve /demo server-render |
| TR/EN, kanıt/kategori, klavye/focus, taşma | Yukarıdaki kapsamda temiz Chrome ile geçti |
| git diff --check ve koruma | Başarılı; index boş; bu tur puan/fixture/bağımlılık değişmedi |

**Ana sayfa ve demo görsel kabulü, kullanıcının masaüstü ve mobil incelemesiyle verildi.** Bu kontroller A1'in repo seçimi/tüm durumlar gibi kalan kapsamını tamamlamaz; 360/768 tüm A1 ekran denetimi de yapılmış sayılmaz. ESLint 9 EOL sınırlaması D011'deki haliyle devam eder. Yeni uzak CI sonucu yok.

Bu turun dosyaları: src/app/page.tsx, src/app/demo/page.tsx, src/app/globals.css, src/messages/tr.json, src/messages/en.json, yeni src/components/result-summary.tsx; docs/STATUS.md, TASKS.md, DESIGN.md ve DECISIONS.md. A1'in önceki çalışma dosyaları ayrıca duruyor. Stage/commit/push yapılmadı.

Görsel kabul kaydedildi; kullanıcı commit mesajı için dur. Yerel inceleme: http://localhost:3000 ve http://localhost:3000/demo; sunucu kapalıysa `npm run dev`. Mevcut A1 commit önerisi `feat: add bilingual landing page and demo report` olarak kalır; revizyonlar aynı henüz commit edilmemiş kapsamın parçasıdır.

## İlk A1 uygulama kaydı — 28 Ekim 2026


### Başlangıç ve A0 uzak CI

- Başlangıç git status/diff boş; HEAD `fcd3718 chore: set up Next.js foundation and CI`. Index boş. Mevcut kullanıcı değişikliği yoktu.
- Kullanıcı A0 commit'ini GitHub'a gönderdiğini ve **GitHub Actions CI'ın başarılı** olduğunu bildirdi. Bu sonuç kullanıcı tarafından doğrulandı; bu oturumda GitHub API üzerinden yeniden sorgulanmadı. Yeni A1 değişikliklerinin uzak CI sonucu henüz yok.
- AGENTS ve yönlendirdiği belgeler okundu; `docs/design/reference.png` araçla açılıp gerçekten incelendi. Kaynak sözleşme, görsel, .gitignore ve marka config dosyası değişmedi.

### Uygulananlar

- Ana sayfa: marka/TR-EN, istenen başlık, değer önerisi, etiketli kullanıcı adı/URL alanı ve açıklaması, sabit kurmaca demoya eylem, Keşfet → Düzelt → Paylaş ve puanın sınırları.
- `/demo`: mira-sample; paper-lantern ve quiet-orbit. Açık örnek etiketi; Gizli Cevher, 77,5/100, neden açıklaması; iki repo bulgusu, kaynak/alan ve açılabilir yerel örnek kanıt; ilk görev ve iki ek görev.
- Profil/Projeler/README açılımlarında 23 check, puan katkıları, pass/fail metinleri ve gerekçeler. Kategori toplamları 15 + 22,5 + 40 = 77,5; ağırlıklar değiştirilmedi. Fixture bileşenden ayrı, gerçek puanlama motoru yok.
- Paylaşım/yeniden analiz disabled ve açıklamalı. Gerçek kaynak URL'si, GitHub/MongoDB/AI/API/PNG veya sessiz demo fallback yok; girilen kullanıcı adı fixture'ı etkilemez.
- next-intl 4.14.9 ve lucide-react 1.62.0 tam sürüm olarak eklendi. Ortak Server Component'ler, mesaj dosyaları ve cookie/Server Action dil tercihi kullanıldı. Aynı URL korunur, HTML lang ve metadata güncellenir.
- Merkezi tokenlar genişletildi; marka #4169FF korundu. Beyaz metinli eylem için kontrastı geçen #3C63F0 ayrıldı. Native details/summary, input label, skip link, focus halkaları ve uzun metin sarma kuralları var. Animasyon yok.

### Kontroller ve kanıt

| Kontrol | Sonuç |
| --- | --- |
| `npm install --save-exact next-intl@4.14.9 lucide-react@1.62.0` | Başarılı; audit 0 vulnerability. Mevcut Next/React uyumlu peer aralıkları resmi metadatadan kontrol edildi. |
| `npm run lint` | Son kaynaklarla başarılı, --max-warnings=0. |
| `npm run typecheck` | Son kaynaklarla başarılı. |
| `npm run build` | Son kaynaklarla başarılı; / ve /demo cookie nedeniyle request sırasında server-render edilir. |
| HTTP GET / ve /demo, locale tr/en | Dört yanıt 200; doğru lang, çeviri, sabit kurmaca adlar ve 77,5/77.5 sayı biçimi doğrulandı. Demo HTML'inde sahte GitHub kaynak href'i yok. |
| Dil seçimi gerçek multipart form POST'u | İki sayfada TR→EN ve EN→TR dört deneme geçti: 200, cookie, aynı sayfa ve doğru dilde HTML. İlk URL-encoded deneme gerçek form encoding'iyle eşleşmedi; multipart ile doğru akış doğrulandı, ürün kodu değişmedi. |
| Fixture aritmetiği / etiket koşulları | 23 check earned/max, her repo ham toplamı, kategori ortalamaları, toplam 77,5 ve Gizli Cevher öncelik koşulları geçti. Tek seferlik inline kontrol; test motoru/script'i repoya eklenmedi. |
| Mesaj dosyaları | TR/EN 120 anahtar eşleşiyor. |
| Hesaplanan metin kontrastları | Paper/ink 17,31:1; muted/ink 9,18:1; muted/surface 8,58:1; link/preview 8,09:1; beyaz/action 4,96:1; beyaz/hover 5,94:1; mint/ilk görev 10,28:1. Renk hesabı tarayıcı incelemesi değildir. |
| Kaynak/HTML erişilebilirlik incelemesi | Label+aria-describedby, html lang, semantic başlıklar, native details/summary, metinle durum ve disabled açıklamaları mevcut. Gerçek klavye kullanımı yapılmadı. |
| Kod / Git incelemesi | Gereksiz state/soyutlama, açıklama yorumları, any/ts-ignore, lint kapatma, servis taklidi veya bırakılan geçici kontrol script'i yok. git diff --check geçti; index boş. |

Geliştirme sunucusu HTTP kontrolünden sonra kapatıldı. **Tarayıcı aracı mevcut değil; ekran görüntüsü alınmadı ve görsel doğrulama yapılmadı.** Playwright/axe/test altyapısı kurulmadı veya çalıştırılmadı. A1 yeni uzak CI sonucu yok.

### Açık kontroller ve bilinen sınırlamalar

- Tarayıcıda iki sayfa ve iki dil için 360/390/768/1440 screenshot incelemesi, 320px yatay taşma, uzun kullanıcı/repo adları, Tab/Shift+Tab, Enter/Space accordion, görünür focus ve uzun TR/EN metinler doğrulanmalı. CSS/HTML incelemesi bu kabulü kapatmaz.
- Dev sunucusuna gelen browser günlüğünde html üzerindeki `data-yd-metadata-content-site="no-match"` niteliğine bağlı hydration farkı görüldü. Bu nitelik proje kaynaklarında yok. Tarayıcı eklentisi/ortamı kaynaklı olabilir; tarayıcı aracı olmadan kesin neden doğrulanmadı. Uyarı suppression eklenmedi. Eklentiler kapalı/gizli pencerede yeniden kontrol edilmeli; devam ederse araştırılmalı.
- ESLint 9.39.5 bakım desteği sınırlaması D011'deki haliyle sürüyor; bu tur araç zinciri değiştirilmedi.
- Repo seçimi, loading/empty/not-found/partial/rate-limit/network-error tasarımları A1'in kalanına aittir. Gerçek GitHub entegrasyonu ve motor sonraki aşamalardadır.

### Yerel inceleme ve durma noktası

`npm run dev` ile aç:

- Ana sayfa: http://localhost:3000
- Örnek sonuç: http://localhost:3000/demo

Her sayfada TR/EN değiştir; ana sayfada farklı kullanıcı adı yazınca örnek profilin sabit kaldığını, kanıtların örnek etiketi taşıdığını ve kategori toplamlarının tutarlı olduğunu incele. 360/390/768/1440 ve 320px genişliklerini; uzun adları, Tab/Shift+Tab odaklarını ve Enter/Space ile accordion açılımlarını kontrol et.

Kod ve yerel kontroller commit hazırlığına uygun; **görsel kabul tamamlandı olarak işaretlenmedi**. Kullanıcı incelemesi/commit mesajı beklenir. Stage/commit/push yapılmadı. Önerilen commit: `feat: add bilingual landing page and demo report`.

Commit kapsamı:

- AGENTS.md, README.md, next.config.ts, package.json, package-lock.json
- src/app/layout.tsx, src/app/page.tsx, src/app/demo/page.tsx, src/app/globals.css
- src/components/site-header.tsx, src/components/site-footer.tsx
- src/i18n/request.ts, src/i18n/actions.ts, src/messages/tr.json, src/messages/en.json
- src/features/analysis/demo.ts
- docs/ARCHITECTURE.md, docs/SCORING.md, docs/DESIGN.md, docs/DECISIONS.md, docs/TASKS.md, docs/STATUS.md

## Önceki kayıt — ESLint uyumluluğu (28 Ekim 2026)


Kullanıcı henüz commit atmadı ve yalnız ESLint uyumluluğunu inceleme yetkisi verdi. HEAD hâlâ 5ca7d9d; önceki A0 dosyaları çalışma alanında duruyor, index boş. A1 başlamadı.

- **Bağımlılık veya config güncellemesi yapılmadı.** Bu tur yalnız DECISIONS.md (D011), TASKS.md ve bu durum kaydı değişti. Node 22.13.0 / npm 10.9.2, package.json ve package-lock.json korundu.
- Kurulu Next.js / eslint-config-next / @next/eslint-plugin-next 16.4.3; ESLint 9.39.5. İlgili eklentilerin tam sürüm/peer tablosu D011 içindedir.
- Somut engeller: eslint-plugin-import 2.32.0 (ESLint aralığı ^9 ile biter), eslint-plugin-react 7.37.5 (^9.7 ile biter), eslint-plugin-jsx-a11y 6.10.2 (^9 ile biter). Üçü de ESLint 10'u dışlar ve güncel stabil registry sürümleridir. Hooks 7.1.1 ve typescript-eslint 8.72.1 ESLint 10'u kabul eder.
- Node engeli yok: ESLint 10.13.0, Node ^22.13.0 kabul eder. Node yükseltmesi bu peer aralıklarını çözmez.
- Yalıtılmış /tmp kurulumu ile ESLint 10.13.0 + mevcut proje config/kaynakları 0 hata/0 uyarıyla lint edildi. Next 16.4.3'ün React/import rule-context uyarlaması incelendi. Config yüklenmeyen ayrı süreçte ham React kuralı `context.getSourceCode is not a function` hatası verdi; bu deney proje config'inde aktif bir runtime çökmesi olarak sunulmaz. Kural proje yapılandırmasına eklenmedi.
- Peer desteği tam, stabil ve desteklenen bir zincir sağlayan küçük güncelleme bulunmadı. Paket/kural ailesi değişikliği uygulanmadı. ESLint 9.39.5 peer uyumlu fakat bakım desteği bitmiş geçici seçim olarak korundu. Force/legacy-peer-deps/override/canary/kural kapatma yok.

### Bu tur yeniden çalıştırılan kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm ci` | Başarılı; 376 paket kuruldu, audit 0 vulnerability. ESLint 9 deprecation uyarısı devam ediyor. |
| `npm run lint` | Başarılı; --max-warnings=0. |
| `npm run typecheck` | Başarılı; next typegen + tsc --noEmit. |
| `npm run build` | Başarılı; / ve /_not-found statik üretildi. |
| `npm ls eslint --all --parseable` | Başarılı; mevcut ESLint 9 ağacında peer hatası yok. |
| ESLint 10 yalıtılmış araştırması | Mevcut config/kaynaklar geçti; ham eklenti API hatası ayrı süreçte yeniden üretildi. Proje paketleri değiştirilmedi. |
| Dosya koruma / `git diff --check` | Başarılı; tur başlangıcına göre yalnız üç belge değişti, staging yapılmadı. |

Bu tur uygulama test altyapısı kurulmadı/çalıştırılmadı; tarayıcı veya HTTP kontrolü tekrarlanmadı. Aşağıdaki HTTP ve temiz tip üretimi sonuçları 27 Ekim A0 kurulumuna aittir. Uzak CI bu tur da çalıştırılmadı.

Commit öncesi kalan teknik sınırlama ESLint 9 EOL durumudur; çözülmüş sayılmaz. Seçenekler D011'de: uyumlu stabil upstream sürümü beklemek veya ayrıca kararlaştırılacak kapsamlı lint araç değişikliği. Mevcut A0 paketi bu görünür sınırlamayla commit'e hazır; A1 geçişi için kullanıcının mesajı beklenir.

## A0 kurulum geçmişi — 27 Ekim 2026

### Başlangıç ve korunan dosyalar

- `git status --short`, `git diff` ve `git diff --cached` başlangıçta boştu.
- `git log -1`: `5ca7d9d docs: add project specification and development workflow`.
- `git remote -v`: origin fetch/push `https://github.com/EnessCansever/github-vitrin.git`. Uzak GitHub durumu ayrıca sorgulanmadı; push bilgisi kullanıcı beyanıdır.
- Önceki turdaki Git yokluğu giderilmiş. Kaynak sözleşme ve referans görseli HEAD ile aynı; PRODUCT, SCORING ve BACKLOG korunuyor. .gitignore mevcut kuralları korunarak genişletildi.
- Bu tur stage, commit veya push yapılmadı; index boş.

## Tamamlananlar

- AGENTS ve yönlendirdiği belgeler okundu; kullanıcının 11 kalıcı kod standardı eklendi. Yetki yalnız kalan A0 olarak güncellendi.
- Mevcut kökte Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3 strict ve Tailwind 4.3.3 kuruldu; iç içe uygulama yok.
- Node 22.13.0 / npm 10.9.2 kullanıldı; sistem kurulumu değiştirilmedi. Tam paket sürümleri DECISIONS.md, package.json ve tek package-lock.json içinde.
- Merkezi marka/config, CSS tokenları ve geliştirme durumunu açıklayan minimal sayfa eklendi; gerçek ürün ekranı veya sahte analiz yok.
- Boş değerli .env.example ve Git ignore kuralları, README, lint/typecheck komutları ve GitHub Actions CI tanımı hazır. Env dosyası/anahtar/veritabanı olmadan build alındı.
- Next.js'in otomatik AGENTS eklemesi `agentRules: false` ile kapatıldı; yalnız araç tarafından eklenen blok kaldırıldı.

## Çalıştırılan kontroller

| Kontrol | Sonuç |
| --- | --- |
| `npm ci` | Başarılı; lockfile üzerinden kurulum, audit 0 vulnerability. ESLint 9 deprecation uyarısı aşağıda kayıtlı. |
| `npm run lint` | Başarılı, --max-warnings=0. |
| `npm run typecheck` | Başarılı. İlk doğrulama öncesinde .next, next-env.d.ts ve tsbuildinfo kaldırılarak temiz tip üretimi kontrol edildi. Son config ile tekrar geçti. |
| `npm run build` | Başarılı; / ve /_not-found statik üretildi. Son next.config.ts ile tekrar geçti. |
| `npm run dev -- --hostname 127.0.0.1` + HTTP GET / | 200; marka, geliştirme durumu metni ve lang=tr HTML içinde doğrulandı. Sunucu sonrasında kapatıldı. |
| `npm ls eslint --all --parseable` | Son sürümle başarılı; peer uyumsuzluğu kalmadı. |
| `git diff --check` | Başarılı. |
| Git ignore/koruma kontrolü | .env.local/.env.production ve üretilen çıktılar ignore; .env.example görünür. Kaynak sözleşme/görsel değişmedi; stage edilmiş dosya yok. |
| Kod incelemesi | Yalnız bu aşamanın kodu incelendi; gereksiz soyutlama, sohbet yorumu, any/ts-ignore, sessiz catch, sahte başarı ve boş domain katmanı eklenmedi. |

**Vitest, React Testing Library, Playwright veya axe kurulmadı ve çalıştırılmadı. Tarayıcıda görsel inceleme yapılmadı. GitHub Actions uzak çalışması yapılmış/başarılı olarak raporlanmıyor.** HTTP kontrolü görsel veya uçtan uca test yerine geçmez.

## Karşılaşılan sorunlar ve sınırlar

- Sandbox ilk npm erişiminde DNS engeli verdi; izinli ağ çağrısıyla paket kurulumu tamamlandı.
- İlk production build Turbopack'in yerel port açmasına izin verilmediği için başarısız oldu. Başarısız çıktının önbelleği temizlendikten sonra izinli çalıştırma geçti; bundler veya build komutu değiştirilmedi. Sandbox içinden localhost erişimi de engellendi; izinli HTTP kontrolü 200 döndü.
- ESLint 10.13.0 denemesi Next lint eklentilerinde peer uyumsuzluğu üretti. Uyumlu 9.39.5'e dönüldü; deprecation uyarısı sürüyor çünkü bakım desteği bitmiş. D008 ve TASKS takip kaydı var. Force, legacy-peer-deps veya override kullanılmadı.
- `npm ls --depth=0`, npm ci sonrası bazı transitif isteğe bağlı WASM paketlerini extraneous olarak gösteriyor; komut exit 0, doğrudan bağımlılıklar ve build çalışıyor. Bunlar uygulamaya elle eklenen bağımlılıklar değildir.
- Uzak Linux CI henüz çalıştırılmadı. Yerel başarılı build uzak ortam garantisi değildir.
- Marka/alan adı, gerçek Instagram URL'si ve puanlama ayrıntıları DECISIONS.md'de açık; A0'ı engellemiyor. Kullanıcı arayüzü, gerçek analiz, kalıcılık ve paylaşım henüz yok.

## A0 önceki teslimindeki adım ve commit (tarihsel)

Bu A0 kurulumu **bilinen ESLint bakım uyarısıyla commit'e hazır**. Kullanıcı stage/commit/push yapar; ardından uzak CI sonucu doğrulanır. Kullanıcı “commit attım, devam” demeden A1'e geçilmez.

Önerilen commit: `chore: set up Next.js foundation and CI`

Commit kapsamı:

- .gitignore, .env.example, .npmrc, .nvmrc
- package.json, package-lock.json, tsconfig.json, next.config.ts, eslint.config.mjs, postcss.config.mjs
- .github/workflows/ci.yml
- src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, src/config/site.ts
- README.md, AGENTS.md
- docs/ARCHITECTURE.md, docs/DESIGN.md, docs/DECISIONS.md, docs/TASKS.md, docs/STATUS.md

node_modules, .next, next-env.d.ts, tsbuildinfo, gerçek env dosyaları ve geçici HTTP çıktıları commit kapsamı dışındadır.
