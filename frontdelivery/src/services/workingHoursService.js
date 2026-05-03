import api from './api'

export const workingHoursService = {
  getByRestaurant: (restaurantId) => api.get(`/working-hours/restaurant/${restaurantId}`).then(r => r.data),
  update:          (data)         => api.put('/working-hours', data).then(r => r.data),
}