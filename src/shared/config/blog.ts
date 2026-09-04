/**
 * The blog's content source.
 *
 * Kept as data rather than JSX for the same reason the legal documents are:
 * the list page, the category filter, the table of contents and the related
 * posts all fall out of this shape, so a new article is a new entry rather
 * than a new component.
 */

import type { CampaignTone } from './campaigns'

export type BlogCategory = 'rehber' | 'ipucu' | 'guzergah' | 'haber'

export const BLOG_CATEGORIES: Record<BlogCategory, string> = {
  rehber: 'Rehber',
  ipucu: 'İpucu',
  guzergah: 'Güzergâh',
  haber: 'Haber',
}

export interface BlogSection {
  readonly heading: string
  readonly paragraphs: readonly string[]
  readonly bullets?: readonly string[]
}

export interface BlogPost {
  readonly slug: string
  readonly title: string
  readonly excerpt: string
  readonly category: BlogCategory
  readonly readingMinutes: number
  /** ISO calendar day; rendered through `formatDateLong` / `formatDateMedium`. */
  readonly publishedAt: string
  /** Reuses the campaign palette, so an article band and a campaign band match. */
  readonly heroTone: CampaignTone
  readonly sections: readonly BlogSection[]
}

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: 'otobuste-konforlu-yolculuk-icin-8-ipucu',
    title: 'Otobüste konforlu yolculuk için 8 ipucu',
    excerpt:
      'Koltuk seçiminden çantanızı nasıl toparlayacağınıza kadar, altı saatlik bir yolculuğu belirgin biçimde rahatlatan sekiz alışkanlık.',
    category: 'ipucu',
    readingMinutes: 7,
    publishedAt: '2026-08-26',
    heroTone: 'brand',
    sections: [
      {
        heading: 'Koltuğunuzu yolculuğun uzunluğuna göre seçin',
        paragraphs: [
          'Otobüsteki her koltuk aynı yolculuğu vaat etmez. Ön taraf yolu daha az sallantılı hissettirir ve inişte zaman kazandırır; orta bölüm tekerlek aksından uzak olduğu için en dengeli yerdir; arka koltuklar motora ve tuvalete yakınlığı nedeniyle uzun seferlerde daha yorucu olabilir.',
          'Altı saati aşan bir yolculuk planlıyorsanız orta bölümdeki tek koltuklardan birini tercih edin. Kısa mesafede ise pencere kenarı, uyumak isteyenler için başınızı yaslayabileceğiniz sabit bir nokta sunar. Koridor tarafı ise sık ayağa kalkacaksanız yanınızdaki yolcuyu rahatsız etmeden hareket etmenizi sağlar.',
        ],
        bullets: [
          'Uzun sefer: orta bölüm, tekerlek aksının önündeki sıralar.',
          'Uyumak isteyenler: pencere kenarı ve mümkünse tek koltuk.',
          'Sık kalkacaklar: koridor tarafı, ön kapıya yakın sıralar.',
        ],
      },
      {
        heading: 'Yanınıza alacaklarınızı üç parçaya ayırın',
        paragraphs: [
          'Bagajınızı tek bir çantada toplamak, yolculuk boyunca ihtiyacınız olan her şeyi ayak altına yığmak demektir. Eşyalarınızı üç gruba ayırın: bagaj bölümüne verilecek büyük çanta, üst rafa konacak orta boy çanta ve bütün yolculuk boyunca kucağınızda ya da önünüzdeki filede duracak küçük bir kese.',
          'Küçük kesede yalnızca yolculuk boyunca uzanacağınız şeyler bulunsun: telefon, şarj kablosu, kulaklık, su, ıslak mendil, ilaçlarınız ve varsa göz bandı. Böylece her ihtiyacınızda üst rafa uzanmak zorunda kalmaz, karanlıkta yanınızdaki yolcuyu uyandırmazsınız.',
        ],
      },
      {
        heading: 'Vücudunuzu uzun oturuşa hazırlayın',
        paragraphs: [
          'Uzun süre aynı pozisyonda oturmak bacaklarda şişmeye ve belde ağrıya yol açar. Yola çıkmadan önce dar kesimli pantolon ve sıkı ayakkabı yerine rahat, esnek bir kombin seçin. Otobüse bindiğinizde ayakkabınızı gevşetin, mümkünse ince bir çorapla kalın.',
          'Saat başı birkaç dakikanızı ayırıp ayak bileğinizi çevirin, dizlerinizi göğsünüze doğru hafifçe çekin, omuzlarınızı geriye doğru açın. Bu küçük hareketler dolaşımı canlı tutar ve varışta hissedeceğiniz tutulmayı belirgin biçimde azaltır.',
          'Boyun yastığı, seyahat konforunun en çok hafife alınan parçasıdır. Şişme bir yastık yer kaplamaz ve başınızın öne düşmesini engelleyerek boyun ağrısının en yaygın nedenini ortadan kaldırır.',
        ],
      },
      {
        heading: 'Molalarda zamanı doğru kullanın',
        paragraphs: [
          'Şoförün duyurduğu mola süresi tavsiye değil, bağlayıcı bir süredir. Otobüsten inerken saate bakın, dönüş saatinizi belirleyin ve aracın plakasını aklınızda tutun; dinlenme tesislerinde birbirine çok benzeyen araçlar yan yana durur.',
          'Molayı yalnızca yemek için değil, hareket etmek için kullanın. Beş dakika yürümek, oturarak geçen üç saatin yorgunluğunu ölçülebilir biçimde azaltır. Ağır ve yağlı yiyecekler yerine hafif bir şeyler tercih etmek, kalan yolda üşüme ve mide rahatsızlığı yaşama ihtimalinizi düşürür.',
        ],
      },
      {
        heading: 'Otobüsün içinde ortak alanı gözetin',
        paragraphs: [
          'Konfor tek başına sizin koltuğunuzda başlamaz. Koltuğunuzu yatırmadan önce arkanızdaki yolcuya dönüp kısaca haber vermek, telefonunuzu sessize almak ve kulaklık kullanmak yolculuğun tamamını herkes için kolaylaştırır.',
          'Gece seferlerinde okuma lambası dışındaki ışıkları kapalı tutun; telefon ekranının parlaklığını düşürmek, arkanızdaki yolcunun uyumasını sağlayan en basit davranıştır. Klima ayarı size soğuk geliyorsa yönlendiriciyi kendinizden uzağa çevirin, doğrudan görevliye söylemeden önce ince bir üst katman deneyin.',
        ],
      },
    ],
  },
  {
    slug: '2-1-ve-2-2-koltuk-duzeni-farki',
    title: '2+1 ve 2+2 koltuk düzeni arasındaki fark nedir?',
    excerpt:
      'Aynı hatta iki otobüs, iki farklı yolculuk. Koltuk düzeninin genişliğe, fiyata ve yolculuk süresine etkisini karşılaştırıyoruz.',
    category: 'rehber',
    readingMinutes: 6,
    publishedAt: '2026-08-18',
    heroTone: 'info',
    sections: [
      {
        heading: 'İki düzen, tek bir sayı farkı değil',
        paragraphs: [
          'Koltuk düzeni, otobüsün bir sırasında koridorun iki yanında kaç koltuk bulunduğunu anlatır. 2+2 düzende koridorun her iki yanında ikişer koltuk vardır; 2+1 düzende ise bir yanda iki, diğer yanda tek koltuk bulunur. Aradaki fark tek bir koltuk gibi görünse de aracın tamamını değiştirir.',
          'Otobüsün genişliği sabit olduğu için bir sıradan bir koltuk çıkarmak, kalan koltukların her birine birkaç santimetre kazandırır. Bu santimetreler omuz hizasında, dirsek mesafesinde ve koltuğun yatma açısında hissedilir. Aynı hatta 2+1 bir araç, 2+2 bir araca göre yaklaşık üçte bir oranında daha az yolcu taşır.',
        ],
      },
      {
        heading: '2+1 düzenin getirdikleri',
        paragraphs: [
          '2+1 düzenin en belirgin avantajı tek koltuklardır. Tek başına yolculuk edenler için bu koltuklar, yanında kimsenin bulunmadığı, kolçağın tamamen kendilerine ait olduğu ve uyandığınızda kimseyi rahatsız etmeden ayağa kalkabildiğiniz bir alan sunar.',
          'Koltukların daha geniş olması, yatma açısının artması anlamına da gelir. Gece seferlerinde ve altı saati aşan yolculuklarda bu fark, uyuyabilmek ile uyuklayarak yol almak arasındaki farka dönüşür. Çift koltuklar da 2+2 düzendeki eşlerine göre daha ferahtır.',
        ],
        bullets: [
          'Tek koltuk seçeneği: yanınızda yolcu bulunmaz.',
          'Daha geniş oturma alanı ve daha büyük yatma açısı.',
          'Koridor daha ferah olduğu için iniş ve biniş daha rahattır.',
        ],
      },
      {
        heading: '2+2 düzen ne zaman daha mantıklı?',
        paragraphs: [
          '2+2 düzen genellikle daha uygun fiyatlıdır ve bir hatta çok daha sık sefer bulunmasını sağlar. Kısa ve orta mesafede, özellikle üç saatin altındaki yolculuklarda koltuk genişliğinin yarattığı fark küçülür; buna karşılık fiyat farkı aynı kalır.',
          'Birlikte yolculuk eden iki kişi için 2+2 düzen çoğu zaman yeterlidir; yan yana oturmak zaten istenen şeydir. Kalabalık bir grupla seyahat ediyorsanız 2+2 araçlarda aynı seferde yan yana koltuk bulma ihtimaliniz de belirgin biçimde yüksektir.',
        ],
      },
      {
        heading: 'Fiyat farkı nereden geliyor?',
        paragraphs: [
          'Bir seferin maliyetinin büyük kısmı yolcu sayısından bağımsızdır: yakıt, sürücü, köprü ve otoyol giderleri araç dolu da olsa boş da olsa aynıdır. 2+1 bir araç bu maliyeti daha az koltuğa böldüğü için koltuk başına fiyat doğal olarak yükselir.',
          'Bu nedenle aynı hatta aynı saatte kalkan iki otobüs arasındaki fiyat farkı çoğu zaman bir hizmet farkı değil, bir kapasite farkıdır. Arama sonuçlarında koltuk düzenine göre filtreleyerek iki seçeneği yan yana görebilir, farkın sizin için anlamlı olup olmadığına kendiniz karar verebilirsiniz.',
        ],
      },
      {
        heading: 'Hangi düzeni seçmelisiniz?',
        paragraphs: [
          'Kesin bir kural yoktur; karar mesafeye, saate ve kaç kişi olduğunuza bağlıdır. Aşağıdaki üç soru çoğu durumda seçimi netleştirir.',
        ],
        bullets: [
          'Yolculuk altı saatten uzun ya da gece kalkışlı mı? 2+1 düzenin farkı burada en çok hissedilir.',
          'Tek başınıza mı seyahat ediyorsunuz? Tek koltuk, ödediğiniz farkın karşılığını doğrudan verir.',
          'Yolculuk üç saatin altında mı? 2+2 düzen çoğu zaman yeterlidir; farkı yol boyunca fark etmezsiniz.',
        ],
      },
    ],
  },
  {
    slug: 'istanbul-ankara-guzergah-rehberi',
    title: 'İstanbul–Ankara otobüs güzergâhı rehberi',
    excerpt:
      'Türkiye’nin en yoğun otobüs hattında kalkış noktaları, yol üzerindeki duraklar, süre beklentisi ve varışta ulaşım.',
    category: 'guzergah',
    readingMinutes: 8,
    publishedAt: '2026-08-11',
    heroTone: 'success',
    sections: [
      {
        heading: 'Hat hakkında kısa bilgi',
        paragraphs: [
          'İstanbul ile Ankara arası, karayoluyla yaklaşık 450 kilometredir ve otobüsle ortalama altı ila yedi saat sürer. Süre; kalkış noktasına, trafiğe, mola sayısına ve kullanılan güzergâha göre değişir. Gece seferleri trafiğin seyrelmesi nedeniyle çoğu zaman gündüz seferlerinden kısa sürer.',
          'Hat, ülkedeki en yoğun otobüs koridorlarından biridir; gün boyunca çok sayıda firma sefer düzenler. Bu yoğunluk, saat seçimini rahatlatır: sabahın erken saatlerinden gece yarısına kadar hemen her aralıkta kalkış bulabilirsiniz.',
        ],
      },
      {
        heading: 'Nereden kalkılır, nereye varılır',
        paragraphs: [
          'İstanbul tarafında biletler genellikle Esenler Otogarı üzerinden düzenlenir; Alibeyköy ve Dudullu gibi noktalardan ek biniş yapan seferler de vardır. Anadolu yakasında oturuyorsanız Dudullu ya da Harem tarafından binebileceğiniz bir sefer aramak, şehir içinde bir saate kadar zaman kazandırabilir.',
          'Ankara tarafında varış noktası büyük çoğunlukla AŞTİ’dir. Bilet alırken kalkış ve varış otogarını mutlaka kontrol edin: aynı fiyata görünen iki sefer, şehir içinde geçireceğiniz süre bakımından birbirinden çok farklı olabilir.',
        ],
        bullets: [
          'İstanbul Avrupa yakası: Esenler Otogarı, Alibeyköy.',
          'İstanbul Anadolu yakası: Dudullu, Harem ve seferine göre ara biniş noktaları.',
          'Ankara: AŞTİ (Ankara Şehirlerarası Terminal İşletmesi).',
        ],
      },
      {
        heading: 'Yol boyunca ne görürsünüz',
        paragraphs: [
          'Güzergâh İstanbul’dan çıktıktan sonra Kocaeli ve Sakarya üzerinden ilerler. Bu bölümde yol büyük ölçüde düz ve hızlıdır; ilk mola çoğunlukla Sakarya çevresindeki dinlenme tesislerinde verilir.',
          'Ardından Bolu Dağı geçişi gelir. Kış aylarında bu bölüm hava koşullarından en çok etkilenen kısımdır ve yolculuk süresini uzatabilir. Dağ geçişinden sonra Gerede ve Kızılcahamam üzerinden Ankara’ya inilir; son bölümde peyaj yerini İç Anadolu’nun açık arazisine bırakır.',
          'Toplamda bir ya da iki mola verilir. Mola sayısı sefere ve firmaya göre değişir; gece seferlerinde genellikle tek ve kısa bir mola tercih edilir.',
        ],
      },
      {
        heading: 'Hangi saatte yola çıkmalısınız',
        paragraphs: [
          'Sabah erken kalkışlar, Ankara’ya öğleden önce varmak isteyenler için uygundur; İstanbul çıkışındaki trafiği de büyük ölçüde atlatırsınız. Öğleden sonra kalkan seferler ise akşam yemeği saatinde varış sağlar ama İstanbul içindeki çıkış trafiğine denk gelme ihtimali taşır.',
          'Gece seferleri hem otelde bir gece kazandırdığı hem de yol boyunca trafik olmadığı için sık tercih edilir. Ertesi sabah erken bir randevunuz varsa, varış saatinden en az bir saat sonrasına planlama yapmanız isabetli olur; gecikme her hatta mümkündür.',
        ],
      },
      {
        heading: 'Varışta Ankara içinde ulaşım',
        paragraphs: [
          'AŞTİ, Ankaray hattının uç istasyonudur; buradan Kızılay’a doğrudan ulaşabilir, Kızılay’da metroya aktarma yaparak şehrin büyük bölümüne geçebilirsiniz. Terminalin içinde firma servisleri de belirli semtlere ücretsiz aktarma sağlar; servis olup olmadığını bilet alırken sormakta fayda vardır.',
          'Gece varışlarında toplu taşıma saatlerinin daralabileceğini hesaba katın. Varış saatiniz gece yarısını geçiyorsa, terminalden nasıl ayrılacağınızı önceden planlamak, yolculuğun en çok unutulan ama en çok işe yarayan hazırlığıdır.',
        ],
      },
      {
        heading: 'Bilet alırken dikkat edilecekler',
        paragraphs: [
          'Bu hatta seçenek çok olduğu için karar vermeyi kolaylaştıracak birkaç ölçüt sıralamak yararlı olur.',
        ],
        bullets: [
          'Kalkış otogarını size en yakın olana göre seçin; şehir içi süre, hat süresinden daha belirleyici olabilir.',
          'Gece yolculuğunda 2+1 düzen, dinlenerek varmanız için belirgin fark yaratır.',
          'Yolculuk süresi ilanlarda ortalama verilir; kışın Bolu Dağı geçişi için pay bırakın.',
          'Dönüş tarihiniz belliyse iki bileti birlikte planlamak, saat seçeneklerini daralmadan görmenizi sağlar.',
        ],
      },
    ],
  },
  {
    slug: 'bilet-iptali-ve-iade-sureci',
    title: 'Bilet iptali ve iade süreci nasıl işler?',
    excerpt:
      'İptal ile iade arasındaki fark, kalkışa kalan sürenin etkisi, paranın hesabınıza dönüş takvimi ve iade edilemeyen biletler.',
    category: 'haber',
    readingMinutes: 6,
    publishedAt: '2026-08-04',
    heroTone: 'warning',
    sections: [
      {
        heading: 'İptal, iade ve değişiklik aynı şey değildir',
        paragraphs: [
          'Üç işlem sık sık birbirinin yerine kullanılır ama sonuçları farklıdır. İptal, biletin geçersiz kılınması ve koltuğun satışa geri açılmasıdır. İade, iptal edilen bilete karşılık ödenen tutarın geri gönderilmesidir. Değişiklik ise biletin iptal edilmeden başka bir sefere ya da tarihe taşınmasıdır.',
          'Bir biletin iptal edilebilir olması, tutarın tamamının geri döneceği anlamına gelmez. Aynı şekilde, değişiklik hakkı bulunan bir bilette fiyat farkı çıkabilir. Bu nedenle işlem yapmadan önce biletinizin ayrıntısında yazan iade koşulunu okumanız gerekir.',
        ],
      },
      {
        heading: 'İptal için nelere ihtiyacınız var',
        paragraphs: [
          'İptal işlemi için genellikle iki bilgi yeterlidir: bilet üzerindeki PNR kodu ve yolcunun soyadı. Üyelikle alınan biletlerde bu bilgileri girmenize gerek kalmadan bilet listenizden doğrudan işlem yapabilirsiniz.',
          'PNR kodu altı karakterlidir ve harf ile rakamlardan oluşur. Kodu SMS ile aldıysanız kopyalarken baştaki ve sondaki boşlukları temizleyin; sorgulama alanı boşlukları kodun parçası sayabilir.',
        ],
      },
      {
        heading: 'İade tutarı nasıl hesaplanır',
        paragraphs: [
          'İade tutarını belirleyen ana etken, kalkışa kalan süredir. Kalkışa uzun süre varken yapılan iptallerde kesinti düşük ya da hiç olmayabilir; kalkış saati yaklaştıkça koltuğun yeniden satılma ihtimali azaldığı için kesinti oranı artar.',
          'Kesinti oranları seferi işleten firmanın kurallarına göre değişir. Kampanyalı ve indirimli biletlerde iade koşulları çoğu zaman standart biletlerden daha kısıtlıdır; bu, indirimli fiyatın karşılığında verilen esnekliğin bir parçasıdır.',
        ],
      },
      {
        heading: 'Para hesabınıza ne zaman geçer',
        paragraphs: [
          'İade, ödemenin yapıldığı yönteme geri gönderilir. Kartla ödenen bir bilette tutar aynı karta yansır; farklı bir hesaba aktarma yapılmaz. Talep onaylandıktan sonra tutarın ekstrenize düşmesi, bankanızın işleyişine bağlı olarak birkaç iş günü sürebilir.',
          'Bu süre boyunca bankanız işlemi “bekleyen” olarak gösterebilir. İade tarihiniz hafta sonuna ya da resmî tatile denk geldiyse takvimi buna göre değerlendirin.',
        ],
      },
      {
        heading: 'İptal edilemeyen biletler',
        paragraphs: [
          'Her bilet iade edilebilir değildir. Kalkışa çok az süre kalan biletlerde, açık biletlerde ve bazı kampanyalı satışlarda iptal seçeneği kapanır. Böyle durumlarda bilet ayrıntısında iptal düğmesi hiç gösterilmez; bu, işlemin yarıda kalmaması için bilinçli bir tercihtir.',
          'Kalkışı kaçırdığınız bir bilette hakkınız firmanın kurallarına göre değişir. Kimi firmalar belirli bir süre içinde açık bilete çevirme imkânı tanır; bu istisnai bir uygulamadır ve her sefer için geçerli değildir.',
        ],
        bullets: [
          'Kalkışa çok az süre kalan biletler.',
          'İade edilemez olarak satılan kampanyalı biletler.',
          'Kalkış saati geçmiş, kullanılmamış biletler.',
        ],
      },
      {
        heading: 'Tanıtım sürümünde durum',
        paragraphs: [
          'BusLinker bir tanıtım uygulamasıdır. Bu sürümdeki iptal ve iade ekranları yalnızca akışı göstermek için vardır; hiçbir bilet gerçekten iptal edilmez, hiçbir tutar iade edilmez ve hiçbir kişisel veri saklanmaz. Ekranlarda gördüğünüz seferler, fiyatlar ve biletler örnek verilerle üretilir.',
        ],
      },
    ],
  },
  {
    slug: 'otobuste-cinsiyet-kurali-nasil-isler',
    title: 'Otobüste cinsiyet kuralı nasıl işler?',
    excerpt:
      'Yan yana koltukların neden bazen size kapalı göründüğünü, koltuk planında hangi işaretlerin ne anlama geldiğini açıklıyoruz.',
    category: 'rehber',
    readingMinutes: 5,
    publishedAt: '2026-07-24',
    heroTone: 'brand',
    sections: [
      {
        heading: 'Kural neyi düzenler',
        paragraphs: [
          'Şehirlerarası otobüslerde yaygın olarak uygulanan kural basittir: birbirini tanımayan iki yolcu, farklı cinsiyette olduklarında yan yana oturtulmaz. Kural yalnızca aynı sıradaki komşu koltuklar için geçerlidir; koridorun karşısındaki ya da önünüzdeki koltuğun kime ait olduğu satışı etkilemez.',
          'Bu nedenle koltuk seçerken gördüğünüz “kapalı” koltukların bir kısmı aslında dolu değildir. Yanındaki koltuk satıldığı için size kapanmıştır; başka bir yolcuya ise açık görünür.',
        ],
      },
      {
        heading: 'Koltuk planında ne görürsünüz',
        paragraphs: [
          'İyi tasarlanmış bir koltuk planında koltuğun durumu yalnızca renkle anlatılmaz. Dolu koltuk, satışa kapalı koltuk ve cinsiyet nedeniyle size kapalı koltuk farklı işaretlerle gösterilir; koltuğun üzerine geldiğinizde ya da odaklandığınızda nedeni yazıyla da okursunuz.',
          'Bir koltuğun yanındaki yolcunun cinsiyetini gösteren işaret, kişisel bir bilgi değil bir satış kuralının görünür hâlidir. Yolcunun adı, iletişim bilgisi ya da bileti hiçbir aşamada başka yolculara gösterilmez.',
        ],
      },
      {
        heading: 'Tek başına yolculuk edenler için',
        paragraphs: [
          'Tek başınıza seyahat ediyorsanız 2+1 düzendeki tek koltuklar kuralın tamamen dışında kalır: yanınızda komşu koltuk bulunmadığı için hiçbir kısıt uygulanmaz. Bu koltuklar aynı zamanda hızlı tükenen koltuklardır; erken almak neredeyse tek yoldur.',
          'Çift koltuklarda ise seçiminiz sonraki yolcuların seçeneklerini de belirler. Boş bir çift koltuğun bir yanına oturduğunuzda, diğer yan yalnızca sizinle aynı cinsiyetteki yolculara açık kalır.',
        ],
      },
      {
        heading: 'Birlikte yolculuk edenler ve aileler',
        paragraphs: [
          'Aynı işlemde birden fazla koltuk seçtiğinizde, birlikte seyahat eden yolcuları yan yana oturtabilirsiniz; kural, tanımadığınız yolculara karşı uygulanır. Bilet alırken her koltuk için yolcu bilgisini doğru işaretlemeniz, planın doğru kilitlenmesi için gereklidir.',
          'Küçük çocuklarla yolculukta koltukları erken seçmek işinizi kolaylaştırır. Yan yana iki koltuk kalmadığında, aynı sıradaki koridor karşısı koltuklar çoğu zaman en iyi ikinci seçenektir.',
        ],
      },
      {
        heading: 'Sık karşılaşılan durumlar',
        paragraphs: [
          'Kural basit olsa da uygulamada birkaç durum kafa karıştırır. Aşağıdakiler en sık sorulanlardır.',
        ],
        bullets: [
          'Boş görünen bir koltuğu seçemiyorum: yanındaki koltuk farklı cinsiyetteki bir yolcuya satılmış olabilir.',
          'Seçimimi kaldırınca komşu koltuk yeniden açılır: sizin seçiminiz de diğer yolcular için aynı kuralı tetikler.',
          'Otobüs değişirse plan değişir: koltuk numaraları yeni araca göre yeniden düzenlenebilir.',
          'Firma uygulamaları farklılaşabilir: bazı seferlerde kural yalnızca belirli bölümlerde işletilir.',
        ],
      },
    ],
  },
  {
    slug: 'gece-yolculugunda-uyku',
    title: 'Gece otobüsünde nasıl daha iyi uyunur?',
    excerpt:
      'Koltuk seçiminden ışığa, yeme düzeninden molalara: gece seferinde dinlenerek varmayı sağlayan pratik bir düzen.',
    category: 'ipucu',
    readingMinutes: 6,
    publishedAt: '2026-07-15',
    heroTone: 'info',
    sections: [
      {
        heading: 'Gece seferinin kendine has ritmi',
        paragraphs: [
          'Gece otobüsü, yolculuğu uykuya çevirebildiğinizde en verimli ulaşım biçimlerinden biridir: trafik seyrekleşir, süre kısalır ve varışta bir gün kazanırsınız. Kazanç, yalnızca gerçekten dinlenebildiğinizde ortaya çıkar.',
          'Bunun için yolculuğu bir gece uykusu gibi planlamak gerekir. Kalkıştan iki saat öncesinde ekran süresini azaltmak, kafeini kesmek ve hafif bir şey yemek, otobüse bindiğinizde uykuya geçişi belirgin biçimde hızlandırır.',
        ],
      },
      {
        heading: 'Koltuk seçimi uykunun yarısıdır',
        paragraphs: [
          'Gece seferinde koltuk seçimi, gündüzden daha belirleyicidir. Tekerlek aksının önündeki orta sıralar en az sallanan bölümdür. Tuvalete ve ön kapıya yakın koltuklar ise gece boyunca en çok hareketin olduğu yerlerdir; mümkünse uzak durun.',
          'Pencere kenarı, başınızı yaslayabileceğiniz sabit bir yüzey sunar ve yanınızdaki yolcu kalktığında uyanmazsınız. 2+1 düzendeki tek koltuk ise gece yolculuğunda ödediğiniz farkın karşılığını en net veren seçenektir.',
        ],
      },
      {
        heading: 'Işık, ses ve sıcaklık',
        paragraphs: [
          'Uykuyu bozan üç etkenin üçü de yanınıza alacağınız küçük eşyalarla yönetilebilir. Göz bandı, otobüsün iç aydınlatmasını ve yol boyunca geçen far ışıklarını tamamen keser. Kulak tıkacı ya da kulaklık, motor ve konuşma sesini bir fon gürültüsüne indirir.',
          'Otobüsler gece genellikle serin tutulur. İnce bir polar ya da şal, battaniyeden daha kullanışlıdır: uyurken kaymaz, mola sırasında da üzerinizde kalır. Ayaklarınızı sıcak tutmak, uykuya dalma süresini kısaltan en basit ayrıntıdır.',
        ],
        bullets: [
          'Göz bandı ve kulak tıkacı: en az yer kaplayan, en çok işe yarayan ikili.',
          'Boyun yastığı: başın öne düşmesini engeller, boyun ağrısını önler.',
          'İnce bir üst katman ve kalın çorap: klimanın serinliğine karşı.',
        ],
      },
      {
        heading: 'Yeme ve içme düzeni',
        paragraphs: [
          'Yola çıkmadan önceki ağır öğün, uykuyu kolaylaştırmaz; aksine mide rahatsızlığı ihtimalini artırır. Hafif ve tuzu düşük bir yemek tercih edin. Kafein, alındıktan sonra saatlerce etkisini sürdürdüğü için akşam saatlerinde çay ve kahveyi bırakmak isabetli olur.',
          'Su içmeyi tamamen kesmek de doğru değildir; otobüsün kuru havası susuzluk hissini artırır. Küçük yudumlarla düzenli su içmek, hem tuvalet ihtiyacını dengeler hem de sabah baş ağrısıyla uyanma ihtimalini düşürür.',
        ],
      },
      {
        heading: 'Molalar ve uyanma',
        paragraphs: [
          'Gece seferlerinde genellikle tek bir mola verilir. Uykunuz derinleştiyse bu molada inmek zorunda değilsiniz; ancak inecekseniz telefonunuza kısa bir alarm kurun ve aracın plakasını hatırlayın.',
          'Varıştan yaklaşık yarım saat önce uyanmayı hedefleyin. Aceleyle toparlanmak, iyi geçmiş bir yolculuğun sonunu yorucu kılar. Eşyalarınızı gece boyunca tek bir yerde tutmak, bu yarım saati sakin geçirmenin en kolay yoludur.',
        ],
      },
      {
        heading: 'Varışta kendinize zaman tanıyın',
        paragraphs: [
          'Otobüste geçen bir gece, yatakta geçen bir geceyle aynı dinlenmeyi vermez. Varış gününüzü buna göre planlayın: ilk birkaç saati yoğun bir programla doldurmak yerine yürüyüş, kahvaltı ve kısa bir dinlenme için pay bırakın.',
          'Gün ışığına çıkmak ve hafif bir hareket, vücut saatinizi yeniden hizalayan en etkili iki şeydir. Böylece kazandığınız günü gerçekten kullanmış olursunuz.',
        ],
      },
    ],
  },
]

export function postBySlug(slug: string | undefined): BlogPost | undefined {
  if (!slug) return undefined
  return BLOG_POSTS.find((post) => post.slug === slug)
}
