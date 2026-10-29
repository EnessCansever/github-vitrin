# RepoVitrin

Geliştirme aşamasındaki GitHub portfolyo sunumu değerlendirme projesi. Ana sayfa kullanıcı adı veya desteklenen GitHub profil URL'siyle gerçek public profili ve uygun repo adaylarını getirir; 1–3 proje seçilebilir. **Sunumu analiz et**, sunucuda puan ve kanıt üretip snapshot kaydeder; başarılı kayıt 30 günlük tokenlı rapor adresinde açılır. `/demo`, `/demo/select`, `/demo/states` kurmaca örnekler olarak ayrıdır. A4.1 f81b46c uzak CI başarısı kullanıcı ekran görüntüsüyle doğrulandı; yeni A4.2 rapor görünümü kullanıcı incelemesini bekler.

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

TR/EN aynı sayfada kalır ve dil cookie'de tutulur. Gerçek seçim aynı ana sayfada açılır; dil değişimi yeni GitHub isteği göndermez ve seçimleri korur. Yeni aramada eski profil/seçimler temizlenir; geç eski yanıt yeni aramayı ezmez. Sunucuda kimlik/kapsam yeniden doğrulanır, README verileri saf motora verilir ve rapor kaydedilir. Eksik analizde toplam/tip hesaplanmaz, bilinen kategoriler görünür. Kaydedilen rapor adresinde tam yenileme snapshot'ı okur; GitHub veya puanlama çalışmaz. Kaydedilemeyen sonuç ve henüz tamamlanmamış seçim yalnız mevcut sayfa oturumundadır. Cache/cihaz geçmişi yoktur; demo ayrı kurmaca profile gider.

Demo ekranları, testler ve build için secret gerekmez. `.env.example`, `GITHUB_TOKEN`, `MONGODB_URI`, `MONGODB_DB` ve `SIGNING_SECRET` isimlerini boş değerlerle belgeler. Gerçek analiz için GitHub tokenı, kayıt/okuma için MongoDB değişkenleri gerekir; yalnız çağrı anında sunucuda okunur. MongoDB yoksa hesaplanmış sonuç korunur ama kayıtlı link oluşturulamaz. `SIGNING_SECRET` henüz kullanılmaz. Gerçek değerleri Git’e veya `NEXT_PUBLIC_` değişkenlerine eklemeyin.

## Kontroller ve production çalıştırma

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

`typecheck`, temiz kurulumda önce `next typegen` ile Next.js tiplerini üretir, sonra TypeScript kontrolünü çalıştırır. `lint` ESLint CLI kullanır. `build` lint yerine geçmez. `npm test`, Vitest ile girdi, kapsam, sayfalama, README, hata ve bütçe davranışlarını sahte HTTP yanıtlarıyla doğrular; gerçek GitHub isteği veya token gerektirmez. Ayrıca saf puanlama, Markdown AST, unknown ve öneri davranışları ağsız test edilir. Gerçek analiz Server Action doğrulaması/DTO’su ve React sunucu render’ıyla complete/incomplete sonuç sunumu da test edilir. Playwright/DOM test bağımlılığı kurulmadı; gerçek tarayıcı kontrolleri yerel incelemedir.

GitHub Actions, push ve pull request üzerinde `npm ci`, test, lint, typecheck ve build çalıştıracak şekilde tanımlıdır; uygulama secret'ı gerektirmez. Yerel kontrol sonuçları uzak CI sonucu değildir; güncel doğrulama durumu [STATUS](docs/STATUS.md) içindedir.

## Yapı

