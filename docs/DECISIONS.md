# Kararlar ve açık konular

Kaynak: [başlangıç sözleşmesi](../RepoVitrin-Codex-Proje-Sozlesmesi.md). Tarih: 26 Ekim 2026. Buradaki kayıtlar uygulama tamamlanma kanıtı değildir.

| Kayıt | Karar ve gerekçe | Etkilenen dosyalar |
| --- | --- | --- |
| D001 — 2026-10-26 | v1 kapsamı ve sabit stack kaynak sözleşmeden değişmeden aktarılır; React/Mongo deneyimi korunur, SSR metadata, kart ve backend tek uygulamada kalır. | PRODUCT.md, ARCHITECTURE.md |
| D002 — 2026-10-26 | Puanlama v1.0.0, profil 20 / repo 30 / README 50; unknown varsa toplam null. Amaç yalnız sunum sinyallerini dürüstçe ölçmektir. | SCORING.md |
| D003 — 2026-10-26 | Referans mevcut ve incelendi. İşlevsel ayrışmalarda sözleşme geçerli; görseldeki puan ve dönüşüm metinleri kuralları değiştirmez. | DESIGN.md, SCORING.md |
| D004 — 2026-10-26 | Kullanıcının güncel talimatı bu turu yalnız A0 belgelendirme ile sınırlar; §12'deki A0+A1 uygulanmaz. A0'ın kurulumu ve tüm sonraki aşamalar bekler. | AGENTS.md, TASKS.md, STATUS.md |
| D005 — 2026-10-26 | Stage, commit ve push yapılmaz; bunlar kullanıcıya aittir. “commit attım, devam” mesajı olmadan sonraki aşama başlamaz. Git yoksa bu tur başlatılmaz. | AGENTS.md, STATUS.md, TASKS.md |
| D006 — 2026-10-26 | RepoVitrin çalışma adıdır; global marka/alan adı bekler. Marka ve Enes bağlantıları tek config'ten yönetilecek; bilinmeyen Instagram URL'si boş kalacak. | PRODUCT.md, DESIGN.md |

## Açık kararlar ve uygulama ayrıntıları

- Global marka/alan adı ve gerçek Instagram URL'si kullanıcıdan bekliyor; uydurulmayacak.
- A0 sürümleri aşağıdaki D008 kaydında kilitlendi. Gelecekte major sürüm değişikliği gelişigüzel yapılmayacak.
- TR/EN alias listeleri, demo işaretleme kuralları, görev önceliği/eşitlikleri, not_applicable aritmetiği ve “Gizli Cevher” profil sunumu koşulunun check eşlemesi SCORING.md'de açık tutuldu. Yeni ağırlık veya sessiz yorum eklenmedi.
- A0 temel tokenları DESIGN.md içinde kayıtlıdır. Mint ve kart fontları A1/A5 kapsamında açık; sabit renkler ve erişilebilirlik koşulları değişmeyecek.
- Başlangıç limitleri sözleşmedeki örnek/config değerleridir; hosting timeout'u, Vercel/Atlas maliyetleri, plan limitleri ve deployment bölgesi ilgili aşamada doğrulanacak. Ücretsiz/sınırsız varsayımı yok.

Bu konular belge teslimini engellemiyor; ilgili uygulama davranışı kesinleştirilmeden tamamlandı sayılamaz. Yeni büyük kararlar Enes'in açık kararıyla tarihli kayda dönüştürülür.

## A0 kurulum kararları — 27 Ekim 2026

### D007 — Yetki ve kod standartları

Kullanıcı 5ca7d9d belge commit'ini gönderdiğini belirtti; yerel HEAD ve origin adresi doğrulandı, başlangıç çalışma alanı temizdi. Yeni talimat D004'ün yalnız belge sınırını kalan A0 kurulumu için genişletti; A1 yetkisi vermedi. Kullanıcının 11 kalıcı kod standardı AGENTS.md'ye aktarıldı. Stage/commit/push yasağı devam eder.

Etkilenen dosyalar: AGENTS.md, TASKS.md, STATUS.md.

### D008 — Uyumlu ve tekrarlanabilir kurulum

Mevcut Node 22.13.0 / npm 10.9.2 kullanıldı; sistem kurulumu değiştirilmedi. Node 22 LTS hattı Next.js >=20.9 gereksinimini karşılar; `.nvmrc` aynı sürümü CI için seçer. Next.js/React/Tailwind stabil npm etiketleri ve engine/peer gereksinimleri kontrol edildi. TypeScript 5.9.3, lint parser'ının desteklediği aralıkta kalmak için seçildi (typescript-eslint >=4.8.4 <6.1.0); registry'deki TypeScript 7 bu aralık dışında.

`next typegen && tsc --noEmit`, build öncesinde ve temiz kurulumda tip kontrolünü mümkün kılar. ESLint CLI ayrı çalışır. Tam sürümler package.json ve tek package-lock.json ile kilitlenir. Yalnız A0 bağımlılıkları kurulur.

ESLint 10.13.0 denemesinde lint/typecheck geçti ancak npm ls, Next'in import/react/jsx-a11y eklentilerinin ESLint 10 peer uyumsuzluğunu bildirdi. Force/legacy-peer-deps/override ile gizlenmedi; uyumlu 9.39.5 seçildi. **ESLint 9 bakım desteği sona ermiştir** ve npm deprecation uyarısı verir; A0'ın bilinen araç sınırlamasıdır. Uyumlu desteklenen lint zinciri değerlendirmesi TASKS.md'ye kaydedildi. [Resmi destek kaydı](https://eslint.org/version-support/).

Etkilenen dosyalar: package.json, package-lock.json, .npmrc, .nvmrc, tsconfig.json, eslint.config.mjs, postcss.config.mjs, .github/workflows/ci.yml, .gitignore, README.md, ARCHITECTURE.md.

28 Ekim 2026 ayrıntılı yeniden inceleme: D011 aşağıda; mevcut Next yapılandırmasındaki runtime davranışı ile transitif peer desteği ayrı değerlendirilmiştir.

### D009 — Minimal başlangıç ve env sınırı

Sayfa yalnız geliştirme durumunu bildirir. Marka src/config/site.ts, temel tokenlar src/app/globals.css içinde merkezidir. Kırık beyaz #F5F5F0 ve sistem fontu kullanılır; kart fontu veya mint seçimi yapılmaz. Başlangıç sayfası A1 tasarımı sayılmaz. Dış font/veri isteği yok; GitHub/MongoDB secret'ı olmadan build yapılabilir. İmzalama sırrı için SIGNING_SECRET adı ayrılır; env örneğindeki tüm değerler boştur, A0 bunları tüketmez.

Etkilenen dosyalar: src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, src/config/site.ts, .env.example, DESIGN.md, README.md.

### Kilitlenen doğrudan paketler

| Paket | Sürüm |
| --- | --- |
| next | 16.4.3 |
| react | 19.3.1 |
| react-dom | 19.3.1 |
| @tailwindcss/postcss | 4.3.3 |
| @types/node | 22.20.5 |
| @types/react | 19.3.0 |
| @types/react-dom | 19.3.0 |
| eslint | 9.39.5 |
| eslint-config-next | 16.4.3 |
| postcss | 8.5.32 |
| tailwindcss | 4.3.3 |
| typescript | 5.9.3 |

### D010 — AGENTS.md otomatik değişiklik koruması

Next.js 16.4.3 geliştirme sunucusu ilk açılışta AGENTS.md'ye yönetilen bir talimat bloğu ekledi. Proje protokolünün kontrolünü korumak için `next.config.ts` içinde resmi `agentRules: false` seçildi; sonraki dev açılışı yalnız üretilmiş bloğu kaldırdı, proje kuralları korundu. Bu ayar stack veya ürün kapsamını değiştirmez. Kaynak: kurulu Next.js paketindeki `dist/docs/01-app/03-api-reference/05-config/01-next-config-js/agentRules.md`.

Etkilenen dosyalar: next.config.ts, AGENTS.md, ARCHITECTURE.md.

### D011 — ESLint 9 seçiminin commit öncesi doğrulanması — 28 Ekim 2026

Karar: ESLint 9.39.5 korunur. Projenin package.json, package-lock.json, eslint.config.mjs, Node sürümü ve uygulama kodunda bu incelemede değişiklik yapılmadı. Yalnız karar, görev ve durum kayıtları güncellendi. Bakım desteği bitmiş bir sürüm kullanılması geçici araç sınırlamasıdır; desteklenen güncel çözüm bulunduğu iddia edilmez.

#### Kurulu tam sürümler ve ESLint peer aralıkları

Aşağıdaki sürümler lockfile ile diskte kurulu package.json dosyalarından birlikte doğrulandı. import/react/jsx-a11y ve TypeScript resolver, eslint-config-next/node_modules altında çözülüyor.

| Paket | Kurulu sürüm | ESLint peer aralığı |
| --- | --- | --- |
| next | 16.4.3 | ESLint peer tanımı yok |
| eslint-config-next | 16.4.3 | >=9.0.0 |
| eslint | 9.39.5 | Kendisi |
| @next/eslint-plugin-next | 16.4.3 | Tanımlı değil |
| eslint-plugin-import | 2.32.0 | ^2 ∥ ^3 ∥ ^4 ∥ ^5 ∥ ^6 ∥ ^7.2.0 ∥ ^8 ∥ ^9 |
| eslint-plugin-react | 7.37.5 | ^3 ∥ ^4 ∥ ^5 ∥ ^6 ∥ ^7 ∥ ^8 ∥ ^9.7 |
| eslint-plugin-jsx-a11y | 6.10.2 | ^3 ∥ ^4 ∥ ^5 ∥ ^6 ∥ ^7 ∥ ^8 ∥ ^9 |
| eslint-plugin-react-hooks | 7.1.1 | ^3.0.0 ∥ ^4.0.0 ∥ ^5.0.0 ∥ ^6.0.0 ∥ ^7.0.0 ∥ ^8.0.0-0 ∥ ^9.0.0 ∥ ^10.0.0 |
| typescript-eslint | 8.72.1 | ^8.57.0 ∥ ^9.0.0 ∥ ^10.0.0 |
| @typescript-eslint/eslint-plugin | 8.72.1 | ^8.57.0 ∥ ^9.0.0 ∥ ^10.0.0 |
| @typescript-eslint/parser | 8.72.1 | ^8.57.0 ∥ ^9.0.0 ∥ ^10.0.0 |
| @typescript-eslint/utils | 8.72.1 | ^8.57.0 ∥ ^9.0.0 ∥ ^10.0.0 |
| eslint-import-resolver-typescript | 3.10.1 | * |
| eslint-import-resolver-node | 0.3.10 | Tanımlı değil |

Tablodaki ∥, package.json içindeki `||` (veya) ifadesidir. TypeScript 5.9.3, typescript-eslint'in >=4.8.4 <6.1.0 aralığı içindedir. Yerel Node 22.13.0 ve npm 10.9.2 değişmedi.

#### Somut bağımlılık engeli

eslint-config-next@16.4.3 → eslint-plugin-import@2.32.0 / eslint-plugin-react@7.37.5 / eslint-plugin-jsx-a11y@6.10.2. Üçünün de ESLint peer aralığı 10.x'i dışlar. Üst paket eslint-config-next'in >=9.0.0 aralığı ESLint 10'u kabul etse de transitif gereksinimleri ortadan kaldırmaz. Hooks ve TypeScript eklentileri ESLint 10'u kabul eder; engel onlar değildir.

Resmi npm registry latest metadatası 28 Ekim 2026 tarihinde kontrol edildi: Next/config/plugin-next 16.4.3; ESLint 10.13.0; import 2.32.0; react 7.37.5; jsx-a11y 6.10.2; hooks 7.1.1; typescript-eslint 8.72.1. Mevcut eklentiler zaten son stabil sürümleridir; küçük bir stabil yükseltmeyle üç peer engelini kaldıran kombinasyon bulunmadı. ESLint'in maintenance etiketi 9.39.5 olsa da resmi destek tablosu bu hattı EOL olarak gösterir; etiket destek garantisi değildir.

ESLint 10.13.0 Node koşulu `^20.19.0 || ^22.13.0 || >=24`; yerel Node uygundur. Node yükseltmek üç peer kısıtını çözmez. Sistem Node değişikliği gerekmiyor ve yapılmadı.

#### Runtime sonucu peer desteğinden ayrıdır

Projenin bağımlılıklarına dokunmadan, /tmp altında yalnız ESLint 10.13.0 normal npm install ile kuruldu. Projedeki aynı config ve kaynaklar, ESLint 10 API'si üzerinden lint edildi: 0 hata / 0 uyarı. Bu deney proje bağımlılıklarının ESLint 10'a geçirildiği veya npm ağacının peer uyumlu olduğu anlamına gelmez.

Next 16.4.3 `rule-context` uygulaması React ve import eklentilerinin kurallarını yerinde uyarlayarak ESLint 10'da kaldırılan context üyelerini sağlar. Bu yüzden mevcut config üzerinde genel bir runtime çökmesi iddia edilemez. Ayrı, config yüklenmeyen süreçte ham `react/forward-ref-uses-ref` kuralı ESLint 10 ile çalıştırıldığında `context.getSourceCode is not a function` hatası yeniden üretildi. Bu kural mevcut Next önerilen kural kümesinde etkin değildir; deney yalnız ham eklenti API uyumsuzluğunu gösterir. Proje lint kuralları eklenmedi/kapatılmadı. Mevcut kaynakların geçmesi tüm eklenti kuralları için uyumluluk kanıtı değildir.

#### Seçenekler ve takip

1. Şimdilik peer aralıkları uyumlu 9.39.5'i bakım desteği sınırlaması görünür kalacak şekilde koru; önerilen mevcut karar budur.
2. Upstream eklentiler ve Next config desteklenen stabil bir zincir sunduğunda yeniden değerlendir. Sadece ESLint sürümünü değiştirmek yeterli değildir.
3. Lint preset/eklenti ailesini değiştirmek veya özel uyumluluk katmanı eklemek daha geniş araç ve kural eşdeğerliği incelemesi gerektirir. Bu tur uygulanmadı; kuralları kaldırarak “çözüm” üretilmedi. Node güncellemesi bu engelin çözümü değildir.

Force, legacy-peer-deps, override, canary veya kural kapatma kullanılmadı. Son doğrulama sonuçları STATUS.md'de. Etkilenen dosyalar: docs/DECISIONS.md, docs/STATUS.md, docs/TASKS.md.

#### İncelenen resmi kaynaklar

