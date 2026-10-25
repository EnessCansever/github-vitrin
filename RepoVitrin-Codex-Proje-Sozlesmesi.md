# GitHub Vitrin — Codex Proje Sözleşmesi v1
Tarih: 26 Ekim 2026. Durum: uygulanacak başlangıç kapsamı; henüz uygulama geliştirilmedi.
RepoVitrin çalışma adıdır. Global marka/alan adı kararı bekliyor. Marka adı tek config dosyasından yönetilir.

## 1. Ürün amacı
Junior frontend geliştiricilerinin herkese açık GitHub portfolyosunun sunumunu değerlendirmek, kanıtlı düzeltmeler sunmak ve gelişimi paylaşılabilir kılmak.
Öncelik: fayda → paylaşım → Enes Cansever'in görünürlüğü → CV değeri.
Skor işe alınma ihtimali, kod kalitesi veya kişinin geliştiricilik seviyesi değildir.
Global marka; Türkçe/İngilizce arayüz; ilk dağıtım Türkiye'deki topluluklar ve Instagram.
Başarı: tamamlanan analiz, tekrar analiz, doğrulanan iyileştirme, kart indirme, paylaşım bağlantısından gelen ziyaret. Kart indirme gerçek paylaşım olarak raporlanmaz.

## 2. Sabit v1 kapsamı
- Kullanıcı adı veya github.com/kullanici URL'si.
- Public profil, profil README'si ve 1–3 seçilmiş public, sahibine ait, arşivlenmemiş repo.
- Ön seçim: uygun pinned repolar; eksikse son güncellenen uygun repolar. Seçim arayüzünde kullanıcı değiştirebilir.
- Repo aday listesi sayfalı ve sınırlı: en fazla 100 aday; sınır ve seçili kapsam görünür.
- Forklar/organizasyon repoları v1 değerlendirmesine dahil değil; bu bir yeterlilik yargısı değil kapsam sınırı.
- Kanıtlı bulgular, şeffaf vitrin puanı, profil tipi, öncelikli üç görev.
- TR/EN; rapor dili ve paylaşım dili seçilebilir.
- Mobil sonuç; ilk analiz kartı; uyumlu iki snapshot arasında dönüşüm kartı.
- PNG: story 1080×1920, gönderi 1080×1350; OG/link 1200×630.
- Paylaşılacak rapor kopyası yalnız kullanıcının paylaşım işlemiyle oluşturulur; linki bilen okuyabilir.
- Hesap, ödeme, global sıralama, AI sohbet, otomatik GitHub yazma, ayrıntılı kod kalitesi incelemesi v1 dışı.
- Üç renk teması sonraki sürüm; v1 tek tutarlı tema.
- İlk sürüm AI kullanmaz. Kanıtlardan üretilen TR/EN şablonlar kullanılır.

## 3. Teknik mimari
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

## 4. Veri akışı ve modüller
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

## 5. Puanlama sözleşmesi v1.0.0
Bu ağırlıklar ürün sezgisidir; işe alım başarısıyla bilimsel olarak doğrulanmış değildir. /methodology bunu açıklar.
Üç kategori, toplam 100:
A) Profil sunumu 20:
- boş olmayan bio 5
- geçerli http(s) portfolio/website alanı 5 (erişilebilirlik garantisi değil)
- boş olmayan profil README 10
B) Repo sunumu 30 (seçili repolardaki her kontrolün ortalaması):
- açıklama 10
- en az bir topic 5
- README veya homepage alanında demo olarak işaretlenmiş geçerli http(s) bağlantı 10
- README AST içinde screenshot/görsel referansı 5 (görselin yüklenmesi doğrulanmaz)
C) README incelenebilirliği 50 (seçili repolarda ortalama):
- boş olmayan README 10
- proje amacı bölümü + en az bir açıklayıcı paragraf 10
- kurulum bölümü + en az bir komut/code block 10
- çalıştırma/kullanım bölümü + açıklama veya komut 10
- teknoloji bölümü + liste/paragraf 5
- özellikler bölümü + liste/paragraf 5
Bölüm eşleştirmeleri TR/EN açık alias listesiyle yapılır. Yalnız kelime varlığı yeterli sayılmaz; AST bağlamı ve içerik aranır. İçeriğin doğruluğu veya teknik kalitesi ölçüldüğü iddia edilmez.
Bir repo içindeki sinyaller yalnız ilgili repo için sayılır. Profil README'si proje README kontrollerine karıştırılmaz.
Repo sayısı bonus değildir: 1 iyi repo, 3 iyi repo ile aynı sunum puanını alabilir; analiz kapsamı ayrıca görünür.
Kategori ham puanları hesaplanır; gösterilen kategoriler bir ondalığa yuvarlanır, toplam bunların toplamı olarak bir ondalık gösterilir; tam sayıysa ondalık gizlenir.
Yıldız, takipçi, streak, commit sayısı, hesap yaşı ve açık kaynak katkısı puan getirmez/götürmez.

