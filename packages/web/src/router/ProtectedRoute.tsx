import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { mapRoleToDisplay } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: Array<'customer' | 'vendor' | 'admin'>
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // Si l'utilisateur n'est pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const displayRole = user?.displayRole || (user?.role ? mapRoleToDisplay(user.role) : undefined)

  // Si des rôles sont requis et l'utilisateur n'a pas le bon rôle
  if (requiredRoles && !requiredRoles.includes(displayRole as 'customer' | 'vendor' | 'admin')) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