- [ESLint destek takvimi](https://eslint.org/version-support/)
- [ESLint 10 Node ve kaldırılan API koşulları](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
- [Next ESLint yapılandırması](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Next 16.4.3 rule-context kaynak kodu](https://github.com/vercel/next.js/blob/v16.4.3/packages/eslint-config-next/src/rule-context.ts)
- npm registry metadata endpointleri: `https://registry.npmjs.org/<paket-adı>`; yerel kurulu package.json ile karşılaştırıldı. Özellikle eslint-config-next, eslint, eslint-plugin-import, eslint-plugin-react ve eslint-plugin-jsx-a11y latest/peer/engine alanları kontrol edildi. Web sayfası aracı registry URL'lerini açamadı; veriler Node fetch ile doğrudan resmi registry'den alındı.

### D012 — A1 ilk bölüm yetkisi ve A0 CI — 28 Ekim 2026

Kullanıcı A0 fcd3718 commit'ini gönderdiğini ve GitHub Actions CI'ın başarılı olduğunu bildirdi. Yerel HEAD fcd3718 ve temiz çalışma alanı doğrulandı; uzak CI bu oturumda API'den yeniden sorgulanmadı. Yeni yetki yalnız ana sayfa + örnek verili mobil öncelikli sonuç ve TR/EN'dir. Repo seçimi, tüm durumlar ve A1'in bütünü tamamlanmış sayılmaz.

Etkilenen dosyalar: AGENTS.md, STATUS.md, TASKS.md, README.md.

### D013 — Aynı URL'de TR/EN ve küçük bileşen yapısı

next-intl 4.14.9, request config + locale cookie + Server Action ile kullanıldı. Dil değişimi mevcut sayfada kalır; tüm metinler iki mesaj dosyasından gelir. Bu aşama server-render edilen iki sayfa olduğu için client state/provider veya locale route segmenti eklenmedi. Lucide 1.62.0 yalnız kullanılan ikonlar için eklendi. Native details/summary, ek accordion bağımlılığı gerektirmeden kanıt ve kategori açılımlarını sağlar.

Etkilenen dosyalar: next.config.ts, package.json, package-lock.json, src/i18n/*, src/messages/*, src/components/*, src/app/layout.tsx, ARCHITECTURE.md.

### D014 — Dürüst demo ve 77,5 puan

Sabit kurmaca profil mira-sample ve iki kurmaca repo seçildi. Gerçek kaynak URL'si, fetch veya analiz motoru yoktur. Demo giriş alanından etkilenmez. Fixture 15/20 profil + 22,5/30 projeler + 40/50 README = 77,5; Gizli Cevher koşulları sağlanır. Her check ve bulgu örnek gerekçe/alan gösterir; gerçek GitHub kanıtı olduğu iddia edilmez. Paylaşım ve yeniden analiz açıkça pasiftir. Görev sırası yalnız bu örneğin sabit içeriğidir.

Etkilenen dosyalar: src/features/analysis/demo.ts, src/app/page.tsx, src/app/demo/page.tsx, src/messages/*, SCORING.md.

### D015 — Referans kimliği ve erişilebilir mavi eylem

Marka #4169FF korunur. Beyaz metinle 4,5:1 gereksinimini karşılamak için dolu eylemde #3C63F0 (4,96:1) kullanıldı. Bu bir tema değişikliği değildir; referans kimliği içinde okunabilir eylem rengi ayrımıdır. Mint #72E5BF yalnız ilk görev ve focus için kullanılır. Native accordion semantiği ve CSS odak halkaları uygulandı; tarayıcı aracı olmadığından görsel/klavye/taşma doğrulaması kullanıcı incelemesine açık bırakılır.

Etkilenen dosyalar: src/app/globals.css, DESIGN.md, STATUS.md, TASKS.md.

### D016 — A1.1 görsel kabul öncesi düzeltme — 28 Ekim 2026

Kullanıcı ilk görünümü kabul etmedi. Boşluklar küçültüldü; pazarlama paneli yerine fixture tabanlı gerçek sonuç önizlemesi, demoda birleşik sonuç kartı kullanıldı. İki kullanım somut olarak aynı kimlik/puanı gösterdiği için tek ResultSummary sunum bileşeni paylaşıldı. Veri katmanı veya yeni soyut altyapı eklenmedi. Metinler iki dilde sadeleşti; teknik alan ve gerekçeler açılımlarda korunur. Fixture, puanlama ve backend kapsamı değişmedi.

Özel browser aracı sunulmasa da mevcut Chrome ile ayrı eklentisiz profilde yerel doğrulama yapılabildi. Hydration farkı, uygulama dışı data-yd nitelikleriyle kontrollü olarak yeniden üretildi; temiz profilde yok. Belirli eklenti adı tespit edilmedi; uyarı gizlenmedi. Görsel kabul kullanıcıdan bekleniyor.

Etkilenen dosyalar: src/app/page.tsx, src/app/demo/page.tsx, src/app/globals.css, src/components/result-summary.tsx, src/messages/tr.json, src/messages/en.json, docs/DESIGN.md, docs/TASKS.md, docs/STATUS.md.

### D017 — A1 kalan arayüz yetkisi ve sınırlı istemci state'i — 28 Ekim 2026

Kullanıcı a78abde commit'ini gönderdiğini, uzak CI başarısını ve önceki ana sayfa/demo görsel kabulünü bildirdi. Yerel HEAD/temiz çalışma alanı doğrulandı. Yeni yetki yalnız `/demo/select` ve `/demo/states` prototipleridir; A2 yetkisi yok.

Seçimler sayıyla değil kimlik dizisiyle React state'te tutulur. Sayfa kapsamlı next-intl provider yalnız gerekli mesajları sağlar; dil değişimi aynı bileşen state'ini korur. Bu ihtiyaç iki küçük Client Component gerektirir; global store, workflow motoru, kalıcılık veya bağımlılık eklenmez. Devam, gerçek işlevini anlatan bir adla yalnız durum örneklerine gider; sabit 77,5 rapor seçim sonucu yapılmaz.

Altı durum elle seçilir. Gerçek retry/başarı, sahte süre/yüzde ve reset sayacı yoktur. Eksik veri 0 puana çevrilmez; toplam ve profil tipi gösterilmez. Yeni ekranlarda kullanıcı görsel kabulü ve native select menüsünün gerçek klavye incelemesi beklenir; A1 tamamlandı sayılmaz.

Etkilenen dosyalar: AGENTS.md, src/app/demo/select/page.tsx, src/app/demo/states/page.tsx, src/app/demo/page.tsx, src/features/analysis/{repo-picker,analysis-states,selection-demo,state-demo}, src/messages/*, src/app/globals.css ve ilgili proje belgeleri.

### D018 — A2.1 yetkisi ve güvenilir veri/hata sınırı — 28 Ekim 2026

Kullanıcı 3912059 commit/push ve GitHub Actions başarısını bildirdi; yerel HEAD ve temiz başlangıç doğrulandı. A1 kabul kriterlerinde açık tasarım maddesi kalmadı. Bu CI kaynağı kullanıcı bildirimidir; bu tur uzak API sorgulanmadı. Yeni yetki yalnız GitHub public veri katmanı ve deterministik testlerdir; arayüz entegrasyonu ve A2'nin bütünü tamamlanmış sayılmaz.

Server-only adapter, Zod giriş/dış yanıt doğrulaması ve tek işlemde paylaşılan REST/GraphQL bütçesi kullanıldı: 20 saniye toplam, 8 saniye/istek, 40 istek, 100 uygun aday, 1 MiB JSON ve sözleşmedeki 256 KiB README. Bu sınırlar eksik veriyi başarıya çevirmeden kaynak kullanımını kısıtlar; dağıtık limit veya cache yerine geçmez. Kör retry yoktur. Pinned verisi alınamazsa `unknown` korunur; rate-limit/auth gibi ortak erişim sorunlarında fallback yapılmaz. 100 adayda `limited` ihtiyatlıdır; daha fazla uygun repo kesin var iddiası değildir.

README yokluğu yalnız dosya 404'ü sonrasında repo metadata kimliği/public kapsamı/default branch tekrar doğrulanarak üretilir. Repo erişiminin kendisi 404 ise (profil reposu dahil) dosya yokluğu kanıtlanmış sayılmaz ve unknown kalır. Bu muhafazakâr sınır gerçek smoke testinde ayrıca incelenecek; puanlama kararı eklenmedi. GraphQL partial/error, auth, rate-limit, ağ, timeout ve büyük/kesilmiş içerik aynı yokluk sonucuna indirilmez. Kullanıcı girdisinden keyfi URL fetch veya README render yoktur.

Zod 4.6.7 ve server-only 0.0.1 runtime, Vitest 5.0.5 dev bağımlılığıdır; Node 22.13.0 korundu. Test config `.mjs` ESM yüklenir; package module tipi ve lint kuralları değiştirilmedi. Yalnız adapter davranışları için Node ortamı kullanılır; React Testing Library/Playwright/axe bu tur kurulmaz. `npm test` CI'a eklenir ve token/ağ gerektirmez. Token için public fine-grained read erişimi resmi kaynaklarla README'de açıklanır; gerçek env açılmaz ve gerçek hesap smoke sonucu iddia edilmez.

Etkilenen dosyalar: AGENTS.md, README.md, .env.example, package.json/package-lock.json, .github/workflows/ci.yml, vitest.config.mjs, src/lib/github/*, tests/*, docs/ARCHITECTURE.md, docs/STATUS.md, docs/TASKS.md. Resmi kaynaklar ARCHITECTURE ve README'dedir.

### D019 — Profil README kapsamı ve kaynak başına limit düzeltmesi — 28 Ekim 2026

Kullanıcı kaynak incelemesi sonrasında D018'in profil reposu yokluğunu sürekli unknown yapan yaklaşımının düzeltilmesini istedi. D018'deki profil kapsamı ve tüm API'leri durduran tek limit yaklaşımı bu kayıtla değiştirilir; puanlama sözleşmesi değişmez.

Profil için proje eligible filtresi/genel README araması kaldırıldı. Hatasız GraphQL nullable repo/kök object bilgisi public görünürlüğün bilinen yokluğunu missing olarak ayırır; errors/partial veya REST 404 bunu kanıtlamaz ve unknown kalır. Public aynı adlı repoda arşiv/fork bağımsız kök README.md, sabit commit ve Blob SHA ile okunur. Boş dosya bulunmuş veridir; gerçek profil gösterimi onaylanmış sayılmaz. Private içerik istenmez. Yalnız ortak dosya decode kodu paylaşılır; yeni servis katmanı/bağımlılık eklenmez.

REST/core ve GraphQL primary limitleri ayrıldı. Secondary/kaynağı belirsiz kısıt ortak kalır; başka API üzerinden aşılmaz. GraphQL HTTP 200 RATE_LIMITED sonraki çağrıları etkiler. Eksik header önceki primary bilgiyi silmez; gerçek reset geçince eski blok kaldırılır. Süre uydurulmaz; tek işlem için 20 saniye/40 istek korunur. Client global singleton değildir. Güncel kaynaklar ve ayrıntılar ARCHITECTURE/README'dedir. Gerçek GitHub smoke testi yapılmadı.

Etkilenen dosyalar: src/lib/github/{client,schemas,errors,transport}.ts, tests/github/{client.test,fixtures,profile-readme.test,rate-limit.test}.ts, README.md, docs/{ARCHITECTURE,STATUS,TASKS,DECISIONS}.md. Arayüz, fixture puanı, bağımlılıklar ve CI bu düzeltmede değiştirilmedi.

### D020 — A2.2 Server Action ve sayfada geçici seçim — 28 Ekim 2026

590f4c7 commit/push ve uzak CI başarısı kullanıcı tarafından bildirildi; yerel HEAD/temiz başlangıç doğrulandı. Kullanıcı yalnız gerçek profil/repo seçimine yetki verdi; puanlama/sonuç veya yayın yoktur.

Aynı iş için tek Server Action seçildi; ek Route Handler/store/cache gerekmedi. Aynı sayfadaki client state, locale re-render'ında yeni GitHub çağrısı olmadan seçimleri korur. İstek kimliği eski yanıtı reddeder; input değişimi/eski sonuç temizliği başka hesabın seçimlerini karıştırmaz. Sunucu bütçesi her yeni işlemde client kurularak başlar, kullanıcı seçimine yayılmaz. Dış avatar fetch yerine monogram ve yalnız gerekli DTO alanları seçildi. Ortak RepoPicker ve StatePanel gerçek/demoda aynı tasarımı taşır; fixture, skor ve gerçek veri ayrı kalır.

Zod istemci/sunucu doğrulaması, 256 UTF-8 byte ham girdi ve 8 KiB framework body sınırı eklendi; bunlar dağıtık abuse koruması değildir. Pinned alt isteği timeout olursa aynı client'ın kalan bütçesinde aday erişimine izin verilir; timeout'u bütçe sıfırlamak için yeni client ile aşmak yoktur. Bu, önceki D018/D019 notlarındaki tüm timeout'ları fallback dışında tutan ayrımı daraltır: ortak deadline hâlâ kesin sınırdır. Bu davranış mock saat/fetch ile test edildi. State ve byte sınırları metadata getirme içindir; yeni bağımlılık/puanlama/README analizi veya public deployment eklenmedi.

Etkilenen dosyalar: AGENTS.md, README.md, next.config.ts, src/app/{page.tsx,globals.css,demo/select/page.tsx}, src/features/analysis/{actions,selection,profile-search,repo-picker,analysis-states}, src/lib/github/client.ts, src/messages/{tr,en}.json, tests/github/actions.test.ts, docs/{ARCHITECTURE,DESIGN,STATUS,TASKS,DECISIONS}.md.

### D021 — A / Developer ID tasarım yönü — 28 Ekim 2026

Kullanıcı **A / Developer ID** yönünü seçti. Gerekçe: kullanıcının açık tasarım tercihi; bu kayıt tasarımı şimdi uygulama yetkisi değildir.

- Yeni tasarım mevcut çalışan gerçek profil ve repo seçimi veri akışını koruyacak.
- Konsept görselindeki kategori isimleri ve puanlar ürün kuralı değildir.
- SCORING.md'deki puanlama sözleşmesi değişmeyecek; görsel değerlerden yeni kural/ağırlık türetilmeyecek.
- Tasarım uygulaması ayrı bir aşamada yapılacak; henüz başlamadı.
- Mevcut A2.2 akışına kullanıcı kabulü verildi; bu kabul yeni tasarımın uygulanmış olduğu anlamına gelmez.

Bu tur yalnız karar ve STATUS/TASKS kabul kayıtları güncellendi. Uygulama kodu, mevcut tasarım, kaynak referans ve puanlama değiştirilmedi; sonraki aşamaya geçilmedi.

Etkilenen dosyalar: docs/DECISIONS.md, docs/STATUS.md, docs/TASKS.md. Gelecekteki tasarım uygulamasının dosya kapsamı bu kayıtla yetkilendirilmez.

### D022 — Developer ID ilk uygulama yetkisi, yerel font ve CSS hareket — 28 Ekim 2026

Kullanıcı c3aa1fe A2.2 commit/push ve uzak CI başarısını bildirdi; yerel HEAD doğrulandı. Başlangıçtaki tek ek dosya beklenen docs/design/developer-id-concept.png idi; görsel açılıp incelendi ve korunuyor. D021'de seçilen yön bu yeni kullanıcı yetkisiyle yalnız ana sayfa ve ortak /demo kimlik kartında uygulanmaya başlandı. Eski reference.png silinmez; görsel yön bu dilimde yeni referansa, davranış ve puanlama mevcut sözleşmelere bağlıdır. Yeni tasarımın kullanıcı kabulü henüz verilmedi.

ResultSummary sunucu bileşeni aynı fixture ve config'ten iki görünümü üretir: hero açılı/askılı, demo düz. Kategori/puanlar aynen korunur. Mühür yalnız profil tipi, onay değildir. Gerçek skor, sahte seri/meslek/başarı veya paylaşım PNG'si eklenmez. Mevcut gerçek arama/seçim kodu ve backend sözleşmeleri değiştirilmez.

Barlow Condensed 800 / Manrope variable / IBM Plex Mono yerel dosya + SIL OFL lisanslarıyla seçildi; Türkçe glyph doğrulaması yapıldı. Runtime font servisi bağımlılığı ve hareket paketi eklenmez. CSS girişleri tek iterasyon ve transform/opacity ile sınırlıdır; reduced-motion tüm hareketi kaldırır. Native details/summary korunur; yükseklik animasyonu için kırılgan bir alternatif eklenmez. Önemli renk/tipografi/hareket sınırları DESIGN'dadır.

Etkilenen dosyalar: AGENTS.md, README.md, src/app/{globals.css,layout.tsx,fonts/*}, src/components/result-summary.tsx, src/messages/{tr,en}.json, docs/{DESIGN,DECISIONS,STATUS,TASKS}.md. Commit'e kullanıcı eklemesi docs/design/developer-id-concept.png de dahil edilebilir; orijinal görsel değiştirilmedi. A3 veya public yayına geçiş yoktur.


### D023 — A3 saf motor, AST sınırları ve deterministik öneriler — 28 Ekim 2026

Kullanıcı Developer ID 7025b91 commit/push ve GitHub Actions başarısını bildirdi; temiz yerel başlangıç ve HEAD doğrulandı. Bu uzak CI kaydı kullanıcı bildirimidir. Yeni yetki yalnız saf puanlama motorudur; çalışan UI/Server Action, adapter, fixture, MongoDB/paylaşım ve yayın kapsamı değişmez. Developer ID için önceki kullanıcı görsel/hareket kabulü korunur.

Motor üç dosyada tipler/Markdown/hesaplama olarak ayrıldı. unified 11.0.5 ve remark-parse 11.0.0 dışında doğrudan bağımlılık eklenmedi; paketler npm/lockfile ile tam sürüme kilitlendi. AST tespiti başlık, bölüm, paragraf, liste, kod ve referans link/görsel üzerinden yürür; HTML çalıştırılmaz/render edilmez ve dış siteler çağrılmaz. Sınırlı alias ve yapısal içerik eşikleri SCORING'e yazıldı. Homepage alanı açık proje sitesi sinyalidir; README'deki sıradan bağlantı ise demo etiketi/bölümü gerektirir. Bu bir çalışırlık/doğruluk garantisi değildir.

Ağırlıklar 20/30/50, repo ortalaması, kategori yuvarlama/toplam ve profil tipi öncelikleri korunur. Profil sunumu fail koşulu üç profil check'inden herhangi birinin fail olmasıdır. not_applicable 1.0.0'da üretilmez; gelecekte kullanımı/aritmetiği ayrı açık karardır. Eksik kategori/tam puan numeric başarıya çevrilmez; unknown toplam/tip null olur. Scope/sürüm hataları puan üretmeden reddedilir.

Görevler yalnız doğrulanmış fail'den, gerçek max/N etkisiyle en çok üç olarak sıralanır. Eşitlikte SCORING kontrol sırası, sonra sabit GitHub ID kullanılır. README yok/boş durumundaki aynı köke bağlı bölüm/görsel görevleri yığılmaz; metadata/homepage üzerinden düzeltilebilen eksikler bağımsız kalır. Mesajlar TR/EN Scoring alanında, hesaplamadan ayrıdır. Bilinen kategori yuvarlama farkı categoryImpact'te; eksik kategoride null'dır.

UI fixture gerçek README içermediğinden ayrı sentetik içerik aynı 23 kontrol durumunu üretir ve 77,5'i doğrular. Fixture'ın editoryal görev sırası değiştirilmez; gerçek motor eşit etkide website → demo → install önerir. Bu fark aritmetiğe veya ürün ağırlıklarına müdahale gerekçesi değildir. Kaynak linkinde branch kullanılır; adapter'ın Blob SHA'sı commit SHA diye sunulmaz. Tespit sınırları ileride değişirse sürüm/karşılaştırma etkisi yeniden değerlendirilmelidir.

Etkilenen dosyalar: AGENTS.md, README.md, package.json/package-lock.json, src/features/analysis/scoring/{types,markdown,engine}.ts, src/messages/{tr,en}.json, tests/scoring/{fixtures,engine.test,markdown.test,messages.test}.ts, docs/{SCORING,ARCHITECTURE,DECISIONS,STATUS,TASKS}.md. Gerçek sonuç arayüz bağlantısı hâlâ açıktır; sonraki işe kullanıcı mesajı olmadan geçilmez.


### D024 — Genel başlıklar, numaralandırma ve ölçülü bulgu dili — 28 Ekim 2026

Kullanıcı canlı smoke'taki yanlış negatiflerin A3 arayüz bağlantısından önce dar kapsamda düzeltilmesine açık yetki verdi. HEAD hâlâ 7025b91; A3 motoru henüz commitlenmedi. Bu revizyon ayrı belge teslimi değil, aynı A3 motor paketinin parçasıdır. Önceki D023'teki sınırlı tespit listesi bu kayıtla genişletilir; ürün ağırlıkları, kapsam, kategori aritmetiği ve profil tipi öncelikleri değişmez.

Proje Özeti / Proje Amacı ve Project summary/purpose/overview gibi genel başlıklar desteklenir. Numaralandırma yalnız başlığın başında, nokta/parantez ve boşlukla ayrılan 1–2 haneli sayısal gruplarda ayıklanır. Backend/frontend kurulum ve uygulamayı çalıştır başlıkları sınırlı tam alias listesine eklenir; keyfi substring eşleştirmesi yoktur. Başlık derinliği/sibling sınırı değişmez; her sinyal kendi tanınan bölümünden kanıt alır. Regresyonlar yanlış komşu bölümden pass üretilmediğini de doğrular.

Genel soru listesi Bu proje neden var / Ne problemi çözüyor / Why this project / What problem does it solve ile sınırlıdır; kendi bölümünde açıklayıcı paragraf gerekir. Proje adına özel alias veya `<X> Neden Var?` gibi nesnesi belirsiz genel bir kalıp kurulmadı. Gerçek Fixora purpose check'i başka bir tanınan genel başlık olan Ne Problemi Çözüyor bölümünden geçer; Fixora Neden Var? başlığına ayrıcalık tanınmaz.

Yapısal fail, kesin içerik yokluğu olarak anlatılmaz. Scoring.evidence içindeki fail metinleri eşleşme kurulamamasını/başka bölüm olasılığını, görevler içeriği eklemeyi veya uygun başlık altında düzenlemeyi anlatır. Doğrulanmış yokluk ve bilinen boş dosya readme.missing/readme.empty ortak kanıt mesajlarıyla ayrılır. Unknown yine erişilemeyen/belirsiz veri, null kategori/toplam ve normal tip üretmeme anlamını korur. Yeni puan durumu veya yapay pass eklenmez.

Henüz yayımlanmamış/commitlenmemiş 1.0.0 motoru tamamlanır; önce/sonra motor karşılaştırması profil gelişimi/snapshot iyileşmesi değildir. Aynı canlı veri üzerinde eski motor 73,3, yeni motor 90 üretmiştir: 3 purpose + 1 install + 1 usage tespit düzeltmesi. SHA'lar önceki smoke ile aynı; repo içerikleri değiştirilmedi. Jobfit usage hâlâ fail'dir; Kurulum içindeki komut Kullanım bölümüne taşınmaz. Bu kalıcı sınır yeni kanıt/görev dilinde ölçülü anlatılır.

Yeni bağımlılık, AI/ağ tabanlı içerik analizi, UI/adapter değişikliği veya backend genişlemesi yoktur. Geçici gerçek smoke çalıştırıcısı kaldırılır; normal test/CI gerçek ağa bağlanmaz. Detaylı kontrol ve kaynak kanıtları STATUS'ta, tam alias/numara sınırları SCORING'dedir.

Etkilenen dosyalar: src/features/analysis/scoring/{markdown,engine}.ts, src/messages/{tr,en}.json, tests/scoring/{markdown,messages}.test.ts, docs/{SCORING,DECISIONS,STATUS,TASKS}.md. A3 arayüz bağlantısı için yetki yoktur; stage/commit/push/yayın yapılmaz.


### D025 — Gerçek analiz action'ı ve sayfada geçici Developer ID sonucu — 28 Ekim 2026

Kullanıcı ee7328e motor commit'i için uzak CI başarısını kullanıcı tarafından sağlanan ekran görüntüsü doğrulaması olarak bildirdi. Yerel HEAD/temiz başlangıç doğrulandı; uzak CI bağımsız sorgulanmadı. Yeni yetki yalnız gerçek analiz/sonuç arayüzüdür; motor sözleşmesi, demo fixture, sonraki depolama/paylaşım/yayın kapsamı değişmez. Yeni arayüz için kullanıcı görsel kabulü açık kalır.

Mevcut actions.ts'ye analiz için tek analyze Server Action eklendi; ayrıca Route Handler oluşturulmadı. Girdi yalnız username/profileId ve 1–3 repo id/name'dir. Strict schema, raw username <=256 UTF-8 byte, payload <=2 KiB, mevcut Next body <=8 KiB ve tekillik sınırları kullanılır. Profil ve repo kimliği/sahiplik/public kapsamı yeniden alınır; client metadata/puan/gerekçe gönderemez. Her analyze işlemi yeni GitHubClient kurar; kendi çağrıları ortak 20 saniye/40 istek bütçesini paylaşır. checkedAt sunucudan, rulesVersion motordan gelir.

Report DTO'su puanlama sonucunu serileştirilebilir public alanlarla sunar; tam README, excerpt, adapter hata nesnesi/kodu, avatar ve token aktarılmaz. GitHub kaynak URL/path/satır/Blob SHA ve yerelleştirme anahtarları yeterlidir. Unknown/incomplete motor tarafından aynen korunur; safe action hata kodu veya eksik sonuç demo fallback'e dönüşmez.

ProfileSearch aramayı, LiveAnalysis analiz pending/response/requestId'sini, RepoPicker seçim ID'lerini tutar. Seçim mounted/hidden kaldığından sonuçtan dönüş ve locale refresh state'i korur. Genel store/workflow veya yeni bağımlılık gerekmedi. Ref guard aynı pending işlemi tekrar göndermez; seçim ekranına dönüş/unmount eski yanıtı geçersiz kılar. Gerçek sunucu isteğinin iptal edildiği iddia edilmez. Sonuç aynı sayfadadır ve tam yenilemede kaybolur; URL'si saklanabilir kalıcı rapor değildir.

IdentityCard, önceki demo wrapper'ı ResultSummary ile gerçek LiveReport'ta ortak basılı kimlik sunumudur. Demo MS, 77,5, kategori ve editoryal metni korunur. Canlı sonuç kartı ve detayları yalnız motor verisini sunar; arayüz puan/ortalama/öneri sırası hesaplamaz. Eksik toplam çizgi/hesaplanmadı, tip ve mühür yok; bilinen kategori/check'ler korunur. Native details/checkbox/focus, uzun metin sarma ve reduced-motion korunur; paylaşım/indirme eylemi eklenmez.

Mevcut Vitest ve React server renderer ile server action/DTO ve complete/incomplete sunum testleri eklendi; yeni test aracı/dependency yoktur. Yerel Chrome/CDP incelemesi CI'a canlı GitHub gereksinimi eklemez. Teknik sonuçlar STATUS'ta; yeni görsel kabul ve commit/push sonrası yeni CI açık. A4'e veya yayına geçiş yoktur.

Etkilenen dosyalar: AGENTS.md, README.md; src/app/{page.tsx,globals.css}; src/components/{identity-card,result-summary}.tsx; src/features/analysis/{actions.ts,profile-search.tsx,repo-picker.tsx,live-analysis.tsx,live-report.tsx,report.ts}; src/messages/{tr,en}.json; tests/github/analysis.test.ts, tests/analysis/report.test.tsx, vitest.config.mjs (TSX test keşfi); docs/{ARCHITECTURE,DESIGN,DECISIONS,STATUS,TASKS}.md.


### D026 — Sticky ortak header ve CSS sonuç girişinin yaşam süresi — 28 Ekim 2026

Kullanıcı, commitlenmemiş A3 paketini koruyarak yalnız ortak sticky header ve gerçek sonuç girişine yetki verdi. Header body altında kalır; opak tam genişlikli sticky yüzey + mevcut shell iç hizası seçildi. Kısa mobil/yüksek masaüstü header tokenı, root scroll-padding ve küçük hedef margin'iyle focus/hash/programatik scroll payı sağlanır. Fixed çözümü, scroll listener veya hareket paketi gerekmedi.

Ölçümde seçim başarı efektinin parent/child tekrarına ek olarak geliştirme Strict Mode tekrarı görüldü. Parent yalnız arama hatasını odaklar; LiveAnalysis son başlık DOM referansıyla aynı focus/scroll'u tekrar etmez. preventScroll + tek açık scroll çağrısı kullanılır; bu, kullanıcı veri/istek akışını değiştirmez.

Giriş, mevcut LiveReport mount yaşam süresine ve yalnız onun CSS selector'larına bağlıdır. Yeni cevapta mount, locale/accordion/re-render'da aynı DOM davranışı tarayıcıda doğrulandı. Mevcut card-in/detail-in keyframe'leri tekrar kullanılır; yalnız kategori scaleX keyframe'i eklendi. Kart 520ms, çubuk 80+600ms, gövde 140+420ms; başlangıç metin/puan gerçek ve okunur, animasyon bitişi beklenmez. Reduced-motion bütün hareket/gecikmeyi kaldırır. Null kategoride doluluk düğümü oluşturulmama sözleşmesi değişmedi.

Motor/adapter/action/puanlama/öneri sırası/demo fixture/metinler/dependency ve kalıcılık kapsamı korunur. Revizyon aynı A3 commit paketine dahildir; yeni kullanıcı görsel kabulü/CI beklenir. Etkilenen dosyalar: src/components/site-header.tsx, src/app/globals.css, src/features/analysis/{profile-search,live-analysis}.tsx, docs/{DESIGN,DECISIONS,STATUS,TASKS}.md. Stage/commit/push/yayın veya A4 geçişi yoktur.

### D027 — A3 kapanışı ve A4.1 sunucuda snapshot sınırı — 29 Ekim 2026

Kullanıcı mevcut A3 görünümünü kabul ettiğini, 5ad54fb commit/push ve uzak CI başarısının kullanıcı ekran görüntüsüyle doğrulandığını bildirdi. Başlangıçta HEAD 5ad54fb ve temiz çalışma alanı/index doğrulandı; uzak CI bağımsız sorgulanmadı. Kaynak §11 A3 teknik kriterleri önceki motor/test/gerçek sonuç kontrolleriyle karşılandığından kullanıcı/commit kapıları kapanır. Eksik canlı analiz hata durumlarının önceki görsel test sınırı tarihsel kayıtta kalır; yeni bir canlı hata smoke'u yapılmış sayılmaz.

Yeni yetki mevcut planın A4 Depolama/karşılaştırma aşamasının yalnız **A4.1 snapshot modeli ve sunucu create/read** dilimidir. MongoDB native driver 7.7.0 stabil npm sürümü/Node >=20.19 gereksinimi resmi metadata ile, Node 22 desteği resmi uyumluluk tablosuyla doğrulandı. Yeni major araç değişikliği/ODM yoktur; paket/lock tam sürüme kilitlenir. Mevcut analiz action'ı, motor, GitHub adapter, UI/animasyon ve sabit demo değişmez.

Sözleşme zaten 30 gün snapshot TTL, immutable sonuç ve tahmin edilemeyen read token tanımlar; bunlar yeni varsayım değildir. Ayrıntısı tanımlanmayan biçim için en küçük seçim: snapshotVersion=1, ayrı rulesVersion=1.0.0, UUID _id ve bağımsız 256-bit random token; DB yalnız token SHA-256'sını tutar. Token/salt kimlik erişimi ayrılır, public endpoint açılmaz. Varsayılan Mongo test DB'sine sessiz yazmamak için boş MONGODB_DB adı eklenir; gerçek değer kullanıcı tarafından daha sonra girilir.

Saklanan veri mevcut güvenli Report DTO'sudur; profil/login/fetchedAt eşlemeleri report.profile ve report.checkedAt içinde, repo seti/check scope'larından türetilmiş selectedRepoIds/scopeHash üsttedir. Hazır çeviri/ham README/alıntı/API/secret saklanmaz. Strict oluşturma ve okuma doğrulaması; snapshot/kural sürümleri ayrı, null/unknown ve görev sırası aynen korunur. Mevcut toplam tutarlılığı doğrulanır, motor yeniden çağrılmaz. Complete ve incomplete saklanabilir; incomplete karşılaştırılabilir tam sonuç yapılmaz. Gelecekte biçim/mesaj/sürüm değişimi açık migration kararı gerektirir.

Driver varsayılan undefined→null BSON yazımı, optional evidence alanlarını bozmamalıdır: insertOne için ignoreUndefined:true seçildi. Bilinçli unknown/null puanlar bundan etkilenmez. Gerçek BSON codec ile ağsız round-trip regresyonları bu ayrımı doğrular; gerçek DB entegrasyon iddiası değildir.

TTL createdAt+30 gün olarak somutlaştırıldı; veri alınma zamanı ayrı korunur. expiresAt tek alan TTL indeksi ve _id unique indeksi yeterlidir; kapsam/kullanıcı/cache indeksleri bu sorgular için gerekmiyor. TTL gecikmesine karşı süre okuma sırasında da kontrol edilir. Gerçek DB çağrısı ilk kullanıma ertelenir; process/HMR havuzu yeniden kullanılır, başarısız bağlantı cache'i temizlenir. Ham DB hataları güvenli kodlara eşlenir. Kör retry veya uygulama içi silme döngüsü eklenmez.

Gerçek MongoDB hesabı/secret oluşturulmadı, env içeriği açılmadı; gerçek bağlantı/yetki/BSON/TTL kontrolü açık. Mock testler bunu doğrulamış sayılmaz. Action bağlantısı, rapor sayfası/kalıcı URL, cache, karşılaştırma, dağıtık throttle/lock, paylaşım/PNG ve yayın bu tur dışındadır. A4 bütünü tamamlanmaz.

Etkilenen dosyalar: src/lib/db/{client,errors,snapshot-schema,snapshots}.ts, tests/db/{fixtures,schema.test,snapshots.test,client.test}.ts, package.json/package-lock.json, .env.example, README.md, AGENTS.md, docs/{PRODUCT,ARCHITECTURE,DECISIONS,STATUS,TASKS}.md.

### D028 — A4.2 sunucu rapor kaydı ve fragment ile snapshot erişimi — 29 Ekim 2026

Kullanıcı f81b46c uzak CI başarısını ekran görüntüsüyle doğruladı; temiz HEAD ve A4.1'in önceki yerel/Atlas kanıtlarıyla kapanışı kaydedildi. Bu tur yalnız gerçek raporu kayda/yenilenebilir adrese bağlar; A4 cache/karşılaştırma/dağıtık limit veya A5 sosyal paylaşımı değildir.

Tokenın Next erişim loguna/metadata'ya gitmesini önlemek için `/reports/[id]#token=…` seçildi; path/query tokenı kullanılmaz. Fragment tarayıcıda çözülür; mevcut readSnapshot'a giden tek loadReport Server Action'ı sunucuda doğrular. GET yalnız genel SSR kabuğudur, JavaScript gerekir. Hash istemciye aktarılmaz. Force-dynamic + no-store/no-referrer/noindex başlıkları ve genel metadata uygulanır; token içeren body/URL logu eklenmez. Tarayıcı/copy eylemi capability'yi taşır; linki bilenlerin erişimi kısa notla açıklanır. Süre mevcut 30 gündür; ayrı public shareReports veya süresiz bağlantı oluşturulmaz.

Analyze yalnız kendi GitHub/motor çıktısını createSnapshot'a verir. Kayıt hatasında güvenli failed durumu ve hesaplanmış rapor korunur. Tekrar deneme client raporunu yüklemez; güncel veriyi yeniden alıp yeni immutable kayıt üretir. Tek geçici client raporu ve bounded okuma promise'i yeterlidir; server session cache, imza sistemi veya yeni workflow katmanı kurulmadı. Gerçek DB hatası missing olarak sunulmaz; erişim yokluğu ise varlık bilgisi sızdırmayan ortak ekran kullanır.

Mevcut LiveReport/IdentityCard, locale ve hareket/focus yaklaşımı korunur; stored modu yalnız geçici notu kaldırır. Yeni action/rota testleri secretsızdır. Yerel production sunucusundaki GitHub sayacı gerçek fetch'e delege eden geçici ölçümdür, mock/fallback değildir; CI'a eklenmez. Test/env hata enjeksiyonu yalnız ayrı test process'inde yapılır; kullanıcı env dosyasına veya dev sunucusuna dokunulmaz. Kullanıcı görsel kabulü ve yeni commit sonrası uzak CI açık kalır.

Etkilenen dosyalar: next.config.ts; src/app/{page.tsx,globals.css,reports/[id]/page.tsx}; src/features/analysis/{actions,report,live-analysis,live-report}; src/features/reports/{actions,link,report-access,copy-link}; src/messages/{tr,en}.json; tests/github/analysis.test.ts, tests/analysis/{report.test.tsx,saved-report.test.ts}; AGENTS.md, README.md, docs/{PRODUCT,ARCHITECTURE,DESIGN,DECISIONS,STATUS,TASKS}.md. Motor/adapter/DB şeması/demo/package/lock değişmez.


### D029 — A5.1 iki formatlı PNG ve erişim kontrollü preview — 29 Ekim 2026

Kullanıcı A4.2 257acff9b8a86d62db5a8beda94f0bf68f42d6b4 CI başarısını Codex public API doğrulamasıyla iletti ([run 40792217446](https://github.com/EnessCansever/github-vitrin/actions/runs/40792217446)). Bu kayıt kullanıcı tarafından sağlanan doğrulamadır; bu tur bağımsız CI sorgusu değildir. Önceki görsel/yerel kabul ile A4.2 kapanır, A4'ün cache/karşılaştırma/dağıtık limit bütünü açık kalır. Yeni açık yetki planın A5 Paylaşım aşamasının yalnız **A5.1 ilk kart, preview, iki PNG indirme** dilimidir.

Mevcut Next `next/og` ImageResponse, yerel statik TTF ve tam çözünürlükte PNG'yi yeni bağımlılık gerektirmeden sağlar. CSS sınırlılığına uygun iki ayrı flex/SVG kompozisyon seçildi; ekran görüntüsü ölçekleme veya client canvas/font yükleme yarışları kullanılmaz. Kesintisiz uzun adlarda Satori overflow-wrap kuralını uygulamadığı için yalnız login/repo alanlarında desteklenen word-break:break-all seçildi ve gerçek PNG ile doğrulandı. Statik Barlow/IBM Plex dosyaları mevcut lisanslarıyla yeterlidir; değişken Manrope için yeni font veya dönüştürücü gerekmez. [Resmi renderer](https://nextjs.org/docs/app/api-reference/functions/image-response), [font koşulları](https://github.com/vercel/satori#fonts).

Render yeni Server Action üzerinden mevcut snapshot erişimini her seferinde doğrular; token yalnız gövdededir. Client skor/raporu kabul edilmez, complete/null engeli sunucudadır. Preview ve download aynı PNG byte'larıdır. Base64 action yanıtı iki sınırlı kompozisyon için en küçük çözümdür; ayrı public dosya/OG endpointi, yeni saklama nesnesi veya imzalı URL gerektirmez. Rapor/motor/GitHub/süre değişmez. Format/dil istek kimliği eski yanıtı dışlar; native format ve download eylemleri ayrı pending/geri bildirim taşır. Download bildirimi tarayıcıya istek iletildiğini söyler; sosyal paylaşım veya fiziksel kaydetme iddia etmez.

Yatay 1200×630 bu dilimde yalnız indirilebilir görseldir. 1080×1350, gelişim/karşılaştırma kartı, otomatik OG, ayrı shareReports/sosyal API ve yayın yetkisi yoktur. Demo indirmesi eklenmez. Kullanıcı görsel kabulü ve yeni commit sonrası CI açık kalır.

Etkilenen dosyalar: src/features/cards/{types,content,image,actions,card-studio}; src/features/reports/report-access.tsx; src/app/{globals.css,reports/[id]/page.tsx}; src/messages/{tr,en}.json; tests/cards/{content,actions,image}.test.ts, tests/cards/studio.test.tsx; AGENTS.md, README.md, docs/{PRODUCT,ARCHITECTURE,DESIGN,DECISIONS,STATUS,TASKS}.md. Package/lock, motor/adapter/snapshot katmanı ve demo fixture değişmez.


### D030 — A5.1 paylaşım afişi ve statik Manrope — 29 Ekim 2026

Kullanıcı önceki krem PNG taslağına görsel kabul vermedi; bu tur yalnız paylaşım görsellerini Developer ID referansının sağ panelindeki **kobalt afiş** diline dönüştürmeyi yetkilendirdi. Referans gerçekten açıldı. Ana sayfa/raporun koyu arayüz + krem kimliği kabul edilmiş olarak kalır; D029'un PNG estetiği bu karar tarafından değiştirilir. Önceki commitlenmemiş A5.1 veri/erişim/preview/indirme işleri korunur.

Story ve yatay ayrı yerleşimlerdir. Dev krem Barlow başlık/puan, kısa lime sunum mührü, ince çizgiler ve sınırlı SVG yön işaretleri kullanılır. Gövde/öneriler Manrope, kimlik/metadata mono olur. İki dilli başlık satırları ve “GitHub vitrin puanı / GitHub portfolio score” ile kısa davet yalnız Card mesajlarına aittir; rapor metni, profil tipi hesaplaması/puanlar veya fixture değiştirilmez. Tarih/kapsam/ilk öneri/config imza korunur. Sabit SVG noktaları ve birkaç kenar izi doku sağlar; bitmap referans, Math.random/clock, barkod/seri numarası veya yeni bağımlılık kullanılmaz. Aynı girdiden PNG byte eşitliği mevcut renderer testine eklendi.

Mevcut Manrope-Variable.ttf, kurulu next/og font parser'ında **parseFvarAxis: Cannot read properties of undefined (reading '256')** verdi. Runtime/parser patch'i veya dönüştürücü eklemek yerine [etkin upstream'in sabit commit'indeki statik Manrope Medium](https://github.com/aaronbell/manrope/blob/468c0dbe38efa331b80bfe9448256abe27be44c3/fonts/ttf/manrope-medium.ttf) yerel font olarak eklendi. 144696 byte, SHA-256 502ee33a6e140ad6ef10ef8b762a8e5cf01f33316f318800795725f4cfd539d9. Upstream OFL metni mevcut manrope-OFL.txt ile whitespace hariç eşleşti; telif/lisans değiştirilmedi. Kaynak dosya değiştirilmeden yerel Manrope-Medium.ttf adıyla tutulur; UI değişken fontu korunur. Runtime'da font/GitHub servisi çağrısı yoktur; font edinimi bu turdaki tek public kaynak varlığı indirmesidir.

Erişim/token/expiry, incomplete, pending/çift istek/retry, PNG preview/download eşitliği korunur; action/CardStudio/DB/motor/adapter yeniden yazılmaz. GitHub kullanıcı verisi/Atlas akışı bu tur tekrarlanmaz; yeni OG/public paylaşım/yayın yetkisi yoktur. Yeni ve eski çıktı dizinleri ayrı tutulur. Teknik/yerel görsel doğrulama kullanıcı kabulü değildir; A5.1 kabulü ve yeni uzak CI açık kalır. Revizyon aynı commitlenmemiş A5.1 paketine dahildir.

Etkilenen dosyalar: src/features/cards/{image,content,types}.ts(x), src/messages/{tr,en}.json, src/app/fonts/{Manrope-Medium.ttf,README.md}, tests/cards/{content,actions,image}.test.ts, AGENTS.md, docs/{DESIGN,ARCHITECTURE,DECISIONS,STATUS,TASKS}.md.


### D031 — Story referans ölçümü ve yerel baskı malzemesi — 29 Ekim 2026

Kullanıcı A5.1'e görsel kabul verilmediğini açıkça belirtti. Önceki “kabul edilebilir / commit edilebilir” ajan değerlendirmesi kabul kaydı değildir. Bu tur yalnız Story kompozisyonu/dokusu düzeltilir; yatay revizyon Story kullanıcı kabulünden sonraya bırakılır. Önceki A5.1 işlev paketi commitlenmemiştir ve korunur.

Konseptin sağ 419×716 paneli ayrı inceleme kırpımıyla ölçüldü; marka, başlık, mühür, kimlik ve puan oranları DESIGN'a yazıldı. 1080×1920 Story'de 210px üst/244px alt güvenli alan korunur. Başlık Barlow gerçek advance ölçüsüyle iki/üç satıra oturur; tip kelimeleri/puan/sıra değişmez. Mühür yaklaşık %28 genişlik, kategori tek şerit, görev/hedef ayrı, imza/tarih iki satırdır. Başlığın sıkı büyük blok olması ve destekleyici alanın sadeleşmesi referansın afiş hiyerarşisini izler.

Story'deki eşit SVG noktaları yerine, yalnız tasarım sırasında imagegen ile üretilmiş yazısız gri kâğıt malzemesi yerelleştirildi. JPEG 461800 byte; köken/SHA assets/README.md içinde. Mevcut Sharp yalnız geçici varlık kodlama/inceleme aracı olarak kullanıldı; yeni bağımlılık veya uygulama Sharp import'u yoktur. Sabit SVG renk/alpha maskesi lif/kenar/kıvrım ve hafif harf aşınması oluşturur. Runtime üretken araç, rastgelelik, harici kaynak veya referans görseli kopyası yoktur. JPEG lazy yüklenir; Satori'nin embedded image keşfi için Story saf element ağacı önceden açılır. İlgili PNG tekrarında byte eşitliği ve production dosya izi doğrulandı.

Aynı sentetik girdide yatay eski/güncel PNG byte eşittir; ortak yazı/renk/Stamp/Texture ve yatay kompozisyon değişmedi. Action/preview/token/expiry/incomplete/indirme davranışı, motor/adapter/snapshot/fixture, ana sayfa/rapor, mesajlar ve bağımlılıklar bu tur değiştirilmedi. Yeni Story PNG'leri ayrı /tmp klasöründe, önceki çıktılar korunuyor. Görsel kabul ve yeni uzak CI açık kalır; bir sonraki dilime geçilmez.

Etkilenen dosyalar: src/features/cards/image.tsx, src/features/cards/assets/{letterpress-paper.jpg,README.md}, AGENTS.md, docs/{DESIGN,ARCHITECTURE,DECISIONS,STATUS,TASKS}.md. Revizyon aynı commitlenmemiş A5.1 paketinin parçasıdır.


D031 ince ayarı — 29 Ekim 2026: Kullanıcı kompozisyon/başlık yönünü uygun buldu; tam görsel kabul vermedi. Yalnız Story mührünün açık metin ölçüleri/satır yüksekliği ve mevcut doku maskelerinin yoğunluğu düzenlendi. Yeni sistem/bağımlılık veya yerleşim değişikliği yoktur; yatay aynı kaldı. Önceki yerel story-long.png tam çözünürlükte kesilmeyi göstermediğinden birebir kök neden doğrulanmış sayılmaz; yeni çıktıların iki dil/dört tip mühürleri açılarak tam metin kontrol edildi. Etkilenen dosyalar: src/features/cards/image.tsx, docs/{DESIGN,STATUS,TASKS,DECISIONS}.md. Aynı commitlenmemiş A5.1 paketidir.


D031 uzun Story düzeltmesi — 29 Ekim 2026: Kullanıcı dokuyu/normal TR görünümünü uygun buldu; tam Story kabulü vermedi. Geçici Satori yerleşim ölçümü önceki uzun EN son başlık kutusunun mühür altına yaklaşık 7px girdiğini gösterdi; bu, PROFILE satırında gözlenen harf kaybının kesin kök nedeni olarak sunulmaz. Yerelde eski tam PNG'de harf kaybı ve footer bitişmesi birebir üretilemedi. Buna karşılık üç satırlı başlıklara 604px sol alan/300px sağ mühür ve en az 16px alt ayrımı verildi; mühür sonra çizilir. Uzun düzenin tarih/kapsamı 8px arayla ayrı satırlara alındı, font küçültülmedi. Yeni tam PNG'lerde yedi PROFILE harfi ve footer ayrımı görsel olarak kontrol edildi. Normal TR ve yatay önceki renderer ile byte eşit; doku sistemi/asset/maskeler, veri/indirme akışı değişmedi. Etkilenen dosyalar: src/features/cards/image.tsx, docs/{DESIGN,STATUS,TASKS,DECISIONS}.md. Aynı commitlenmemiş A5.1 paketi, görsel kabul açık.


### D032 — Ayrı yatay afiş ve Story çıktısının korunması — 31 Ekim 2026

Kullanıcı son uzun EN Story'de mühür metninin eksiksiz, başlıkla çakışmasız ve footer tarih/kapsam ayrımının doğru olduğunu bildirdi. Bu kullanıcı doğrulamasıdır; A5.1 genel görsel kabulü değildir. Güncel yetki yalnız yatay 1200×630 kartı mevcut Story seviyesine getirmektir; Story, ana sayfa/rapor ve işlevler korunur.

Yatayın eski nokta dokusu kaldırılıp aynı yerel JPEG/maskeler PrintTexture ile paylaşıldı; Story'nin boyut/maske varsayılanları aynı. Stamp'in eski yatay metin dalı kaldırıldı; iki format da mevcut Story'nin açık metin kutusunu kullanır. Yeni font/varlık/bağımlılık yoktur. Ayrı yatay kompozisyonda başlık 620px sol alanda, puan/mühür 476px sağ alandadır. Başlık ölçüsü yerel font advance ve aksan yüksekliğine bağlıdır; uzun tip ve Türkçe noktalar için tek örnek yaması veya clipping kullanılmaz. Puan ayrı 320px alanı, mühür 152px alanı kullanır. Footer çağrı/imza ve kapsam/tarih olarak ayrık iki satırdır; aradaki boşluklar DESIGN'dadır.

Aynı 16 sentetik girdide eski/yeni Story PNG byte eşitliği doğrulandı; motor, adapter, snapshot, puan/sıra, token/expiry/incomplete ve indirme akışı değişmedi. Yatay tam/390px PNG'ler açıldı; yeni teknik kontroller ve çıktılar STATUS'tadır. Yeni uzak CI, gerçek servis/indirme akışı veya fiziksel paylaşım bu tur doğrulanmış sayılmaz. Genel görsel kabul ve kullanıcı commit/push açık; aynı commitlenmemiş A5.1 paketidir.

Etkilenen dosyalar: src/features/cards/image.tsx, src/features/cards/assets/README.md, AGENTS.md, docs/{DESIGN,ARCHITECTURE,DECISIONS,STATUS,TASKS}.md.

### D033 — A5.1 kabulü ve ilk yayın kapsamının korunması — 31 Ekim 2026

Kullanıcı A5.1 Story/yatay görünümlerini kabul etti ve **0f3d6c5 — feat: add Developer ID share cards** commit/push bilgisini verdi. Tam SHA yerel HEAD ile **0f3d6c5570e7a6bdade0d3b44ac253102ca4c4d9** olarak doğrulandı. **GitHub Actions CI #11 başarısı kullanıcı ekran görüntüsüne dayanan doğrulamadır**; bu tur bağımsız uzak sorgu yapılmadı. Böylece yalnız iki formatlı ilk analiz kartı/önizleme/indirme diliminin kabul kapısı kapanır. Önceki ajan değerlendirmeleri kabul sayılmaz; fiziksel telefon veya sosyal platform başarısı çıkarılmaz.

Karar: Daha dar bir ilk yayın kullanıcı tarafından ayrıca onaylanmadığı için kaynak sözleşmenin v1 / A0–A6 kapsamı korunur. Kalan kapsam, kod kanıtı, yayın zorunluluğu ve önerilen bağımlılık sırası TASKS'ın tek tablosunda tutulur; yeni gereksinim veya uygulama yetkisi değildir. A4 önbellek/atomik throttle/kilit/uyumlu karşılaştırma, A5 üçüncü boyut/gelişim kartları/görsel cache/shareReports/SSR OG ve A6 kalite/yayın hazırlığı açık kalır. A7 pilot/anonim ölçümler ilk deploy sonrası v1 dağıtım işidir; BACKLOG'a veya v2'ye taşınmaz.

Gerekçe: Kabul edilen PNG ile otomatik OG aynı teslim değildir. Mevcut 30 günlük fragment tokenlı snapshot erişimi korunur; ayrı 90 günlük kullanıcı onaylı shareReports ve yönetim/silme kontrolü uygulanmadan public paylaşım tamamlandı denemez. OG botlarının fragment'e erişememesi private tokenı query/path'e taşıma yetkisi vermez. Aynı biçimde GitHub işleminin 20s sınırı/istemci çift tıklama koruması, toplam action süresi ve dağıtık abuse korumasının yerine geçmez. Kaynakta örnek verilen kotalar bu tur sabit üretim kararı yapılmadı; tanımlanmamış cihaz/OS matrisi veya sosyal entegrasyon eklenmedi.

Önerilen tek sonraki uygulama dilimi **A4 atomik throttle veri katmanı**dır (geçici öneri adı A4.3a): mevcut MongoDB native driver ile rateLimits atomik sayaç/expiry/TTL ve secretsız davranış testleri. Önce ortak veri davranışını doğrulamak, sonra güvenilir hosting/proxy kaynağı ve uçlara entegrasyonu ele almak için küçük bir sınırdır. Bu tur uygulanmadı/onaylanmış sonraki aşama sayılmadı; action/UI, session/IP üretimi, cache/kilit, paylaşım ve yayın eklenmez. Veri katmanı tek başına yayın için yeterli koruma değildir.

Yalnız durum/görev/karar belgeleri değişir. Önceki revizyonların kabul bekleme kayıtları tarihsel olarak korunur; güncel kabul STATUS/TASKS ve bu kayıttır. Tasarım/ürün/puanlama/stack/erişim sözleşmesi değişmedi. Uygulama değişmediği için rutin testler tekrarlanmadı; belge diff ve tutarlılık kontrolü yapıldı. Stage/commit/push/yayın yoktur.

Etkilenen dosyalar: docs/{STATUS,TASKS,DECISIONS}.md.

### D034 — A4.3a sabit pencereli atomik sayaç — 31 Ekim 2026

Kullanıcı D033'te önerilen MongoDB rateLimits veri katmanını açıkça yetkilendirdi. Temiz başlangıç HEAD 95c9881'dir; bu belge commit'i için yeni uzak CI bilgisi verilmedi. Önceki A5.1 kullanıcı kabulü/CI kaynağı korunur. Güncel AGENTS aşama sınırı bu yeni kullanıcı mesajına göre güncellendi.

Karar: Tek küçük server-only `consumeRateLimit` fonksiyonu, native driver/Zod ve mevcut lazy DB havuzuyla çalışır; yeni bağımlılık yoktur. Kota/windowMs çağırandan gelir; 10/10 dakika ve 60s örnekleri sabit ürün kararı yapılmadı. İlk kabulde başlayan sabit pencere, retlerde uzamayan expiry ve limitte kalan kabul sayacı seçildi. Key yalnız 64 küçük hex opak sunucu anahtarıdır; ham IP/kimlik türetme bu modülde yoktur. Aktif key/politika uyuşmazlığı invalid_limit; süre dolunca yeni politika uygulanabilir. Bu seçim, yanlışlıkla farklı config veren çağıranın aktif kotayı büyütmesini önler.

Gerekçe: Ayrı read/count/write yaklaşımı eşzamanlı isteklere fazla hak verebilir. Bunun yerine tek belge pipeline'ı Mongo $$NOW ile expiry ve kotayı değerlendirir; allowed son karar alanı ve count aynı atomik işlemde değişir, her çağrı kendi post-image'ını döndürür. Allowed alanı sonraki isteğe izin kaynağı olarak okunmaz. Unique _id oluşturma yarışını sınırlar; 11000 durumunda tek non-upsert kurtarma vardır. Ağ/timeout yazımının belirsizliği kör yeniden tüketimle büyütülmez; hata configuration/unavailable/invalid_record/invalid_limit olarak kalır. Majority write concern ve mevcut DB timeout'u korunur. TTL temizliği gecikse de expiry pipeline'da denetlenir; ek silme döngüsü yoktur.

36 secretsız mock test dönüş/validation/kurtarma/hata davranışını doğrular; Mongo atomikliği iddiası değildir. Ayrı gerçek Atlas smoke'ta yeni anahtarın 30 eşzamanlı çağrısında 10 kabul/20 ret, bir kullanım sonrası 30 çağrıda 9 kabul/21 ret ve count=10 gözlendi. Farklı key, politika uyuşmazlığı, hâlâ saklanan expired kaydın yenilenmesi, kısa gerçek pencere ve indeksler de doğrulandı. Yalnız dört geçici kayıt temizlendi/4 yokluk okuması geçti; çalıştırıcı/derlenmiş kopyalar kaldırıldı. Çoklu process/failover/ağ bölünmesi ve fiziksel TTL silinmesi doğrulanmış değildir.

Bu dilim hiçbir action/rapor/PNG akışına bağlanmaz. Session/IP/proxy güveni, requestLocks, cache, UI, toplam analiz bütçesi ve yayın açık kalır; bütün dağıtık koruma veya A4 tamamlandı denmez. Motor/adapter/snapshot/demo/arayüz/paketler değişmez. Yerel son kontrol sonuçları STATUS'tadır. Varsayılan Turbopack build yerel port açma ortam kısıtı nedeniyle iki denemede geçmedi; mevcut --webpack seçeneğiyle production build geçti. Bu yalnız doğrulama komutudur, paket/build script/config veya araç zinciri kararı değiştirilmedi. Varsayılan build/yeni CI açık; stage/commit/push/yayın yapılmaz.

Etkilenen dosyalar: src/lib/db/{rate-limits,errors}.ts, tests/db/rate-limits.test.ts, AGENTS.md, docs/{ARCHITECTURE,DECISIONS,STATUS,TASKS}.md.
