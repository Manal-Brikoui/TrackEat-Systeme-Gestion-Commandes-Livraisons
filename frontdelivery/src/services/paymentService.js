import api from './api'

export const paymentService = {
  process:      (data)    => api.post('/payments', data).then(r => r.data),
  getByOrderId: (orderId) => api.get(`/payments/order/${orderId}`).then(r => r.data),
}