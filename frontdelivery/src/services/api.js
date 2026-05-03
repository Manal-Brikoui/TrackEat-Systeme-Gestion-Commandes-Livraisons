import axios from 'axios'
import { _storage } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((cfg) => {
  try {
    const token = _storage.safeGet('token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  } catch (e) {
    console.warn('localStorage bloqué par le navigateur', e)
  }
  return cfg
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status
    const url     = err.config?.url
    const method  = err.config?.method?.toUpperCase()
    const data    = err.response?.data

    console.error(
      `[API] ${method} ${url} → ${status}`,
      '\nRéponse serveur:', data,
      '\nMessage:', err.message
    )

    if (status === 400) {
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        data?.detail ||
        'Requête invalide (400)'
      return Promise.reject(new Error(msg))
    }

    if (status === 401) {
      _storage.safeClear()
      window.location.href = '/login'
      return Promise.reject(new Error('Session expirée, reconnectez-vous'))
    }

    if (status === 403) {
      return Promise.reject(new Error('Accès refusé (403)'))
    }

    if (status === 404) {
      return Promise.reject(new Error(`Ressource introuvable : ${url}`))
    }

    if (status === 409) {
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        'Conflit — ressource déjà existante (409)'
      return Promise.reject(new Error(msg))
    }

    if (status === 500) {
      const msg =
        (typeof data === 'string' && data) ||
        data?.message ||
        data?.error ||
        data?.trace?.split('\n')?.[0] ||
        'Erreur interne du serveur (500)'
      console.error('[API] Détail 500:', msg)
      return Promise.reject(new Error(msg))
    }

    if (!err.response) {
      return Promise.reject(new Error('Serveur injoignable — vérifiez que le backend est démarré'))
    }

    return Promise.reject(err)
  }
)

export default api