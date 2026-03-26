import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail.jsx'
import CreateListing from './pages/CreateListing'

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#FAF7F2]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/create" element={<CreateListing />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App