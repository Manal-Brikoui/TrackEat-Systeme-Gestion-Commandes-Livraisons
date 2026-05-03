import api from './api'

export const adminService = {
  getAllUsers: () => api.get('/admin/users').then(r => r.data),
  removeRole:  (id) => api.patch(`/admin/users/${id}/remove-role`).then(r => r.data),
}