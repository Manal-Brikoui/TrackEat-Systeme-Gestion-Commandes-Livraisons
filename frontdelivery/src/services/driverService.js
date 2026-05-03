import api from './api'

export const driverService = {
  apply:              (data)                    => api.post('/drivers/apply', data).then(r => r.data),
  getPending:         ()                        => api.get('/drivers/pending').then(r => r.data),
  updateStatus:       (id, status)              => api.patch('/drivers/' + id + '/status', null, { params: { status } }).then(r => r.data),
  getMyProfile:       ()                        => api.get('/drivers/me').then(r => r.data),
  getAvailable:       ()                        => api.get('/drivers/available').then(r => r.data),
  toggleAvailability: ()                        => api.patch('/drivers/toggle').then(r => r.data),
  updateLocation:     (latitude, longitude)     => api.patch('/drivers/location', null, { params: { latitude, longitude } }).then(r => r.data),
  getAll:             ()                        => api.get('/drivers/all').then(r => r.data),
  notifyDriver:       (driverId, orderId)       => api.post('/drivers/' + driverId + '/notify', { orderId }).then(r => r.data),
}