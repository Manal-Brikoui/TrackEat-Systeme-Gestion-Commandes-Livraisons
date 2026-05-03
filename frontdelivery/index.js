import { api } from "./api";

export const authService = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/api/auth/reset-password", data),
  updateProfile: (data) => api.put("/api/auth/profile", data),
};

export const restaurantService = {
  getAll: () => api.get("/api/restaurants"),
  getById: (id) => api.get(`/api/restaurants/${id}`),
  getMy: () => api.get("/api/restaurants/my"),
  apply: (data) => api.post("/api/restaurants/apply", data),
  getPending: () => api.get("/api/restaurants/pending"),
  updateStatus: (id, status) => api.patch(`/api/restaurants/${id}/status?status=${status}`),
  toggleOpen: (id) => api.patch(`/api/restaurants/${id}/toggle`),
  delete: (id) => api.delete(`/api/restaurants/${id}`),
  updateInfo: (data) => api.put("/api/restaurants/my/info", data),
  getByCategory: (catId) => api.get(`/api/restaurants/category/${catId}`),

  
  getProducts: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/products`),
  addProduct: (data) => api.post("/api/restaurants/products", data),
  deleteProduct: (id) => api.delete(`/api/restaurants/products/${id}`),


  getCategories: () => api.get("/api/restaurants/categories"),
  createCategory: (data) => api.post("/api/restaurants/categories", data),
  updateCategory: (id, data) => api.put(`/api/restaurants/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/api/restaurants/categories/${id}`),
};


export const workingHoursService = {
  getByRestaurant: (id) => api.get(`/api/working-hours/restaurant/${id}`),
  update: (data) => api.put("/api/working-hours", data),
};

export const orderService = {
  create: (data) => api.post("/api/orders", data),
  getMy: () => api.get("/api/orders/my"),
  getById: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status?status=${status}`),
  cancel: (id) => api.patch(`/api/orders/${id}/cancel`),
  getByRestaurant: (id) => api.get(`/api/orders/restaurant/${id}`),
  getByDriver: (id) => api.get(`/api/orders/driver/${id}`),
  getAvailable: () => api.get("/api/orders/available"),
  assignDriver: (orderId, driverId) => api.patch(`/api/orders/${orderId}/assign-driver?driverId=${driverId}`),
  driverAccept: (id) => api.patch(`/api/orders/${id}/accept`),
  driverReject: (id) => api.patch(`/api/orders/${id}/reject`),
  deliver: (id) => api.patch(`/api/orders/${id}/deliver`),
};

export const driverService = {
  apply: (data) => api.post("/api/drivers/apply", data),
  getPending: () => api.get("/api/drivers/pending"),
  updateStatus: (id, status) => api.patch(`/api/drivers/${id}/status?status=${status}`),
  getMyProfile: () => api.get("/api/drivers/me"),
  getAvailable: () => api.get("/api/drivers/available"),
  toggleAvailability: () => api.patch("/api/drivers/toggle"),
  updateLocation: (lat, lng) => api.patch(`/api/drivers/location?latitude=${lat}&longitude=${lng}`),
};


export const notificationService = {
  getMy: () => api.get("/api/notifications"),
  getUnreadCount: () => api.get("/api/notifications/unread-count"),
  markAllRead: () => api.patch("/api/notifications/read-all"),
};

export const reviewService = {
  add: (data) => api.post("/api/reviews", data),
  getByRestaurant: (id) => api.get(`/api/reviews/restaurant/${id}`),
  getAverageRating: (id) => api.get(`/api/reviews/restaurant/${id}/rating`),
  delete: (id) => api.delete(`/api/reviews/${id}`),
};


export const paymentService = {
  process: (data) => api.post("/api/payments", data),
  getByOrder: (orderId) => api.get(`/api/payments/order/${orderId}`),
};


export const adminService = {
  getAllUsers: () => api.get("/api/admin/users"),
  removeRole: (id) => api.patch(`/api/admin/users/${id}/remove-role`),
};


export const uploadService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm("/api/upload", formData);
  },
};


export const trackingService = {
  getDriverLocation: (orderId) => api.get(`/api/tracking/order/${orderId}`),
};