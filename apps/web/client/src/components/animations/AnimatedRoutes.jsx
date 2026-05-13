import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import PageTransition from './PageTransition'
import Home from '../../pages/Home'
import Collection from '../../pages/Collection'
import ListingDetail from '../../pages/ListingDetail.jsx'
import OrderDetail from '../../pages/OrderDetail.jsx'
import RentalDetail from '../../pages/RentalDetail.jsx'
import DisputesPage from '../../pages/Disputes.jsx'
import Cart from '../../pages/Cart.jsx'
import Checkout from '../../pages/Checkout'
import CreateListing from '../../pages/CreateListing'
import EditListing from '../../pages/EditListing'
import Login from '../../pages/Login'
import Dashboard from '../../pages/Dashboard'
import NotFound from '../../pages/NotFound'

const AnimatedRoutes = ({ CompleteMagicLinkComponent: CompleteMagicLink }) => {
  const location = useLocation()
  void CompleteMagicLink

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/order/:bookingId" element={<OrderDetail />} />
          <Route path="/rental/:rentalId" element={<RentalDetail />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/disputes/:disputeId" element={<DisputesPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/edit/:listingId" element={<EditListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complete-magic-link" element={<CompleteMagicLink />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
