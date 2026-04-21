import { lazy, Suspense } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminProductsPage } from '@/pages/AdminProductsPage'
import { AdminVendorsPage } from '@/pages/AdminVendorsPage'
import { VendorProductsPage } from '@/pages/VendorProductsPage'
import { VendorSalesPage } from '@/pages/VendorSalesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from '@/layouts/MainLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const infoPageClassName = 'rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-700'
const CheckoutPage = lazy(() =>
  import('@/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage }))
)

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
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
            <Suspense fallback={<LoadingSpinner message="Loading checkout..." />}>
              <CheckoutPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
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
            <Navigate to="/admin/dashboard" replace />
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
            <div className={infoPageClassName}>User Management (Coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <Navigate to="/admin/products/pending" replace />
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
            <div className={infoPageClassName}>Super admin dashboard (Coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin/admins',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <div className={infoPageClassName}>Admin management (Coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'super-admin/deletions',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <div className={infoPageClassName}>Deletion requests (Coming soon)</div>
          </ProtectedRoute>
        ),
      },
      { path: 'about', element: <div className={infoPageClassName}>About Revanda</div> },
      { path: 'contact', element: <div className={infoPageClassName}>Contact Revanda support</div> },
      { path: 'unauthorized', element: <div className={infoPageClassName}>Unauthorized</div> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
