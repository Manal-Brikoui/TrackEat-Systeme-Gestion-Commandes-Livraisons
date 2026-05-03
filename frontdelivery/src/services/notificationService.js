import api from './api'


export const notificationService = {
  getMy:         () => api.get('/notifications').then(r => r.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
  markAllRead:   () => api.patch('/notifications/read-all').then(r => r.data),
}