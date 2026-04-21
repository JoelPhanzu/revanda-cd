import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminProductsPage } from '@/pages/AdminProductsPage'
import { AdminVendorsPage } from '@/pages/AdminVendorsPage'
import { VendorProductsPage } from '@/pages/VendorProductsPage'
import { VendorSalesPage } from '@/pages/VendorSalesPage'
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
        path: 'checkout/:orderId',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
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
            <VendorProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vendor/sales',
        element: (
          <ProtectedRoute requiredRoles={['vendor']}>
            <VendorSalesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <div>Gestion Utilisateurs (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products/pending',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/vendors',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminVendorsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <div>Tableau de bord Super Admin (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin/admins',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <div>Gestion Admins (À créer)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin/deletions',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
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
