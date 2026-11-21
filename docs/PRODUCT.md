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

## A4.2 — kayıtlı gerçek rapor bağlantısı

A4.1 f81b46c commit'i ve uzak CI başarısı kullanıcı ekran görüntüsüyle sağlanan doğrulamadır. Yeni dilimde gerçek analiz sunucuda üretildikten sonra immutable snapshot kaydedilir; complete/incomplete kuralları değişmez. Başarılı kayıt aynı Developer ID sunumunu kullanan /reports/[id] adresinde açılır. Okuma tokenı tam adresin #token=… bölümüdür; linke sahip kişiler süresi boyunca okuyabilir. Bu, 30 günlük snapshot erişimidir; A5'teki ayrı 90 günlük shareReports/sosyal paylaşım kopyası değildir.

Veri zamanı ve kayıttan itibaren 30 günlük bitiş açık gösterilir. Yenileme/raporu açma/dil değişimi GitHub verisi almaz veya yeniden puanlamaz. Tam bağlantı kopyalama ve clipboard yoksa elle kopyalama vardır; erişim linki token içerdiğinden log/metadata'ya girmez, raporlar indekslenmez/listelenmez. Fragment'i okuyan tarayıcı JavaScript'i gerekir; sunucu tokenı doğrular ve snapshot okur.

Kayıt hatasında hesaplanan sonuç geçici olarak ekranda kalır; kaydedilmediği ve tam yenilemede kaybolacağı açıklanır. Yeniden deneme istemcideki raporu kaydetmez; aynı seçimi sunucuda yeniden doğrulayıp güncel GitHub verilerinden yeni analiz/kayıt yapar. Önceki hesaplanmış sonuç beklerken veya yeni istek hatasında korunur. Yeni analiz eski snapshot'ı değiştirmez. Cache, karşılaştırma, dağıtık limit, paylaşım görseli ve yayın bu dilimde yoktur.


## A5.1 — kayıtlı complete raporun ilk PNG kartı

A4.2 kabulü/commit'i kapandı; 257acff9b8a86d62db5a8beda94f0bf68f42d6b4 CI başarısı kullanıcının ilettiği Codex public API doğrulamasıdır ([çalışma](https://github.com/EnessCansever/github-vitrin/actions/runs/40792217446)); bu tur bağımsız sorgulama yapılmadı. Kullanıcının yeni yetkisi A4'ün açık cache/karşılaştırma/dağıtık limit maddelerini kapatmaz.

Bu dilimde erişimi doğrulanmış, süresi dolmamış complete snapshot'tan iki ayrı kompozisyon üretilir: Story 1080×1920 ve yatay 1200×630. Yatay çıktı indirilebilir PNG'dir; otomatik OG/link önizlemesi değildir. Gönderi 1080×1350, gelişim kartı, ayrı shareReports ve sosyal paylaşım sonraki dilimlerdir.

Kart kayıtlı profil tipini, kullanıcı adını, toplam/kategori puanlarını, motorun ilk önerisini ve repo/profil hedefini, UTC analiz tarihini, portfolyo sunumu notunu ve config'teki marka/yazar imzasını taşır. Öneri yoksa eksiklik/gelişim uydurulmaz. Incomplete rapor okunabilir kalır ancak puanlı kart üretilemez. Demo indirmesi eklenmez.

Önizleme indirmeden önce bu bilgileri göstereceğini açıklar; format rapor diline uyar. Üretim yalnız mevcut raporu okur; GitHub erişimi, yeniden puanlama, snapshot yazımı veya süre uzatma yoktur. Aynı PNG önizlenir ve kullanıcının açık indirme eylemiyle tarayıcıya verilir. İndirme isteği, cihazda kaydetme veya gerçek sosyal paylaşım başarısı diye raporlanmaz. Kartta token, erişim bağlantısı, QR, uydurma alan adı/Instagram adresi veya sahiplik/doğrulanmışlık iddiası yoktur.


## A4.4a — analiz cache politikası (7 Kasım 2026)

Kaynak sözleşme §6–7'deki analiz önbelleği 15 dakikadır; aynı doğrulanmış GitHub kullanıcı ID'si, repo kümesi ve puanlama sürümünü kapsar. Kullanıcı bu dilimde yalnız **complete** sonuçların cache'lenmesini açıkça onayladı; incomplete ve hatalar cache'lenmez. Incomplete snapshot saklama kuralı aynen korunur. Cache, özel rapor erişimi veya public paylaşım kaydı değildir; okuma tokenı/hash'i ve snapshot kimliği içermez.

