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

## Uygulamadan önce netleştirilecek ayrıntılar

- TR/EN başlık alias listelerinin tam içeriği ve demo olarak işaretlenmiş bağlantıyı tanıma kuralları henüz yazılmadı; fixture örnekleriyle görünür biçimde tanımlanmalı.
- Check şemasında not_applicable var; hangi puanlanan kontrolde kullanılacağı ve aritmetiğe etkisi tanımlı değil. Sessizce payda değiştirilmemeli; ihtiyaç doğarsa karar netleştirilmeli.
- “Gizli Cevher” için profil sunumundan bir fail koşulunun kategori/check eşlemesi uygulama öncesi açık hale getirilmeli. Ağırlık veya etiket önceliği kendiliğinden değiştirilemez.
- Öncelikli üç görevin sıralama/eşitlik kuralları henüz ayrıntılandırılmadı.

Bu maddeler yeni ürün kararı veya uygulanmış algoritma değildir.
