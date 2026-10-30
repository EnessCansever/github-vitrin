# RepoVitrin çalışma protokolü

Bu proje junior frontend geliştiricilerinin public GitHub portfolyosunun sunumunu değerlendirir. Skor kod kalitesi, geliştiricilik seviyesi veya işe alınma ihtimali değildir. Kaynak sözleşme: [RepoVitrin-Codex-Proje-Sozlesmesi.md](RepoVitrin-Codex-Proje-Sozlesmesi.md). Kaynak sözleşmeyi ve [referans görselini](docs/design/reference.png) koru.

## Her yeni oturumda bağlamı yeniden kur

1. Önce bu dosyayı; ardından sırasıyla [PRODUCT](docs/PRODUCT.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [SCORING](docs/SCORING.md), [DESIGN](docs/DESIGN.md), [DECISIONS](docs/DECISIONS.md), [STATUS](docs/STATUS.md), [TASKS](docs/TASKS.md) ve ilgili görev maddelerini, [BACKLOG](docs/BACKLOG.md) dosyasını oku. Kaynak sözleşmeyi gerektiğinde karşılaştırma için oku; sohbet belleği tek kaynak değildir.
2. Mevcut dosyaları ve varsa `git status` / `git diff` / `git diff --cached` çıktısını incele. Git yoksa bildir; mevcut yetki olmadan başlatma.
3. İlk durum yanıtında mevcut aşamayı, kanıta dayalı durumu ve sıradaki işi belirt. Belgelerle kod çelişiyorsa önce bunu raporla; durum etiketlerini incelemeden doğrulanmış sayma.

## Belge sorumlulukları

AGENTS çalışma davranışını, PRODUCT kapsamı, ARCHITECTURE teknik yapıyı, SCORING hesaplamayı, DESIGN görünümü yönetir. DECISIONS kararları ve açık konuları, TASKS kabul kriterlerini, STATUS gerçek ilerlemeyi, BACKLOG kapsam dışı fikirleri tutar. Çakışmada karar uydurma; çelişkiyi/uygulanabilirlik sorununu açıkça raporla ve ilgili kısmı netleştir. Görselin işlevsel eksiklerinde kaynak sözleşme geçerlidir.

## İş yapma ve doğrulama

- Tek seferde küçük, doğrulanabilir bir dikey iş dilimi uygula. Kullanıcı mesajı olmadan sonraki aşamaya geçme.
- Güncel yetki **A5.1 — kayıtlı complete rapordan paylaşım kartı önizleme ve Story 1080×1920 / yatay 1200×630 PNG indirme** ile sınırlıdır. A4.2 257acff commit'inin uzak CI başarısı kullanıcının ilettiği Codex public API doğrulamasıdır; bu tur bağımsız doğrulama diye yazma. Kart için mevcut snapshot id/token/expiry kontrolünü tekrar uygula; istemci puanı/raporu kabul etme. Token yalnız fragment ve action gövdesinde kalır; görsel/dosya adı/metadata/query/path/loga koyma. Incomplete kart üretilmez. Preview ile download aynı PNG'yi kullanır; kullanıcı açık eylemle indirir. GitHub/motor/snapshot/TTL/demo değişmez. Yeni public OG/shareReports, üçüncü boyut, karşılaştırma, cache/dağıtık limit veya yayın ekleme. A4'ün ve A5'in bütünü tamamlanmış sayılmaz; yeni görsel kabul ve sonraki dilim açık kullanıcı mesajı gerektirir. 31 Ekim 2026 kullanıcı yetkisi yalnız yatay 1200×630 kartı mevcut Story görsel diline getirmektir. Story tasarımı/çıktısı korunur; aynı girdide önceki renderer ile byte eşitliği doğrulanır. Son uzun EN Story mühür/başlık/footer doğruluğu kullanıcı bildirimi olarak kaydedilir; bu bildirim A5.1 genel görsel kabulü sayılmaz. Ana sayfa/rapor ve mevcut A5.1 işlevleri değişmez. A5.1 için kullanıcı görsel kabulü verilmedi; önceki ajan değerlendirmesi kabul kaydı sayılamaz. Manrope gövde, condensed başlık ve mono kimlik ayrımı korunur.
- Stack, kapsam, puanlama ve tasarım kararlarını kendiliğinden değiştirme. Büyük kapsam/stack/puanlama/marka değişiklikleri Enes'in açık kararını gerektirir; rutin uygulama ayrıntıları için sürekli onay isteme. Geçmiş onayı yeniden sorma; yeni büyük kararı onaylanmış sayma.
- Kullanıcının mevcut dosyalarını/değişikliklerini koru. İlgisiz refactor, silme, dependency ekleme veya tasarım değişikliği yapma.
- Her tamamlanan işte **STATUS.md ve TASKS.md** güncelle; her anlamlı değişiklikte ilgili gereksinim belgelerini de güncelle. Kararları tarih, karar, gerekçe ve etkilenen dosyalarla DECISIONS.md'ye yaz.
- STATUS içinde aktif aşama, tamamlananlar, açık işler, engeller, çalıştırılan kontroller ve sonuçları, bilinen hatalar ve sıradaki somut adım bulunmalı. Tamamlanmamış/doğrulanmamış işi tamamlandı yazma; “bitti” kanıt gerektirir.
- Gerekli testleri çalıştır. Çalıştırılamadıysa nedeni ve kalan komut/kontrolü kaydet. Başarısızlığı başarı gibi sunma. Uydurma test, kullanıcı sayısı, başarı metriği veya işveren iddiası üretme.
- Gizli anahtarları okuma/yazdırma. Fixture ile gerçek adapter ayrı olmalı; mock geçişi açık config gerektirir. Gerçek servis hatasında sessiz demo fallback yasaktır.
- Kapsam dışı fikirleri BACKLOG.md'ye kaydet; v1 içine sessizce ekleme.
- İş sonunda ne değişti, nasıl doğrulandı, ne kaldı kısa raporla. Bu belgeler bağlam kaybını sıfırlama garantisi vermez; küçük iş dilimleri ve kanıtlı kontrollerle sapmalar tespit edilir.

## Git, commit ve aşama geçişi

- **Commit ve push işlemlerini kullanıcı yapar. Otomatik commit/push yapma; dosyaları stage etme.** Kaynak sözleşmenin §10.12 genel commit yetkilendirme kuralını bu oturumun daha dar kullanıcı talimatı sınırlar.
- Her anlamlı aşamanın sonunda commit için hazır olup olmadığını belirt. Hazırsa kapsama uygun kısa bir Conventional Commits mesajı ve dahil edilecek dosyaların açık listesini ver.
- Kontroller başarısızsa düzelt veya engeli açıkça yaz. Hazırlık ile gerçekten commit edilmiş olmayı birbirine karıştırma.
- Kullanıcı **“commit attım, devam”** demeden sonraki aşamaya geçme. Kaynak sözleşmedeki devam promptu otomatik ilerleme izni değildir.
- Push ve yayın yetkisini varsayma. Bu tur hiçbir Git mutasyonu yapılmaz.

## Kalıcı kod standartları

1. Kod sade, okunabilir ve proje ölçeğine uygun olmalı. Gereksiz katman, wrapper, factory, generic yardımcı, soyutlama veya gelecekte lazım olabilir diye altyapı oluşturma.
2. Değişken, fonksiyon, bileşen ve dosya adları İngilizce, anlamlı ve gerektiği kadar kısa olmalı. Tekrarlayan uzun isimlerden kaçın; kısaltma uğruna anlaşılabilirliği bozma. Yerleşik framework adlandırmalarına uy.
3. Yorum yalnız koddan anlaşılmayan gerekçeyi, önemli kısıtı veya şaşırtıcı davranışı açıklamalı. Kodun yaptığını tekrar etme; her fonksiyona açıklama/JSDoc ekleme. Tip bilgisini TypeScript ile ifade et.
4. Kaynak kodda sohbet kalıntısı, kullanıcıya hitap, “burada şunu yapıyoruz”, “istediğiniz gibi”, “AI tarafından oluşturuldu”, dekoratif yorum başlıkları veya numaralı anlatımlar bulunmamalı. Zorunlu lisans, telif ve araç bildirimlerini koru; sahte yazarlık/geçmiş iddiası ekleme.
5. TODO/FIXME yalnız somut ertelenmiş iş için kullanılmalı; iş TASKS veya BACKLOG içinde kayıtlı olmalı. Belirsiz placeholder yorum bırakma.
6. TypeScript strict kullan. Hata susturmak için gerekçesiz any, ts-ignore, lint disable veya aşırı type assertion kullanma. Hataları sessiz catch ile gizleme.
7. Tek kullanımlık basit işlemleri gereksiz yardımcılara bölme; tekrar eden iş kuralını kopyalama. Soyutlama somut ihtiyaçtan doğmalı.
8. Yalnız yetkili aşamanın kodunu yaz. Kullanılmayan import, bağımlılık, bileşen, örnek dosya veya ölü kod bırakma. Gerçek servis yerine sahte başarı üretme.
9. Testler anlamlı davranışı doğrulamalı; implementasyonu tekrar eden veya test sayısını artırmak için yazılan testler ekleme.
10. Her aşama sonunda yalnız değişen kodu gereksiz yorum, karmaşık isim, tekrar, kullanılmayan kod ve gereksiz soyutlama açısından incele. İlgisiz dosyaları yeniden yazma.
11. Önemli teknik kararları ilgili docs dosyasına kaydet; kaynak kodu açıklama metniyle doldurma. Sonuç raporunda yeni kavramları ve kararları kısa, anlaşılır biçimde açıkla.
