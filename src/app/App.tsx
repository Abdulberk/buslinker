import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from '@/shared/ui/toaster'
import { TooltipProvider } from '@/shared/ui/primitives'
import { AppLayout } from './AppLayout'
import { AccountLayout } from '@/pages/account/AccountLayout'
import { RouteError } from './RouteError'
import { PageFallback } from './PageFallback'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ResultsPage = lazy(() => import('@/pages/ResultsPage'))
const SeatPage = lazy(() => import('@/pages/SeatPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))

const TicketLookupPage = lazy(() => import('@/pages/TicketLookupPage'))
const TicketDetailPage = lazy(() => import('@/pages/TicketDetailPage'))
const TicketCancelPage = lazy(() => import('@/pages/TicketCancelPage'))

const OperatorsPage = lazy(() => import('@/pages/OperatorsPage'))
const OperatorDetailPage = lazy(() => import('@/pages/OperatorDetailPage'))
const TerminalsPage = lazy(() => import('@/pages/TerminalsPage'))
const TerminalDetailPage = lazy(() => import('@/pages/TerminalDetailPage'))
const PopularRoutesPage = lazy(() => import('@/pages/PopularRoutesPage'))

const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const LegalPage = lazy(() => import('@/pages/LegalPage'))

const RouteLandingPage = lazy(() => import('@/pages/RouteLandingPage'))
const CityPage = lazy(() => import('@/pages/CityPage'))
const TripDetailPage = lazy(() => import('@/pages/TripDetailPage'))
const CheckoutSuccessPage = lazy(() => import('@/pages/CheckoutSuccessPage'))

const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))

const BlogPage = lazy(() => import('@/pages/BlogPage'))
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
const CampaignDetailPage = lazy(() => import('@/pages/CampaignDetailPage'))
const HelpPage = lazy(() => import('@/pages/HelpPage'))

const CareersPage = lazy(() => import('@/pages/CareersPage'))
const PressPage = lazy(() => import('@/pages/PressPage'))
const PartnerPage = lazy(() => import('@/pages/PartnerPage'))
const AccessibilityPage = lazy(() => import('@/pages/AccessibilityPage'))
const SitemapPage = lazy(() => import('@/pages/SitemapPage'))
const GiftCardPage = lazy(() => import('@/pages/GiftCardPage'))

const AccountOverviewPage = lazy(() => import('@/pages/account/AccountOverviewPage'))
const MyTripsPage = lazy(() => import('@/pages/account/MyTripsPage'))
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const SavedPassengersPage = lazy(() => import('@/pages/account/SavedPassengersPage'))
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'))
const LoyaltyPage = lazy(() => import('@/pages/account/LoyaltyPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

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
