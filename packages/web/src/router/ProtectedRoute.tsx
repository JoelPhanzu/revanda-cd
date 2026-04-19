import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: Array<'customer' | 'vendor' | 'admin' | 'super_admin'>
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // Si l'utilisateur n'est pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si des rôles sont requis et l'utilisateur n'a pas le bon rôle
  if (requiredRoles && !requiredRoles.includes(user?.role as any)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute