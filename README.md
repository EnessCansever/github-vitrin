# RepoVitrin

Geliştirme aşamasındaki GitHub portfolyo sunumu değerlendirme projesi. TR/EN ana sayfa ve açıkça kurmaca `/demo`, `/demo/select`, `/demo/states` ekranları kullanıcı görsel kabulünü aldı. A2’nin ilk bölümünde sunucu GitHub adapter’ı ve testleri eklendi; arayüze bağlı gerçek analiz, puanlama motoru, veri saklama ve paylaşım henüz yok.

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

TR/EN seçimi aynı sayfada kalır ve dil tercihi cookie’de saklanır. Repo seçimi bu dil değişiminde korunur; devam eylemi yalnız durum örneklerini açar, yeni analiz veya puan üretmez. Kullanıcı adı alanı analiz başlatmaz; demo eylemi her zaman aynı kurmaca profile gider.

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

Bu bölüm henüz arayüzden tetiklenmez; public API veya debug endpointi yoktur. EnessCansever için mevcut adapter ile gerçek public bağlantı smoke kontrolü yapıldı; güvenli sonuçlar [STATUS](docs/STATUS.md) içinde.

GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens altında süreli bir token oluşturun. Yalnız public veri için **Public repositories** erişimini seçin; ek hesap, yazma veya özel repo izinleri vermeyin. Fine-grained tokenlar public repolara okuma erişimi içerir. Classic tokenın `public_repo` kapsamı yerine bu dar erişimi tercih edin. [Resmi token oluşturma rehberi](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [GraphQL yetkilendirmesi](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql) ve [public README erişimi](https://docs.github.com/en/rest/repos/contents#get-a-repository-readme).

Tokenı kendiniz ignore edilen `.env.local` içindeki `GITHUB_TOKEN` değişkenine ekleyebilirsiniz; paylaşmayın. Adapter modülü import edilirken token okunmaz. Çağrı anında boş/biçimi bozuk token veya GitHub 401 yanıtı `configuration`, diğer yetki sorunları `auth` olur. Build ve deterministik testler bu değeri gerektirmez. Token eklemek mevcut kullanıcı adı alanını gerçek analize bağlamaz.

Bir sunucu işlemi için yeni bir `GitHubClient` oluşturulur; **global singleton olarak saklanmaz**. `getProfile`, `getPinned`, `getCandidates`, `getProfileReadme`, `getSelected` aynı 20 saniye / 40 istek bütçesini paylaşır. En fazla 100 uygun aday tutulur; bu sınırdaki `limited` bayrağı kesilmeyi ihtiyatlı biçimde bildirir. README en fazla 256 KiB, HTTP JSON gövdesi en fazla 1 MiB; içerik kesilmez.

Profil README'si proje adaylarından bağımsızdır: aynı adlı public repoda, varsayılan dalın sabit commit'indeki **kök `README.md`** kontrol edilir. Hatasız GraphQL yanıtında aynı adlı public repo veya kök dosyanın bilinen yokluğu `missing`; auth/ağ/partial ve belirsiz yanıt `unknown` olur. REST 404 tek başına yokluk kanıtı değildir. Arşiv/fork proje filtresi profil README'sine uygulanmaz; private README içeriği istenmez. Boş dosya `found` ve boş metin olarak korunur. `found`, dosyanın okunabildiğini belirtir; boş olmama kontrolü veya GitHub profilinde gerçekten gösterilme iddiası değildir. GitHub'ın gösterim koşulları ayrıca içerik gerektirir; eski repolarda elle paylaşım koşulu da vardır. [Resmi profil README koşulları](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme).

REST/core ve GraphQL primary limitleri ayrı kaydedilir. Yalnız kısıtlanan kaynak durur; secondary veya kaynağı belirsiz limit iki API'yi de durdurur. Header yokluğu önceki bilinen primary bilgiyi silmez. Gerçek reset geçmişse eski bakiye engeli kaldırılır; reset bilinmiyorsa zaman uydurulmaz. GraphQL HTTP 200 rate-limit hataları da kayda işlenir. Pinned GraphQL primary limiti REST aday erişimini engellemez; secondary limiti başka API üzerinden aşmaya çalışan fallback yoktur. [GitHub API limit kaynakları](https://docs.github.com/en/rest/rate-limit/rate-limit), [secondary limitler](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api).

EnessCansever üzerinde profil/pinned/adaylar/profil ve proje README erişimi gerçek adapter ile doğrulandı. Bu opt-in smoke kontrolü npm test/CI içinde çalışmaz; geçici çalıştırıcı kaldırıldı. Gerçek kullanıcı akışı henüz arayüze bağlanmadı. Güncel kapsam ve kontrol sonuçları [STATUS](docs/STATUS.md) içinde.
