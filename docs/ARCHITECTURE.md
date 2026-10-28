# Mimari ve operasyon

Kaynak: [GitHub Vitrin — Codex Proje Sözleşmesi v1](../RepoVitrin-Codex-Proje-Sozlesmesi.md), 26 Ekim 2026. Aşağıdaki gereksinimler hedef davranıştır; uygulandıkları anlamına gelmez.

## Teknik mimari
- Next.js App Router + React + TypeScript strict.
- Tailwind CSS; CSS variables tasarım tokenları; Radix tabanlı shadcn/ui yalnız gerekli erişilebilir temel bileşenler için; Lucide ikonları.
- Node.js runtime; Next.js Route Handlers backend. Ayrı Express servisi yok.
- MongoDB Atlas + resmi mongodb Node driver; Zod giriş/çıktı doğrulaması.
- Sunucuda fetch ile GitHub GraphQL (profil/pinned) + REST (repo README/metadata).
- Markdown inceleme: unified/remark-parse AST; güvenilmeyen HTML render edilmez.
- next-intl ile TR/EN; metinler mesaj dosyalarında.
- next/og ImageResponse ile ayrı kart render şablonları; JSX/CSS destek sınırlarına göre tasarlanır.
- Vitest + React Testing Library; kritik kullanıcı akışlarına Playwright; erişilebilirlik için axe.
- npm tek paket yöneticisi, tek lockfile. Desteklenen Node LTS ve uyumlu stabil paket sürümleri kurulum anında resmi dokümanla doğrulanır, tam sürümler kilitlenir. Canlı proje boyunca gelişigüzel major yükseltme yok.
- Tek Next.js uygulaması Vercel hedefli; Mongo bağlantısı process başına yeniden kullanılır. Sağlayıcı maliyeti/limitleri yayın aşamasında doğrulanır; ücretsiz/sınırsız varsayılmaz.
- Redux, mikroservis, Redis, kuyruk ve ek servis somut ihtiyaç olmadan eklenmez.
Neden: React/Mongo deneyimini korumak; SSR paylaşım metadatası, kart görselleri ve backend'i tek projede yönetmek.

## Veri akışı ve modüller
Girdi doğrula → profil ve aday repolar → seçimi doğrula → önbellek/limit → GitHub verilerini al → normalize et → saf kuralları çalıştır → bulguları/önerileri üret → snapshot kaydet → sonuç.
Puanlama fonksiyonu ağ, veritabanı, saat veya AI çağırmaz; normalize edilmiş girdi ve sürüm alır.
Aynı girdi + aynı kural sürümü = aynı sonuç; dil değişikliği puanı değiştirmez.
Alanlar:
- github: fetch, sayfalama, hata ayrımı, timeout, rate-limit.
- analysis: normalize, rules, scoring, archetypes, recommendations.
- storage: snapshots, cache, shares, throttles.
- cards: ilk analiz/gelişim, boyutlar, fontlar.
- ui: giriş, seçim, sonuç, kanıt, görevler, paylaşım.
- i18n: TR/EN mesajları.
Önerilen dizin: src/app, src/components, src/features/analysis, src/lib/github, src/lib/db, src/lib/security, src/lib/cards, src/messages, tests, docs.
Route handler ince kalır; iş kuralları domain modülünde bulunur.

## Depolama, paylaşım ve sınırlar
Collections:
- analysisSnapshots: değişmez sonuç ve sınırlı kanıt. Varsayılan 30 gün TTL.
- analysisCache: anahtar username/userId + scopeHash + rulesVersion; 15 dakika TTL.
- shareReports: kullanıcı işlemiyle oluşturulan immutable, minimum veri içeren rapor kopyası; rastgele >=128-bit share id, 90 gün sona erme.
- rateLimits ve requestLocks: atomik sayaç/kilit + TTL. TTL temizliği gecikebilir; expiry her istekte kontrol edilir.
- aggregateEvents: kullanıcı adı/IP olmadan günlük olay sayaçları.
Snapshot erişimi tahmin edilemeyen read token ile; token loglanmaz. Kamuya açık shareReports ayrı nesnedir.
Paylaşım sayfaları noindex; anonim profil listesi, sıralama, dizin oluşturulmaz.
Paylaşım oluşturulurken cihazda yönetim/silme tokenı tutulur, DB'de hash saklanır. Link süresi ve cihazdan silme kontrolü açıklanır.
Share sayfası GET/OG istekleri yeni GitHub analizi tetiklemez.
Görsel anahtarı reportId + format + locale + templateVersion. TR/EN kartlar ayrı cache'lenir.
Avatar yalnız allowlist GitHub avatar hostundan, timeout ve boyut sınırıyla; başarısızsa yerel monogram. Keyfi URL sunucudan fetch edilmez.
Sunucu puanı kendisi hesaplar; istemcinin yolladığı puan, bulgu veya snapshot sahibi id'sine güvenmez.
Örnek başlangıç limitleri: anonim session + güvenli proxy IP türevi için 10 analiz/10 dakika; aynı profil/kapsama zorunlu yenileme en az 60 saniye; ortak GitHub bütçesi ayrıca korunur. Bunlar config ve testlerle ayarlanır.
HMAC IP anahtarı kısa ömürlü; ham IP veya token loglanmaz. Cookie tek başına abuse koruması değildir.
Tekil işlem kilidi ve aynı isteği birleştirme; sunucu başına bellek limiti tek başına kullanılmaz.
GitHub 403/429/GraphQL errors, retry-after/reset, timeout ve bütçe tükenmesi ele alınır. Kör retry yok; geçici ağ/5xx için en fazla 2 kontrollü retry.
Toplam analiz timeout'u başlangıçta 20 saniye; hosting sınırlarıyla doğrulanır. Arkada tamamlanacağı garanti edilmeyen fire-and-forget iş yok.

