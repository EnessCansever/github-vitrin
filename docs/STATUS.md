# Güncel durum

Son güncelleme: 28 Ekim 2026 (Europe/Istanbul).

## Aktif aşama

**A1 ilk bölüm arayüzü kullanıcı geri bildirimine göre düzeltildi; yerel ve temiz Chrome kontrolleri geçti. Ana sayfa ve demo için kullanıcı masaüstü ve mobil incelemesiyle görsel kabul verdi. A1’in bütünü tamamlanmadı.** Ana sayfa ve /demo TR/EN olarak uygulanmıştır. Repo seçimi, tüm durum ekranları ve sonraki aşamalar yapılmadı. Kullanıcı “commit attım, devam” demeden ilerlenmez.

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
