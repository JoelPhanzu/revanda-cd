import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'
import { authService, type LoginInput } from '@/services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const { addNotification } = useUIStore()

  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = (await authService.login(formData)) as any
      const { token, user } = response

      // Sauvegarder dans le store
      setUser(user)
      setToken(token)

      // Sauvegarder le token dans localStorage
      authService.setToken(token)

      // Notification
      addNotification({
        type: 'success',
        message: 'Connecté avec succès!',
        duration: 3000,
      })

      // Rediriger
      navigate('/dashboard')
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur de connexion',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Connexion</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="register-link">
          Pas de compte? <a href="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage