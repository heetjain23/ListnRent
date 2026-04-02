import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import PageTransition from './PageTransition'
import Home from '../../pages/Home'
import Collection from '../../pages/Collection'
import ListingDetail from '../../pages/ListingDetail.jsx'
import Checkout from '../../pages/Checkout'
import CreateListing from '../../pages/CreateListing'
import EditListing from '../../pages/EditListing'
import Login from '../../pages/Login'
import Dashboard from '../../pages/Dashboard'
import NotFound from '../../pages/NotFound'

const AnimatedRoutes = ({ CompleteMagicLinkComponent }) => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/edit/:listingId" element={<EditListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complete-magic-link" element={<CompleteMagicLinkComponent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  )
}

export default AnimatedRoutes
