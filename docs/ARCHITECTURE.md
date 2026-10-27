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
