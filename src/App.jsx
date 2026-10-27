import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './content/pages/dashboard/Dashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  )
}

export default App