## Güvenlik ve operasyon
GITHUB_TOKEN, MONGODB_URI ve imzalama secretları yalnız server; NEXT_PUBLIC_ altında sır yok.
Public data için gereken en düşük yetki. .env.example yalnız isim/örnek; .env.local gitignore.
Raw README HTML/JS çalıştırılmaz. URL protokolü doğrulanır, javascript/data linkleri reddedilir.
Server-side istekler sabit GitHub API endpointlerine; demo siteler fetch edilmez.
Girdi Zod ile doğrulanır; request body, concurrency, dosya ve zaman sınırları.
Loglarda correlationId, hata türü, süre; token/README içeriği/IP yok.
Paylaşım oluşturma/silme mutasyonlarında origin kontrolü ve rate limit.
Vercel/Atlas plan limitleri, deployment bölgesi, env ve hata ekranları yayın öncesi kontrol edilir.
Uygulama analizi GitHub hesabında değişiklik yapmaz.
Veri süresi, public kapsam ve puan sınırları kısa gizlilik/metodoloji sayfalarında açıklanır.

## Resmi teknik referanslar
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://nextjs.org/docs/app/api-reference/functions/image-response
- https://www.mongodb.com/docs/drivers/node-frameworks/next-integration/
- https://docs.github.com/en/graphql/reference/users
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api

Bağlam kaybının sıfır olacağı garanti edilemez. Bu dosyalar, küçük iş dilimleri ve testler; yeni oturumun durumu yeniden kurmasını ve sapmaların erken fark edilmesini sağlar.

## A0 kurulum yapısı — 27 Ekim 2026

Tek uygulama mevcut proje kökünde elle yapılandırıldı; oluşturucu çalıştırılıp mevcut belgelerin üzerine yazılmadı. `src/app` App Router girişidir. Node runtime varsayılanı korunur; Edge veya ayrı backend eklenmedi.

- Marka ve geliştirici bilgileri: `src/config/site.ts`.
- Temel CSS tokenları: `src/app/globals.css`; Tailwind v4 PostCSS eklentisi ile derlenir.
- TypeScript strict; `@/*` alias'ı `src/*` konumuna gider.
- Lint: ESLint flat config, Next core-web-vitals ve TypeScript kuralları. Build'den bağımsız kontrol edilir.
- Typecheck: `next typegen && tsc --noEmit`; üretilen `next-env.d.ts` ve `.next` Git'e alınmaz. Önceden build/dev çalıştırma gerektirmez.
- `.nvmrc`: Node 22.13.0; npm 10.9.2. Yerelde mevcut sürümler kullanılır; sistem kurulumu değiştirilmedi. Node 22 desteklenen LTS hattıdır ve Next.js >=20.9 gereksinimini karşılar. Bu kayıt en güncel Node yaması olduğu iddiası değildir.
- `package.json` doğrudan bağımlılıkları tam sürümlerle, `package-lock.json` tüm çözümlemeyi kilitler. `.npmrc` yeni eklemeler için save-exact kullanır.
- `next.config.ts` içindeki `agentRules: false`, dev sunucusunun AGENTS.md dosyasına otomatik talimat eklemesini engeller.
- CI: GitHub Actions checkout/setup-node v7, `.nvmrc`, `npm ci`, lint, typecheck, build; yalnız contents: read. Uygulama secret'ı istenmez. Çalışma sonucu push sonrasında ayrıca doğrulanır.
- `.env.example`: `GITHUB_TOKEN`, `MONGODB_URI`, `SIGNING_SECRET` boş değerlerdir. Sözleşmedeki adı belirlenmemiş imzalama sırrı için SIGNING_SECRET adı ayrıldı. A0 kodu bu değişkenleri okumaz; gerçek anahtar eklenmedi.

MongoDB, Zod, GitHub adapter, next-intl, Markdown parser, UI bileşen kütüphaneleri ve test araçları ilgili aşamalarda gerektiğinde kurulacak. Bu turda boş domain katmanları, sahte servis veya gerçek ürün ekranı eklenmedi. Snapshot/karşılaştırma koşulları PRODUCT.md'de değişmeden durur.

### Kurulumda doğrulanan resmi kaynaklar

