import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// A handy wrapper component that guards our private pages.
// If you're logged in, you can pass through. If not, you get sent straight to the login screen!
export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}