### Eksik veri ve kanıt
Her check: id, rulesVersion, scope, status(pass/fail/unknown/not_applicable), earned, max, evidence, suggestionKey.
Evidence: repo id/fullName, kaynak GitHub URL'si, incelenen dosya/yol, ref/commit SHA mümkünse, checkedAt, kısa bulgu.
404 yalnız ilgili dosyanın yokluğu güvenilir biçimde doğrulanmışsa fail. Auth, ağ, 403, 429, GraphQL errors/partial, erişim kaybı unknown.
Herhangi bir puanlanan alan unknown ise toplam puan null; bilinen bulgular gösterilir, sonuç "Eksik analiz". Normal puan kartı/gelişim kartı üretilmez; yeniden deneme sunulur.
Repo bulunmaması ayrı boş durumdur, yapay düşük puan verilmez.
"Demo bağlantısı yok" yerine "İncelenen README ve websitesi alanında demo bağlantısı bulunamadı".
Demo linkinin bulunması uygulamanın çalıştığını göstermez; v1 dış URL taraması yapmaz.
Kontrollerin gerçekte neyi ölçtüğü metodoloji sayfasında belgelenir.
Çok uzun README için byte sınırı (256 KiB) konur; kesilmiş veriyle yokluk sonucu çıkarılmaz, unknown üretilir.

### Profil tipleri
Deterministik öncelik:
1. "Vitrini Hazır": toplam >=80 ve tüm seçili repoların demo + kurulum kontrolleri pass.
2. "Demo Nerede?": seçili repoların hiçbirinde demo sinyali bulunmuyor.
3. "Gizli Cevher": repo açıklaması ve amacı bütün seçili repolarda pass; demo/kurulum/profil sunumundan en az biri fail.
4. "Vitrin Yapımda": diğer tam analizler.
Bu isimler sunum karakteridir. "Gizli Cevher" teknik kaliteyi onaylamaz.
"Kurs Arşivi" v1'de kullanılmaz; eğitim projesi olduğu güvenilir şekilde belirlenemiyor.
Her etiket yanında nedenini açıklayan gerçek check referansları bulunur.

## 6. Önce–sonra karşılaştırması
Snapshot immutable: id, githubUserId, loginAtAnalysis, selectedRepoIds, scopeHash, rulesVersion, fetchedAt, status, categoryScores, findings, normalized evidence.
Karşılaştırma: aynı githubUserId + aynı repo seti + aynı rulesVersion + iki tam analiz.
Farklı repo seti/sürüm: karşılaştırma sunma; yeni başlangıç olarak açıkla.
Aynı önbellek kaydı yeni ölçüm veya gelişim değildir.
İyileştirme iddiası: aynı check fail→pass. "2 README düzenlendi" gibi dosya düzenlenme sayısını yalnız check farkından uydurma; "2 repoda kurulum adımları eklendi" gibi doğrulanabilen sinyal değişimi kullan.
Skor aynı/azalmışsa başarı kurgulama. İlk analiz kartı hâlâ paylaşılabilir.
Giriş olmadığı için profil sahipliği doğrulanmaz. Kopyalarda varsayılan "Bu profil" kullan; "Benim profilim" seçimi sahiplik rozeti anlamına gelmez.
Cihaz geçmişi localStorage'da sınırlı erişim kimlikleriyle tutulur; cihazlar arası hesap geçmişi vaat edilmez.

## 7. Depolama, paylaşım ve sınırlar
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

