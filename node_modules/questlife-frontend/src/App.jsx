import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'

function AppInner() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:40, animation:'spin 1s linear infinite' }}>⚔️</div>
    </div>
  )

  return user ? <Dashboard /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
