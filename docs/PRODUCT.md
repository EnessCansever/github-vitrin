# Ürün ve kapsam

Kaynak: [GitHub Vitrin — Codex Proje Sözleşmesi v1](../RepoVitrin-Codex-Proje-Sozlesmesi.md), 26 Ekim 2026. Aşağıdaki gereksinimler hedef davranıştır; uygulandıkları anlamına gelmez.

Çalışma adı **RepoVitrin**; global marka/alan adı kararı bekliyor. Marka adı tek config dosyasından yönetilecek.

## Ürün amacı
Junior frontend geliştiricilerinin herkese açık GitHub portfolyosunun sunumunu değerlendirmek, kanıtlı düzeltmeler sunmak ve gelişimi paylaşılabilir kılmak.
Öncelik: fayda → paylaşım → Enes Cansever'in görünürlüğü → CV değeri.
Skor işe alınma ihtimali, kod kalitesi veya kişinin geliştiricilik seviyesi değildir.
Global marka; Türkçe/İngilizce arayüz; ilk dağıtım Türkiye'deki topluluklar ve Instagram.
Başarı: tamamlanan analiz, tekrar analiz, doğrulanan iyileştirme, kart indirme, paylaşım bağlantısından gelen ziyaret. Kart indirme gerçek paylaşım olarak raporlanmaz.

## Sabit v1 kapsamı
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

## Önce–sonra karşılaştırması
Snapshot immutable: id, githubUserId, loginAtAnalysis, selectedRepoIds, scopeHash, rulesVersion, fetchedAt, status, categoryScores, findings, normalized evidence.
Karşılaştırma: aynı githubUserId + aynı repo seti + aynı rulesVersion + iki tam analiz.
Farklı repo seti/sürüm: karşılaştırma sunma; yeni başlangıç olarak açıkla.
Aynı önbellek kaydı yeni ölçüm veya gelişim değildir.
İyileştirme iddiası: aynı check fail→pass. "2 README düzenlendi" gibi dosya düzenlenme sayısını yalnız check farkından uydurma; "2 repoda kurulum adımları eklendi" gibi doğrulanabilen sinyal değişimi kullan.
Skor aynı/azalmışsa başarı kurgulama. İlk analiz kartı hâlâ paylaşılabilir.
Giriş olmadığı için profil sahipliği doğrulanmaz. Kopyalarda varsayılan "Bu profil" kullan; "Benim profilim" seçimi sahiplik rozeti anlamına gelmez.
Cihaz geçmişi localStorage'da sınırlı erişim kimlikleriyle tutulur; cihazlar arası hesap geçmişi vaat edilmez.

## A4.1 uygulama sınırı — 29 Ekim 2026

A3 mevcut gerçek sonuç görünümü kullanıcı tarafından kabul edildi; 5ad54fb uzak CI başarısı kullanıcı ekran görüntüsüyle sağlanan doğrulamadır. A4'ün bu ilk dilimi yalnız immutable snapshot modeli ve sunucuda oluşturma/tokenla okuma katmanıdır. Mevcut analiz otomatik kaydedilmez; kullanıcıya kalıcı sonuç URL'si veya public rapor sunulmaz. Public shareReports gelecekte ayrı kullanıcı işlemi/nesnesidir.

Mevcut raporun profil kimliği/login'i, veri zamanı, seçili repo kapsamı, sürüm, complete/incomplete durumu, puan/kategori/check kanıtları, profil tipi gerekçeleri ve önerileri korunur. Snapshot biçim sürümü kural sürümünden ayrıdır. Çevrilmiş metin yerine mevcut mesaj/kural anahtarları ve scope parametreleri saklanır; yeniden dil seçimi hesaplamayı değiştirmez. Incomplete rapor saklanabilir, toplam/tip null kalır ve iki tam analiz karşılaştırmasının yerine geçmez. 30 gün TTL ve tahmin edilemeyen read token kaynak sözleşme §7'den gelir; yeni saklama/silme politikası eklenmedi. Cache, karşılaştırma, cihaz geçmişi, action bağlantısı ve public erişim henüz uygulanmadı.

## Belge sınırları

Puanlama SCORING.md, teknik yapı ARCHITECTURE.md, görsel kurallar DESIGN.md içindedir. Paylaşım ve karşılaştırma kapsamı bu belgelerle birlikte uygulanır. Mevcut ilerleme STATUS.md ve TASKS.md ile takip edilir.
