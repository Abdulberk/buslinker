import { Link } from 'react-router'
import { OPERATORS } from '@/shared/api/catalog'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { SectionHeading, SectionMore } from './SectionHeading'

export function OperatorStrip() {
  return (
    <>
      <SectionHeading
        id="anlasmali-firmalar"
        tier="secondary"
        title="Anlaşmalı firmalar"
        lead="Türkiye'nin köklü otobüs firmalarının seferlerini aynı listede karşılaştırın."
        more={{ to: '/otobus-firmalari', context: 'Otobüs firmaları' }}
      />

      {/* Six firms in two, three or six columns: every count divides six, so
          no width is left with a lone logo on a last row. A grid rather than
          the old sideways strip, too, because a strip hid half the firms
          behind a swipe that nothing announced. */}
      <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-7 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-6">
        {OPERATORS.map((operator) => (
          <li key={operator.id}>
            <Link
              to={`/otobus-firmalari/${operator.id}`}
              className="group flex flex-col items-center gap-2.5 rounded-xl text-center"
            >
              {/* No card around the plate on purpose. OperatorLogo already
                  draws a bordered white tile — the marks are PNGs on white and
                  need that ground to survive dark mode — so a second box
                  around it would put one frame inside another.

                  The plate is landscape and as wide as its column, where it
                  used to be an 80px square floating in a 128px cell: the mark
                  now draws as tall as the plate allows at every width, and six
                  plates of one shape read as one row of firms rather than a
                  scatter of small tiles. The hover is the text-card recipe —
                  the edge warms toward brand — applied to the plate, since the
                  plate is what the pointer is on.

                  The image is let shrink below its own height. As a grid item
                  it otherwise keeps a minimum of the height its width implies,
                  which in a landscape plate is taller than the plate, and the
                  bottom of each mark was cut off. */}
              <OperatorLogo
                operatorId={operator.id}
                className="aspect-video h-auto w-full rounded-xl p-2.5 transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard group-hover:-translate-y-0.5 group-hover:border-brand/40 group-hover:shadow-md [&>img]:min-h-0"
              />
              <span className="text-sm font-medium text-balance-tr text-fg underline-offset-4 group-hover:underline">
                {operator.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <SectionMore to="/otobus-firmalari" label="Tüm otobüs firmaları" />
    </>
  )
}
