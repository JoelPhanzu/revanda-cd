import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: Array<'customer' | 'vendor' | 'admin'>
}

const normalizeRole = (role?: string) => (role || '').toLowerCase()

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // Si l'utilisateur n'est pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si des rôles sont requis et l'utilisateur n'a pas le bon rôle
  if (requiredRoles && !requiredRoles.map(normalizeRole).includes(normalizeRole(user?.displayRole || user?.role))) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
