# Kararlar ve açık konular

Kaynak: [başlangıç sözleşmesi](../RepoVitrin-Codex-Proje-Sozlesmesi.md). Tarih: 26 Ekim 2026. Buradaki kayıtlar uygulama tamamlanma kanıtı değildir.

| Kayıt | Karar ve gerekçe | Etkilenen dosyalar |
| --- | --- | --- |
| D001 — 2026-10-26 | v1 kapsamı ve sabit stack kaynak sözleşmeden değişmeden aktarılır; React/Mongo deneyimi korunur, SSR metadata, kart ve backend tek uygulamada kalır. | PRODUCT.md, ARCHITECTURE.md |
| D002 — 2026-10-26 | Puanlama v1.0.0, profil 20 / repo 30 / README 50; unknown varsa toplam null. Amaç yalnız sunum sinyallerini dürüstçe ölçmektir. | SCORING.md |
| D003 — 2026-10-26 | Referans mevcut ve incelendi. İşlevsel ayrışmalarda sözleşme geçerli; görseldeki puan ve dönüşüm metinleri kuralları değiştirmez. | DESIGN.md, SCORING.md |
| D004 — 2026-10-26 | Kullanıcının güncel talimatı bu turu yalnız A0 belgelendirme ile sınırlar; §12'deki A0+A1 uygulanmaz. A0'ın kurulumu ve tüm sonraki aşamalar bekler. | AGENTS.md, TASKS.md, STATUS.md |
| D005 — 2026-10-26 | Stage, commit ve push yapılmaz; bunlar kullanıcıya aittir. “commit attım, devam” mesajı olmadan sonraki aşama başlamaz. Git yoksa bu tur başlatılmaz. | AGENTS.md, STATUS.md, TASKS.md |
| D006 — 2026-10-26 | RepoVitrin çalışma adıdır; global marka/alan adı bekler. Marka ve Enes bağlantıları tek config'ten yönetilecek; bilinmeyen Instagram URL'si boş kalacak. | PRODUCT.md, DESIGN.md |

## Açık kararlar ve uygulama ayrıntıları

- Global marka/alan adı ve gerçek Instagram URL'si kullanıcıdan bekliyor; uydurulmayacak.
- Desteklenen Node LTS ve uyumlu stabil paketlerin tam sürümleri kurulum aşamasında resmi belgelerle doğrulanıp kilitlenecek. Şu an sürüm kararı yok.
- TR/EN alias listeleri, demo işaretleme kuralları, görev önceliği/eşitlikleri, not_applicable aritmetiği ve “Gizli Cevher” profil sunumu koşulunun check eşlemesi SCORING.md'de açık tutuldu. Yeni ağırlık veya sessiz yorum eklenmedi.
- Token paletinin kalan kesin değerleri ve uygun lisanslı yerel fontlar A1/A5'te belirlenecek; sabit renkler ve erişilebilirlik koşulları değişmeyecek.
- Başlangıç limitleri sözleşmedeki örnek/config değerleridir; hosting timeout'u, Vercel/Atlas maliyetleri, plan limitleri ve deployment bölgesi ilgili aşamada doğrulanacak. Ücretsiz/sınırsız varsayımı yok.

Bu konular belge teslimini engellemiyor; ilgili uygulama davranışı kesinleştirilmeden tamamlandı sayılamaz. Yeni büyük kararlar Enes'in açık kararıyla tarihli kayda dönüştürülür.
