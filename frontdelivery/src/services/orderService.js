import api from './api'

export const orderService = {

  create:       (data)  => api.post('/orders', data).then(r => r.data),
  getMy:        ()      => api.get('/orders/my').then(r => r.data),
  getById:      (id)    => api.get('/orders/' + id).then(r => r.data),
  cancel:       (id)    => api.patch('/orders/' + id + '/cancel').then(r => r.data),

  getByRestaurant: (restaurantId) => api.get('/orders/restaurant/' + restaurantId).then(r => r.data),
  confirm:         (id)           => api.put('/orders/' + id + '/confirm').then(r => r.data),
  decline:         (id)           => api.put('/orders/' + id + '/decline').then(r => r.data),
  updateStatus:    (id, status)   => api.patch('/orders/' + id + '/status', null, { params: { status } }).then(r => r.data),

  getAvailable:  ()    => api.get('/orders/available').then(r => r.data),
  getByDriver:   (id)  => api.get('/orders/driver/' + id).then(r => r.data),
  driverAccept:  (id)  => api.patch('/orders/' + id + '/accept').then(r => r.data),
  driverReject:  (id)  => api.patch('/orders/' + id + '/reject').then(r => r.data),
  deliver:       (id)  => api.patch('/orders/' + id + '/deliver').then(r => r.data),
  assignDriver:  (id, driverId) => api.patch('/orders/' + id + '/assign-driver', null, { params: { driverId } }).then(r => r.data),

  deleteOrder:   (id)  => api.delete('/orders/' + id).then(r => r.data),
}