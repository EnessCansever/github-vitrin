# RepoVitrin

Geliştirme aşamasındaki GitHub portfolyo sunumu değerlendirme projesi. Ana sayfa kullanıcı adı veya desteklenen GitHub profil URL'siyle gerçek public profili ve uygun repo adaylarını getirir; 1–3 proje seçilebilir. **Puanlama ve gerçek sonuç üretimi henüz açık değildir.** `/demo`, `/demo/select`, `/demo/states` kurmaca örnekler olarak ayrıdır; gerçek seçim sabit demo puanına yönlendirilmez. A2.2 akışı kullanıcı tarafından kabul edildi. Ana sayfa ve demo kimlik kartının Developer ID görsel revizyonu kullanıcı incelemesini bekliyor.

## Gereksinimler ve kurulum

Node.js **22.13.0** ve npm **10.9.2** ile doğrulanır; `.nvmrc` yerel ve CI Node sürümünü belirler. Sistem Node kurulumunu otomatik değiştiren bir betik yoktur. nvm kullanıyorsanız `nvm use` ile mevcut sürümü seçebilirsiniz.

```sh
npm ci
npm run dev
```

Ana sayfa: http://localhost:3000

Örnek sonuç: http://localhost:3000/demo

Repo seçimi örneği: http://localhost:3000/demo/select

Durum örnekleri: http://localhost:3000/demo/states

TR/EN aynı sayfada kalır ve dil cookie'de tutulur. Gerçek seçim aynı ana sayfada açılır; dil değişimi yeni GitHub isteği göndermez ve seçimleri korur. Yeni aramada eski profil/seçimler temizlenir; geç eski yanıt yeni aramayı ezmez. Seçim devamı puanlama geliştirilmekte olduğu için pasiftir. Demo eylemi her zaman bağımsız kurmaca profile gider. Sayfa yenilemede canlı seçim belleği sıfırlanır; kalıcı cache veya geçmiş yoktur.

Demo ekranları, testler ve build için secret gerekmez. `.env.example`, `GITHUB_TOKEN`, `MONGODB_URI` ve `SIGNING_SECRET` isimlerini boş değerlerle belgeler. Yalnız GitHub adapter’ı çağrıldığında sunucuda `GITHUB_TOKEN` okunur. Diğer iki değişken henüz kullanılmaz. Gerçek değerleri Git’e veya `NEXT_PUBLIC_` değişkenlerine eklemeyin.

## Kontroller ve production çalıştırma

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

`typecheck`, temiz kurulumda önce `next typegen` ile Next.js tiplerini üretir, sonra TypeScript kontrolünü çalıştırır. `lint` ESLint CLI kullanır. `build` lint yerine geçmez. `npm test`, Vitest ile girdi, kapsam, sayfalama, README, hata ve bütçe davranışlarını sahte HTTP yanıtlarıyla doğrular; gerçek GitHub isteği veya token gerektirmez. UI/Playwright test altyapısı kurulmadı.

GitHub Actions, push ve pull request üzerinde `npm ci`, test, lint, typecheck ve build çalıştıracak şekilde tanımlıdır; uygulama secret'ı gerektirmez. Yerel kontrol sonuçları uzak CI sonucu değildir; güncel doğrulama durumu [STATUS](docs/STATUS.md) içindedir.

## Yapı

- `src/app`: App Router ana sayfa, demo, ortak layout ve merkezi CSS tasarım tokenları.
- `src/components`: ortak marka, dil seçimi ve geliştirici imzası.
- `src/i18n`, `src/messages`: next-intl istek/dil ayarları ve TR/EN metinleri.
- `src/features/analysis/demo.ts`: sabit kurmaca örnek; puanlama motoru değildir.
- `src/lib/github`: server-only public adapter, Zod doğrulama, normalize edilmiş veri ve tipli hatalar. Arayüze bağlı değildir.
- `tests/github`: ağ kullanmayan adapter ve girdi testleri.
- `src/config/site.ts`: çalışma markası ve geliştirici bağlantı bilgileri. Bilinmeyen Instagram adresi boştur.
- `docs`: ürün, mimari, puanlama, tasarım ve aşama kayıtları.

Tam paket sürümleri `package.json` ve `package-lock.json` içinde kilitlidir. Yalnız npm kullanılır. Çalışma kuralları [AGENTS.md](AGENTS.md), sıradaki işler [TASKS](docs/TASKS.md) içindedir.

## GitHub bağlantısını hazırlama

Gerçek profil/aday erişimi ana sayfadaki “Projelerimi getir” eylemiyle tek Server Action üzerinden tetiklenir; aynı iş için Route Handler veya debug endpointi yoktur. EnessCansever için mevcut adapter ile gerçek public bağlantı smoke kontrolü yapıldı; güvenli sonuçlar [STATUS](docs/STATUS.md) içinde.

GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens altında süreli bir token oluşturun. Yalnız public veri için **Public repositories** erişimini seçin; ek hesap, yazma veya özel repo izinleri vermeyin. Fine-grained tokenlar public repolara okuma erişimi içerir. Classic tokenın `public_repo` kapsamı yerine bu dar erişimi tercih edin. [Resmi token oluşturma rehberi](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [GraphQL yetkilendirmesi](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql) ve [public README erişimi](https://docs.github.com/en/rest/repos/contents#get-a-repository-readme).

Tokenı kendiniz ignore edilen `.env.local` içindeki `GITHUB_TOKEN` değişkenine ekleyebilirsiniz; paylaşmayın. Adapter modülü import edilirken token okunmaz. Çağrı anında boş/biçimi bozuk token veya GitHub 401 yanıtı `configuration`, diğer yetki sorunları `auth` olur. Build ve deterministik testler bu değeri gerektirmez. Token, ana sayfadan public profil/aday erişimini açar; README analizi veya puanlama başlatmaz.

Bir sunucu işlemi için yeni bir `GitHubClient` oluşturulur; **global singleton olarak saklanmaz**. `getProfile`, `getPinned`, `getCandidates`, `getProfileReadme`, `getSelected` aynı 20 saniye / 40 istek bütçesini paylaşır. En fazla 100 uygun aday tutulur; bu sınırdaki `limited` bayrağı kesilmeyi ihtiyatlı biçimde bildirir. README en fazla 256 KiB, HTTP JSON gövdesi en fazla 1 MiB; içerik kesilmez.

Profil README'si proje adaylarından bağımsızdır: aynı adlı public repoda, varsayılan dalın sabit commit'indeki **kök `README.md`** kontrol edilir. Hatasız GraphQL yanıtında aynı adlı public repo veya kök dosyanın bilinen yokluğu `missing`; auth/ağ/partial ve belirsiz yanıt `unknown` olur. REST 404 tek başına yokluk kanıtı değildir. Arşiv/fork proje filtresi profil README'sine uygulanmaz; private README içeriği istenmez. Boş dosya `found` ve boş metin olarak korunur. `found`, dosyanın okunabildiğini belirtir; boş olmama kontrolü veya GitHub profilinde gerçekten gösterilme iddiası değildir. GitHub'ın gösterim koşulları ayrıca içerik gerektirir; eski repolarda elle paylaşım koşulu da vardır. [Resmi profil README koşulları](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

REST/core ve GraphQL primary limitleri ayrı kaydedilir. Yalnız kısıtlanan kaynak durur; secondary veya kaynağı belirsiz limit iki API'yi de durdurur. Header yokluğu önceki bilinen primary bilgiyi silmez. Gerçek reset geçmişse eski bakiye engeli kaldırılır; reset bilinmiyorsa zaman uydurulmaz. GraphQL HTTP 200 rate-limit hataları da kayda işlenir. Pinned GraphQL primary limiti REST aday erişimini engellemez; secondary limiti başka API üzerinden aşmaya çalışan fallback yoktur. [GitHub API limit kaynakları](https://docs.github.com/en/rest/rate-limit/rate-limit), [secondary limitler](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api).

EnessCansever üzerinde profil/pinned/adaylar/profil ve proje README erişimi gerçek adapter ile doğrulandı. Bu opt-in smoke kontrolü npm test/CI içinde çalışmaz; geçici çalıştırıcı kaldırıldı. Ana sayfa gerçek profil ve repo seçimine bağlıdır; sonraki analiz adımı henüz açık değildir. Güncel kapsam ve kontrol sonuçları [STATUS](docs/STATUS.md) içinde.

## A2.2 yerel akış ve yayın sınırı

Ana sayfada kullanıcı adı veya desteklenen URL'yi girip Enter/“Projelerimi getir” ile gönderin. Alan hatası ve gerçek pending gösterilir; aynı pending işlem için çift gönderim engellenir. Profil güvenli monogramla gösterilir; uygun pinler, sonra son güncellenen adaylar üçe kadar ön seçilir. Pinned unknown bilgisi gizlenmez; 100 aday sınırı bildirilir. Hatalarda “Yeniden dene” gerçek işlemi tekrarlar. Kullanıcıya ham API/Error veya token bilgisi verilmez.

Server Action girdisi en fazla 256 UTF-8 byte; Next Server Action body sınırı 8 KiB'dir. İşlem başına yeni client 20 saniye/40 istek sınırını korur ve kullanıcı seçim yaparken tutulmaz. Eski arama yanıtı istemcide atılır; başlamış sunucu isteğinin iptal edildiği garanti edilmez. Kalıcı/dağıtık abuse, throttle ve cache henüz yoktur. **Bu akış yalnız yerel geliştirme/inceleme içindir; public deployment'a hazır değildir ve yayın yapılmadı.**

Kontroller: `npm test` gerçek GitHub/token gerektirmez. Gerçek form kontrolü açık opt-in yerel tarayıcı incelemesidir; CI otomatik canlı istek yapmaz. Güncel yerel/uzak sonuç ayrımı STATUS'tadır.

## Developer ID görünümü

Ana sayfa ve ortak demo kimlik kartı, docs/design/developer-id-concept.png yönünü izler. Kategoriler/puanlama değişmedi; gerçek profile henüz skor verilmez. Barlow Condensed, Manrope ve IBM Plex Mono yerel next/font/local ile kullanılır; Türkçe glyph desteği kontrol edildi, SIL OFL lisansları [font dizininde](src/app/fonts/README.md) tutulur. Font servisi veya hareket bağımlılığı eklenmedi. CSS hareketleri reduced-motion tercihinde kaldırılır. Güncel görsel kurallar ve kullanıcı kabul durumu DESIGN/STATUS içindedir.
