import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, token, setAuth, updateUser, logout } = useAuthStore()
  return {
    user,
    token,
    isAuthenticated: !!token,
    isClient:          user?.role === 'CLIENT',
    isDriver:          user?.role === 'DRIVER',
    isRestaurantAdmin: user?.role === 'RESTAURANT_ADMIN',
    isAdmin:           user?.role === 'ADMIN',
    hasRole: (r) => Array.isArray(r) ? r.includes(user?.role) : user?.role === r,
    setAuth,
    updateUser,
    logout,
  }
}