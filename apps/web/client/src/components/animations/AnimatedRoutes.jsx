import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import PageTransition from './PageTransition'
import Home from '../../pages/Home'
import Collection from '../../pages/Collection'
import ListingDetail from '../../pages/ListingDetail.jsx'
import OrderDetail from '../../pages/OrderDetail.jsx'
import RentalDetail from '../../pages/RentalDetail.jsx'
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
  const transitionKey = location.pathname.startsWith('/dashboard') ? '/dashboard' : location.pathname

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={transitionKey}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
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
      </PageTransition>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
