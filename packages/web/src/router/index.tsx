import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout } from '@/layouts/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <div>Profil Page (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <div>Paramètres Page (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'vendor/products',
        element: (
          <ProtectedRoute requiredRoles={['vendor']}>
            <div>Mes Produits Vendeur (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'vendor/sales',
        element: (
          <ProtectedRoute requiredRoles={['vendor']}>
            <div>Ventes Vendeur (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
            <div>Tableau de bord Admin (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
            <div>Gestion Utilisateurs (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
            <div>Gestion Produits (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin',
        element: (
          <ProtectedRoute requiredRoles={['super_admin']}>
            <div>Tableau de bord Super Admin (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin/admins',
        element: (
          <ProtectedRoute requiredRoles={['super_admin']}>
            <div>Gestion Admins (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin/deletions',
        element: (
          <ProtectedRoute requiredRoles={['super_admin']}>
            <div>Demandes de Suppression (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'unauthorized',
        element: <div className="error-page">Non autorisé</div>,
      },
      {
        path: '*',
        element: <div className="error-page">Page non trouvée 404</div>,
      },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}

export default Router