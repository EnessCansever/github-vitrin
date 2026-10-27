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
