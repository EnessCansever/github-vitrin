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
