# RepoVitrin

RepoVitrin, bir ziyaretçinin GitHub profilinden projeleri ne kadar kolay tanıyabileceğini, kurulum adımlarını bulup örneklerini deneyebileceğini değerlendirir. Puan **portföy sunumunu** ölçer. Kod kalitesi, geliştirici yetkinliği ve işe alınma olasılığı değerlendirmenin kapsamı dışındadır.

[Canlı uygulama](https://github-vitrin.vercel.app) · [Örnek rapor](https://github-vitrin.vercel.app/demo) · [Metodoloji](https://github-vitrin.vercel.app/methodology) · [Gizlilik](https://github-vitrin.vercel.app/privacy)

## Profil aramasından rapora

1. GitHub kullanıcı adını veya profil adresini gir. İncelenen hesaba ait, herkese açık, arşivlenmemiş ve fork olmayan 1–3 proje seç.
2. Raporda **Profil (20), Projeler (30) ve README (50)** puanlarını, kontrol edilen kaynakları ve en fazla üç öncelikli öneriyi incele. Proje puanları seçimin ortalamasına dayanır. Bir kontrol için veri alınamazsa bilinen bulgular korunur, toplam puan ve profil tipi gösterilmez.
3. Aynı profil, repo kümesi ve kural sürümü için tam analiz 15 dakika boyunca yeniden kullanılabilir. GitHub verileriyle yenilemek ayrı bir ölçüm üretir. İki uyumlu tam raporda puan ve kontrol değişimleri karşılaştırılabilir. Aynı önbellek sonucunu açmak ikinci ölçüm sayılmaz.

Arayüz Türkçe ve İngilizcedir. Sabit örnek profille [proje seçimini](https://github-vitrin.vercel.app/demo/select) ve [yüklenme, hata ve eksik analiz ekranlarını](https://github-vitrin.vercel.app/demo/states) gerçek istek başlatmadan inceleyebilirsiniz.

## Rapor erişimi ve paylaşım

- **Özel rapor** 30 gün geçerlidir. Okuma anahtarını içeren tam bağlantıya sahip kişi raporu açabilir. Sayfayı yenilemek veya dil değiştirmek kayıtlı sonucu gösterir. Tarayıcı geçmişinde son 10 özel raporun erişim bilgileri tutulabilir.
- **Herkese açık paylaşım** açık onayla oluşturulan, bağımsız 90 günlük salt okunur bir özettir. Özel rapor anahtarı ve cihaz geçmişi paylaşılmaz. Ayrı yönetim bağlantısıyla public erişim kalıcı olarak kapatılabilir veya public kopya silinebilir. Özel rapor kendi süresini korur.
- **PNG kartları** tam rapordan veya uyumlu iki raporun karşılaştırmasından önizlenip indirilebilir. Story 1080×1920, gönderi 1080×1350, yatay 1200×630 pikseldir. Aktif, tam public paylaşımın ayrıca OG/Twitter bağlantı önizlemesi vardır. Paylaşımı kapatmak, önceden indirilen dosyaları veya sosyal platformların sakladığı önizlemeleri geri almaz.

## Teknoloji ve mimari

Next.js App Router, React, strict TypeScript ve next-intl arayüzü oluşturur. Sunucu GitHub REST/GraphQL üzerinden veriyi alır ve Zod ile doğrular. Saf puanlama motoru Markdown yapısını unified ve remark-parse ile inceler. Demo sitelerine istek göndermez ve README’deki komutları çalıştırmaz. MongoDB native driver raporları, süreli önbellekleri, kota sayaçlarını ve analiz kilitlerini yönetir. PNG’ler next/og ve yerel fontlarla üretilir.

[Mimari ve işlem sınırları](docs/ARCHITECTURE.md) · [Puanlama kuralları ve tespit sınırları](docs/SCORING.md) · [Tasarım](docs/DESIGN.md) · [Font lisansları](src/app/fonts/README.md)

## Yerel kurulum

Node.js **22.13.0** ve npm **10.9.2** kullanılır. nvm ile proje sürümü `nvm use` komutuyla seçilebilir.

```sh
npm ci
npm run dev
```

[Yerel ana sayfa](http://localhost:3000) ve [kurmaca demo](http://localhost:3000/demo) bu sunucuda açılır. Demo ve build için gizli değer gerekmez. Gerçek arama ve analiz için [.env.example](.env.example) içindeki adları Git tarafından yok sayılan `.env.local` dosyasında tanımlayın, ardından sunucuyu yeniden başlatın.

| Sunucu değişkeni | Kullanımı |
| --- | --- |
| `GITHUB_TOKEN` | Yalnız herkese açık depoları okuyabilen, süreli fine-grained GitHub tokenı. |
| `MONGODB_URI` | İşlemleri (transactions) destekleyen geliştirme replica seti veya Atlas bağlantısı. |
| `MONGODB_DB` | Hedef veritabanı adı. Uygulama kullanıcısı yalnız bu veritabanında `readWrite` yetkisi gerektirir. |
| `SIGNING_SECRET` | Kota anahtarları ve anonim oturum imzaları için en az 32 baytlık rastgele sır. Aynı ortamın sunucu süreçlerinde ortak kullanılır. |
| `SITE_URL` | Public önizlemelerin mutlak adresleri için ortamın HTTPS origin’i. Yerel geliştirmede varsayılan `http://localhost:3000`. |

Production ayrı Atlas projesindeki `repovitrin_prod` veritabanını kullanır. Vercel’de Production ve Preview için MongoDB bağlantısı ve veritabanı adı ayrı tanımlıdır. Yerel geliştirmede geliştirme veritabanını kullanın. Korunan işlemler geliştirmede ortak kota kimliği, dağıtımda doğrudan Vercel ingress bilgisi kullanır. [GitHub token kurulumu](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) · [Atlas veritabanı kullanıcıları](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/)

## Doğrulama

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

Vitest puanlama, erişim, kota ve saklama davranışlarını kontrollü verilerle sınar. Playwright için Bash, OpenSSL, yerel `mongod` veya çalışan Docker ve boş 3197/37917 portları gerekir. Build sonrasında:

```sh
npx playwright install chromium
npm run test:e2e
```

Kurulu Chrome ile `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` de kullanılabilir. E2E senaryosu geçici bir MongoDB replica seti ve kontrollü GitHub yanıtlarıyla arama, seçim, analiz, yenileme, karşılaştırma, PNG indirme ve ayrı anonim oturumdan paylaşım erişimini sınar. CI bu kontrolleri uygulama sırları olmadan çalıştırır.

Canlı Chrome kontrolünde üç PNG biçimi beklenen boyutlarda açıldı. İki ayrı paylaşımda kapatma ve silme sonrasında aynı anonim sayfa raporu göstermedi ve önceden yüklenen OG adresi 404 döndü. Fiziksel telefon, ekran okuyucu ve gerçek sosyal platform önizlemesi açık kontrollerdir. [Doğrulama kayıtları](docs/STATUS.md) · [Kalan yayın işleri](docs/TASKS.md)
