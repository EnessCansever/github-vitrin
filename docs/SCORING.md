# Puanlama ve kanıt

Kaynak: [GitHub Vitrin — Codex Proje Sözleşmesi v1](../RepoVitrin-Codex-Proje-Sozlesmesi.md), 26 Ekim 2026. Aşağıdaki gereksinimler hedef davranıştır; uygulandıkları anlamına gelmez.

## Puanlama sözleşmesi v1.0.0
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

## Saflık ve karşılaştırma

Puanlama fonksiyonu normalize edilmiş girdi ve kural sürümü alır; ağ, veritabanı, saat veya AI çağırmaz. Aynı girdi ve aynı kural sürümü aynı sonucu verir; dil puanı değiştirmez. checkedAt gibi kanıt bilgileri dışarıdan sağlanan verinin parçasıdır. Karşılaştırma yalnız PRODUCT.md içindeki aynı kullanıcı, aynı repo seti, aynı sürüm ve iki tam analiz koşullarıyla yapılır. Cache sonucu yeni gelişim sayılmaz.

## A3 motoru — uygulanmış tespit sınırları (1.0.0)

`src/features/analysis/scoring/engine.ts` içindeki `scoreAnalysis`, adapter'ın normalize edilmiş Profile / Repository / Readme tiplerini alır. Yalnız 1.0.0 desteklenir; bilinmeyen sürüm `unsupported_rules`, sıfır repo `no_repos`, üçten fazla/yinelenen/geçersiz/uygun kapsam dışında repo `invalid_scope` hatasıdır. Repo ID ve büyük/küçük harften bağımsız ad tekilliği kontrol edilir; sahibin ID/login/User türü doğrulanır. Sonuçta sahte boş hesap puanı yoktur.

### Markdown ve bölüm alias'ları

