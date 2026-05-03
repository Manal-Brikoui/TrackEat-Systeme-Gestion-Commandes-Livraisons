import api from './api'

export const reviewService = {
  add:              (data) => api.post('/reviews', data).then(r => r.data),
  getByRestaurant:  (id)   => api.get(`/reviews/restaurant/${id}`).then(r => r.data),
  getAverageRating: (id)   => api.get(`/reviews/restaurant/${id}/rating`).then(r => r.data),
  delete:           (id)   => api.delete(`/reviews/${id}`).then(r => r.data),
}