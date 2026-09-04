import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { CakeSlice, Pencil, Plus, Trash2, UserRound, Users } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/ui/primitives'

type Gender = 'F' | 'M'

interface SavedPassenger {
  id: string
  fullName: string
  gender: Gender
  birthYear: number
}

const GENDER_LABEL: Record<Gender, string> = { F: 'Kadın', M: 'Erkek' }

const SAVED_PASSENGERS: readonly SavedPassenger[] = [
  { id: 'p-1', fullName: 'Ayşe Yılmaz', gender: 'F', birthYear: 1990 },
  { id: 'p-2', fullName: 'Mehmet Yılmaz', gender: 'M', birthYear: 1987 },
  { id: 'p-3', fullName: 'Elif Yılmaz', gender: 'F', birthYear: 2012 },
]

export default function SavedPassengersPage() {
  useEffect(() => {
    document.title = 'Kayıtlı Yolcular | BusLinker'
  }, [])

  const [open, setOpen] = useState(false)

  const notifyDemo = (message: string) => {
    toast.info(message, {
      description: 'Yolcu kayıtları bu tanıtım sürümünde saklanmaz.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-fg">Kayıtlı Yolcular</h2>
          <p className="mt-1 max-w-prose text-sm text-fg-secondary">
            Sık seyahat ettiğiniz kişileri kaydedin, bilet alırken bilgileri tekrar yazmayın.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="md">
              <Plus className="size-4" aria-hidden="true" />
              Yeni yolcu ekle
            </Button>
          </DialogTrigger>
          <NewPassengerDialog onDone={() => setOpen(false)} />
        </Dialog>
      </div>

      {SAVED_PASSENGERS.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SAVED_PASSENGERS.map((passenger) => (
            <li key={passenger.id}>
              <PassengerCard passenger={passenger} onAction={notifyDemo} />
            </li>
          ))}
        </ul>
      ) : (
        <SavedPassengersEmpty />
      )}
    </div>
  )
}

function PassengerCard({
  passenger,
  onAction,
}: {
  passenger: SavedPassenger
  onAction: (message: string) => void
}) {
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-fg-secondary"
          >
            <UserRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-fg">
              {passenger.fullName}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
              <span>{GENDER_LABEL[passenger.gender]}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <CakeSlice className="size-3.5" aria-hidden="true" />
                <span data-numeric>{passenger.birthYear}</span>
                <span> doğumlu</span>
              </span>
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAction(`${passenger.fullName} için düzenleme etkin değil.`)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Düzenle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction(`${passenger.fullName} kaydını silme etkin değil.`)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Sil
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * Rendered when the list is empty — which the demo data never is, but a real
 * account starts here and lands here again after the last passenger is
 * removed. Keeping it next to the list is what stops the two from drifting the
 * day the list becomes editable.
 */
function SavedPassengersEmpty() {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-surface-sunken text-fg-muted"
        >
          <Users className="size-6" />
        </span>
        <p className="font-display text-base font-bold text-fg">Kayıtlı yolcunuz bulunmuyor</p>
        <p className="max-w-sm text-sm text-fg-secondary">
          Birlikte seyahat ettiğiniz kişileri ekleyin; bilet alırken tek dokunuşla seçebilirsiniz.
        </p>
      </CardBody>
    </Card>
  )
}

function NewPassengerDialog({ onDone }: { onDone: () => void }) {
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<Gender>('F')
  const [birthYear, setBirthYear] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.info('Yolcu ekleme bu tanıtım sürümünde etkin değil.', {
      description: 'Girdiğiniz bilgiler gönderilmez veya saklanmaz.',
    })
    setFullName('')
    setGender('F')
    setBirthYear('')
    onDone()
  }

  return (
    <DialogContent
      title="Yeni yolcu ekle"
      description="Bilet alırken hızlıca seçebilmeniz için yolcu bilgilerini girin."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 overflow-y-auto p-5">
        <Field
          label="Ad Soyad"
          name="passengerName"
          autoComplete="off"
          placeholder="Ad Soyad"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />

        <div className="mb-3 flex flex-col gap-1.5">
          <span id="passenger-gender-label" className="text-sm font-medium text-fg-secondary">
            Cinsiyet
          </span>
          <ToggleGroup
            type="single"
            value={gender}
            // Radix clears the value when the active item is pressed again;
            // a passenger always has one, so the current choice stands.
            onValueChange={(value: string) => {
              if (value === 'F' || value === 'M') setGender(value)
            }}
            aria-labelledby="passenger-gender-label"
            className="flex gap-2"
          >
            <ToggleGroupItem value="F">{GENDER_LABEL.F}</ToggleGroupItem>
            <ToggleGroupItem value="M">{GENDER_LABEL.M}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Field
          label="Doğum Yılı"
          name="passengerBirthYear"
          type="number"
          inputMode="numeric"
          min={1920}
          max={2026}
          placeholder="1990"
          hint="Yaşa bağlı indirimler için kullanılır."
          value={birthYear}
          onChange={(event) => setBirthYear(event.target.value)}
        />

        <Button type="submit" size="lg" full className="mt-2">
          Yolcuyu Kaydet
        </Button>
      </form>
    </DialogContent>
  )
}