[unified 11.0.5](https://github.com/unifiedjs/unified) + [remark-parse 11.0.0](https://github.com/remarkjs/remark/tree/main/packages/remark-parse), [mdast](https://github.com/syntax-tree/mdast) üretir. Render/çalıştırma eklentisi yoktur. Ham HTML, HTML link/görsel etiketleri ve script içerikleri sinyal sayılmaz. HTML ile karışık paragraf açıklayıcı paragraf sayılmaz. Fenced/indented kodun içindeki başlık metni bölüm oluşturmaz. Markdown dışındaki GFM/MDX gibi uzantılar bu dilimde eklenmedi.

Üst belge düzeyindeki ATX/setext başlıkları eşleştirilir; blockquote/liste içine gömülü başlıklar bağımsız bölüm açmaz. Bölüm, sonraki aynı veya daha üst düzey başlığa kadar sürer; alt başlıkların içeriği dahildir. Eşleştirme tam başlık üzerinden yapılır. Başlangıçtaki dekoratif işaretler ayıklandıktan sonra yalnız `1.`, `2)`, `2.1`, `2.1.` gibi nokta/parantez ve ardından boşluk taşıyan 1–2 haneli sayısal bölüm önekleri çıkarılır; çok düzeyli sayısal gruplar desteklenir. Düz yıl/sürüm sayıları, Roma rakamları, Step/Adım sözcüğü veya `1.Kurulum` gibi boşluksuz önekler keyfi olarak silinmez. Ardından Unicode NFKD, aksan işaretlerinin kaldırılması, ı→i, küçük harf ve harf/sayı dışını boşluğa dönüştürme. Bu normalizasyon hesaplama dilinden bağımsızdır; keyfi substring/fuzzy başlık araması yoktur.

| Kontrol | Sınırlı alias listesi |
| --- | --- |
| Amaç | purpose; about; about the project; overview; amaç; projenin amacı; proje amacı; proje özeti; project purpose; project summary; project overview; bu proje neden var; ne problemi çözüyor; why this project; what problem does it solve; hakkında; proje hakkında; genel bakış |
| Kurulum | installation; install; setup; getting started; kurulum; başlangıç; backend kurulumu; frontend kurulumu; backend installation; frontend installation; backend setup; frontend setup |
| Kullanım | usage; how to use; run; running; development; kullanım; çalıştırma; geliştirme; uygulamayı çalıştır; uygulamayı çalıştırma; run the app; running the app; run the application; running the application |
| Teknoloji | technologies; tech stack; technology stack; built with; teknolojiler; kullanılan teknolojiler; teknoloji yığını |
| Özellikler | features; key features; özellikler; temel özellikler |
| Demo bölümü/link etiketi | demo; live demo; preview; canlı demo; canlı önizleme; önizleme |

Genel soru başlıkları yalnız listedeki tam ifadelerle desteklenir: Bu proje neden var / Ne problemi çözüyor / Why this project / What problem does it solve. Bunlar açıkça projenin gerekçesi/problemine yöneliktir ve yine kendi bölümünde açıklayıcı paragraf gerektirir. Keyfi `<isim> Neden Var?` / `Why does <isim> exist?` kalıbı uygulanmaz; isim nesnesinin gerçekten proje olduğu varsayılmaz. Proje adına özel alias veya repository adına bağlı eşleştirme yoktur.

Numaralandırma yalnız başlık etiketini eşleştirmeye yardımcı olur; AST heading.depth ve bölüm sınırlarını değiştirmez. Örneğin aynı düzeydeki Backend Kurulumu kendi kod bloğuyla değerlendirilebilir; önceki Kurulum bölümüne veya sonraki ilgisiz bölüme içerik taşınmaz. Tanınan bir bölüm dışındaki çalıştırma komutu tek başına usage check'ini geçirmez.

İçerik koşulları:

- Amaç: ilgili bölümde en az üç Unicode harf/sayı sözcüğü içeren paragraf. Bu yapısal eşiktir; açıklamanın doğruluğu/kalitesi ölçülmez. Görsel alt metni veya kod bloğu paragraf yerine geçmez.
- Kurulum: kendi bölümünde dolu fenced/indented kod bloğu (yalnız tek başlık/anahtar kelime değil; boşluk veya kod/komut noktalaması içeren içerik, ayrıca `make`) veya inline komut. Inline komut başlangıçları: npm, npx, pnpm, yarn, bun, git, pip, python, python3, docker, cargo, go, node, deno, dotnet + argüman; `make` veya `./...`; isteğe bağlı `$` öneki. Kodun doğru, güvenli veya çalışır olduğu doğrulanmaz.
- Kullanım: kendi bölümünde açıklayıcı paragraf veya aynı komut/kod koşulu.
- Teknoloji/özellikler: kendi bölümünde en az bir dolu metinli liste maddesi veya açıklayıcı paragraf. `- React` liste olarak geçebilir; tek başına `React` paragrafı geçmez.
- README içeriği: trim sonrası boş değil. Boş `found`, bilinen boş içeriktir; `missing` ile aynı fail puanını alır, kanıtta `availability: found` / `missing` ayrımı kalır. Profil README'sine proje bölüm kontrolleri uygulanmaz.

### Bağlantı ve görsel tespiti

README linki yalnız yukarıdaki demo sözcük/ifadelerinden biri linkin kendi etiketinde sözcük sınırlarıyla bulunuyorsa veya demo bölümünün içindeyse demo sinyalidir. Yakındaki sıradan metinde “demo” yazması, ilgisiz doküman linki veya kullanılmayan link tanımı yeterli değildir. Homepage metadata alanındaki geçerli HTTP(S) proje sitesi bağlantısı bu alana açıkça atanmış site sinyali olarak kabul edilir; URL adından uygulama türü/çalışırlık çıkarılmaz. Profil website alanı repo demosuna karışmaz.

Inline ve referans linkleri/görselleri mdast definition/identifier üzerinden çözülür. Linkler mutlak HTTP(S), hostname içeren, credential/boşluk/kontrol karakteri içermeyen URL olmalıdır. javascript/data/ftp ve protocol-relative linkler kabul edilmez. Görsellerde buna ek olarak repo içi göreli/root-relative yol kabul edilir; scheme, protocol-relative, boş/yalnız anchor, whitespace/control veya ters bölüyle başlayan yol reddedilir. Yalnız Markdown görsel referansı ölçülür: badge de bu yapısal koşulu sağlayabilir; görselin screenshot olduğu, yüklendiği veya hedefin güvenilir/erişilebilir olduğu iddia edilmez. Dış site fetch edilmez.

### Sonuç, eksik veri ve kanıt

Sabit check ID'si `profile:{githubId}:{rule}` veya `repo:{githubId}:{rule}` biçimindedir. Her check kural sürümü, kategori, scope, durum, repo başına earned/max, evidence ve suggestionKey taşır. Kategori katkısı repo check'lerinin toplamının seçili repo sayısına bölünmesidir. Evidence alanları: güvenli sabit GitHub kaynak linki, repo ID/fullName, metadata field veya gerçek README path, varsa branch ve dosyanın **Blob SHA** bilgisi, AST satırı/kısa alıntı, availability/hata kodu ve detailKey. Blob SHA commit SHA gibi kullanılmaz; blob linki branch üzerinden kurulur ve dalın sonradan değişebileceği bilinir. Adapter commit SHA sağlamadığında motor uydurmaz. checkedAt yalnız girdide varsa taşınır; saat üretilmez.

README unknown ise ona bağlı kontroller unknown/earned=null olur; description/topics gibi bilinen metadata korunur. Geçerli homepage varsa demo kontrolü README unknown olsa da pass olabilir; OR koşulunu bilinen pozitif kanıt sağlar. Etkilenen kategori rawScore/score=null, toplam null, status=incomplete ve profileType=null olur; başka tam kategoriler sayısal kalabilir. 256 KiB UTF-8 byte üstü found girdi de kesilmeden unknown/too_large olur. Error nesnesi çıktı içine taşınmaz; yalnız güvenli adapter kodu taşınır.

`not_applicable` sonuç tipi sözleşmesinde tutulur, fakat 1.0.0 hiçbir puanlanan kontrolde üretmez; payda/ağırlık değişmez. Bu durumun ileride kullanımı ve aritmetiği hâlâ açık ürün kararıdır.

### Profil tipi ve öneri sırası

Yukarıdaki profil tipi öncelikleri aynen korunur. Hazır eşiği gösterilen toplam üzerinden >=80'dir. “Profil sunumundan en az biri fail”, bio / website / profileReadme kontrollerinden birinin fail olmasıdır. Yalnız tam analizde tip üretilir; etiketin dayandığı gerçek check ID'leri yanında taşınır. Vitrini Hazır için puan eşiğini destekleyen pass kontrolleri; Demo Nerede için demo fail'leri; Gizli Cevher için açıklama/amaç pass ve ilgili fail'ler; Vitrin Yapımda için fail kontrolleri referans olur.

En fazla üç görev yalnız fail check'lerden üretilir. Profil görevinin rawImpact değeri max; repo görevininki max / seçili repo sayısıdır. Sıralama ham etki azalan, eşitlikte bio → website → profileReadme → description → topics → demo → image → readme → purpose → install → usage → technology → features, sonra GitHub repo ID artandır. Input sırası sonucu değiştirmez. Aynı scope/check tekrar etmez.

README yok/boş ise purpose/install/usage/technology/features/image görevleri ayrıca yığılmaz; temel README görevi kalır. Description/topics ve homepage üzerinden de giderilebilen demo eksikliği bağımsızdır. README yazma görevi diğer bütün eksikleri kendiliğinden gideriyor gibi puanlanmaz. Unknown için içerik düzeltme görevi yoktur; kısmi analizde bilinen fail görevi korunabilir. `rawImpact`, o check'in fail→pass kazanımıdır; `categoryImpact` tam kategoride gösterilen yuvarlanmış kategori farkını verir, eksik kategoride null'dır; eksik toplamı sayısal vaat etmez.

TR/EN kısa eylemler `Scoring.suggestions`, kanıt açıklamaları `Scoring.evidence` mesaj alanlarında ayrı tutulur. Motor yalnız anahtar/scope/kanıt üretir; locale almaz, kullanıcıya teknik ayrıntıları eylem metni olarak yığmaz. Bu alanlar henüz gerçek sonuç UI'ına bağlanmadı.

### Bulgu dili ve tespit sınırlaması

Dolu found metinde bir başlık/içerik eşleşmesi kurulamaması, içeriğin kesin yokluğu değildir. İlgili `rule.fail` kanıt metni “bu tarama … eşleştiremedi; başka başlık/bölüm/biçimde bulunabilir” der. Görev metni mevcut içeriği Amaç / Kurulum / Kullanım / Teknolojiler / Özellikler başlığı altında **ekle veya düzenle** seçeneğini kapsar; demo/görsel görevi işaretleme veya desteklenen biçime düzenlemeyi de kapsar.

Doğrulanmış dosya yokluğu için ortak `readme.missing`, bilinen boş found dosya için `readme.empty` kullanılır; bu iki mesaj eşleşme sınırından ayrı kesin veri durumunu açıklar. Unknown yine ilgili `rule.unknown` ve null puanla korunur. Bu ayrım yalnız evidence.detailKey/metin dilini daraltır; kontrol durumlarını, missing/unknown anlamını veya earned/max hesabını değiştirmez. Dolu ama tespitte eşleşmeyen içerik fail olarak kalır; sırf başlık tanınmadı diye erişim unknown'una çevrilmez.

A3 motoru henüz commitlenmemiş/yayımlanmamış olduğundan bu iyileştirme aynı 1.0.0 paketinin parçasıdır. Tespit kodunun önce/sonra farkı geliştiricinin portfolyo gelişimi sayılmaz; yayındaki sürüm/snapshot karşılaştırması için ayrı sürüm değerlendirmesi gerekir.

## A1 örnek fixture — motor değildir

`src/features/analysis/demo.ts`, kurmaca mira-sample profili ve paper-lantern / quiet-orbit repoları için statik UI verisidir. Gerçek README, AST, GitHub kaynağı veya zaman damgası üretildiği iddia edilmez; tüm kanıtlar örnek olarak etiketlenir. 1.0.0 kural sürümüne göre hazırlanmış 23 check vardır; ağırlıklar değişmedi.

| Kategori | paper-lantern | quiet-orbit | Gösterilen kategori |
| --- | --- | --- | --- |
| Profil | Ortak profil: bio 5 + website 0 + profil README 10 | Aynı profil | 15/20 |
| Projeler | Açıklama 10 + topic 5 + demo 0 + görsel 0 = 15 | 10 + 5 + 10 + 5 = 30 | (15 + 30) / 2 = 22,5/30 |
| README | 10 + 10 + 10 + 10 + 5 + 5 = 50 | README 10 + amaç 10 + kurulum 0 + kullanım 0 + teknoloji 5 + özellik 5 = 30 | (50 + 30) / 2 = 40/50 |

Toplam: **15 + 22,5 + 40 = 77,5/100**. EN arayüzünde yalnız sayı biçimi 77.5 olarak değişir. Gizli Cevher: iki repo açıklaması ve amacı pass, en az bir demo/kurulum/profil kontrolü fail; hiçbir-demo-yok koşulu oluşmaz ve toplam 80 altında kalır. Etiketin nedenleri ekranda açıklanır. Seçilen ilk görev ve diğer iki görev fixture'a ait editoryal sıradır; fixture bu tur değiştirilmedi. Gerçek motor eşit 5 puanlık etkide sabit kontrol sırasıyla website → paper-lantern demo → quiet-orbit install önerir. Bu, puan farkı değildir.

A3 testleri, fixture'daki 23 check'i karşılayan ayrı sentetik Markdown girdisiyle 15/22,5/40 kategorilerini, 77,5 toplamını ve Gizli Cevher tipini doğrular. UI fixture gerçek README içermez; bu test mevcut check aritmetiğine eşdeğerliği gösterir, canlı kaynak doğrulaması değildir. Fixture dosyası ve puanları korunur.