## 8. Tasarım kuralları
Onaylanan son konsept pano görseli docs/design/reference.png olarak kullanıcı tarafından repoya eklenir; yoksa placeholder ile tasarım onaylandı sayılmaz. Bu belge görselin işlevsel eksiklerinde otoritedir.
Koyu ink #0B1020; elektrik mavi #4169FF; kırık beyaz; mint yalnız olumlu değişim/eylem vurgusu.
Tasarım tokenları tek yerde. Marka adı ve Enes bağlantıları tek config.
Mobil önce: 360/390/768/1440 genişlikleri; 320'de yatay taşma yok.
Metin kontrastı normalde >=4.5:1; büyük yazıda >=3:1; görünür focus, klavye, semantic HTML, reduced-motion.
Form input ve butonlar dokunmaya elverişli; küçük metin anlam kaybı yaratmaz. Renk tek anlam taşıyıcısı değildir.
Sonuç sırası: kimlik/tip/puan → neden/kanıt → ilk görev → paylaşım → açılabilir kategoriler/diğer görevler.
Elmas küçük semboldür. Büyük dekorasyon bulguları bastıramaz.
Her puan kategorisinde check ve puan katkıları açılır.
Loading gerçek işlemleri anlatır; yapay ilerleme yüzdesi yok.
Loading, empty, not-found, partial, rate-limited, network-error, success durumları tasarlanır.
TR/EN uzun metin, Türkçe fontlar, uzun kullanıcı adları tüm formatlarda test edilir.
Kartlar ayrı layout'lardır; ekran screenshot'u ölçeklenerek üretilmez.
ImageResponse fontları yerel ve lisansı uygun; CSS destek kısıtları dikkate alınır.
Geliştirici imzası okunur, kullanıcı kimliğine baskın değil. Gerçek Instagram URL'si bilinmiyorsa config'te boş; uydurma link yok.
Görsellerdeki 62,54,81 ve repo bulguları demo fixture'dır, gerçek kullanıcı sonucu değildir.
Gerçek servis hata verince demo verisine sessiz fallback yasak. /demo açık etiketlidir.

## 9. Güvenlik ve operasyon
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

## 10. Codex bağlam protokolü — AGENTS.md'ye aktarılacak kurallar
1. Her yeni oturumda önce AGENTS.md, docs/PRODUCT.md, docs/ARCHITECTURE.md, docs/SCORING.md, docs/DESIGN.md, docs/DECISIONS.md, docs/STATUS.md ve ilgili TASKS maddesini oku; sonra git status/diff incele.
2. Bu başlangıç sözleşmesini ilgili belgelere böl. Başlangıçta tüm maddeler aktarılmalı; kritik kapsam eksiltilmemeli.
3. AGENTS çalışma davranışını, PRODUCT kapsamı, SCORING hesaplamayı, DESIGN görünümü, ARCHITECTURE teknik yapıyı yönetir. Çakışmada karar uydurma; ilgili kısmı netleştir.
4. Sohbet belleği tek kaynak değildir. Her anlamlı değişiklikte ilgili belge ve STATUS güncellenir.
5. STATUS: aktif aşama, tamamlananlar, açık işler, blockers, çalıştırılan testler/sonuçlar, bilinen hatalar ve sıradaki somut adım. "Bitti" kanıt gerektirir.
6. DECISIONS: tarih, karar, gerekçe, etkilediği dosyalar. Büyük kapsam/stack/puanlama/marka değişikliği Enes'in açık kararını gerektirir; rutin uygulama ayrıntıları için sürekli onay isteme.
7. Tek seferde bir doğrulanabilir dikey iş dilimi. Her aşama kriteri geçmeden tamamlandı yazma.
8. Kullanıcının değişikliklerini koru; ilgisiz refactor, dosya silme, dependency ekleme veya tasarım değiştirme yapma.
9. Gizli anahtar okuma/yazdırma yok. Fixture ve gerçek adapter ayrıdır; mock geçişi açık config gerektirir.
10. Gerekli testleri çalıştır; çalıştırılamadıysa nedeni ve kalan komutu kaydet. Başarısızlığı başarı gibi sunma.
11. Koddan sonra ne değişti, nasıl doğrulandı, ne kaldı kısa raporla. Uydurma test, kullanıcı sayısı, başarı metriği ve işveren iddiası yasak.
12. Her aşama için küçük anlamlı commit öner. Kullanıcı yetkilendirdiyse commit at; push/yayın ayrıca kapsam dahilinde olmalı.
13. Scope dışı fikirleri docs/BACKLOG.md'ye yaz; v1 içine sessizce ekleme.
14. Yeni sohbette ilk yanıt: mevcut aşama + kanıta dayalı durum + sıradaki iş. Belgeler kodla çelişiyorsa önce tespit et.
15. Geçmiş kullanıcı onayını tekrar sorma; ama yeni büyük ürün kararını onaylanmış gibi yazma.

