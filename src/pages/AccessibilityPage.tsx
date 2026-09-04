import { useEffect } from 'react'
import { Link } from 'react-router'
import { Contrast, Ear, Keyboard, MousePointerClick, type LucideIcon } from 'lucide-react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'

interface Highlight {
  readonly icon: LucideIcon
  readonly title: string
  readonly body: string
}

const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: Keyboard,
    title: 'Klavyeyle tam kullanım',
    body: 'Arama, sefer listesi, koltuk seçimi ve bilet işlemleri fare olmadan tamamlanabilir.',
  },
  {
    icon: Contrast,
    title: 'Ölçülmüş kontrast',
    body: 'Metin ve arayüz renkleri, açık ve koyu temada AA eşiğine göre hesaplanarak seçildi.',
  },
  {
    icon: Ear,
    title: 'Türkçe ekran okuyucu etiketleri',
    body: 'Her düğme, alan ve durum bildirimi Türkçe okunacak biçimde etiketlendi.',
  },
  {
    icon: MousePointerClick,
    title: 'En az 44 piksel dokunma alanı',
    body: 'Dokunmatik hedefler, yanlışlıkla komşu ögeye basmayı önleyecek büyüklükte tutuldu.',
  },
]

export default function AccessibilityPage() {
  useEffect(() => {
    document.title = 'Erişilebilirlik | BusLinker'
  }, [])

  return (
    <>
      <PageHeader
        title="Erişilebilirlik"
        lead="BusLinker'ın erişilebilirlik hedefini, bugün gerçekten yaptıklarını ve henüz tamamlanmamış başlıklarını olduğu gibi anlatıyoruz."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon
            return (
              <li
                key={item.title}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5"
              >
                <span
                  className="grid size-10 place-items-center rounded-lg bg-brand/8 text-brand-fg"
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                <h2 className="text-base">{item.title}</h2>
                <p className="text-sm text-fg-secondary">{item.body}</p>
              </li>
            )
          })}
        </ul>

        <Prose className="mt-12 sm:mt-16">
          <h2>Hedefimiz</h2>
          <p>
            BusLinker'ı <strong>WCAG 2.2 AA</strong> ölçütlerini karşılayacak biçimde
            geliştiriyoruz. Bu, arayüzün algılanabilir, kullanılabilir, anlaşılabilir ve dayanıklı
            olması anlamına gelir. Erişilebilirlik ayrı bir aşama değil; bir bileşen bu ölçütleri
            karşılamadan tamamlanmış sayılmaz.
          </p>
          <p>
            Aşağıdakiler bir niyet beyanı değil, uygulamanın bugünkü davranışının tarifidir. Bir
            maddenin karşılığını ekranda bulamazsanız bu bir hatadır ve bize bildirmenizi isteriz.
          </p>

          <h2>Klavyeyle kullanım</h2>
          <p>
            Akışın tamamı yalnızca klavyeyle yürütülebilir. Sekme sırası, ekranda gördüğünüz sıranın
            aynısıdır; hiçbir bileşen odağı içine hapsetmez. Pencerelerde (arama filtreleri, onay
            kutuları) odak açılışta içeri alınır, <strong>Esc</strong> ile kapatıldığında ise
            pencereyi açan düğmeye geri döner.
          </p>
          <p>
            Koltuk haritası bir <strong>ızgara</strong> olarak işaretlenmiştir ve tek bir sekme
            durağı içerir; böylece 45 koltuklu bir otobüsü geçmek için 45 kez sekme tuşuna basmanız
            gerekmez. Izgaranın içinde:
          </p>
          <ul>
            <li>
              Yön tuşları koltuklar arasında dolaşır; boş alanlar, koridor ve merdiven atlanarak en
              yakın koltuğa geçilir.
            </li>
            <li>
              <strong>Home</strong> ve <strong>End</strong> bulunduğunuz sıranın ilk ve son
              koltuğuna, <strong>Ctrl + Home</strong> ve <strong>Ctrl + End</strong> ise otobüsün
              ilk ve son koltuğuna gider.
            </li>
            <li>
              <strong>PageUp</strong> ve <strong>PageDown</strong> beşer sıra ilerleyip geri alır.
            </li>
            <li>
              <strong>Boşluk</strong> ve <strong>Enter</strong> koltuğu seçer ya da seçimi kaldırır.
            </li>
          </ul>

          <h2>Odak görünürlüğü</h2>
          <p>
            Odak halkası tek bir yerde tanımlanır ve hiçbir sayfada kaldırılmaz. Halka iki katmanlı
            çizilir: içte yüzeyin rengiyle bir ayırıcı, dışta belirgin bir kontur. Böylece odak, hem
            açık hem koyu yüzeyde, hatta marka kırmızısının üzerinde bile görünür kalır. Yüksek
            kontrast (forced colors) modunda halka yerini işletim sisteminin kendi vurgu konturuna
            bırakır.
          </p>

          <h2>Hareket ve animasyon</h2>
          <p>
            İşletim sisteminizde “hareketi azalt” tercihi açıksa (
            <strong>prefers-reduced-motion</strong>) geçiş süreleri sıfıra iner, kalan animasyonlar
            ise en fazla onda bir saniyeye düşer. Hiçbir bilgi yalnızca bir animasyonla aktarılmaz;
            hareket her yerde yardımcı bir sinyaldir.
          </p>

          <h2>Renk tek başına anlam taşımaz</h2>
          <p>
            Bir durumu yalnızca renkle anlatmıyoruz. En belirgin örnek koltuk haritasıdır: dolu bir
            koltuk yalnızca mavi ya da pembe değildir, üzerinde{' '}
            <strong>45 derecelik tarama deseni</strong> taşır ve ekran okuyucuya “erkek yolcu dolu”
            ya da “kadın yolcu dolu” diye okunur. Seçili koltuk ayrıca dolgu ve kenarlık değiştirir;
            harita altındaki açıklama listesinde her durum kendi çizimi ve yazısıyla birlikte yer
            alır.
          </p>
          <p>
            Aynı kural formlarda da geçerlidir: bir alan hatalıysa kenarlığı kırmızıya dönmekle
            kalmaz, altında yazılı bir hata iletisi belirir ve alan <strong>aria-invalid</strong>{' '}
            ile işaretlenir. Uyarı, bilgi ve başarı kutularının her biri renkle birlikte bir simge
            ve metin taşır.
          </p>

          <h2>Ekran okuyucular</h2>
          <p>
            Sayfalar gezinme, ana içerik ve alt bilgi bölgeleriyle işaretlenir; her sayfada tek bir
            birinci düzey başlık bulunur ve başlık sırası atlamasız ilerler. Tüm etiketler
            Türkçedir; “Sil” gibi tek başına anlamsız düğmeler{' '}
            <em>“12 numaralı koltuk seçimini kaldırın”</em> biçiminde genişletilir.
          </p>
          <p>
            Arama sonucu sayısı, koltuk seçimi ve iptal işlemi gibi ekranı yenilemeden değişen
            bilgiler kibar bir canlı bölgeyle duyurulur; okuma sürerken sözünüzü kesmez. Yalnızca
            süsleme amaçlı simgeler ise erişilebilirlik ağacından çıkarılır.
          </p>

          <h2>Kontrast ve tipografi</h2>
          <p>
            Renkler algısal bir renk uzayında tanımlanır ve her metin–zemin çifti hem açık hem koyu
            temada ölçülür. Gövde metni ve arayüz yazıları en az <strong>4,5:1</strong>, büyük
            başlıklar ve arayüz sınırları en az <strong>3:1</strong> oranını karşılar. Marka
            kırmızısı düğme dolgusu olarak kullanıldığında beyazla yeterli kontrastı verir; aynı
            kırmızı metin olarak kullanıldığında ise bir adım koyulaşarak okunurluğunu korur.
          </p>
          <p>
            Yazı boyutları göreli birimlerle tanımlıdır; tarayıcınızdan yazıyı <strong>%200</strong>{' '}
            büyüttüğünüzde ya da sayfayı 320 piksel genişliğe sıkıştırdığınızda içerik yatay
            kaydırma gerektirmeden yeniden dizilir.
          </p>

          <h2>Dokunmatik kullanım</h2>
          <p>
            Dokunulabilir her hedef en az 44 × 44 piksel alan kaplar. Görsel olarak daha küçük duran
            ögelerde (küçük bir kapatma düğmesi gibi) dokunma alanı görünmez biçimde genişletilir.
            Koltuk haritası çift yönlü yakınlaştırmayı engellemez.
          </p>

          <h2>Bilinen sınırlar</h2>
          <p>Bunları saklamak yerine yazıyoruz; her biri üzerinde çalışılıyor.</p>
          <ul>
            <li>
              <strong>Bağımsız bir denetim yapılmadı.</strong> Bu sayfa bir uygunluk beyanı ya da
              sertifika değildir; ölçümler ekibin kendi testlerine dayanır.
            </li>
            <li>
              <strong>Ekran okuyucu kapsamı sınırlı test edildi.</strong> Denemeler ağırlıklı olarak
              masaüstü tarayıcılarla yapıldı; mobil ekran okuyucularda bazı bileşenlerin okunuşu
              beklenenden farklı olabilir.
            </li>
            <li>
              <strong>Koltuk haritası küçük ekranlarda yoğun kalabilir.</strong> Çift katlı
              otobüslerde kat geçişi, klavye kullanıcıları için ideal olandan daha fazla adım
              gerektiriyor.
            </li>
            <li>
              <strong>Bazı görseller yalnızca süsleme olarak işaretli.</strong> Şehir fotoğrafları
              bilgi taşımadığı için boş metinle sunulur; bir fotoğrafın bilgi taşıdığını
              düşünürseniz bize bildirin.
            </li>
            <li>
              <strong>Bu bir tanıtım sürümüdür.</strong> Ödeme adımı gibi tamamlanmamış akışlar
              devre dışıdır; bu akışların erişilebilirliği de henüz değerlendirilmemiştir.
            </li>
          </ul>

          <h2>Bize bildirin</h2>
          <p>
            Bir sayfayı kullanamadıysanız ya da bir engelle karşılaştıysanız duymak istiyoruz. Hangi
            sayfada, hangi araçla (tarayıcı, ekran okuyucu, işletim sistemi) ve ne yapmaya
            çalışırken sorun yaşadığınızı yazmanız, sorunu tekrar üretmemizi kolaylaştırır.
          </p>
        </Prose>

        <Card className="mt-10">
          <CardBody className="flex flex-col gap-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-prose">
              <h2 className="text-xl text-balance-tr sm:text-2xl">
                Bir erişilebilirlik sorunu mu buldunuz?
              </h2>
              <p className="mt-2 text-base text-fg-secondary">
                İletişim formundaki “Diğer” başlığını seçip durumu anlatın. Bildirimleri ürün
                ekibine doğrudan iletiriz.
              </p>
            </div>
            <div className="lg:shrink-0">
              <Button variant="primary" size="lg" asChild>
                <Link to="/iletisim">Sorunu bildirin</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
