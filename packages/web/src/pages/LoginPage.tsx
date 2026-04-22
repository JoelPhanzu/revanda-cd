import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'
import { authService, type AuthResponse, type LoginInput } from '@/services/auth'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuthState } = useAuthStore()
  const { addNotification } = useUIStore()

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof LoginInput]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setFormError('')
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof LoginInput, string>> = {}
    if (!emailRegex.test(formData.email)) {
      nextErrors.email = 'Veuillez entrer un email valide.'
    }
    if (formData.password.length < 6) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 6 caractères.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      return
    }

    setLoading(true)
    setFormError('')
    setSuccessMessage('')

    try {
      const response = (await authService.login(formData)) as unknown as AuthResponse
      const { token, user } = response
      const now = new Date().toISOString()

      setAuthState(
        {
          ...user,
          role: user.role || 'CUSTOMER',
          createdAt: now,
          updatedAt: now,
        },
        token
      )
      authService.setToken(token)
      setSuccessMessage('Connexion réussie. Redirection en cours...')

      addNotification({
        type: 'success',
        message: 'Connecté avec succès!',
        duration: 3000,
      })

      setTimeout(() => navigate('/dashboard'), 500)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erreur de connexion'
      setFormError(errorMessage)
      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[75vh] items-center py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
          <p className="mt-1 text-sm text-slate-600">Bienvenue sur Revanda.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'}`}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'}`}
            />
            {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700">
              Créer un compte
            </Link>
            <a href="#" className="text-slate-500 hover:text-slate-700">
              Mot de passe oublié ?
            </a>
          </div>

          {formError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p> : null}
          {successMessage ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Pas de compte ?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
