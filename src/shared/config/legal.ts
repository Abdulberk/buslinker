/**
 * The legal pages' content source.
 *
 * Kept as data rather than JSX so `LegalPage` stays a renderer: the table of
 * contents, the anchor ids and the reading order all fall out of this shape,
 * and a new document is a new entry rather than a new page component.
 */

export interface LegalSection {
  readonly heading: string
  readonly paragraphs: readonly string[]
  readonly bullets?: readonly string[]
}

export interface LegalDoc {
  readonly slug: LegalSlug
  readonly title: string
  /** ISO calendar day; rendered through `formatDateLong`. */
  readonly updatedAt: string
  readonly intro: string
  readonly sections: readonly LegalSection[]
}

export const LEGAL_SLUGS = [
  'kvkk',
  'gizlilik-politikasi',
  'kullanim-kosullari',
  'cerez-politikasi',
] as const

export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export function isLegalSlug(value: string | undefined): value is LegalSlug {
  return value !== undefined && (LEGAL_SLUGS as readonly string[]).includes(value)
}

export const LEGAL_DOCS: Record<LegalSlug, LegalDoc> = {
  kvkk: {
    slug: 'kvkk',
    title: 'KVKK Aydınlatma Metni',
    updatedAt: '2026-07-14',
    intro:
      'Bu metin, BusLinker üzerinden bilet arama ve satın alma süreçlerinde kişisel verilerin nasıl işlendiğini anlatmak üzere hazırlanmıştır. BusLinker bir portföy çalışmasıdır; aşağıdaki metin yalnızca gösterim amaçlı örnek bir taslaktır, hukuki tavsiye niteliği taşımaz ve gerçek bir veri işleme faaliyetini tanımlamaz. Gerçek bir uygulamada bu metnin, faaliyetinizi bilen bir hukuk danışmanı tarafından yeniden yazılması gerekir.',
    sections: [
      {
        heading: 'Aydınlatma metninin amacı',
        paragraphs: [
          '6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi, kişisel verisi işlenen kişilerin bu işlemeden önce bilgilendirilmesini zorunlu tutar. Bu metin de söz konusu bilgilendirmenin nasıl kurgulanabileceğini göstermek için yazılmıştır.',
          'Metin; hangi verilerin toplandığını, hangi amaçla ve hangi hukuki sebebe dayanılarak işlendiğini, kimlere aktarılabileceğini ve ilgili kişinin hangi haklara sahip olduğunu sırasıyla açıklar. Bir bölümü okumadan geçtiyseniz sağdaki içindekiler listesinden geri dönebilirsiniz.',
        ],
      },
      {
        heading: 'İşlenebilecek kişisel veriler',
        paragraphs: [
          'Bir otobüs bileti platformunun tipik olarak ihtiyaç duyduğu veri kategorileri aşağıda sıralanmıştır. BusLinker tanıtım sürümünde bu verilerin hiçbiri toplanmaz, bir sunucuya gönderilmez ve saklanmaz; formlar yalnızca arayüzü göstermek için çalışır.',
        ],
        bullets: [
          'Kimlik verisi: ad, soyad ve bilet üzerinde yer alması gereken diğer bilgiler.',
          'İletişim verisi: e-posta adresi ve cep telefonu numarası.',
          'Seyahat verisi: kalkış ve varış noktası, sefer tarihi, seçilen koltuk ve PNR numarası.',
          'İşlem güvenliği verisi: oturum kayıtları, IP adresi ve cihaz bilgisi.',
          'Müşteri işlem verisi: iptal, iade ve destek talepleriyle ilgili yazışmalar.',
        ],
      },
      {
        heading: 'İşleme amaçları ve hukuki sebepler',
        paragraphs: [
          'Kişisel veriler, yalnızca belirli, açık ve meşru amaçlarla işlenir. Aşağıdaki eşleştirme, hangi amacın hangi hukuki sebebe dayandığını göstermeyi amaçlar.',
        ],
        bullets: [
          'Bilet satışının ve koltuk tahsisinin tamamlanması: sözleşmenin kurulması ve ifası için veri işlemenin zorunlu olması.',
          'Fatura ve bilet kayıtlarının mevzuatta öngörülen süre boyunca tutulması: hukuki yükümlülüğün yerine getirilmesi.',
          'İptal, iade ve destek taleplerinin sonuçlandırılması: sözleşmenin ifası ve meşru menfaat.',
          'Sahtecilik ve kötüye kullanım girişimlerinin tespiti: veri sorumlusunun meşru menfaati.',
          'Kampanya ve bülten gönderimi: yalnızca açık rızanız bulunduğu sürece, dilediğiniz an geri alabileceğiniz şekilde.',
        ],
      },
      {
        heading: 'Aktarım ve saklama',
        paragraphs: [
          'Bilet satışı, doğası gereği üçüncü taraflarla veri paylaşımı gerektirir: koltuğu tahsis eden otobüs firması, ödemeyi yürüten ödeme kuruluşu ve altyapıyı sağlayan hizmet sağlayıcıları bunların başında gelir. Gerçek bir uygulamada bu aktarımların her biri, Kanun’un 8. ve 9. maddelerindeki şartlara göre ayrı ayrı değerlendirilir.',
          'Veriler, işlendikleri amaç için gerekli olan süre boyunca; mevzuatta bir süre öngörülmüşse o süre boyunca saklanır. Sürenin sonunda veriler silinir, yok edilir veya anonim hâle getirilir. BusLinker tanıtım sürümünde saklanan bir kişisel veri bulunmadığı için bu süreler yalnızca örnek niteliğindedir.',
        ],
      },
      {
        heading: 'İlgili kişinin hakları',
        paragraphs: [
          'Kanun’un 11. maddesi uyarınca, kişisel verisi işlenen herkes veri sorumlusuna başvurarak aşağıdaki taleplerde bulunabilir.',
        ],
        bullets: [
          'Kişisel verisinin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme.',
          'İşlemenin amacını ve verilerin amacına uygun kullanılıp kullanılmadığını öğrenme.',
          'Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme.',
          'Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme.',
          'Kanun’da öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme.',
          'İşlemenin hukuka aykırı olması sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.',
        ],
      },
      {
        heading: 'Başvuru yolu',
        paragraphs: [
          'Gerçek bir uygulamada başvurular; yazılı olarak, kayıtlı elektronik posta adresi üzerinden veya veri sorumlusuna daha önce bildirilmiş bir e-posta adresinden iletilir ve en geç otuz gün içinde sonuçlandırılır.',
          'BusLinker tanıtım sürümünde işlenen bir kişisel veri bulunmadığından, buradan yapılan bir başvurunun karşılığı da bulunmamaktadır. Ürünle ilgili sorularınız için iletişim sayfasındaki formu kullanabilirsiniz.',
        ],
      },
    ],
  },

  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    updatedAt: '2026-07-14',
    intro:
      'Bu politika, BusLinker’ı kullanırken hangi bilgilerin nasıl ele alındığını sade bir dille anlatır. BusLinker bir portföy çalışmasıdır; bu metin gösterim amaçlı örnek bir taslak olup hukuki tavsiye niteliği taşımaz. Tanıtım sürümünde girdiğiniz hiçbir bilgi tarayıcınızın dışına çıkmaz.',
    sections: [
      {
        heading: 'Kapsam',
        paragraphs: [
          'Politika; BusLinker web arayüzü, arama ve bilet akışı ile bu akışların içindeki formları kapsar. Arama sonuçlarından ulaştığınız üçüncü taraf siteler kendi gizlilik metinlerine tabidir ve bu politikanın kapsamı dışındadır.',
          'Bir bölümü değiştirdiğimizde sayfanın başındaki güncelleme tarihini de değiştiririz; önemli bir değişiklikte ayrıca arayüz üzerinden bilgilendirme yapılması beklenir.',
        ],
      },
      {
        heading: 'Toplanan bilgiler',
        paragraphs: [
          'İki tür bilgiden söz edilebilir: sizin doğrudan girdikleriniz ve kullanım sırasında teknik olarak oluşanlar.',
        ],
        bullets: [
          'Doğrudan girdikleriniz: arama kriterleriniz, yolcu bilgileri, iletişim formuna yazdıklarınız ve bülten aboneliği için verdiğiniz e-posta adresi.',
          'Teknik olarak oluşanlar: sayfa görüntüleme kayıtları, tarayıcı ve cihaz türü, yaklaşık konum bilgisi ve hata kayıtları.',
          'Tercihleriniz: koyu/açık tema seçimi ve son aramalarınız gibi, yalnızca tarayıcınızda tutulan ayarlar.',
        ],
      },
      {
        heading: 'Bilgilerin kullanımı',
        paragraphs: [
          'Toplanan bilgiler; aramanın sonuçlanması, biletin oluşturulması, destek taleplerinin yanıtlanması, hataların giderilmesi ve arayüzün ölçülüp iyileştirilmesi için kullanılır.',
          'Bilgileriniz reklam amacıyla üçüncü kişilere satılmaz. Açık rızanız olmadan pazarlama iletisi gönderilmez; gönderilen her iletide de tek tıkla çıkma bağlantısı bulunur.',
        ],
      },
      {
        heading: 'Güvenlik',
        paragraphs: [
          'Gerçek bir uygulamada aktarım güvenliği TLS ile sağlanır, yetkisiz erişime karşı rol bazlı erişim denetimi uygulanır ve ödeme bilgileri lisanslı ödeme kuruluşunda tutulur; bu bilgiler platformun kendi veri tabanına hiç yazılmaz.',
          'BusLinker tanıtım sürümü kart numarası, kimlik numarası veya benzeri hassas bir veri istemez. Ödeme adımı yalnızca arayüzü göstermek için vardır ve gerçek bir tahsilat yapmaz.',
        ],
      },
      {
        heading: 'Saklama süresi',
        paragraphs: [
          'Her bilgi türü için ayrı bir saklama süresi belirlenir: bilet ve fatura kayıtları mevzuatın öngördüğü süre boyunca, destek yazışmaları talebin kapanmasından sonra makul bir süre, teknik günlükler ise kısa süreli olarak tutulur.',
          'Sürenin sonunda kayıtlar silinir veya kimliği belirlenemeyecek hâle getirilir. Tanıtım sürümünde saklanan bir kayıt bulunmadığından bu süreler örnek olarak verilmiştir.',
        ],
      },
      {
        heading: 'Haklarınız ve iletişim',
        paragraphs: [
          'Kendinizle ilgili bilgilere erişmeyi, bunların düzeltilmesini veya silinmesini istemeyi ve pazarlama izninizi geri almayı her zaman talep edebilirsiniz. Bu taleplerin nasıl işletildiği KVKK Aydınlatma Metni’nde ayrıntılı olarak anlatılmıştır.',
          'Politikayla ilgili sorularınızı iletişim sayfasındaki form üzerinden iletebilirsiniz.',
        ],
      },
    ],
  },

  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    updatedAt: '2026-07-14',
    intro:
      'Bu koşullar, BusLinker arayüzünü kullanırken tarafların karşılıklı beklentilerini tanımlar. BusLinker bir portföy çalışmasıdır; aşağıdaki metin gösterim amaçlı örnek bir taslak olup hukuki tavsiye niteliği taşımaz ve gerçek bir satış sözleşmesi kurmaz.',
    sections: [
      {
        heading: 'Hizmetin tanımı',
        paragraphs: [
          'BusLinker, şehirlerarası otobüs seferlerinin aranmasını, karşılaştırılmasını ve koltuk seçimini tek bir arayüzde toplayan bir bilet arama uygulamasıdır. Taşıma hizmetini platform değil, seferi işleten otobüs firması sunar.',
          'Bu tanıtım sürümünde seferler, gerçek bir firma sistemine bağlanmadan örnek verilerle üretilir. Görülen saatler, fiyatlar ve doluluk bilgileri gerçek sefer verisi değildir ve hiçbir bilet gerçekten satılmaz.',
        ],
      },
      {
        heading: 'Kullanıcının yükümlülükleri',
        paragraphs: [
          'Arayüzü kullanırken aşağıdaki maddelere uymanız beklenir. Bunlar, hem diğer kullanıcıların hem de sistemin sağlıklı çalışması içindir.',
        ],
        bullets: [
          'Yolcu bilgilerini doğru ve eksiksiz girmek; bilet üzerindeki adın kimlik belgesiyle uyuşması gerekir.',
          'Hesabınıza ait giriş bilgilerini üçüncü kişilerle paylaşmamak.',
          'Otomatik araçlarla toplu sorgu göndermemek, arama altyapısına orantısız yük bindirmemek.',
          'Platformun içeriğini izinsiz kopyalamamak veya ticari amaçla yeniden yayımlamamak.',
        ],
      },
      {
        heading: 'Bilet, iptal ve iade',
        paragraphs: [
          'Bilet koşulları seferi işleten firmaya göre değişir. İptal süresi, iade kesintisi ve değişiklik hakkı gibi başlıklar, satın alma öncesinde sefer ayrıntısında gösterilir; satın almadan önce bu koşulları okumanız beklenir.',
          'İptal ve iade talepleri, biletin alındığı kanal üzerinden yürütülür. İade tutarı, ödemenin yapıldığı yönteme iade edilir ve bankaya bağlı olarak hesabınıza geçmesi birkaç iş günü sürebilir.',
        ],
      },
      {
        heading: 'Fiyatlar ve uygunluk',
        paragraphs: [
          'Fiyatlar ve koltuk durumu, firmaların sistemlerinden gelen anlık bilgilere dayanır ve siz arama yaparken değişebilir. Bir koltuk, ödeme adımını tamamlayana kadar kesin olarak size ayrılmış sayılmaz.',
          'Arama sonucunda gösterilen tutarın ödeme ekranındaki tutarla aynı olması esastır. Bir tutarsızlık fark ederseniz işlemi tamamlamadan önce bize bildirmeniz beklenir.',
        ],
      },
      {
        heading: 'Sorumluluğun sınırı',
        paragraphs: [
          'Seferin gerçekleşmesi, kalkış saatine uyulması, otobüsün donanımı ve yolculuk sırasındaki hizmet kalitesi taşımayı üstlenen firmanın sorumluluğundadır. Platform, bu unsurlar bakımından aracılık ettiği ölçüde sorumludur.',
          'Arayüzün kesintisiz ve hatasız çalışacağı taahhüt edilemez; planlı bakım veya teknik arıza nedeniyle erişim geçici olarak durabilir. Bu tanıtım sürümü ise yalnızca ürünün nasıl çalıştığını göstermek için yayımlanmıştır.',
        ],
      },
      {
        heading: 'Değişiklikler ve uygulanacak hukuk',
        paragraphs: [
          'Koşullarda yapılan değişiklikler bu sayfada yayımlandığı anda geçerli olur ve sayfanın başındaki güncelleme tarihinden takip edilebilir. Değişiklikten sonra arayüzü kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.',
          'Bu koşullardan doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır. Tüketici sıfatıyla, tüketici hakem heyetlerine ve tüketici mahkemelerine başvurma hakkınız saklıdır.',
        ],
      },
    ],
  },

  'cerez-politikasi': {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    updatedAt: '2026-07-14',
    intro:
      'Bu politika, çerezlerin ve benzeri teknolojilerin bir bilet arama uygulamasında ne işe yaradığını ve tercihlerinizi nasıl yönetebileceğinizi anlatır. BusLinker bir portföy çalışmasıdır; bu metin gösterim amaçlı örnek bir taslak olup hukuki tavsiye niteliği taşımaz.',
    sections: [
      {
        heading: 'Çerez nedir?',
        paragraphs: [
          'Çerez, ziyaret ettiğiniz sitenin tarayıcınıza bıraktığı küçük bir metin dosyasıdır. Bir sonraki ziyaretinizde site bu dosyayı okuyarak sizi tanır; oturumunuzun açık kalması ya da tema tercihinizin hatırlanması bu sayede olur.',
          'Çerezlere ek olarak tarayıcı depolaması (localStorage) ve oturum depolaması gibi benzer teknolojiler de kullanılabilir. Bu politikada hepsi kısaca “çerez” olarak anılmaktadır.',
        ],
      },
      {
        heading: 'Kullanılan çerez türleri',
        paragraphs: [
          'Çerezler, yerine getirdikleri işleve göre dört başlıkta toplanabilir. Zorunlu olanlar dışındakiler yalnızca izniniz varsa çalışır.',
        ],
        bullets: [
          'Zorunlu çerezler: oturumun sürdürülmesi, güvenlik doğrulaması ve sepetin korunması gibi, olmadan sitenin çalışamayacağı işlevler.',
          'Tercih çerezleri: dil, koyu/açık tema ve son aramalarınız gibi seçimlerinizi hatırlar.',
          'Performans çerezleri: hangi sayfaların ne kadar sürede açıldığını ve nerede hata alındığını toplu olarak ölçer.',
          'Pazarlama çerezleri: ilgi alanlarınıza uygun kampanyaların gösterilmesi için kullanılır; yalnızca açık rızayla çalışır.',
        ],
      },
      {
        heading: 'BusLinker tanıtım sürümünde durum',
        paragraphs: [
          'Bu tanıtım sürümü izleme veya reklam çerezi kullanmaz. Yalnızca tarayıcınızda kalan ve sunucuya gönderilmeyen küçük tercihler tutulur; koyu/açık tema seçimi bunun tipik örneğidir.',
          'Tarayıcınızın site verilerini temizlemeniz hâlinde bu tercihler de silinir ve arayüz varsayılan hâline döner.',
        ],
      },
      {
        heading: 'Üçüncü taraf çerezleri',
        paragraphs: [
          'Gerçek bir uygulamada harita, video oynatıcı veya ödeme sağlayıcısı gibi gömülü bileşenler kendi çerezlerini bırakabilir. Bu çerezler ilgili sağlayıcının politikasına tabidir ve platform tarafından okunamaz.',
          'Böyle bir bileşen eklendiğinde, sağlayıcının adı ve amacı bu sayfada açıkça listelenmelidir.',
        ],
      },
      {
        heading: 'Tercihlerinizi yönetmek',
        paragraphs: [
          'Çerez tercihlerinizi dilediğiniz zaman değiştirebilirsiniz. En yaygın iki yol, sitenin çerez tercih panelini kullanmak ve tarayıcı ayarlarından ilerlemektir.',
        ],
        bullets: [
          'Tarayıcınızın gizlilik ayarlarından çerezleri site bazında engelleyebilir veya topluca silebilirsiniz.',
          'Zorunlu çerezleri engellerseniz oturum açma ve bilet alma adımlarının çalışmayacağını göz önünde bulundurun.',
          'Mobil cihazlarda reklam kimliğini sıfırlamak, pazarlama amaçlı takibi belirgin biçimde azaltır.',
        ],
      },
    ],
  },
}
