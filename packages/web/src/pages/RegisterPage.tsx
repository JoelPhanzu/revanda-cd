import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'
import { authService, type AuthResponse, type RegisterInput } from '@/services/auth'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuthState } = useAuthStore()
  const { addNotification } = useUIStore()

  const [formData, setFormData] = useState<RegisterInput>({
    fullName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'password', string>>>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as 'name' | 'email' | 'password']) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setFormError('')
  }

  const validate = () => {
    const nextErrors: Partial<Record<'name' | 'email' | 'password', string>> = {}
    if (formData.fullName.trim().length < 2) {
      nextErrors.name = 'Le nom doit contenir au moins 2 caractères.'
    }
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
      const response = (await authService.register(formData)) as unknown as AuthResponse
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
      setSuccessMessage('Inscription réussie. Redirection en cours...')

      addNotification({
        type: 'success',
        message: 'Inscription réussie!',
        duration: 3000,
      })

      setTimeout(() => navigate('/dashboard'), 500)
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Erreur lors de l’inscription'
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
    <div className="-mx-4 -my-6 grid min-h-[calc(100vh-64px)] md:grid-cols-[1fr,1fr]">
      {/* Left — brand panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-blue-500 p-10 text-white md:flex">
        <Link to="/" className="text-2xl font-black tracking-tight">
          Revanda
        </Link>
        <div className="space-y-6">
          <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
            B2B Marketplace
          </p>
          <h2 className="text-3xl font-black leading-snug">
            Rejoignez des milliers d'acheteurs et vendeurs.
          </h2>
          <p className="text-sm text-indigo-100">
            Créez votre compte en moins d'une minute et accédez à notre catalogue complet.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '10K+', label: 'Produits' },
            { value: '2K', label: 'Vendeurs' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="mt-0.5 text-xs text-indigo-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <Link to="/" className="mb-4 inline-block text-xl font-black text-indigo-600 md:hidden">
              Revanda
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
            <p className="mt-1 text-sm text-slate-600">Inscription gratuite. Aucune carte requise.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jean Dupont"
                autoComplete="fullName"
                className={`h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-2 ${errors.name ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'}`}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
            </div>

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
                placeholder="example@company.com"
                autoComplete="email"
                className={`h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-2 ${errors.email ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'}`}
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
                autoComplete="new-password"
                className={`h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-2 ${errors.password ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'}`}
              />
              {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
            </div>

            {formError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>
            ) : null}
            {successMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Inscription en cours...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Se connecter
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>🔒 Inscription sécurisée</span>
            <span>·</span>
            <span>Données chiffrées</span>
            <span>·</span>
            <span>Sans engagement</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
