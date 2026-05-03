import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: '',

  addItem: (product, restaurantId, restaurantName) => {
    const { items, restaurantId: cur } = get()
    if (cur && cur !== restaurantId) {
      if (!window.confirm('Vider le panier pour commander ici ?')) return
      set({ items: [], restaurantId: null, restaurantName: '' })
    }
    const existing = items.find(i => i.id === product.id)
    if (existing) {
      set({ items: items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) })
    } else {
      set({ items: [...items, { ...product, quantity: 1 }], restaurantId, restaurantName })
    }
  },

  removeItem: (id) => {
    const items = get().items
      .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0)
    set({ items, ...(items.length === 0 ? { restaurantId: null, restaurantName: '' } : {}) })
  },

  deleteItem: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items, ...(items.length === 0 ? { restaurantId: null, restaurantName: '' } : {}) })
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: '' }),
  total:     () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
  count:     () => get().items.reduce((s, i) => s + i.quantity, 0),
}))