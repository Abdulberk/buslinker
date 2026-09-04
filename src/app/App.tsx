import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from '@/shared/ui/toaster'
import { TooltipProvider } from '@/shared/ui/primitives'
import { AppLayout } from './AppLayout'
import { lazyRoute } from './lazy-route'
import { AccountLayout } from '@/pages/account/AccountLayout'
import { RouteError } from './RouteError'
import { PageFallback } from './PageFallback'

const HomePage = lazyRoute(() => import('@/pages/HomePage'))
const ResultsPage = lazyRoute(() => import('@/pages/ResultsPage'))
const SeatPage = lazyRoute(() => import('@/pages/SeatPage'))
const CheckoutPage = lazyRoute(() => import('@/pages/CheckoutPage'))
const LoginPage = lazyRoute(() => import('@/pages/LoginPage'))
const SignupPage = lazyRoute(() => import('@/pages/SignupPage'))

const TicketLookupPage = lazyRoute(() => import('@/pages/TicketLookupPage'))
const TicketDetailPage = lazyRoute(() => import('@/pages/TicketDetailPage'))
const TicketCancelPage = lazyRoute(() => import('@/pages/TicketCancelPage'))

const OperatorsPage = lazyRoute(() => import('@/pages/OperatorsPage'))
const OperatorDetailPage = lazyRoute(() => import('@/pages/OperatorDetailPage'))
const TerminalsPage = lazyRoute(() => import('@/pages/TerminalsPage'))
const TerminalDetailPage = lazyRoute(() => import('@/pages/TerminalDetailPage'))
const PopularRoutesPage = lazyRoute(() => import('@/pages/PopularRoutesPage'))

const AboutPage = lazyRoute(() => import('@/pages/AboutPage'))
const ContactPage = lazyRoute(() => import('@/pages/ContactPage'))
const FaqPage = lazyRoute(() => import('@/pages/FaqPage'))
const LegalPage = lazyRoute(() => import('@/pages/LegalPage'))

const RouteLandingPage = lazyRoute(() => import('@/pages/RouteLandingPage'))
const CityPage = lazyRoute(() => import('@/pages/CityPage'))
const TripDetailPage = lazyRoute(() => import('@/pages/TripDetailPage'))
const CheckoutSuccessPage = lazyRoute(() => import('@/pages/CheckoutSuccessPage'))

