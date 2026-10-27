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
