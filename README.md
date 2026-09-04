# BusLinker

Türkiye için otobüs bileti arama ve koltuk seçimi arayüzü.

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4 · TanStack Query v5 · Zustand · Radix UI

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run build      # tsc -b && vite build
npm run lint
```

Node ≥ 22.13 gerekir.

---

## Neden bu mimari

Bu bir yeniden yazımdır. Eski sürüm derlenmiyordu ve koltuk seçimi algoritmik olarak hatalıydı;
aşağıdaki kararların çoğu doğrudan o hataların düzeltilmesidir.

### Koltuk düzeni: saf bir geometri motoru

`src/entities/deck/geometry.ts` içindeki `layoutDeck(spec, tokens)` bildirimsel bir otobüs planını
(sütun rayları üzerinde tiplenmiş hücre satırları) alır ve mutlak SVG koordinatları, `viewBox`,
koltuk numaraları, ARIA ızgara koordinatları ve ok tuşu komşuları üretir. DOM yok, React yok,
rastgelelik yok — bu yüzden tamamı test edilebilir.

İki özellik taşıyıcıdır ve her ikisinin de testi vardır:

1. **Satır yerleşimi doğrusaldır**, `y = burun + boşluk + satır × adım`. Eski kod
   `row * (42 + (row - 1) * 90)` kullanıyordu — bu `row` cinsinden ikinci derecedendir ve
   0, 42, 264, 666 üretir. Geometrinin hiçbir sabitle oturmamasının gerçek sebebi buydu.

2. **Koltuk numaraları ayrı bir geçişte**, okuma sırasıyla (önden arkaya, soldan sağa) yalnızca
   `seat` hücrelerine verilir — asla `(satır, sütun)` aritmetiğiyle değil. Türkiye'deki gerçek
   numaralandırmayı yalnızca bu üretir: orta kapı bir sütunu böler, karşı sütun ardışık akar.
   38 koltukluk 2+1'de sağ sütun 18'den 22'ye atlarken sol tekli sütun 19, 20, 21 diye ilerler.

2+1 otobüslerde **tekli koltuklar solda** (şoför tarafı), **ikili sağda** ve orta kapı sağ sütunu
böler. Bu ayna simetrik değildir: ters çevrilirse plan kusursuz görünür ama otobüsteki her koltuk
numarası yanlış olur. `geometry.test.ts` bunu doğrular.

### Koltuk haritası mimarisi

Şasi tek bir dekoratif SVG (`aria-hidden`, `pointer-events: none`). Koltuklar ise gerçek HTML
`<button>` öğeleri, **aynı `viewBox` kutusunun yüzdeleriyle** konumlanır
(`left: calc(144 / 202 * 100%)`). İki katman aynı geometriyi okuduğu için kayma yapısal olarak
imkânsızdır — `ResizeObserver` yok, ölçüm yok, elle ayar yok.

SVG içinde `<g role="button" tabindex="0">` yerine gerçek buton kullanılır: `<g>` öğesinin
varsayılan rolü yoktur, SVG erişilebilirlik eşlemesi motorlar arasında hâlâ tutarsızdır, `outline`
SVG öğelerinde güvenilir biçimde çizilmez ve adlandırılmamış bir SVG düğümündeki `tabindex` ekran
okuyucunun sonraki düğümler için ad hesaplamasını bozar. Gerçek butonla doğal odak, doğal
Enter/Space ve `:focus-visible` bedavaya gelir.

ARIA olarak APG ızgara deseni kullanılır; `role="gridcell"` butonun üzerine yazılır.
`aria-selected` düz bir butonda geçersizdir ve `aria-pressed` "basılı" diye seslendirilir — bir
koltuğu kümeden seçmek için yanlış zihinsel model.

### Cinsiyet kuralı sunucu durumudur

Bir koltuğun satılabilirliği `availableFor: 'ALL' | 'M' | 'F' | 'NO'` alanından gelir ve sunucuda
hesaplanır. İstemci asla komşu koltuğa bakarak bu kuralı yeniden türetmez. Kural yalnızca koridorun
aynı tarafındaki ikilinin iki koltuğunu bağlar; tekli koltukların eşi olmadığı için kısıtı hiç
oluşmaz.

Sepet düzeyindeki kurallar (`canAddToCart`) ayrı ve saftır: en fazla koltuk sayısı, tek biletle
farklı cinsiyet, çift seçim. Eski kod bu ikisini karıştırıyordu ve komşu kısıtını tıklamalar arası
sıfırlamadığı için kural bir sonraki koltuğa sızıyordu.

### Belirlenimli sahte arka uç

`src/shared/api/mock-server.ts` her şeyi bir dizi tohumdan üretir. Aynı sefer her zaman aynı
otobüsü, aynı doluluğu döndürür. Eski kod `Math.random()`'ı `useEffect` içinde çağırıyordu, yani
her bağlanmada otobüs yeniden karışıyordu — bu haliyle ne test edilebilir ne de derin bağlanabilir.

Faset sayaçları sunucuda hesaplanır çünkü bir sayaç **kendi grubunun seçimini dışlamak zorundadır**:
"Metro Turizm" işaretlendikten sonra Firma faseti diğer firmaların kaç seferi olduğunu göstermeye
devam etmelidir. Bu, filtrelenmiş sonuç sayfasından türetilemez.

### URL tek doğruluk kaynağıdır

Arama, filtre ve sıralama sorgu dizesinde yaşar. Çok değerli fasetler **tekrarlanan anahtarlarla**
serileştirilir (`?op=metro&op=varan`). Koltuk düzeni `2p1` olarak taşınır — `seat=2+1` sessizce
`"2 1"` olarak çözülür. Anahtar sırası ve değer sırası kanoniktir, böylece bir filtre kümesi tek bir
önbellek anahtarı üretir.

### Tasarım jetonları

`src/styles/theme.css` üç katmanlıdır ve sıra önemlidir:

1. `@theme` — ilkeller (OKLCH rampalar, tip ölçeği, yarıçap, gölge, hareket). Derleme anında sabit.
2. `:root` / `.dark` — temaya göre değişen anlamsal değişkenler.
3. `@theme inline` — anlamsal değerleri yardımcı sınıf ad alanlarına yeniden verir.

Üçüncü katmanda `inline` **zorunludur**. Düz bir `@theme`, `var()` ifadesini `:root` düzeyinde bir
kez çözer ve koyu tema hiçbir hata vermeden çalışmayı bırakır.

Hazır Tailwind paleti `--color-*: initial` ile silinmiştir; `bg-slate-500` gibi bir sınıf yoktur.
Tasarıma yalnızca tanımlı rampalar girebilir.

Renk sistemindeki üç kritik ölçüm:

- Marka kırmızısı üzerinde beyaz **4.75:1** — AA'yı yalnızca 0.25 farkla geçer. Bu yüzden CTA
  vurgusu **koyulaşır** (`brand-700`), asla açılmaz.
- `neutral-600` beyaz üzerinde 4.34:1'dir ve **kalır**; sönük metin `neutral-700`'dür.
- Koyu temada `neutral-700` bir kontrol kenarı olarak 2.96:1'dir; `border-strong` orada
  `neutral-600`'e kayar.

Marka kırmızısı ile tehlike kırmızısı 600 adımında ayırt edilemeyecek kadar yakındır. Ayrım renkle
değil biçimle sağlanır: **karar bağlamı başına tek bir dolu marka rengi**. Sonuç sayfasındaki
kartlar bu yüzden `brand-outline` kullanır — 20 kart, 20 kırmızı buton demek olurdu.

Cinsiyet asla yalnızca renkle kodlanmaz: dolgu, kenarlık, ♂/♀ işareti ve Türkçe `aria-label` olmak
üzere dört kanal taşır. Mavi/pembe ayrımı tam olarak protanopi ve döteranopide çöken çifttir.

### Tipografi

Poppins bırakıldı. Sebep estetik değil: Türkçede i/ı sesbirimseldir (sık ≠ sik) ve Poppins l, I ve
ı'yı birbirinden neredeyse ayırt edilemeyen üç düz gövde olarak çizer. Inter'in `cv05` (kuyruklu l)
ve `cv08` (serifli I) özellikleri bu beş harfi ayırır; başlıklar için Archivo'nun genişlik ekseni
uzun Türkçe başlıkları sarmak yerine daraltır.

Satır yüksekliği başlıklarda 1.20'nin altına inmez — İ ve Ğ büyük harf yüksekliğinin üzerine taşar.

---

## Yapı

```
src/
  app/                 yönlendirici, düzen, hata ve yükleme sınırları
  pages/               rota bileşenleri
  widgets/             sayfa düzeyi bloklar (başlık, alt bilgi, ana sayfa bölümleri)
  features/            etkileşimli dilimler
    search-form/         şehir birleşik kutusu, tarih alanı, arama formu
    trip-results/        kart, filtre rayı, sıralama, tarih şeridi, durumlar
    seat-map/            koltuk haritası, şasi, gösterge, seçim rayı
    booking/             taslak deposu (zustand)
  entities/            alan modeli
    deck/                geometri motoru + otobüs planı kataloğu
    seat/                koltuk modeli, kurallar, fiyatlandırma
  shared/
    api/                 katalog, sahte sunucu, sorgu seçenekleri
    lib/                 tr biçimlendiriciler, url durumu, rng, kancalar
    ui/                  temel bileşenler
  styles/theme.css     tasarım jetonları
```

`legacy/` eski uygulamayı barındırır. Yalnızca referans içindir, derlemeye dahil değildir.

## Testler

```bash
npm test
```

Testler saf katmana odaklanır: geometri motoru, sepet kuralları, fiyatlandırma, Türkçe
biçimlendirme, URL serileştirme ve sahte sunucunun belirlenimliliği. Bunlar eskiden elle ayarlanan
şeylerin yerini alır.
