# Tasarım sözleşmesi

Kaynak: [GitHub Vitrin — Codex Proje Sözleşmesi v1](../RepoVitrin-Codex-Proje-Sozlesmesi.md), 26 Ekim 2026. Aşağıdaki gereksinimler hedef davranıştır; uygulandıkları anlamına gelmez.

## Tasarım kuralları
Bu tasarım diliminin görsel yönü [Developer ID konsepti](design/developer-id-concept.png)'dir; kullanıcı tarafından eklenen gerçek dosya açılıp incelendi. Bu tur ana sayfa ve ortak kimlik kartı için eski [referans panonun](design/reference.png) önündedir. İki görsel de korunur. Ürün davranışı için PRODUCT/ana sözleşme, kategori ve puanlar için SCORING geçerlidir; görseldeki alternatif kategoriler ürün kuralı değildir.
Güncel palet: neredeyse siyah ink #090E14, kobalt #1845F5, sıcak metin #F4EEE2; kimlik kâğıdı #EFE8D8 ve baskı mürekkebi #111C32. Lime #D4EB52 yalnız küçük profil tipi mühründedir. Mevcut mint olumlu görev/focus kullanımında kalır; yeni lime gezinmeye veya genel zemine yayılmaz.
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

Görselin işlevsel eksiklerinde ana sözleşme otoritedir. A0 başlangıcında kırık beyaz #F5F5F0 ve sistem fontu Arial/Helvetica/sans-serif kullanıldı. Mint ve kart fontunun kesin seçimi ilgili tasarım aşamasında kaydedilecek; mevcut palet ve erişilebilirlik sınırları korunacak.

## A0 altyapı sınırı

