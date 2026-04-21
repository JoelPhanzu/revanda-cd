import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Go back home
      </Link>
    </div>
  )
}

export default NotFoundPage
