import api from './api'

export const restaurantService = {
  
  getCategories:    ()         => api.get('/restaurants/categories').then(r => r.data),
  createCategory:   (data)     => api.post('/restaurants/categories', data).then(r => r.data),
  updateCategory:   (id, data) => api.put(`/restaurants/categories/${id}`, data).then(r => r.data),
  deleteCategory:   (id)       => api.delete(`/restaurants/categories/${id}`).then(r => r.data),


  getAll: () => api.get('/restaurants').then(r => r.data),
                                  
  getById:       (id)          => api.get(`/restaurants/${id}`).then(r => r.data),
  getMy:         ()            => api.get('/restaurants/my').then(r => r.data),
  apply:         (data)        => api.post('/restaurants/apply', data).then(r => r.data),
  getPending:    ()            => api.get('/restaurants/pending').then(r => r.data),
  updateStatus:  (id, status)  => api.patch(`/restaurants/${id}/status`, null, { params: { status } }).then(r => r.data),
  toggleOpen:    (id)          => api.patch(`/restaurants/${id}/toggle`).then(r => r.data),
  delete:        (id)          => api.delete(`/restaurants/${id}`).then(r => r.data),
  getByCategory: (categoryId)  => api.get(`/restaurants/category/${categoryId}`).then(r => r.data),
  updateMyInfo:  (data)        => api.put('/restaurants/my/info', data).then(r => r.data),
  updateProduct: (id, data) => api.put(`/restaurants/products/${id}`, data).then(r => r.data),
  updateLocationAdmin: (id, lat, lng) =>
    api.patch(`/restaurants/${id}/location`, null, { params: { latitude: lat, longitude: lng } }).then(r => r.data),

  getProducts:   (restaurantId) => api.get(`/restaurants/${restaurantId}/products`).then(r => r.data),
  addProduct:    (data)         => api.post('/restaurants/products', data).then(r => r.data),
  deleteProduct: (id)           => api.delete(`/restaurants/products/${id}`).then(r => r.data),
}