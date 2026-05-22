import React, { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import PageTransition from './PageTransition'
import { seoLandingPages } from '../../config/seoPages'

const Home = lazy(() => import('../../pages/Home'))
const Collection = lazy(() => import('../../pages/Collection'))
const ListingDetail = lazy(() => import('../../pages/ListingDetail.jsx'))
const OrderDetail = lazy(() => import('../../pages/OrderDetail.jsx'))
const RentalDetail = lazy(() => import('../../pages/RentalDetail.jsx'))
const Cart = lazy(() => import('../../pages/Cart.jsx'))
const Checkout = lazy(() => import('../../pages/Checkout'))
const CreateListing = lazy(() => import('../../pages/CreateListing'))
const EditListing = lazy(() => import('../../pages/EditListing'))
const Login = lazy(() => import('../../pages/Login'))
const Dashboard = lazy(() => import('../../pages/Dashboard'))
const NotFound = lazy(() => import('../../pages/NotFound'))
const SeoLandingPage = lazy(() => import('../../pages/SeoLandingPage'))

const RouteFallback = () => (
  <div className="min-h-screen bg-[#FAF7F2] pt-28 px-4">
    <div className="mx-auto max-w-6xl">
      <div className="h-6 w-40 animate-pulse rounded-full bg-[#E8E0D5]" />
      <div className="mt-6 h-12 w-3/4 max-w-xl animate-pulse rounded-2xl bg-[#E8E0D5]" />
      <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[#E8E0D5]" />
    </div>
  </div>
)

const AnimatedRoutes = ({ CompleteMagicLinkComponent: CompleteMagicLink }) => {
  const location = useLocation()
  void CompleteMagicLink
  const transitionKey = location.pathname.startsWith('/dashboard') ? '/dashboard' : location.pathname

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={transitionKey}>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            {seoLandingPages.map((page) => (
              <Route
                key={page.slug}
                path={page.path}
                element={<SeoLandingPage pageSlug={page.slug} />}
              />
            ))}
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/order/:bookingId" element={<OrderDetail />} />
            <Route path="/rental/:rentalId" element={<RentalDetail />} />
            <Route path="/disputes" element={<Navigate to="/dashboard/disputes" replace />} />
            <Route path="/disputes/:disputeId" element={<Navigate to="/dashboard/disputes/:disputeId" replace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/create" element={<CreateListing />} />
            <Route path="/edit/:listingId" element={<EditListing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/:tab" element={<Dashboard />} />
            <Route path="/dashboard/:tab/:disputeId" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complete-magic-link" element={<CompleteMagicLink />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