Bu tur yalnız veri katmanıdır; gerçek analiz hâlâ mevcut GitHub/motor/snapshot akışındadır, kullanıcıya cache isabeti sunulmaz. Veri katmanı analizin gerçek checkedAt değerini korur; 15 dakikayı bu veri zamanından sayar, hit/write anında uzatmaz. Aynı cache yeni ölçüm/gelişim değildir. Normal/önbelleği atlayan zorunlu yenileme seçimi, cache kaynağı/zamanının arayüzde açıklanması ve cache'ten bağımsız özel rapor erişimi sonraki entegrasyon diliminde ele alınır; uygulanmış sayılmaz.


## A4.4b — başlangıç global analiz sınırı

7 Kasım 2026 kullanıcı kararı: tüm Vercel süreçlerinde ortak en fazla **5 aktif analiz admission'ı**. Bu ölçülmüş kapasite değil merkezi sunucu koruma politikasıdır; gerçek kullanımda yeniden değerlendirilecek. Kapasite doluysa yeni GitHub analizi başlamaz, kullanıcı mevcut manuel retry ile yeniden deneyebilir; istek kuyruğa alındığı veya belirli anda kesin biteceği söylenmez. Mevcut scope kilidi/60s/IP kotaları korunur. Sonuç paylaşımıyla istek birleştirme ve cache arayüzü bu sınırlı dilimde uygulanmadı.


## A4.4c — eşzamanlı çalışmanın paylaşılması

Aynı doğrulanmış profil/repo kümesi ve mevcut kural sürümünde eşzamanlı çağrılar tek liderin README/puanlama sonucunu paylaşabilir. Her çağrı kendi giriş kotası/doğrulamasından geçer; katılan ikinci global analiz permit'i veya yeni ölçüm üretmez. Minimal kimlik/uygunluk metadata doğrulaması tekrarlanabilir; yalnız tek lider gerçek analiz verisini getirip puanlar. Katılanlar birbirlerinin rapor erişimini almaz, ayrı snapshot/token üretilir; checkedAt, snapshot kayıt zamanı ve 30 günlük bitiş aynı kalır. Incomplete sonuç mevcut null/bilinen kanıtlarıyla aktarılabilir, complete cache'e girmez. Bekleme sınırlıdır; sonuç yayınlanamıyorsa yeni analiz yapılmış gibi davranılmaz. Normal 15 dakikalık cache ve force-refresh kullanıcı akışı henüz bağlanmadı.


## A4.4d — normal kullanım ve zorunlu yenileme

Geçerli complete analiz 15 dakika aynı doğrulanmış GitHub kimliği, repo kümesi ve kural sürümü için kullanılabilir; IP/uygunluk doğrulaması sürer, hit yeni analiz veya 60s/global kapasite tüketmez. Yeni private erişim üretilir, orijinal veri zamanı ve snapshot geçerliliği uzatılmaz. Miss ve zorunlu yenileme mevcut kota/kilit/birleştirme/global kurallarından geçer. Yenileme başarısızsa eski rapor erişilebilir kalır; incomplete/error complete cache'e yazılmaz.

Kaynak (yeni/cache/yenilenmiş/eşzamanlı çalışma) raporla saklanır, TR/EN ve yeniden açmada korunur. Eski raporda kaynak bilinmiyor olarak gösterilir. Geçmiş sonuç yenileme yüzünden değiştirilmez; karşılaştırma veya gelişim iddiası bu dilimde eklenmedi.


## A4.5 — özel kayıtlı sonuçları karşılaştırma

Kayıtlı raporda “Önceki raporla karşılaştır” alanı vardır. Kullanıcı bu cihazda daha önce açılmış bir raporu seçebilir veya aynı sitedeki tam özel rapor bağlantısını yapıştırabilir. Yenileme yeni rapora geçtiğinde önceki erişim cihaz geçmişinde kalır; başarısız yenileme önceki raporu değiştirmez. Giriş/sahiplik doğrulaması veya cihazlar arası hesap geçmişi değildir.

