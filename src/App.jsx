import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './content/pages/dashboard/Dashboard.jsx'
import FullPlayer from './content/pages/focused/FullPlayer.jsx'
import { PlayerProvider } from "./content/utility/universal/PlayerContext.jsx";
// import AdminDashboard from './content/pages/musiccontrol/AdminDashboard.jsx'

function App() {
  return (
    <PlayerProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/focused" element={<FullPlayer />} />
      {/* <Route path="/add" element={<AdminDashboard />} /> */}
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
    </PlayerProvider>
  )
}

export default App