# Tasarım sözleşmesi

Kaynak: [GitHub Vitrin — Codex Proje Sözleşmesi v1](../RepoVitrin-Codex-Proje-Sozlesmesi.md), 26 Ekim 2026. Aşağıdaki gereksinimler hedef davranıştır; uygulandıkları anlamına gelmez.

## Tasarım kuralları
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

## Referans incelemesi — 26 Ekim 2026

[Referans pano](design/reference.png) mevcut ve görsel olarak incelendi; kaynak dosya korunur. Panoda mobil sonuç, ilk analiz story kartı, gelişim kartı ve yatay bağlantı önizlemesi bulunuyor. Koyu zemin, mavi vurgular, beyaz büyük başlıklar, ince kenarlı yuvarlatılmış kartlar, avatar, elmas sembolü, kanıta giden repo satırları, ilk görev ve paylaşım eylemi temel görsel yönü oluşturuyor. Mint olumlu değişim ve ilk eylem vurgusunda kullanılıyor.

Bu inceleme uygulanmış arayüzün onayı, kontrast testi veya responsive doğrulama değildir. Panoda gösterilmeyen repo seçimi, hata durumları, gönderi kartı ve diğer ekranlar da sözleşme kapsamında kalır.

## Görsel ile sözleşmenin ayrıştığı noktalar

- Panodaki “README · 18/30” ve “Kurulum adımları 0/5” üretim puanlaması değildir. SCORING.md uyarınca README kategorisi 50, repo başına kurulum kontrolü 10 puandır; kategoriler profil 20 / repo 30 / README 50 olarak uygulanacak.
- “2 README düzenlendi” yalnız kontrol farkından çıkarılamaz. Gelişim kartı gerçek fail→pass sinyallerini, örneğin “2 repoda kurulum adımları eklendi” şeklinde ifade etmeli.
- “Vitrinimi geliştirdim” ve “GitHub vitrin puanım” varsayılan sahiplik iddiası olamaz. Varsayılan “Bu profil”; kişinin seçtiği birinci tekil şahıs anlatımı sahiplik doğrulaması sağlamaz.
- Büyük elmas ve dekorasyon içerik hiyerarşisini bastırmamalı; sözleşmenin küçük sembol kuralı geçerli.
- Görseldeki “5 dakika” etiketi doğrulanmış süre garantisi değildir; sözleşmede görev süresi garantisi yoktur.
- 62, 54, 81 ve örnek repo bulguları fixture değerleridir. Gerçek analiz veya doğrulanmış iyileştirme olarak kullanılamaz.

Görselin işlevsel eksiklerinde ana sözleşme otoritedir. Kırık beyaz ve mintin kesin token değerleri, font ailesi ve lisansı henüz seçilmedi; mevcut palet ve erişilebilirlik sınırları korunarak ilgili aşamada kaydedilecek.