Sunucu iki raporun tokenını ve süresini ayrı doğrular. Aynı GitHub ID, sırasız repo kümesi ve kural sürümündeki iki complete analiz için kayıtlı toplam/kategori farkları ve yalnız aynı kontrolün fail→pass / pass→fail değişimleri gösterilir. Kaynak kanıtları iki ölçüm için açılır; dosya düzenleme/teknik kalite iddiası üretilmez. Puan aynıysa nötr, azalmışsa azalma dili kullanılır. Aynı veri zamanı cache/birleşen çalışma/aynı rapor için ikinci ölçüm değildir; daha yeni rapor “önce” seçilemez. Uyumsuz profil/kapsam/sürüm yeni başlangıçtır; incomplete için anlamlı toplam farkı hesaplanmaz, kendi raporları korunur.

Cihaz geçmişi son açılan en fazla 10 erişim kimliği/tokenı ve kısa seçim etiketi (login/analiz zamanı/expiry) içerir; puan veya rapor içeriği saklanmaz. Süresi bitmiş erişimler ayıklanır, temizleme eylemi yalnız cihaz geçmişini kaldırır; sunucu raporunu silmez. Yerel depolama kullanılamıyorsa elle bağlantı girişi çalışır. Bu ilk akış public paylaşım, kalıcı karşılaştırma adresi, OG veya gelişim kartı oluşturmaz.


## A5.2 — ayrı public paylaşım kopyası

Özel rapordaki açık paylaşım alanı izinli alanları ve90 günlük süreyi açıklar; kullanıcı onay kutusu ve oluşturma eylemiyle ayrı kopya üretir. Server Action özel rapor tokenını/süresini tekrar doğrular, client skor veya özetini kabul etmez. İzinli minimum public alanlar: profil login'i, seçili public repo adları, orijinal checkedAt/rulesVersion, complete/incomplete durumu, gerçek toplam/kategoriler, profil tipi veya null, motorun ilk görev anahtarı/hedef adı/puan etkisi. Null incomplete korunur; tam özel raporun yerine geçtiği iddia edilmez. Ham README/API/tüm check kanıtları/özel snapshot ID-token-hash/cihaz geçmişi/yönetim tokenı-hash'i public veride yoktur.

Public bağlantı /share/[id] salt okunur; ayrı rastgele192-bit ID,90 gün geçerlilik ve noindex/no-referrer/no-store taşır. Yenileme/dil/GET GitHub veya motor çağırmaz, analizi veya geçerlilik süresini yenilemez. Oluşturulan/kopyalanan bağlantı gerçek paylaşım veya birine gönderim başarısı değildir. Public sayfa yalnız özet sunar; otomatik OG/yeni PNG formatı bu dilimde yoktur.

Kullanıcı kararı: **özel rapor okuma, public okuma ve paylaşım mutasyonları birbirinden ayrı IP60/1dk bütçeleridir.** Oluşturma/kapatma/silme kendi aralarında tek mutasyon sayacını paylaşır. Aynı eylemin private helper okuması ek report bütçesi tüketmez; yanlış token/bozuk giriş ilgili giriş bütçesindedir. Origin geçersizse işlem DB kotasına ulaşmadan reddedilir.

Özel snapshot30 gün, public kopya oluşturulmadan itibaren90 gündür; birbirini uzatmaz veya silmez. Ayrı /share/manage#id=…&token=… bağlantısı yönetim yetkisini taşır; yalnız fragment ve mutation POST gövdesindedir, public bağlantıda/SSR metadata'da yoktur. Yönetim bilgisi cihazda ayrı saklanır ve kullanıcıya bağlantıyı ayrı/gizli kaydetmesi açıklanır. Storage başarısızsa bağlantı sayfa oturumunda korunur ve elle kopyalama uyarısı vardır; cihaz verisi veya yönetim bağlantısı kaybolursa hesapla geri kazanım vaat edilmez.

“Paylaşımı kalıcı kapat” yalnız o public bağlantıyı geri açılmayacak biçimde devre dışı bırakır; içerik kendi90 günlük süresi/silme işlemine kadar DB'de kalabilir. “Paylaşım raporunu sil” yalnız public kopyayı fiziksel siler. İkisi özel raporu değiştirmez; özel rapor bittikten sonra da ayrı yönetim bağlantısı çalışır. Eski ekran görüntüsü/indirilmiş kopyalar geri alınamaz; kapatma sonraki server okumalarını durdurur. Yeni paylaşım ancak yeni açık kullanıcı işlemiyle yeni ID olarak oluşturulur; eski link tekrar açılmaz.