- `src/app`: App Router ana sayfa, demo, ortak layout ve merkezi CSS tasarım tokenları.
- `src/components`: ortak marka, dil seçimi ve geliştirici imzası.
- `src/i18n`, `src/messages`: next-intl istek/dil ayarları ve TR/EN metinleri.
- `src/features/analysis/demo.ts`: sabit kurmaca örnek; puanlama motoru değildir.
- `src/features/analysis/scoring`: sunucu analiz akışından çağrılan saf puanlama motoru; rulesVersion 1.0.0, Markdown AST ve kanıt/öneri çıktısı. Kurallar ve tespit sınırları [SCORING](docs/SCORING.md) içinde.
- `src/lib/github`: server-only public adapter, Zod doğrulama, normalize edilmiş veri ve tipli hatalar; mevcut Server Action profil/aday erişimini kullanır.
- `src/lib/db`: server-only MongoDB native driver havuzu, snapshot şeması ve create/read fonksiyonları; analyze sunucuda ürettiği raporu bu katmana verir.
- `src/features/reports`, `src/app/reports/[id]`: tokenlı snapshot okuma action'ı, rapor adresi, kopyalama ve güvenli erişim durumları.
- `src/features/analysis/{live-analysis,live-report,report}`: geçici analiz state’i, güvenli sonuç DTO’su ve sonuç sunumu.
- `tests/github`, `tests/scoring`, `tests/analysis`, `tests/db`: ağ kullanmayan adapter/action/motor, sonuç render ve sahte DB ile snapshot/bağlantı davranış testleri. Sahte DB testleri gerçek MongoDB entegrasyon kanıtı değildir.
- `src/config/site.ts`: çalışma markası ve geliştirici bağlantı bilgileri. Bilinmeyen Instagram adresi boştur.
- `docs`: ürün, mimari, puanlama, tasarım ve aşama kayıtları.

Tam paket sürümleri `package.json` ve `package-lock.json` içinde kilitlidir. Yalnız npm kullanılır. Çalışma kuralları [AGENTS.md](AGENTS.md), sıradaki işler [TASKS](docs/TASKS.md) içindedir.

## GitHub bağlantısını hazırlama

Gerçek profil/aday erişimi ana sayfadaki “Projelerimi getir” eylemiyle tek Server Action üzerinden tetiklenir; aynı iş için Route Handler veya debug endpointi yoktur. EnessCansever için mevcut adapter ile gerçek public bağlantı smoke kontrolü yapıldı; güvenli sonuçlar [STATUS](docs/STATUS.md) içinde.

GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens altında süreli bir token oluşturun. Yalnız public veri için **Public repositories** erişimini seçin; ek hesap, yazma veya özel repo izinleri vermeyin. Fine-grained tokenlar public repolara okuma erişimi içerir. Classic tokenın `public_repo` kapsamı yerine bu dar erişimi tercih edin. [Resmi token oluşturma rehberi](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [GraphQL yetkilendirmesi](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql) ve [public README erişimi](https://docs.github.com/en/rest/repos/contents#get-a-repository-readme).

Tokenı kendiniz ignore edilen `.env.local` içindeki `GITHUB_TOKEN` değişkenine ekleyebilirsiniz; paylaşmayın. Adapter modülü import edilirken token okunmaz. Çağrı anında boş/biçimi bozuk token veya GitHub 401 yanıtı `configuration`, diğer yetki sorunları `auth` olur. Build ve deterministik testler bu değeri gerektirmez. Token, sunucuda public profil/aday ve seçili README erişimini sağlar. Analiz yalnız kullanıcının Sunumu analiz et veya yeniden veri al eylemiyle başlar; dil değişimi analiz çağırmaz.

Bir sunucu işlemi için yeni bir `GitHubClient` oluşturulur; **global singleton olarak saklanmaz**. `getProfile`, `getPinned`, `getCandidates`, `getProfileReadme`, `getSelected` aynı 20 saniye / 40 istek bütçesini paylaşır. En fazla 100 uygun aday tutulur; bu sınırdaki `limited` bayrağı kesilmeyi ihtiyatlı biçimde bildirir. README en fazla 256 KiB, HTTP JSON gövdesi en fazla 1 MiB; içerik kesilmez.

Profil README'si proje adaylarından bağımsızdır: aynı adlı public repoda, varsayılan dalın sabit commit'indeki **kök `README.md`** kontrol edilir. Hatasız GraphQL yanıtında aynı adlı public repo veya kök dosyanın bilinen yokluğu `missing`; auth/ağ/partial ve belirsiz yanıt `unknown` olur. REST 404 tek başına yokluk kanıtı değildir. Arşiv/fork proje filtresi profil README'sine uygulanmaz; private README içeriği istenmez. Boş dosya `found` ve boş metin olarak korunur. `found`, dosyanın okunabildiğini belirtir; boş olmama kontrolü veya GitHub profilinde gerçekten gösterilme iddiası değildir. GitHub'ın gösterim koşulları ayrıca içerik gerektirir; eski repolarda elle paylaşım koşulu da vardır. [Resmi profil README koşulları](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

REST/core ve GraphQL primary limitleri ayrı kaydedilir. Yalnız kısıtlanan kaynak durur; secondary veya kaynağı belirsiz limit iki API'yi de durdurur. Header yokluğu önceki bilinen primary bilgiyi silmez. Gerçek reset geçmişse eski bakiye engeli kaldırılır; reset bilinmiyorsa zaman uydurulmaz. GraphQL HTTP 200 rate-limit hataları da kayda işlenir. Pinned GraphQL primary limiti REST aday erişimini engellemez; secondary limiti başka API üzerinden aşmaya çalışan fallback yoktur. [GitHub API limit kaynakları](https://docs.github.com/en/rest/rate-limit/rate-limit), [secondary limitler](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api).

EnessCansever üzerinde profil/pinned/adaylar/profil ve proje README erişimi gerçek adapter ile doğrulandı. Bu opt-in smoke kontrolü npm test/CI içinde çalışmaz; geçici çalıştırıcı kaldırıldı. Ana sayfa gerçek profil, seçim ve analize bağlıdır; başarılı kayıt tokenlı rapor adresinden açılır, kaydedilemeyen çıktı yalnız sayfa oturumunda kalır. Güncel kapsam ve kontrol sonuçları [STATUS](docs/STATUS.md) içinde.

## A2.2 yerel akış ve yayın sınırı

Ana sayfada kullanıcı adı veya desteklenen URL'yi girip Enter/“Projelerimi getir” ile gönderin. Alan hatası ve gerçek pending gösterilir; aynı pending işlem için çift gönderim engellenir. Profil güvenli monogramla gösterilir; uygun pinler, sonra son güncellenen adaylar üçe kadar ön seçilir. Pinned unknown bilgisi gizlenmez; 100 aday sınırı bildirilir. Hatalarda “Yeniden dene” gerçek işlemi tekrarlar. Kullanıcıya ham API/Error veya token bilgisi verilmez.

Server Action girdisi en fazla 256 UTF-8 byte; Next Server Action body sınırı 8 KiB'dir. İşlem başına yeni client 20 saniye/40 istek sınırını korur ve kullanıcı seçim yaparken tutulmaz. Eski arama yanıtı istemcide atılır; başlamış sunucu isteğinin iptal edildiği garanti edilmez. Kalıcı/dağıtık abuse, throttle ve cache henüz yoktur. **Bu akış yalnız yerel geliştirme/inceleme içindir; public deployment'a hazır değildir ve yayın yapılmadı.**

Kontroller: `npm test` gerçek GitHub/token gerektirmez. Gerçek form kontrolü açık opt-in yerel tarayıcı incelemesidir; CI otomatik canlı istek yapmaz. Güncel yerel/uzak sonuç ayrımı STATUS'tadır.

## Developer ID görünümü

Ana sayfa ve ortak demo kimlik kartı, docs/design/developer-id-concept.png yönünü izler. Kategoriler/puanlama değişmedi; gerçek sonuç ve demo ortak IdentityCard sunumunu kullanır. Eksik sonuçta normal tip/mühür ve sayısal toplam üretilmez. Barlow Condensed, Manrope ve IBM Plex Mono yerel next/font/local ile kullanılır; Türkçe glyph desteği kontrol edildi, SIL OFL lisansları [font dizininde](src/app/fonts/README.md) tutulur. Font servisi veya hareket bağımlılığı eklenmedi. CSS hareketleri reduced-motion tercihinde kaldırılır. Güncel görsel kurallar ve kullanıcı kabul durumu DESIGN/STATUS içindedir.


## A3 gerçek analiz

Ana sayfada profili getir, 1–3 proje seç, **Sunumu analiz et**. Ayrı analyze Server Action'ı yalnız username, profileId ve repo id/name kabul eder; metadata, puan, bulgu veya sürüm kabul etmez. Zod strict seçim doğrulaması, ham username/istek boyutu ve tekrar eden ID/ad kontrolü vardır. Analiz payload'ı 2 KiB, Next body sınırı 8 KiB'dir. Profil ID/login, seçilen repo ID/sahiplik/public/archive/fork kapsamı sunucuda tekrar doğrulanır. Her işlem yeni client kullanır; işlem içindeki çağrılar aynı 20 saniye/40 istek bütçesini paylaşır.

Sonuç checkedAt UTC ve rulesVersion içerir. İstemciye yalnız profil ID/login, motorun puan/kategori/check/tip/görevleri ve güvenli GitHub kaynak alanları döner; tam README, alıntı metni, token, Error veya ham API yanıtı dönmez. İncomplete raporda null toplam/tip korunur; bilinen kontrol/kategoriler kaybolmaz. Kaynaklar yalnız GitHub üzerinde açılır; dış demo siteleri taranmaz. Görevlerin sırası/puan etkisi arayüzde yeniden hesaplanmaz. A3 kullanıcı görsel kabulü ve 5ad54fb uzak CI doğrulaması kullanıcı tarafından sağlandı. Dağıtık abuse/cache/paylaşım/yayın yoktur.

## A4.1 snapshot katmanı ve sonraki yerel kurulum

Yalnız sunucudan `createSnapshot(report)` ve `readSnapshot(id, readToken)` kullanılabilir. A4.2 analyze action'ı bunları kullanır; istemciden rapor/puan kabul edilmez. Demo/test/build MongoDB olmadan çalışır. Gerçek analiz kayıt başarısızlığında sonucu geçici olarak gösterir; başarılı kayıt ayrı tokenlı rapor adresine gider.

Sonraki gerçek entegrasyon kontrolü için kullanıcı kendi MongoDB/Atlas geliştirme veritabanını hazırlayıp ignore edilen `.env.local` dosyasına `MONGODB_URI` ve `MONGODB_DB` değerlerini kendisi eklemelidir. URI `mongodb://` veya `mongodb+srv://`, ayrı DB adı 1–63 ASCII harf/rakam/tire/alt çizgi olmalıdır; varsayılan `test` veritabanı seçilmez. Örnekteki değerler bilinçli olarak boştur. Atlas'ta yalnız ilgili veritabanına `readWrite` yetkili bir database user ve yerel bağlantının IP access list izni yeterlidir; geniş yönetici rolü gerekmez. [Database user kurulumu](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/), [readWrite yetkileri](https://www.mongodb.com/docs/manual/reference/built-in-roles/#readwrite), [IP access list](https://www.mongodb.com/docs/atlas/security/ip-access-list/). URI/parolayı paylaşmayın veya loglamayın; gerçek hesap/secret bu dilimde oluşturulmadı/istenmedi.

Resmi `mongodb` **7.7.0** kullanılır; mevcut Node 22.13.0 desteklenir. [Driver uyumluluğu](https://www.mongodb.com/docs/drivers/compatibility/?driver-language=javascript&javascript-driver-framework=nodejs). Bağlantı import sırasında açılmaz. İlk çağrıda oluşturulan process havuzu sonraki çağrılarda/HMR'da yeniden kullanılır; her istekte kapatılmaz. Bağlantı başarısızsa havuz kaydı temizlenir, sonraki açık çağrı yeniden deneyebilir; kör retry yoktur. Env değişince sunucuyu yeniden başlatın. Eksik/bozuk ayar `configuration`; bağlantı/yetki/operasyon sorunu güvenli `unavailable` verir, URI veya ham DB hatası döndürülmez.

`analysisSnapshots` kaydı immutable'dır: ayrı UUID kimliği, 256-bit rastgele okuma tokenının SHA-256 hash'i, snapshotVersion=1, repo seti/hash'i, createdAt/expiresAt ve mevcut rapor DTO'su. `rulesVersion=1.0.0` bağımsızdır; puanlar, null değerler, kanıt ve öneri sırası korunur, okurken motor çalıştırılmaz. TR/EN için kural/mesaj kimlikleri ve scope parametreleri saklanır; hazır çevrilmiş bulgu metni, token/ham README/API nesnesi saklanmaz. Salt kimlikle erişim yoktur; token yalnız oluşturma sonucunda bir kez verilir ve loglanmamalıdır.

Yazımda `ignoreUndefined:true`, bulunmayan optional kanıt alanlarının driver tarafından null'a çevrilmesini önler; gerçek null puanlar aynen kalır. Ağsız testlerde gerçek BSON dönüşümü de kontrol edilir, ancak bu gerçek veritabanı bağlantısını doğrulamaz.

Sözleşme §7'deki **30 gün TTL** uygulanır: expiresAt=createdAt+30 gün, ilk yazım öncesi idempotent `expiresAt` TTL indeksi kurulur; `_id` MongoDB'nin unique indeksidir. [TTL temizliği gecikebilir](https://www.mongodb.com/docs/manual/core/index-ttl/); okuma ayrıca süreyi kontrol eder. Başka silme politikası/indeks, cache, karşılaştırma veya public paylaşım eklenmedi. Complete ve incomplete kayıtlar ayrı durumlarıyla saklanabilir; incomplete toplam/tip null kalır ve karşılaştırılabilir tam analiz sayılmaz.

29 Ekim 2026 A4.1 opt-in smoke kontrolünde repovitrin_dev Atlas bağlantısı/indeks, complete/incomplete BSON yaz/oku, yanlış token/bulunmayan kimlik ve expiry reddi doğrulandı; o turun üç kaydı temizlendi. A4.2 gerçek analiz → kayıt → rapor → yenileme/dil ve hata/retry kontrolleri [STATUS](docs/STATUS.md) içindedir. Deterministik testler hâlâ sahte driver/collection kullanır; normal test/CI gerçek DB veya secret gerektirmez.

## A4.2 rapor adresleri ve gizlilik

Başarılı analiz `/reports/[id]#token=…` adresine gider. Tam bağlantı 30 gün boyunca raporu okumaya yetkilidir; sayfa veri zamanı ve son geçerliliği gösterir. Tokenı/linkin tamamını loglara, issue'lara veya ekran görüntülerine koymayın. Yeni analiz mevcut snapshot'ı değiştirmez. Sosyal OG/PNG, ayrı shareReports, kullanıcı dizini veya username ile rapor arama yoktur.

Fragment sunucuya URL olarak gitmez; tarayıcı JavaScript'i tokenı doğrulayan okuma action'ının gövdesine aktarır. Rapor sayfası genel noindex/no-referrer metadata ve private/no-store HTTP başlıkları taşır; rapor verisi/URL metadata'ya eklenmez. Tam yenileme ve dil değişimi mevcut snapshot'ı okur/korur, GitHub isteği veya yeni skor üretmez. JS kapalıyken bu fragment erişim akışı çalışmaz. [Fragment davranışı](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment).

“Rapor bağlantısını kopyala” gerçek clipboard sonucunu bildirir; izin/API yoksa readonly alandan elle kopyalama mümkündür. Bağlantıya sahip kişilerin okuyabileceği açıklanır. Geçersiz/eksik/süresi dolmuş erişim ortak güvenli ekran; DB hatası ayrı yeniden deneme ekranıdır. Kayıt başarısızsa hesaplanmış sonuç kaybolmaz; yeniden analiz edip kaydetme yeni GitHub verilerini alır, client raporunu yüklemez. Bu sonuç tam yenilemede kaybolur. Gerçek raporları public deployment'a çıkarma yetkisi/hazırlığı yoktur; dağıtık abuse/cache/lock sonraki kapsamdır.
