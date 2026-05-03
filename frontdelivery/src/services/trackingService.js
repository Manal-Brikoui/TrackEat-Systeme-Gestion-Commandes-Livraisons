
import api from './api'

export const trackingService = {
  getLastLocation: (orderId) =>
    api.get(`/tracking/${orderId}`).then(r => r.data),  // ← sans /api/
}