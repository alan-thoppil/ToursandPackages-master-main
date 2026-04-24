import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Listing from './pages/Listing'
import Details from './pages/Details'
import Booking from './pages/Booking'
import Suggestions from './pages/Suggestions'
import AiTripPlanner from './pages/AiTripPlanner'
import Layout from './components/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/details" element={<Details />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/ai-planner" element={<AiTripPlanner />} />
      </Routes>
    </Layout>
  )
}

export default App