- [Next.js kurulum ve Node gereksinimi](https://nextjs.org/docs/app/getting-started/installation)
- [Node LTS sürüm durumu](https://nodejs.org/en/about/previous-releases)
- [Next.js typegen](https://nextjs.org/docs/app/api-reference/cli/next)
- [Next.js ESLint](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Tailwind Next.js kurulumu](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [GitHub setup-node](https://github.com/actions/setup-node) ve [checkout](https://github.com/actions/checkout)

Stabil sürüm etiketleri ve peer/engine gereksinimleri npm kayıt defterinden de kontrol edildi. Kurulan tam sürümler DECISIONS.md'de; gerçek kontrol sonuçları STATUS.md'de tutulur.

## A1 ilk bölüm — ana sayfa ve demo

- Yeni doğrudan bağımlılıklar: next-intl 4.14.9 (TR/EN mesajları), lucide-react 1.62.0 (kullanılan ikonlar). Stabil sürüm/peer aralıkları mevcut Next 16.4.3 ve React 19.3.1 ile doğrulandı; başka doğrudan bağımlılık eklenmedi.
- `src/i18n/request.ts`, `locale` cookie değerini tr/en olarak sınırlar; varsayılan Türkçedir. `src/i18n/actions.ts` Server Action üzerinden tercihi yazar. Revalidation mevcut URL'yi değiştirmez. Cookie HttpOnly, SameSite=Lax, bir yıl; production'da Secure.
- URL'ler `/` ve `/demo` olarak kalır; locale segmenti/middleware gerekmez. Bu aşamada tüm çeviriler Server Component içinde kullanılır; client provider veya uygulama state katmanı eklenmedi. Root HTML lang ve metadata da seçili dile uyar.
- Görünen metinler `src/messages/tr.json` ve `en.json` içinde; marka/yazar mevcut config'tedir. Kullanıcı adı alanı hiçbir analiz isteğine veya fixture değişikliğine bağlanmaz.
- `src/features/analysis/demo.ts`, sabit check değerleri ve toplamları içerir. Sunum bileşeni saf puanlama motoru veya GitHub normalizasyonu yapmaz. Dış URL, gerçek token, snapshot veya ağ adapter'ı içermez.
- Native details/summary, kategori ve kanıt açılımını yönetir; ek client state veya accordion bağımlılığı yok. Başlangıç durumları kapalıdır. Gerçek veri geliyormuş gibi loading/success üretilmez.
- Dil cookie'si nedeniyle iki sayfa request sırasında server-render edilir. Gerçek rapor/paylaşım dili seçimi bu aşamanın kapsamında değildir.

Resmi kurulum kaynağı: [next-intl App Router](https://next-intl.dev/docs/getting-started/app-router) ve [istek yapılandırması](https://next-intl.dev/docs/usage/configuration). A0 ESLint kararı D011 ile korunur.

## A1 repo seçimi ve durum örnekleri

- `/demo/select` ve `/demo/states` iki yeni server page'dir. Her biri yalnız kendi Select/States mesajlarını NextIntlClientProvider ile ilgili Client Component'e verir. Kabul edilmiş root layout, dil Server Action'ı ve ana sayfa değiştirilmedi.
- RepoPicker, repos ve initialSelectedIds props'larını alır. `useState` içinde repo kimlik dizisi tutulur; sayı bu diziden türetilir. Üç sınırı hem checkbox disabled durumunda hem güncelleme fonksiyonunda uygulanır. Seçili kutular sınırda da etkin kalır. Dil Server Action'ının RSC güncellemesinde bileşen kimliği korunduğu için seçim sıfırlanmaz; browser kontrolüyle doğrulandı. Sayfa yenileme/cihazlar arası kalıcılık vaat edilmez; store/localStorage eklenmedi.
- AnalysisStates yalnız StateExample[] props'larını ve elle seçilen örneği tutar. Altı durum verisi state-demo.ts içinde, repo adayları selection-demo.ts içinde; görünür metinler mevcut TR/EN mesaj dosyalarında. Genel workflow motoru veya adapter tasarlanmadı.
- Devam eylemi yalnız `/demo/states` navigasyonudur. Seçili kimlikler bir backend'e gönderilmez, puanlama çalışmaz. Sabit `/demo` raporu bağımsız kalır. Kısmi örnekte bir bilinen bulgu ve puan üretmeme açıklaması gösterilir.
- Yeni paket, API route, GitHub/MongoDB/AI isteği, zamanlayıcı, reset sayacı veya PNG eklenmedi. Yerel Next navigasyonu ve mevcut dil tercihi dışında analiz isteği yoktur.

Client çeviri referansı: [next-intl Server/Client Components](https://next-intl.dev/docs/environments/server-client-components).

## A2.1 — sunucu GitHub veri katmanı — 28 Ekim 2026

`src/lib/github` bu tur gerçek kullanıcı arayüzüne bağlanmadı. Route Handler, public/debug endpointi, puanlama, cache veya kalıcılık yoktur. `GitHubClient` her sunucu işlemi için yeniden oluşturulur; singleton olarak paylaşılmaz. Profil ve pinned GraphQL, repo adayları/metadata/README REST üzerinden alınır. REST alan seçimi sağlamadığından dönen büyük nesneden yalnız gerekli alanlar Zod şemalarıyla doğrulanıp tutulur. GraphQL sorguları yalnız kullanılan alanları ister.

- `input.ts`: trim + küçük harfe normalizasyon; normal kişisel GitHub adı (1–39 ASCII alfanümerik, arada tek tire), `github.com/login` veya `https://github.com/login`, isteğe bağlı son `/`. Repo yolu, sorgu/hash, credential, port, başka host, http, encoding ve path normalizasyonu kabul edilmez. Sözdizimi hesabın varlığını/kişisel hesap olduğunu kanıtlamaz; GraphQL `user` sorgusu bunu ayrıca doğrular. Managed-user underscore biçimleri bu dar public profil girdisine dahil değildir. Sunucu `getProfile` içinde şemayı tekrar uygular.
- `getProfile`: normalize edilmiş public kimlik/bio/website/avatar. `getPinned`: uygun public, sahibine ait, arşivlenmemiş/fork olmayan pinned kimlikleri veya açık `unknown` + tipli hata. Boş erişilebilir liste ile hata aynı değildir. Null node, GraphQL errors veya partial sessizce boş listeye çevrilmez.
- `getCandidates`: uygun pinleri REST metadata ile yeniden doğrular, sonra güncelleme sıralı 100'lük REST sayfalarını tarar; ID ile tekrarları kaldırır. Public + User owner kimliği/login + fork/archive filtresi uygulanır. En fazla 100 uygun aday; `limited: true` o sınırda ihtiyatlı olarak döner, toplam uygun repo sayısı iddia edilmez. İşlem bütçesi taramayı durdurursa eksik liste veya `no_repos` başarısı dönmez. İlk sıralar pinned, sonra son güncellenenlerdir; ileride 1–3 ön seçim için kullanılabilir, arayüze bağlanmadı.
- Pinned için servis/ağ/partial hatası varsa güncel aday listesine geçilebilir; `pinnedStatus: unknown` ve ayrı Pinned sonucundaki hata korunur. Auth/configuration/bütçe hatasında yeni istek gönderilmez. Pinned isteğinin kendi timeout'unda kalan ortak bütçe varsa aday erişimi denenebilir; ortak deadline dolduysa transport yeni isteği reddeder. Pinned GraphQL primary limitinde REST aday erişimi kendi limiti uygunsa sürebilir; secondary/belirsiz limitte transport her iki API için yeni isteği reddeder. Başlangıçta uygun görünen pin metadata kontrolünde kapsam dışına çıkarsa `repo_unavailable` olur; sessizce yok sayılmaz.
- `getSelected`: 1–3 benzersiz pozitif repo ID'si + güvenli repo adını doğrular; güncel owner/public/archive/fork/ID metadata'sını ve README'yi alır. İstemcinin kapsam iddiasına güvenmez. `getProfileReadme` proje eligible filtresini ve genel `/readme` aramasını kullanmaz; aşağıda ayrı profil kapsamı açıklanır.
- Proje README: `found` (metin, path, dosya SHA, branch), `missing` veya `unknown` + hata. README 404 sonrası repo metadata'sı tekrar alınır; ID/owner/kapsam/default branch korunmuşsa `missing` üretilir. Repo 404/private/transfer/archive/fork/kimlik değişimi veya doğrulama hatası `unknown` kalır. Profil README yokluğu ayrı, hatasız GraphQL nullable alanlarıyla doğrulanır; REST 404 tek başına missing üretmez.
- README JSON/base64, bildirilen boyut, gerçek byte sayısı ve UTF-8 doğrulanır. 256 KiB üstü içerik kesilmez; `unknown/too_large` olur. Markdown render/çalıştırma/AST puanlama bu katmanda yoktur. Kaynak path/SHA/branch tutulur; dış `download_url` takip edilmez.

`GitHubTransport`: yalnız `https://api.github.com` altında sabit kod endpointleri, redirect reddi, no-store. Ortak işlem deadline'ı 20 saniye; istek başına en fazla 8 saniye ve kalan ortak süre; en fazla 40 HTTP isteği. Bunlar process-geneli veya dağıtık abuse limiti değildir; A4 atomik koruma hâlâ açık. JSON gövdesi stream sırasında 1 MiB ile sınırlıdır. Retry eklenmedi. REST/core ve GraphQL primary bakiye/blokları ayrı tutulur; secondary ve bilinmeyen kısıtlar ortak bloktur. Aşağıdaki revizyon kuralları geçerlidir. API sürümü `2026-03-10` ile sabitlendi.

Hata kodları: `invalid_input`, `configuration` (boş/biçimi bozuk token, HTTP 401), `auth` (403/GraphQL yetki), `user_not_found`, `no_repos`, `repo_unavailable`, `rate_limit`, `network`, `timeout`, `service`, `graphql`, `partial`, `invalid_response`, `request_budget`, `too_large`. GraphQL HTTP 200 errors kontrol edilir; kısmi veri tam sonuç gibi kullanılmaz. REST 403 secondary-limit mesajı da ayrılır. Remaining/reset/retry-after yalnız gerçek yanıttan gelir; yoksa boş kalır. Hata mesajları upstream body/token/README içermez. Bu katman hata/unknown verisini puana veya demo verisine dönüştürmez.

Token yalnız server-only işaretli adapter/transport içinde, çağrı anında okunur. İçe aktarım/build token gerektirmez. Vitest testlerinde server-only işareti yalnız Node test ortamında mock edilir; uygulama sınırı kaldırılmaz. Global fetch her testte stub edilir, gerçek ağ çağrısı yapılmaz. CI `npm ci` → `npm test` → lint → typecheck → build sırasındadır; test secret'ı yoktur. Zod 4.6.7, server-only 0.0.1 ve dev Vitest 5.0.5 tam sürümle kilitlendi (Vite 8.3.5 transitif); Vitest Node ^22.12.0 gereksinimi mevcut 22.13.0 ile uyumludur. Config `.mjs` ile ESM yüklenir; uygulamanın module tipi değiştirilmez.

Resmi doğrulama kaynakları:

- [GitHub kayıt formu: normal kullanıcı adı karakterleri](https://github.com/signup), [GitHub kullanıcı adı uzunluk/normalizasyon sınırları ve managed-user ayrımı](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/iam-configuration-reference/username-considerations-for-external-authentication).
- [GraphQL User ve pinnedItems](https://docs.github.com/en/graphql/reference/users), [GraphQL çağrı ve token erişimi](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql).
- [REST repo metadata ve sayfalama](https://docs.github.com/en/rest/repos/repos), [README endpointi](https://docs.github.com/en/rest/repos/contents#get-a-repository-readme).
- [REST rate-limit ve gizlenen 404 davranışı](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api).
- [Fine-grained token oluşturma](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [Zod gereksinimleri](https://zod.dev/), [Vitest kurulumu](https://vitest.dev/guide/). Paket engine/sürüm metadatası ayrıca resmi npm registry'den kontrol edildi.

### A2.1 profil README ve limit düzeltmesi — 28 Ekim 2026

Profil README çözümü en fazla üç istek kullanır: (1) GraphQL user kimliği ve aynı adlı nullable repo metadata'sı; (2) public repo için varsayılan dal commit SHA'sında `README.md` Git object metadata'sı; (3) Blob varsa REST `/contents/README.md?ref=COMMIT` ile doğrulanan dosya içeriği. Kullanıcı/repo kimliği, dosya yolu ve Blob SHA eşleştirilir. İki GraphQL adımında da `errors`/partial önce reddedilir; alanın eksik olması null sayılmaz. Hatasız `repository: null`, bilinen private repo (public profil kapsamı yokluğu), boş public repo veya hatasız kök object null `missing` olur. Public repo sonradan kaybolmuş/private olmuş veya kimlik değişmişse `unknown`; doğrulanmış Blob sonrasında REST 404 de `unknown` olur. Bu sonuç `no_repos` aday boş durumundan bağımsızdır.

Arşiv/fork yalnız proje aday kapsamıdır; resmi profil README koşulu olmadığı için bu yolda kullanılmaz. Genel repo README endpointi `.github`/docs konumunu seçebildiğinden profil için çağrılmaz. İlk public kontrolünden önce README object/içeriği istenmez; private README okunmaz. Dosya çözümlemesinde proje/profil yalnız ortak `decodeReadme` fonksiyonunu kullanır; base64, byte boyutu, UTF-8 ve 256 KiB sınırı korunur. Boş dosya found + boş text'tir. Bu veri API'den okunabilirlik kanıtıdır; görünür profil gösterimi doğrulanmaz. Resmi koşullardaki içerik gereksinimi, managed-user istisnası ve Temmuz 2020 öncesi repolarda elle paylaşım notu nedeniyle adapter `displayed: true` gibi bir alan üretmez.

Transport'ta `core` ve `graphql` için ayrı primary bilgiler/bloklar vardır. `x-ratelimit-resource` biliniyorsa header'lar o kaynağa, eksikse sabit endpoint kaynağına bağlanır. Tanınmayan kaynak bir primary hesabına yazılmaz; rate-limit kısıtı belirsiz ortak blok olur. Eksik/geçersiz header önceki gerçek remaining/reset bilgisini silmez. Primary blok yalnız kendi kaynağında sürer; gerçek reset zamanı geçince eski bakiye ve blok bırakılır, çağrı ancak ortak 20 saniye/40 istek bütçesi hâlâ uygunsa gönderilir. Bilinmeyen reset oluşturulmaz. Sıfırın reset'i bilinmiyorsa o kaynak işlem ömründe bloklu kalır.

HTTP 403/429 mesajı ve gerçek header'lar birlikte değerlendirilir: secondary/abuse veya retry-after ortak kısıttır; tanımlı kaynağın gerçek zero remaining bilgisi primary, türü belirsiz rate-limit ortak bloktur. GraphQL HTTP 200 RATE_LIMITED da transport'a işlenir; secondary mesajı/retry-after varsa ortak blok olur. Aynı işlemde eksik header önceden bilinen primary kaydını korur. Ortak blokta yalnız gerçek retry-after ya da gelecekteki gerçek zero-balance reset bilgisiyle tekrar zamanı belirlenir; bilgi yoksa tüm işlem ömründe korunur. Geçmiş bir primary reset, yeni secondary kısıtı açmak için kullanılmaz. Otomatik retry yoktur. `GitHubClient`/transport tek sunucu işlemi ömründedir; global singleton veya dağıtık rate-limit çözümü değildir.

Resmi kaynaklar: [profil README gösterim koşulları](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme), [genel repo README konumları](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), [nullable User.repository](https://docs.github.com/en/graphql/reference/users), [Repository/Git object erişimi](https://docs.github.com/en/graphql/reference/repos), [ayrı API limit kaynakları](https://docs.github.com/en/rest/rate-limit/rate-limit), [GraphQL primary/secondary hata davranışı](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api).

## A2.2 — gerçek profil ve seçim akışı — 28 Ekim 2026

Ana sayfada Server Component yalnız çeviri/örnek önizleme render eder; GitHub çağrısı render'a bağlı değildir. Sayfa kapsamlı next-intl provider Home/Search/Select mesajlarını ProfileSearch'e verir. ProfileSearch, form ve gerçek seçim state'ini tutar; dil değişimi bileşen kimliğini korur. Başka route/store/localStorage/cache eklenmedi. Gerçek arama POST'u yalnız `src/features/analysis/actions.ts` içindeki `getRepos` Server Action'ıdır; Route Handler eklenmez. Girdi `unknown` olarak karşılanır, ham byte sayısı <=256 ve ortak Zod profileInput hem istemcide hem sunucuda uygulanır. Next `experimental.serverActions.bodySizeLimit: 8kb` ağ gövdesini kısıtlar; varsayılan aynı-origin Server Action kontrolü korunur, allowedOrigins genişletilmez.

Her getRepos çağrısı yeni GitHubClient oluşturur ve getProfile → getPinned → getCandidates çağırır. 20 saniye/40 istek tek sunucu işlemi içindir; seçimi beklemek client ömrüne dahil değildir. Profil/proje README çağrılmaz, analiz/puan üretilmez. DTO yalnız profile id/login, repo id/name/description/language/pinned, başlangıç ID'leri, pinnedUnknown ve limited içerir. Açıklama 350, dil 60 karaktere sınırlandırılır; yalnız görüntü metnidir, puanlama girdisi değildir. Client kimliği numeric GitHub ID'sinin string biçimidir. Avatar URL'si aktarılmaz/fetch edilmez; güvenli monogram ve sabit github.com profil bağlantısı kullanılır. Error nesnesi, ham API nesnesi, token ve server-only modül istemciye gönderilmez; yalnız invalid_input/notFound/empty/network/rateLimit/configuration kodları döner. Timeout/servis/partial/invalid_response gibi iç ayrımlar UI'da güvenli bağlantı metnine eşlenir; adapter kodları içeride korunur.

RepoPicker gerçek/demoda aynı görsel checkbox kurallarını paylaşır. Görünüm modu yalnız başlık ve sonraki eylemi değiştirir: demo /demo/states linki, gerçek seçim pasif puanlama bilgisi. Demo fixture'ın descriptionKey çevirisi demo server page'de çözülür; gerçek veriyle fixture karıştırılmaz. Ortak StatePanel loading/hata yüzeyini gerçek akış ve demo durumlarında paylaşır; demo seçici gerçek istek üretmez. Gerçek retry formu yeniden gönderir. Yükleme yalnız pending istektir; sahte yüzde, süre veya demo fallback yoktur.

Adapter pinleri önce/güncel adayları sonra sıraladığından ilk üç ID ön seçilir. Pinned unknown ayrı uyarıdır, bilinen boş kabul edilmez. Pinned isteğinin 8 saniyelik timeout'unda kalan işlem süresi varsa aynı client ile REST adaylarına geçilir; yeni client açılıp bütçe sıfırlanmaz. Kalan süre yoksa transport timeout verir. Auth/configuration/bütçe ve secondary/belirsiz rate-limit korumaları aşılmaz.

ProfileSearch aynı pending gönderimi ref ile eşzamanlı engeller. Alan değişimi önceki sonuç/seçimleri ve pending görünümünü temizler, istek kimliğini ilerletir. Dönen yanıt yalnız son kimliğe aitse uygulanır; eski backend çağrısının iptali vaat edilmez. Başarılı seçim her yeni aramada ayrı searchId key'i alır; dil değişimi yeni kimlik/istek üretmez. Sonuç/hata başlığına görünür focus ve bölge başına scroll uygulanır. Seçimler yalnız client ID dizisidir; sunucuya analiz için henüz yollanmaz.

Bu bir public ağ girişidir fakat kalıcı/dağıtık abuse koruması değildir: 256 byte girdi, 8 KiB body ve işlem budget'ı tek başına anonim ölçekli korunma sağlamaz. A4 throttle/cache/lock yoktur. Public deployment yetkisi/hazırlığı verilmedi; bu akış yerelde incelenir.

Resmi referanslar: [Server Actions ve programatik form çağrısı](https://nextjs.org/docs/app/guides/forms), [Server Action body/origin yapılandırması](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions). Kurulu Next 16.4.3 config tipleri ve action-handler body parser'ı da kontrol edildi. Yerel aşırı body denemesinde limit doğrulandı; geliştirme sunucusu dahili 413 body-limit hatasını HTTP 500 Server Action yanıtı içinde taşıdı. Bu statü özel bir JSON API sözleşmesi olarak sunulmaz.


## A3 — saf puanlama motoru (bağımsız domain modülü)

- `src/features/analysis/scoring/types.ts`: adapter ile uyumlu normalize girdi, check/evidence, kategori, öneri ve tip çıktısı.
- `markdown.ts`: unified 11.0.5 / remark-parse 11.0.0 AST incelemesi; açık TR/EN alias'ları ve bölüm sınırları. HTML render/çalıştırma ve URL fetch yoktur. Başlıklar tek geçişte bölüm kapsamına ayrılır; iç içe kapsam en fazla Markdown başlık derinliğidir.
- `engine.ts`: `scoreAnalysis(input)`; 1–3 uygun repo, sabit sürüm, puan/ortalama/yuvarlama, unknown, profil tipi ve en çok üç görev. Genel workflow/kural motoru yoktur.
- Adapter'ın Readme/Profile/Repository/ErrorCode tipleri type-only import edilir; yalnız saf login/repo adı Zod şemaları runtime import edilir. Transport, server-only client, env, DB, saat veya AI puanlama modülüne yüklenmez. Saat ve locale bağımlılığı yoktur; checkedAt opsiyonel girdidir. Çıktı yeni nesnelerle oluşturulur, girdi değiştirilmez; repo ID sırası sonucu sabitler.
- `GitHubClient.getSelected` çıktısındaki `{repo, readme}[]`, profile ve profileReadme ile doğrudan girdi olabilir; ilk motor diliminde bu çağrıları birleştiren Server Action oluşturulmamıştı. Güncel analyze bağlantısı aşağıdaki gerçek analiz bölümündedir. getRepos yalnız profil/adayları getirir; seçimi bekleyen client yaşam süresi uzatılmaz.
- Eksik data kategorisi ve toplam null'dır; bilinen metadata/check bulguları korunur. README yokluğu yalnız adapter'ın doğrulanmış missing durumu veya bilinen boş found metindir. Büyük found metin ikinci savunma olarak unknown/too_large olur; kesilmez.
- Evidence, varsa Blob SHA'yı dosya kimliği olarak taşır; branch ile kaynak linkini ayrı tutar. Sağlanmayan commit SHA veya zaman damgası uydurulmaz. Güvenli errorCode dışında Error/transport nesnesi döndürülmez.
- `src/messages/{tr,en}.json` içindeki yeni Scoring alanı hesaplama dışındaki metinleri tutar. Önceki mesajlar ve UI bileşenleri korunur. Motor/demolar henüz birleştirilmez; 77,5 fixture değişmez.
- `tests/scoring`: ağ/saat/rastgelelik olmadan davranış, Markdown, scope, eksik veri, öneriler, profil tipi ve iki dilde mesaj anahtarları. Mevcut Vitest/CI kullanılmaya devam eder; yeni test aracı veya canlı GitHub testi yoktur.

Tam tespit sınırları ve aritmetik [SCORING](SCORING.md) içindedir. Gerçek kullanıcı sonuç akışı, kalıcı cache/MongoDB ve paylaşım bu dilimde yoktur; public deployment sınırlamaları sürer.


## A3 — gerçek analiz ve geçici sonuç arayüzü

`actions.ts` içindeki analyze, getRepos'tan ayrı kullanıcı işlemi için Server Action'dır; aynı işi yapan Route Handler/public debug endpointi eklenmedi. Girdi strict Zod: username, profileId, 1–3 benzersiz id/name; kullanıcı adı raw <=256 byte ve JSON payload <=2 KiB, mevcut framework body <=8 KiB. Fazladan metadata/score/findings/version reddedilir. Profilin ID/login'i getProfile ile, her repo ID ve eligible kapsamı getSelected ile tekrar doğrulanır. Veri değişimi repo_unavailable/kimlik uyuşmazlığında güvenli selectionChanged olur. Repo listesi getirilirken açılan client kullanıcı seçimini beklemez; her analyze işlemi yeni client ve ortak 20 saniye/40 istek bütçesidir.

Güncel repo metadata/README ve profil README sunucuda motora verilir. checkedAt sunucunun gerçek veri alma zamanıdır; RULES_VERSION motor sabitidir. report.ts, serileştirilebilir DTO'yu tanımlar: üstte checkedAt/profile/repoCount, motor sonucu ve yalnız izinli evidence alanları. Excerpt, adapter errorCode/Error, ham metadata/README ve avatar/token aktarılmaz. Güvenli action kodları kullanıcı hatalarına çevrilir; README unknown ise adapter/motor sözleşmesiyle incomplete döner, demo fallback yoktur.

ProfileSearch arama durumunu, LiveAnalysis analiz işlem kimliğini/pending/sonucunu tutar. RepoPicker ID state'i sonuç gösterilirken mounted/hidden kalır; geri dönüşte ve locale refresh'inde seçim kaybolmaz. Yeni arama eski LiveAnalysis'ı kaldırır. Ref guard çift analizi engeller; requestId hem seçim ekranına dönüşte hem unmount'ta artar, eski yanıt uygulanmaz. Sunucu isteğinin iptali vaat edilmez; Next istemci action kuyruğu da kullanıcı işlemlerini sıralayabilir. Sonuç/veri alma render/locale effect'ine bağlı değildir; yalnız açık kullanıcı eylemi ağ işlemi başlatır.

LiveReport yalnız motorun kategori/check/tip/öneri dizilerini sunar; puan toplamaz/ortalama hesaplamaz/sıralamaz. Kaynaklar GitHub linki, path/satır/Blob SHA ve yerelleştirilmiş kanıt metnidir; README render edilmez. IdentityCard, sunucu demo wrapper'ı ResultSummary ile canlı client sunumunda ortaktır. Incomplete: toplam null, tip/mühür yok; tam kategoriler ve bilinen bulgular korunur, tekrar alma ve geri dönüş açıktır. Tam yenilemede kaybolan sayfa state'i kalıcı rapor URL'si değildir. Demo fixture/editoryal metin ve üç demo route'u ayrı kalır.

Tests/github/analysis.test.ts gerçek HTTP mock'larıyla girdi/scope/identity/DTO/complete/incomplete/hata/bütçe doğrular; tests/analysis/report.test.tsx mevcut React renderer/next-intl ile null ve yerelleştirme/sunum sırasını kontrol eder. CI hâlâ ağ/secret gerektirmez; yeni bağımlılık/test aracı eklenmez. Yerel Chrome/CDP gerçek akış kontrolü CI sonucu değildir. MongoDB/kalıcı cache, karşılaştırma, paylaşım/PNG, dağıtık abuse ve deployment bu dilimde yoktur.

## A4.1 — snapshot modeli ve ayrı sunucu saklama/okuma katmanı

`src/lib/db` yalnız server-only modüller içerir. Mevcut actions/UI/adapter/motor bu modülleri import etmez; veri akışına DB yazımı bağlanmadı. Yeni route, public/debug endpointi, rapor sayfası veya shareReports yoktur. `mongodb` 7.7.0 resmi native driver, mevcut Node 22.13.0 ile uyumludur; Mongoose/ODM veya repository framework eklenmedi.

- `client.ts`: `getDatabase()` yalnız çağrı anında MONGODB_URI ve ayrı MONGODB_DB doğrular. URI şeması mongodb/mongodb+srv; DB adı 1–63 ASCII harf/rakam/tire/alt çizgi. Eksik/geçersiz ayar configuration, bağlantı hatası unavailable. Global process promise aynı client havuzunu eşzamanlı çağrı/HMR'da paylaşır; GitHubClient'ın işlem başına yeni client kuralından ayrıdır. Env değişiminde restart gerekir. Başarısız bağlantı temizlenip client kapatılır; sonraki açık çağrı yeniden bağlanabilir. Her işlemde close/kör retry yoktur.
- Havuz max=10/min=0, idle=60s; server selection/connect=5s, checkout=2s, operation timeoutMS=8s. Bunlar DB çağrısı sınırlarıdır; GitHub 20s/40 istek bütçesine henüz DB eklenmedi. Atlas gerçek kapasite/latency uygunluğu bu dilimde ölçülmedi.
- `snapshot-schema.ts`: snapshotVersion=1 için strict Zod; ayrı rulesVersion=1.0.0 desteklenir. Bilinmeyen biçim/kural sürümü okunabilir diye varsayılmaz; migrasyon/uyum kararı gerekir. Mevcut `Report` tipine compile-time uyum denetlenir. Ham README/excerpt, adapter Error/errorCode, avatar, token veya ek alanlar reddedilir. İzinli evidence alanları güvenli github.com URL'si, field, path/branch/Blob SHA/satır/availability/detailKey'dir.
- Şema profil/repo scope ve check kimliği tekilliği, 1–3 repo/13–33 check, üç benzersiz kategori, earned/status ve complete/incomplete/null tutarlılığı, gösterilen kategori toplamı, tip/görev check referanslarını doğrular. 1.0.0'da not_applicable kabul edilmez. Bu depolama doğrulamasıdır; Markdown/motor yeniden çalıştırılmaz, puan/tip/öneri sırası düzeltilmez veya yeniden üretilmez.

### Saklanan belge ve alan eşlemesi

| Alan | Anlam |
| --- | --- |
| _id | Rastgele UUID; MongoDB'nin varsayılan unique _id indeksi. |
| snapshotVersion | Belge/DTO biçimi, 1. Scoring rulesVersion ile aynı kavram değildir. |
| report.profile.id / login | Sözleşmedeki githubUserId / loginAtAnalysis; o andaki kimlik. |
| selectedRepoIds / scopeHash | Check scope'larından çıkarılan sayısal artan benzersiz repo ID'leri; scopeHash sıralanmış ID JSON dizisinin SHA-256'sı. Repo sırası hash'i değiştirmez; kullanıcı ve kural sürümü ayrıca tutulur. Bu henüz karşılaştırma/cache anahtarı uygulaması değildir. |
| report.checkedAt | Sözleşmedeki fetchedAt: A3 sunucu veri alma zamanı, değiştirilmez. |
| report.rulesVersion | Puanlama kural sürümü; her check'te de korunur. |
| report.status / score / categories / checks | Complete/incomplete; kategori/check katkıları, fail/pass/unknown ve sınırlı normalize kanıt. Findings, ayrı kopya yerine checks dizisidir. |
| report.profileType / recommendations | Gerekçe check ID'leri, en fazla üç görevin mesaj anahtarı/target/rawImpact/categoryImpact ve mevcut sırası. |
| createdAt / expiresAt | Mongo BSON Date; sunucuda kayıt oluşturma zamanı ve createdAt+30 gün. Analiz veri zamanından ayrıdır. |
| readTokenHash | 32 rastgele byte tokenının SHA-256 hash'i. Ham okuma tokenı DB'ye/loga yazılmaz. |

Yerelleştirme: `rule`, `suggestionKey`, `evidence.detailKey`, scope id/name ve puan etkileri mevcut TR/EN şablonlarının parametrelerini taşır; hazır çevrilmiş bulgu/öneri metni veya locale saklanmaz. Rapor aynı dil bağımsız değerlerle sunulabilir. Mesaj anahtarlarının gelecek sürümlerde kaldırılması ayrı uyum/migrasyon sorumluluğudur.

`snapshots.ts` iki küçük fonksiyon sunar: `createSnapshot(report)` strict doğrulama sonrası index/create/insert yapar, `{id, readToken}` döndürür; `readSnapshot(id, readToken)` kimlik+token hash+expiresAt filtreli okur ve **dönen kaydı yeniden şemayla doğrular**. Kaydedilen raporun puan/öneri sırası aynen döner. Hash istemci DTO'suna çıkmaz; okuma dönüşündeki tarih alanları ISO string'dir. Hatalı erişim biçimi, bulunamayan/yanlış tokenlı/süresi geçmiş kayıt null; bozuk saklanmış veri invalid_record, bozuk oluşturma girdisi invalid_report, eksik ayar configuration, DB/izin/işlem hatası unavailable. Ham DB hatası veya URI cause/log olarak taşınmaz. Şema yalnız güvenilen sunucu çıktısını saklama sınırıdır; gelecekte istemci raporu/puanı doğrudan kabul eden action yazılmaz.

Insert `ignoreUndefined:true` kullanır: isteğe bağlı path/SHA/satır gibi bulunmayan alanlar BSON'a yazılmaz; gerçek unknown puan/null değerleri korunur. Driver'ın varsayılan undefined→null dönüşümü strict okuma şemasını bozacağından bu ayar saklama sözleşmesinin parçasıdır. [Resmi BSON undefined davranışı](https://www.mongodb.com/docs/drivers/node/current/data-formats/bson/undefined-values/). Mevcut driver'ın gerçek BSON serializer/deserializer'ıyla ağsız complete/incomplete dönüşüm test edildi; gerçek MongoDB sunucusuna insert/read yapıldığı anlamına gelmez.

### Saklama süresi, indeks ve görünürlük

Kaynak sözleşme §7'deki **30 gün TTL** aynen korunur. `expiresAt` üzerinde `expireAfterSeconds:0`, `snapshot_expiry` adlı tek alanlı TTL indeksi her create öncesi idempotent olarak istenir; index/izin hatasında insert yapılmaz. `_id` zaten unique olduğundan ek id/token/kullanıcı/karşılaştırma indeksi eklenmedi. TTL temizliği anlık değildir; read filtresi ve doğrulama sonrası süre kontrolü bitmiş kaydı döndürmez. Yeni varsayımsal silme politikası/collection kurulmadı. Gerçek Atlas smoke'ta yalnız bu uygulama indeks tanımı çalıştırılıp doğrulandı; fiziksel otomatik TTL silinmesi gözlenmedi.

Complete ve incomplete aynı biçimde saklanabilir; unknown sıfıra çevrilmez, bilinen bulgular korunur. Incomplete toplam/tip null'dır ve karşılaştırma uygunluğu verilmez. Yalnız ID ile okuma yoktur; ayrı tahmin edilemeyen token gerekir. Bu modül sunucuda kalır, dış endpoint olmadığı için bu dilim kayıtları public hâle getirmez. Snapshot ve ilerideki public shareReports ayrı nesnelerdir.

`tests/db` mock driver/collection ile şema, dönüşüm, null/kimlik/expiry/token ve güvenli hata/pool davranışını doğrular; bu testler gerçek DB kanıtı değildir. Ayrı 29 Ekim 2026 opt-in smoke'ta mevcut modüllerle repovitrin_dev Atlas bağlantısı, gereken indeks/yaz/oku yetkileri, complete/incomplete BSON round-trip, token/kimlik ve DB'de mevcut süresi geçmiş kaydın uygulamada reddi doğrulandı. Yalnız üç sentetik test kaydı kimlikle temizlendi, geçici çalıştırıcı kaldırıldı; ayrıntı STATUS'ta. Fiziksel TTL silinmesi gözlenmedi ve gerçek DB hata türleri bu olumlu smoke'ta zorlanmadı. Normal test/CI secret gerektirmez. Action bağlantısı, kalıcı URL, cache, karşılaştırma, atomik throttle/lock, share ve yayın sonraki yetkili dilimlere kalır.

Resmi referanslar: [Node/driver uyumluluğu](https://www.mongodb.com/docs/drivers/compatibility/?driver-language=javascript&javascript-driver-framework=nodejs), [process başına havuz kullanımı](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools/), [bağlantı seçenekleri](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/), [TTL ve gecikmeli temizleme](https://www.mongodb.com/docs/manual/core/index-ttl/). Paket sürümü npm metadatası/lockfile ile doğrulandı; sistem Node kurulumu değiştirilmedi.
