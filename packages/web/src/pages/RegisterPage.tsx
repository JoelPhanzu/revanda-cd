import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'
import { authService, type RegisterInput } from '@/services/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const { addNotification } = useUIStore()

  const [formData, setFormData] = useState<RegisterInput>({
    fullName: '',
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
      const response = (await authService.register(formData)) as any
      const { token, user } = response

      // Sauvegarder dans le store
      setUser(user)
      setToken(token)

      // Sauvegarder le token dans localStorage
      authService.setToken(token)

      // Notification
      addNotification({
        type: 'success',
        message: 'Inscription réussie!',
        duration: 3000,
      })

      // Rediriger
      navigate('/dashboard')
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'inscription',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Inscription</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Nom complet</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Jean Dupont"
              required
            />
          </div>

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
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="login-link">
          Déjà inscrit? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
