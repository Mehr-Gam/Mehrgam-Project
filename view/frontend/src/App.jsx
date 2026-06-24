import { Navigate, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EmergencyPage from './pages/EmergencyPage.jsx'
import HomePage from './pages/HomePage.jsx'
import RequestsPage from './pages/RequestsPage.jsx'
import SupervisorPage from './pages/SupervisorPage.jsx'
import VolunteerPage from './pages/VolunteerPage.jsx'
import { getAccessToken, getStoredUser } from './utils/auth.js'

function RequireAuth({ children, roles }) {
  const token = getAccessToken()
  const user = getStoredUser()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function ProtectedPage({ children, roles }) {
  return <RequireAuth roles={roles}>{children}</RequireAuth>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/logout" element={<AuthPage mode="logout" />} />
      <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
      <Route path="/requests" element={<ProtectedPage roles={['disabled', 'supervisor', 'volunteer']}><RequestsPage /></ProtectedPage>} />
      <Route path="/emergency" element={<ProtectedPage roles={['disabled', 'supervisor']}><EmergencyPage /></ProtectedPage>} />
      <Route path="/volunteer" element={<ProtectedPage roles={['volunteer']}><VolunteerPage /></ProtectedPage>} />
      <Route path="/supervisor" element={<ProtectedPage roles={['supervisor']}><SupervisorPage /></ProtectedPage>} />
      <Route path="/admin" element={<ProtectedPage roles={['admin']}><AdminPage /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