## A5.3 — public bağlantının otomatik önizlemesi

Aktif complete public kopya için TR/EN başlık/açıklama, Open Graph ve Twitter summary_large_image metadata'sı ile1200×630 PNG vardır. Kaynak yalnız shareReports minimum özetidir; private snapshot tokenı/kimliği, yönetim capability/hash, cihaz geçmişi, GitHub veya yeniden puanlama yoktur. Mevcut onaylı kobalt/krem/lime yatay renderer'ı aynı font/dokuyla kullanılır; indirilebilir Story/yatay formatlar değişmez. Incomplete için sahte puan/tip üretilmez: nötr metadata, puanlı görsel yoktur.

Dil public URL'de ?lang=tr veya ?lang=en, görsel URL'sinde /image/tr veya /image/en olarak sabittir. Yeni kopyalama bağlantısı seçili dili taşır; eski dilsiz/bozuk-çoklu dil linkleri TR başlangıcıdır. Public dil seçimi aynı ID'yi koruyarak cookie'yi ve açık dil URL'sini günceller. Metadata, ana içerik ve PNG aynı dildedir; anonim botun cookie'sine bağımlı değildir. Özel rapor/yönetim fragment ve dil davranışı korunur.

Metadata ve sayfa bir server isteğinde tek shareRead kullanır; görsel ayrı HTTP isteğinde shareRead ve yalnız render edilebilen complete kopya için mevcut card10/10dk bütçesini tüketir. Private report60/1dk, shareRead60/1dk, shareMutation60/1dk ayrımı aynıdır; yeni sayı belirlenmedi. Her görsel teslimden önce share durumunu tekrar okur. Kapalı/silinmiş/expired kopyada kişisel metadata/görsel sunulmaz; DB/config/rate-limit hataları güvenli ayrı sonuçtur.

Uygulama/CDN cache'i no-store olarak kapalıdır. Kapatma/silme uygulamadaki sonraki okumaları engeller; sosyal platformların daha önce aldıkları önizlemeyi kendi cache'lerinde tutabileceği oluşturma/yönetim açıklamasında belirtilir. Bu kopyalar buradan geri çağrılamaz. Mutlak linkler server-only SITE_URL canonical origin'inden üretilir; production için gerçek HTTPS origin yapılandırılmalıdır. Domain/Instagram hesabı uydurulmaz. Yerel doğrulama gerçek sosyal platform ve Vercel CDN kontrolü değildir; otomatik paylaşım veya yeni PNG formatı eklenmedi.

Kayıtlı complete raporda gönderi (1080×1350), Story ve yatay biçimleri aynı önizleme ve indirme akışında seçilir. Gönderi ilk analiz kartının içeriğini kullanır. Sunucu PNG baytlarını kaynağın mevcut bitiş zamanına kadar yeniden kullanabilir.

Özel raporda geçerli bir önce–sonra karşılaştırması açıldığında kullanıcı gelişim kartını üç mevcut PNG biçiminde önizleyip indirebilir. Tarihler ve puanlar iki kayıtlı ölçümü gösterir. Artış ve düşüş işaretli farkla, aynı puan nötr başlıkla gösterilir. Kartta yalnız gerçek durum geçişlerinden hesaplanan kontrol sayıları bulunur.

Footer üzerinden erişilen /methodology puanın hesabını, profil tiplerini, tespit ve öneri sınırlarını açıklar. /privacy veri kaynaklarını, saklama ve erişim sürelerini, yönetim bağlantısını, yerel geçmişi ve kota sayaçlarını açıklar. İki sayfa da mevcut TR/EN dil tercihini kullanır.

## Anonim analiz hakkı

İlk analiz, önbellekten yeniden kullanım ve zorunlu yenileme aynı analiz girişinden geçer. İmzalı tarayıcı oturumu ve IP için ayrı ayrı 10 dakikada 10 analiz hakkı uygulanır. Çerez kapalıysa kullanıcıya çerezlere izin verip tekrar denemesi söylenir. Public paylaşım sayfasını açmak için oturum gerekmez. Diğer işlem bütçeleri D035/D046'da tanımlıdır.
