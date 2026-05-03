import { create } from 'zustand'

let _mem = {}

const safeGet = (key) => {
  try { return localStorage.getItem(key) ?? _mem[key] ?? null } catch { return _mem[key] ?? null }
}
const safeSet = (key, value) => {
  try { localStorage.setItem(key, value) } catch { /*  */ }
  _mem[key] = value
}
const safeRemove = (key) => {
  try { localStorage.removeItem(key) } catch { /*  */ }
  delete _mem[key]
}
const safeClear = () => {
  try { localStorage.clear() } catch { /*  */ }
  _mem = {}
}

const getStoredUser = () => {
  try { return JSON.parse(safeGet('user')) } catch { return null }
}

export const useAuthStore = create((set) => ({
  user:  getStoredUser(),
  token: safeGet('token'),

  setAuth: (user, token) => {
    safeSet('token', token)
    safeSet('user', JSON.stringify(user))
    set({ user, token })
  },

  updateUser: (user) => {
    safeSet('user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    safeClear()
    set({ user: null, token: null })
  },
}))

export const _storage = { safeGet, safeSet, safeRemove, safeClear }