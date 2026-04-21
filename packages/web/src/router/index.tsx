import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'

export const router = createBrowserRouter(routes)

export function Router() {
  return <RouterProvider router={router} />
}

export default Router
