/**
 * Turkish copy — the source of truth for every key.
 *
 * `en.ts` is typed against this object, so a key added here and forgotten
 * there is a compile error rather than a string that silently falls back.
 */
export const tr = {
  common: {
    close: 'Kapat',
    skipToContent: 'İçeriğe geç',
    menu: 'Menü',
    appearance: 'Görünüm',
    signIn: 'Giriş Yap',
    signUp: 'Üye Ol',
    show: 'Göster',
    apply: 'Uygula',
    clear: 'Temizle',
  },

  nav: {
    main: 'Ana menü',
    mobile: 'Mobil menü',
    tickets: 'Otobüs Bileti',
    myTrips: 'Seferlerim',
    help: 'Yardım',
    sheetDescription: 'Sayfalar ve hesap işlemleri',
  },

  locale: {
    /** The header control's accessible name, e.g. "Para birimi ve dil: TL · TR". */
    trigger: 'Para birimi ve dil',
    title: 'Dil ve para birimi',
    description: 'Siteyi hangi dilde görmek ve fiyatları hangi para biriminde okumak istersiniz?',
    languageHeading: 'Dil',
    currencyHeading: 'Para birimi',
    ratesNote: 'Kurlar {{date}} tarihlidir. Ödeme her zaman Türk lirası ile alınır.',
    example: 'Örnek fiyat',
    save: 'Kaydet',
    languageName: {
      tr: 'Türkçe',
      en: 'İngilizce',
    },
    currencyName: {
      TRY: 'Türk lirası',
      EUR: 'Euro',
      USD: 'ABD doları',
      GBP: 'İngiliz sterlini',
    },
  },

  phone: {
    country: 'Ülke kodu',
    search: 'Ülke ara',
    noResults: 'Ülke bulunamadı',
    invalid: 'Numarayı ülke koduna uygun şekilde eksiksiz girin.',
  },

  search: {
    formLabel: 'Sefer arama',
    from: 'Nereden',
    to: 'Nereye',
    date: 'Tarih',
    fromPlaceholder: 'Kalkış şehri',
    toPlaceholder: 'Varış şehri',
    cityPlaceholder: 'Şehir veya plaka',
    submit: 'Bilet Bul',
    swap: 'Kalkış ve varış şehrini değiştir',
    fromError: 'Kalkış şehrini seçin.',
    toError: 'Varış şehrini seçin.',
    sameCityError: 'Kalkış ve varış şehri aynı olamaz.',
    noResults: 'Sonuç bulunamadı',
    noResultsHint: 'Şehir adını ya da plaka kodunu deneyin, örneğin 34.',
    listing: '{{count}} şehir listeleniyor',
    dateTyped: 'Tarihi yazarak girin',
    dateHint: 'Gün, ay ve yılı noktayla ayırın.',
    dateInvalid: 'Geçerli bir tarih girin. Örnek: 04.09.2026',
    datePast: 'Geçmiş bir tarih için bilet aranamaz.',
    today: 'Bugün',
    tomorrow: 'Yarın',
    thisWeekend: 'Bu hafta sonu',
    pickDate: '{{label}} seç',
  },

  results: {
    found_one: '{{count}} sefer bulundu',
    found_other: '{{count}} sefer bulundu',
    foundRich_one: '<b>{{count}}</b> sefer bulundu',
    foundRich_other: '<b>{{count}}</b> sefer bulundu',
    emptyFiltered: 'Bu filtrelerle sefer bulamadık',
    emptyFilteredBody:
      'Seçtiğiniz filtreler arama sonuçlarının tamamını eledi. Birkaç filtreyi kaldırıp yeniden deneyin.',
    emptyDate: 'Bu tarihte sefer bulunmuyor',
    emptyDateBody:
      'Seçtiğiniz güzergâhta bu gün için planlanmış bir kalkış yok. Yakın bir tarihi deneyebilirsiniz.',
    seeDate: '{{date}} tarihine bak',
    errorTitle: 'Seferler yüklenemedi',
    errorBody:
      'Bağlantı sırasında bir sorun oluştu. Lütfen tekrar deneyin; sorun sürerse birkaç dakika sonra yeniden bakın.',
    retry: 'Tekrar dene',
    group: {
      bands: 'Kalkış Saati',
      operators: 'Firma',
      layouts: 'Koltuk Düzeni',
      amenities: 'Araç Özellikleri',
      fromTerminals: 'Kalkış Terminali',
    },
    band: {
      morning: 'Sabah',
      noon: 'Öğle',
      evening: 'Akşam',
      night: 'Gece',
    },
    priceRange: 'Bilet fiyatı aralığı',
    clearFilters: 'Filtreleri temizle',
    loading: 'Seferler yükleniyor',
    newSearch: 'Yeni arama yap',
    sortOption: {
      depAsc: 'Kalkış: erken → geç',
      depDesc: 'Kalkış: geç → erken',
      priceAsc: 'Fiyat: düşük → yüksek',
      priceDesc: 'Fiyat: yüksek → düşük',
      durationAsc: 'Süre: en kısa',
      arrAsc: 'Varış: en erken',
      ratingDesc: 'Puan: en yüksek',
    },
    showAll_one: '{{count}} seferi göster',
    showAll_other: '{{count}} seferi göster',
    operatorFallback: 'Otobüs firması',
    sort: 'Sıralama',
    filter: 'Filtrele',
    filters: 'Filtreler',
    activeFilters: '{{count}} filtre etkin',
    seatLayout: 'koltuk düzeni',
    moreAmenities: '{{count}} özellik daha',
    select: 'Koltuk Seç',
    seatsLeft: 'Son {{count}} koltuk',
    nextDay: 'ertesi gün varış',
    premium: 'Premium',
    empty: 'Bu tarihte sefer bulunamadı',
  },

  footer: {
    newsletterTitle: 'Fırsatları kaçırmayın',
    newsletterBody: 'Kampanyalardan ve indirimli biletlerden ilk siz haberdar olun.',
    email: 'E-posta adresiniz',
    subscribe: 'Kaydol',
    consent: 'Dilediğiniz an çıkabilirsiniz.',
    subscribed: 'Bültenimize kaydoldunuz.',
    subscribedBody: 'Kampanyalardan ve yeni hatlardan ilk siz haberdar olacaksınız.',
    tagline:
      'Türkiye’nin dört bir yanındaki otobüs firmalarını tek ekranda karşılaştırın, koltuğunuzu saniyeler içinde seçin.',
    social: 'BusLinker sosyal medya hesapları',
    apps: 'Mobil uygulamayı indir',
    payments: 'Kabul edilen ödeme yöntemleri',
    legal: 'Yasal bilgiler',
    rights: '© {{year}} BusLinker. Tüm hakları saklıdır.',
    links: {
      helpCenter: 'Yardım Merkezi',
      faq: 'Sıkça Sorulan Sorular',
      ticketLookup: 'Bilet Sorgula',
      ticketCancel: 'Bilet İptali',
      contact: 'İletişim',
      about: 'Hakkımızda',
      blog: 'Blog',
      careers: 'Kariyer',
      press: 'Basında Biz',
      partner: 'Firma İş Birliği',
      terms: 'Kullanım Koşulları',
      privacy: 'Gizlilik Politikası',
      cookies: 'Çerez Politikası',
      accessibility: 'Erişilebilirlik',
      sitemap: 'Site Haritası',
    },
    columns: {
      operators: 'Otobüs Firmaları',
      routes: 'Popüler Seferler',
      help: 'Yardım',
      corporate: 'Kurumsal',
    },
  },
}

/** Same shape, any strings: what `en.ts` must satisfy. */
export type Resources = typeof tr
