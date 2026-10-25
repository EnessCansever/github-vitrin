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
- Bu tur yalnız **A0 belgelendirme** yetkilidir. Uygulama kurma, paket yükleme, arayüz kodu yazma veya Git deposu başlatma. A0'ın tamamını bitmiş sayma. Kaynak sözleşmenin §12 A0+A1 isteği bu tur için geçerli çalışma yetkisi değildir.
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
