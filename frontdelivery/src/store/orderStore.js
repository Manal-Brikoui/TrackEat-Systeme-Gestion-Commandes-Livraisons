import { create } from 'zustand'

export const useOrderStore = create((set) => ({
  activeOrder: null,
  orders: [],
  setActiveOrder: (o) => set({ activeOrder: o }),
  setOrders:      (orders) => set({ orders }),
  updateOrder: (updated) => set((s) => ({
    orders: s.orders.map(o => o.id === updated.id ? updated : o),
    activeOrder: s.activeOrder?.id === updated.id ? updated : s.activeOrder,
  })),
}))