## 11. Aşamalar ve kabul kriterleri
A0 Sözleşme/kurulum:
- Belgelere bölme, AGENTS, STATUS, TASKS, repo, env örneği, paket sürümleri, CI.
- typecheck/lint/build çalışır; uygulama henüz tamamlandı sayılmaz.
A1 Tasarım:
- /demo içinde açık örnek verilerle ana sayfa, repo seçimi, mobil sonuç, kanıt/accordion, tüm durumlar, TR/EN.
- 360/390/768/1440 screenshot incelemesi; klavye, kontrast, uzun metin.
A2 GitHub:
- Public adapter, normalize, aday seçimi, pinned fallback, timeout/rate limit/unknown.
- Gerçek public profil smoke testi; eksik token halinde açık kurulum hatası.
A3 Puanlama:
- Saf kurallar + fixture testleri; her bulgunun kanıtı; kategori aritmetiği.
- Unknown ve dil bağımsızlığı, repo sayısı, eksik README, boş hesap, GraphQL partial testleri.
A4 Depolama/karşılaştırma:
- Snapshot, cache, atomik throttle, lock, TTL; uyumlu/uyumsuz karşılaştırma testleri.
- Yenilemenin GitHub verisini gerçekten yeniden aldığı ve cache sonucunu yeni ilerleme saymadığı doğrulanır.
A5 Paylaşım:
- İlk/gelişim PNG, 3 boyut, TR/EN, OG metadata server-rendered.
- Yalnız açık kullanıcı işlemiyle shareReport; expiry/silme; anonim incognito link.
- İndirilen resim gerçek boyutu ve Türkçe karakterleri doğrulanır.
- "İndirildi", "bağlantı kopyalandı", "paylaşım menüsü açıldı" ayrılır; Instagram'a otomatik post iddiası yok.
A6 Yayın kalitesi:
- Kritik Playwright akışları, erişilebilirlik, üretim build, güvenlik/secret taraması.
- Gerçek hesaplarda manuel doğruluk kontrolü; bilinen sınırlar.
- README: kurulum, mimari, scoring gerekçesi, testler, ekranlar, demo.
- Yayın yetkisi varsa deploy/smoke; yoksa deploy için somut hazır paket.
A7 Dağıtım:
- Küçük kullanıcı denemesi, bulgu doğruluğu ve paylaşım deneyimi geri bildirimi.
- Anonim aggregate ölçümler; gerçek veriye dayanan CV anlatımı. Trafik gelmeden "viral" sonucu çıkarılmaz.

## 12. Başlangıç promptu
Bu belgeyi projenin başlangıç sözleşmesi kabul et. Önce repoyu ve varsa mevcut AGENTS.md'yi incele; kullanıcı değişikliklerini koru. Bu belgenin kapsamını kaybetmeden AGENTS.md ile docs/PRODUCT.md, ARCHITECTURE.md, SCORING.md, DESIGN.md, DECISIONS.md, TASKS.md, STATUS.md ve BACKLOG.md dosyalarını oluştur. Çalışma adı RepoVitrin, nihai marka kararı bekliyor.
A0 ve A1'i uygula: Next.js/TypeScript kurulumunu ve açıkça demo olarak etiketlenen mobil öncelikli TR/EN arayüzü hazırla. Gerçek GitHub entegrasyonu tamamlanmış gibi gösterme. Eklenen görseli referans al; metin ve kurallar için bu belgeyi esas al. Koddan önce kısa uygulama sırası bildir, sonra çalış. Sonunda kontrolleri, ekran görüntüsü incelemesini, eksikleri ve sıradaki aşamayı STATUS'a yaz. Bir sonraki aşamaya geçiş için somut durum raporu ver; yeni özellikler ekleme.

## 13. Oturum devam promptu
AGENTS.md ve orada belirtilen proje belgelerini oku, git status/diff ile gerçek durumu kontrol et. docs/STATUS.md'deki son tamamlanan aşamayı doğrula; sıradaki eksik işi sözleşme sınırlarında uygula. Çelişki varsa tahmin etme. İlgili testleri çalıştır ve STATUS/TASKS/karar kayıtlarını güncelle.

## 14. Resmi teknik referanslar
- https://nextjs.org/docs/app/getting-started/route-handlers
- https://nextjs.org/docs/app/api-reference/functions/image-response
- https://www.mongodb.com/docs/drivers/node-frameworks/next-integration/
- https://docs.github.com/en/graphql/reference/users
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api

Bağlam kaybının sıfır olacağı garanti edilemez. Bu dosyalar, küçük iş dilimleri ve testler; yeni oturumun durumu yeniden kurmasını ve sapmaların erken fark edilmesini sağlar.

