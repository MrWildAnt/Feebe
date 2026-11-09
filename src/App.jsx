import './App.css'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Dashboard from './content/pages/dashboard/Dashboard.jsx'
import FullPlayer from './content/pages/focused/FullPlayer.jsx'
import { PlayerProvider } from "./content/utility/universal/PlayerContext.jsx";
import LoginRegister from './content/pages/registration/LoginRegister.jsx'
// import AdminDashboard from './content/pages/musiccontrol/AdminDashboard.jsx'

function MusicExperience() {
  return (
    <PlayerProvider>
      <Outlet />
    </PlayerProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<MusicExperience />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/focused" element={<FullPlayer />} />
      </Route>
      <Route path="/login" element={<LoginRegister mode="login" />} />
      <Route path="/registration" element={<LoginRegister mode="register" />} />
      {/* <Route path="/add" element={<AdminDashboard />} /> */}
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  )
}

export default App