const ForgotPasswordPage = lazyRoute(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazyRoute(() => import('@/pages/ResetPasswordPage'))

const BlogPage = lazyRoute(() => import('@/pages/BlogPage'))
const BlogPostPage = lazyRoute(() => import('@/pages/BlogPostPage'))
const CampaignDetailPage = lazyRoute(() => import('@/pages/CampaignDetailPage'))
const HelpPage = lazyRoute(() => import('@/pages/HelpPage'))

const CareersPage = lazyRoute(() => import('@/pages/CareersPage'))
const PressPage = lazyRoute(() => import('@/pages/PressPage'))
const PartnerPage = lazyRoute(() => import('@/pages/PartnerPage'))
const AccessibilityPage = lazyRoute(() => import('@/pages/AccessibilityPage'))
const SitemapPage = lazyRoute(() => import('@/pages/SitemapPage'))
const GiftCardPage = lazyRoute(() => import('@/pages/GiftCardPage'))

const AccountOverviewPage = lazyRoute(() => import('@/pages/account/AccountOverviewPage'))
const MyTripsPage = lazyRoute(() => import('@/pages/account/MyTripsPage'))
const ProfilePage = lazyRoute(() => import('@/pages/account/ProfilePage'))
const SavedPassengersPage = lazyRoute(() => import('@/pages/account/SavedPassengersPage'))
const NotificationsPage = lazyRoute(() => import('@/pages/account/NotificationsPage'))
const LoyaltyPage = lazyRoute(() => import('@/pages/account/LoyaltyPage'))
const NotFoundPage = lazyRoute(() => import('@/pages/NotFoundPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
)

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // Last resort: this one replaces the layout, so it only shows when the
    // layout itself is what failed.
    errorElement: <RouteError />,
    children: [
      {
        // A pathless boundary INSIDE the layout. A route error — most often a
        // chunk a deploy replaced — now replaces this element instead of the
        // layout, so the header, nav and footer stay on screen and the user
        // can navigate away rather than being stranded on a bare card.
        errorElement: <RouteError />,
        children: [
          { index: true, element: withSuspense(<HomePage />) },
          {
            // An SEO-indexable search path: /otobus-bileti/istanbul-ankara/2026-09-04
            path: 'otobus-bileti/:route/:date',
            element: withSuspense(<ResultsPage />),
          },
          // Seat selection is a route, not a modal: the back button behaves, the
          // selection is deep-linkable, and there is no focus trap to maintain.
          { path: 'otobus-bileti/:route', element: withSuspense(<RouteLandingPage />) },
          { path: 'sehir/:slug', element: withSuspense(<CityPage />) },
          { path: 'sefer/:tripId', element: withSuspense(<TripDetailPage />) },
          { path: 'koltuk/:tripId', element: withSuspense(<SeatPage />) },
          { path: 'odeme/:tripId', element: withSuspense(<CheckoutPage />) },
          { path: 'odeme/:tripId/onay', element: withSuspense(<CheckoutSuccessPage />) },
          { path: 'giris', element: withSuspense(<LoginPage />) },
          { path: 'kayit', element: withSuspense(<SignupPage />) },
          { path: 'sifremi-unuttum', element: withSuspense(<ForgotPasswordPage />) },
          { path: 'sifre-sifirla', element: withSuspense(<ResetPasswordPage />) },
          // Ticket operations — the most-used screens after search.
          { path: 'bilet-sorgula', element: withSuspense(<TicketLookupPage />) },
          { path: 'bilet-iptal', element: withSuspense(<TicketCancelPage />) },
          { path: 'bilet/:pnr', element: withSuspense(<TicketDetailPage />) },

          // Discovery. These are the indexable pages: one component each, but the
          // params fan them out across every city, terminal and carrier.
          { path: 'otobus-firmalari', element: withSuspense(<OperatorsPage />) },
          { path: 'otobus-firmalari/:operatorId', element: withSuspense(<OperatorDetailPage />) },
          { path: 'terminaller', element: withSuspense(<TerminalsPage />) },
          { path: 'terminaller/:terminalId', element: withSuspense(<TerminalDetailPage />) },
          { path: 'populer-seferler', element: withSuspense(<PopularRoutesPage />) },

          // Account. A layout route, so the sidebar and its h1 render once.
          {
            path: 'hesabim',
            element: <AccountLayout />,
            children: [
              { index: true, element: withSuspense(<AccountOverviewPage />) },
              { path: 'seferlerim', element: withSuspense(<MyTripsPage />) },
              { path: 'bilgilerim', element: withSuspense(<ProfilePage />) },
              { path: 'kayitli-yolcular', element: withSuspense(<SavedPassengersPage />) },
              { path: 'bildirimler', element: withSuspense(<NotificationsPage />) },
              { path: 'puanlarim', element: withSuspense(<LoyaltyPage />) },
            ],
          },

          // Corporate and help.
          { path: 'hakkimizda', element: withSuspense(<AboutPage />) },
          { path: 'iletisim', element: withSuspense(<ContactPage />) },
          { path: 'sss', element: withSuspense(<FaqPage />) },
          { path: 'yardim', element: withSuspense(<HelpPage />) },
          { path: 'blog', element: withSuspense(<BlogPage />) },
          { path: 'blog/:slug', element: withSuspense(<BlogPostPage />) },
          { path: 'kampanya/:id', element: withSuspense(<CampaignDetailPage />) },
          { path: 'kariyer', element: withSuspense(<CareersPage />) },
          { path: 'basinda-biz', element: withSuspense(<PressPage />) },
          { path: 'firma-girisi', element: withSuspense(<PartnerPage />) },
          { path: 'erisilebilirlik', element: withSuspense(<AccessibilityPage />) },
          { path: 'site-haritasi', element: withSuspense(<SitemapPage />) },
          { path: 'hediye-kart', element: withSuspense(<GiftCardPage />) },

          // Four documents, one renderer — the slug picks the content.
          { path: 'kvkk', element: withSuspense(<LegalPage />) },
          { path: 'gizlilik-politikasi', element: withSuspense(<LegalPage />) },
          { path: 'kullanim-kosullari', element: withSuspense(<LegalPage />) },
          { path: 'cerez-politikasi', element: withSuspense(<LegalPage />) },

          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200} skipDelayDuration={400}>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
