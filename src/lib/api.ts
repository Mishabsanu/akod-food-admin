import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const adminApi = {
  // Dashboard Analytics
  getDashboard: () => api.get('/admin/dashboard'),

  // Categories
  getCategories: (params?: any) => api.get('/admin/categories', { params }),
  getCategory: (id: string) => api.get(`/admin/categories/${id}`),
  createCategory: (data: FormData) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: FormData) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // Products
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  getProduct: (id: string) => api.get(`/admin/products/${id}`),
  createProduct: (data: FormData) => api.post('/admin/products', data),
  updateProduct: (id: string, data: FormData) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  getOrder: (id: string) => api.get(`/admin/orders/${id}`),
  updateOrder: (id: string, status: string) => api.put(`/admin/orders/${id}`, { status }),
  updateShipment: (id: string, data: any) => api.patch(`/admin/orders/${id}/shipment`, data),
  deleteOrder: (id: string) => api.delete(`/admin/orders/${id}`),

  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Customers
  getCustomers: (params?: any) => api.get('/customers/admin/list', { params }),
  toggleCustomerStatus: (id: string) => api.patch(`/customers/admin/status/${id}`),
  deleteCustomer: (id: string) => api.delete(`/admin/customers/${id}`),
};

export default api;