`src/app/globals.css` merkezi ink (#0B1020), brand (#4169FF), paper (#F5F5F0) ve sistem fontu tokenlarını içerir. Başlangıç sayfası yalnız geliştirme durumunu bildirir; sonuç ekranı veya onaylı A1 tasarımı değildir. Harici font isteği yoktur. Mint A0 ekranında gerekmediği için eklenmedi. Tarayıcı, kontrast ve responsive incelemeleri A1 kapsamında açık kalır.

## A1 ilk bölüm uygulaması

Referans pano bu oturumda yeniden görsel olarak incelendi. Koyu ink, küçük elmas kimliği, açık tipografi, repo bazlı bulgular ve ilk görev hiyerarşisi kullanıldı. Ana sayfa büyük bir başlık, tek giriş alanı ve açık örnek eylemiyle başlar; rapor örneği bir yan panelde somutlaşır. Sonuç sayfası mobilde tek sütun, geniş ekranda bulgular/görev ve kategori ayrıntıları olarak iki sütundur. DOM okuma sırası kimlik/puan → bulgular → ilk görev → pasif paylaşım → kategoriler/diğer görevlerdir.

Yeni merkezi tokenlar: surface #10182B, border #2B3B58, muted #A8B5D0, link #A6BCFF, mint #72E5BF. Marka #4169FF değişmedi. Beyaz metin bu marka renginde 4,48:1 verdiği için dolu eylem arka planında yakın mavi action #3C63F0 kullanılır (4,96:1); hover #3356DF (5,94:1). Mint yalnız ilk eylem ve focus vurgusundadır. Metin boyutları en az 12px; sistem fontu Türkçe karakterleri destekler, harici font isteği yoktur.

Görünür focus, input label + açıklama ilişkisi, skip link, native details/summary ve açıklaması bulunan disabled paylaşım/yeniden analiz butonları uygulandı. Uzun metinler için grid minmax(0, …), min-width:0 ve ilgili adlarda overflow-wrap:anywhere kullanıldı; yatay taşmayı gizleyen global overflow-x:hidden eklenmedi. Animasyon/sahte ilerleme yoktur.

Renk kontrastları sayısal hesapla ve semantik yapı kaynak/HTML incelemesiyle kontrol edildi. **Tarayıcı aracı bulunmadığından 360/390/768/1440 screenshot, gerçek klavye kullanımı, focus/accordion görüntüsü, 320px ve uzun ad taşması görsel olarak doğrulanmadı.** Bunlar STATUS/TASKS içinde manuel kontrol olarak açık; uygulanmış CSS tarayıcı doğrulaması yerine sayılmaz.

## A1.1 görsel geri bildirim revizyonu — 28 Ekim 2026

Kullanıcının yedi masaüstü ekranı referans panoyla karşılaştırıldı: ilk sürümde büyük hero boşluğu ve pazarlama ağırlıklı sağ panel ana eylemi aşağı itiyordu; demo kimlik ve puanı sınırlı bir kartta birleşmiyordu. Kullanıcı bu görünüme kabul vermedi.

Header minimum 76px, masaüstü hero üst boşluğu 40px olarak düzenlendi. Sabit içerik yüksekliği/kırpma yok. Başlıkta profilin/profile, var olan #4169FF ile vurgulanır; büyük metin kontrast eşiğine tabidir. Sonuç kartı `ResultSummary` ile hem önizleme hem demo için ortak sunulur; küçük elmas, kullanıcı, tip ve skor aynı kimliği korur. Önizleme üç kategori ve tek repo bulgusu gösterir. Teknik gerekçeler ve kaynaklar native açılımlarda kalır; ana anlatım kısadır. Yeni tema, dekorasyon veya animasyon eklenmedi; eski CSS kuralları düzenlendi, kullanılmayan pazarlama stilleri kaldırıldı.

Önceki turdaki tarayıcı doğrulama eksikliği bu revizyonda **kurulu Chrome + ayrı temiz profil + CDP** ile kısmen kapatıldı: iki sayfa/iki dil 390×844 ve 1440×900 ekranları görüntülendi; 320px/uzun ad/açık accordion taşması, dil tıklamaları ve klavye odakları kontrol edildi. Masaüstünde ana CTA altı y=622px, önizleme altı TR y=585px/EN y=563px; 900px ilk ekran koşulu geçti. Bu sonuçlar tüm A1 genişlikleri/ekranları veya kullanıcı görsel kabulü anlamına gelmez. Tam ölçümler ve hydration araştırması STATUS'tadır.

## A1 repo seçimi ve durum örnekleri — 28 Ekim 2026

Kullanıcı a78abde commit'indeki ana sayfa ve demo görünümüne masaüstü/mobil kabul verdi. Bu tur kabul edilmiş stiller düzenlenmedi; globals.css sonuna yalnız yeni ekranlara ait seçiciler eklendi. `/demo` altına tek sade seçim bağlantısı eklendi, ana sayfanın demo bağlantısı korundu.

Seçim ekranı mevcut marka header'ı, kurmaca profil, açık örnek etiketi ve kısa 1–3 yönlendirmesini kullanır. İki sütunlu repo kartları mobilde tek sütundur. Gerçek checkbox, açık renk sınır, checked işareti ve “Seçili” metni birlikte kullanılır; seçilme yalnız renkle anlatılmaz. Sınır mesajı görünür, seçili kutular kaldırılabilir, sıfır seçimde pasif devamın gerekçesi yanındadır. Repo adları ve açıklamalar kırpılmaz, sarılır.

Durum ekranı etiketli native select ile altı görünümü aynı yüzeyde inceler. Metin alanı polite/atomic status bildirimi taşır. Loading ikonu hareketsizdir; yüzde, süre ve otomatik geçiş yok. Eksik analizde puan/tip yerine alınabilen bulgu vardır; sabit başarılı örneğe ayrı açıklamalı bağlantı verilir. Gerçekmiş gibi çalışan retry butonu yoktur.

Yeni ekranlar temiz Chrome'da TR/EN, mobil ve masaüstünde incelendi; 320/360/390/768/1440 taşma kontrolleri ve uzun ad kontrolleri yapıldı. Checkbox Space/Tab/Shift+Tab ve focus kontrolü geçti. Native select'in headless ortamda klavyeyle değer değiştirmesi otomasyonla doğrulanamadı; gerçek tarayıcı menüsü kullanıcı kontrolünde açık tutuldu. Bu yeni ekranlar için kullanıcı görsel kabulü henüz verilmedi. Tam sonuçlar STATUS/TASKS içinde tutulur.

## A1 demo gezinmesi ve bağlantı hiyerarşisi — 28 Ekim 2026

Kullanıcı mevcut demo bağlantılarının fark edilmediğini bildirdi. `/demo`, `/demo/select` ve `/demo/states` üstünde tek DemoNav sunum bileşeniyle “Demoyu keşfet” gezinmesi kullanılır: örnek rapor, proje seçimi, analiz durumları. Genel site header'ı değişmez; bu araçlar ana site navigasyonuna taşınmaz. Aktif link aria-current=page, onay işareti, alt çizgi, belirgin çerçeve ve zeminle anlatılır; yalnız renk kullanılmaz. Mobilde üç esnek sütundaki metinler gerektiğinde satır kırar.

Bağlantı hiyerarşisi:

- Ana eylem: mevcut button-primary dolu mavi stil.
- Önemli ikincil geçiş: ortak button-secondary; secondary #172642 zemin, secondary-border #5875AA çerçeve, okunaklı açık metin ve yön oku. Hover/aktif tonu secondary-hover #203763.
- Yardımcı/geri: ortak text-link/back-link; sakin alt çizgili metin ve uygun yön oku. Hover daha belirgin, link/gezinti odağı 3px mavi.

Bu üç renk mevcut mavi palette merkezi token olarak tanımlıdır; linklere ayrı renk verilmez. Mint gezinme veya dil seçimi focus'unda kullanılmaz. Paylaşım/yeniden analiz disabled kalır. Sayfa değiştiren tüm eylemler gerçek anchor/Next Link olarak korunur. `/demo` altındaki seçim geçişi belirgin ikincil eylemdir; üst gezinme aynı geçişi sayfa sonuna inmeden sunar. Gereksiz eski min-height tekrarları ilgili link kurallarından kaldırıldı; yeni bağımlılık/client state eklenmedi.

Temiz Chrome'da TR/EN 390px ve masaüstü ekranları alınıp incelendi; 320px'de üç link ve sayfa taşması yok. Geçişler, geri dönüş, dil, klavye/hover/focus doğrulandı. İkincil açık metin kontrastı normal zeminde 13,79:1, hover'da 10,74:1; çerçeve/zemin 3,26:1. **Bu revizyon için kullanıcı görsel kabulü henüz verilmedi.**

## A2.2 — gerçek form ve seçim — 28 Ekim 2026

Kabul edilmiş hero/örnek kart kimliği korunarak ana eylem “Projelerimi getir” oldu; ayrı mavi ikincil demo linki görünür kalır. Form etiket/hint/alan hatası ve disabled pending taşır. Gerçek seçim aynı sayfada, mevcut monogram, repo kartları ve native checkbox stiliyle açılır. Sonuç/hata başlığına programatik klavye focus verilir; tüm uzun listeye dekoratif çerçeve çizilmez. Seçim başına scroll, kesme/sabit yükseklik olmadan başlığı görünür kılar. Gerçek akışın alanları demo/sabit puanla birleştirilmez.

Tek ortak RepoPicker/StatePanel kullanılır; TR/EN görünen metinler mesaj dosyalarındadır. 1–3 sınırı, pinned-unknown ve 100 aday uyarıları, sıfır seçim ve pasif puanlama açıklaması vardır. Profil linki gerçek kullanıcı adına gider; avatar için dış istek yerine monogram seçildi.

Temiz Chrome ile TR/EN 390×844 ve 1440×900 ekranları görüntülendi; 320/390/768/1440 ve uzun metinde yatay taşma yok. Native Enter, checkbox Space, görünür focus ve dil değişiminde ID korunumu kontrol edildi. Ana CTA masaüstü ilk ekranda kalır. Bu yeni A2.2 bölümüne kullanıcı görsel kabulü henüz verilmedi; önceki A1 kabulü kapsamı değişmez.

## Developer ID ilk uygulama — 28 Ekim 2026, kullanıcı kabulü bekleniyor

Yeni görsel pano gerçekten incelendi: koyu geniş alan, güçlü dar başlık, kobalt form eylemi, sıcak basılı kimlik, küçük lime mühür ve hero askı/klipsi bu dilimin yönüdür. Görseldeki açık kaynak katkısı, proje çeşitliliği, meslek, kişi adı, seri numarası ve başarı iddiaları aktarılmadı. Ana sayfa TR “Kodun var. İz bırak.”, EN “Write code. Leave a mark.” başlığıyla gerçek formu korur. Keşfet/Düzelt/Paylaş mevcut basit ol/ikon yapısıyla ince ayırıcılar ve mono adım numaraları taşır; yeni dashboard/kart yığını yoktur.

Tokenlar mevcut merkezi globals.css içinde güncellendi. Yardımcı metin #AAB5C5, kart yardımcı metni #4B5160, link #A7BAFF, surface #111A26, border #334157. İkincil eylemler aynı koyu mavi aileyi kullanır. Kontrol edilen metin çiftleri en az 6,50:1; beyaz/kobalt ana eylem 6,54:1, kart mürekkebi/kâğıt 13,92:1, mühür 12,79:1, seçili repo metni 13,05:1, pasif metin 8,44:1. Dekoratif kâğıt çizgileri veri/etkileşim ayrımının tek işareti değildir.

Tipografi yerel next/font/local ile: Barlow Condensed ExtraBold 800 başlık ve büyük skor; Manrope variable 200–800 gövde; IBM Plex Mono 400 kullanıcı adı/metadata. Dosyalar değiştirilmemiş Google Fonts kaynaklarıdır; SIL OFL 1.1 lisansları src/app/fonts içinde korunur, kaynaklar README.md'de listelenir. Her üç fontun cmap tablosunda ÇçĞğİıÖöŞşÜü doğrulandı. Kart küçük metinleri >=12px'dir; form/gövde boyutları aşırı küçültülmedi. Fontlar yerel servis edilir; runtime/build Google Fonts isteği yoktur.

ResultSummary aynı demo fixture'ını ana sayfa ve /demo için kullanır. Her ikisinde demo etiketi, mira-sample/monogram, Gizli Cevher, 77,5 ve Profil 15/20, Projeler 22,5/30, README 40/50 vardır. Metin/puan/barlar HTML/CSS; ikonlar SVG'dir, konsept görseli UI yerine yerleştirilmez. Kâğıt dokusu ince statik CSS gradyanları, baskı hissi çizgi/renk/çok hafif gölgeyle kurulur. Lime mühür yalnız profil tipidir; yanında onay olmadığı yazılır, doğrulanmışlık/meslek/seri numarası yoktur. /demo kartı düzdür ve native gerekçe açılımını korur. Gerçek profile skor veya PNG/paylaşım çıktısı üretilmez.

Hero kartı yalnız >=1000px'de 5 derece açılır ve CSS askı/klips gösterir; küçük ekranda düzleşir, detaylar kapanır. Formun/metnin önüne taşmaz. Ana buton 390×844 ve 1440×900 ilk ekranında erişilebildi. Kesme/sabit içerik yüksekliği/global overflow gizleme yoktur. Repo seçim kartları baştan tasarlanmadı; ortak font/token uyumu kontrol edildi. Eski summary/preview/score CSS kuralları yerlerine yeni kart kuralları yazılarak kaldırıldı; üst üste override yığını bırakılmadı.

Hareket: başlık 420ms, hero kartı 500ms, tek iterasyon; başlangıç opacity .75/.8 ile içerik ilk andan okunur. Yalnız transform/opacity, süreklilik/sallama/sonsuz parıltı yoktur. Buton hover/press 140ms geri bildirim verir. Accordion yüksekliği native kalır; chevron 150ms ve açık içerik 160ms hafif belirme kullanır. prefers-reduced-motion altında animasyon, transition ve hareketli buton transformları kaldırılır. CSS/SSR kullanılır; rastgele veya hydration'a bağlı pozisyon yoktur. Dil değişiminde giriş animasyonu yeniden çalışmadı; ayrı soğuk-font testinde yerel home/1440 ölçülen layout shift 0.

Tarayıcı incelemesi: TR/EN 390×844 ve 1440×900 ana sayfa/demo; diğer demo seçim/durum sayfalarının görüntüleri de incelendi. /, /demo, /demo/select, /demo/states için 320/390/768/1000/1440 taşması yok. Input focus, native Space/Enter accordion, üç kategori ve kanıt açılımı, disabled eylem, uzun kullanıcı adı ve reduced-motion doğrulandı. Yeni tasarım kullanıcı kabulü henüz verilmedi; önceki A2.2 işlev kabulü korunur.

Font kaynakları: [Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed), [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope), [IBM Plex Mono](https://github.com/google/fonts/tree/main/ofl/ibmplexmono). Yerel lisans/kaynak dizini: [fonts](../src/app/fonts/README.md).
