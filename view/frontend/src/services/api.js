import axios from 'axios'
import { getAccessToken } from '../utils/auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'خطایی در ارتباط با سرور رخ داد.'

    return Promise.reject(new Error(message))
  },
)

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

export const serviceRequestApi = {
  create: (payload) => api.post('/service-requests', payload),
  getMy: () => api.get('/service-requests/my'),
  getAvailable: () => api.get('/service-requests/available'),
  accept: (requestId) => api.post(`/service-requests/${requestId}/accept`),
  finish: (requestId) => api.patch(`/service-requests/${requestId}/finish`),
  cancel: (requestId) => api.patch(`/service-requests/${requestId}/cancel`),
}

export const emergencyApi = {
  create: (payload) => api.post('/emergency-alerts', payload),
  getMy: () => api.get('/emergency-alerts/my'),
  resolve: (alertId) => api.patch(`/emergency-alerts/${alertId}/resolve`),
  cancel: (alertId) => api.patch(`/emergency-alerts/${alertId}/cancel`),
}

export const volunteerApi = {
  getMe: () => api.get('/volunteers/me'),
  updateLocation: (payload) => api.patch('/volunteers/me/location', payload),
  goOnline: () => api.patch('/volunteers/me/online'),
  goOffline: () => api.patch('/volunteers/me/offline'),
  createAvailability: (payload) => api.post('/volunteers/me/availability', payload),
  getAvailability: () => api.get('/volunteers/me/availability'),
  deactivateAvailability: (availabilityId) => api.patch(`/volunteers/me/availability/${availabilityId}/deactivate`),
}

export const supervisorApi = {
  getMyDisabled: (params = {}) => api.get('/supervisors/me/disabled', { params }),
  attachDisabled: (payload) => api.post('/supervisors/me/disabled', payload),
  removeDisabled: (disabledId) => api.delete(`/supervisors/me/disabled/${disabledId}`),
}

export const adminApi = {
  listUsers: (params = {}) => api.get('/admin/users', { params }),
  activateUser: (userId) => api.patch(`/admin/users/${userId}/activate`),
  deactivateUser: (userId) => api.patch(`/admin/users/${userId}/deactivate`),
  createAdmin: (payload) => api.post('/admin/admins', payload),
  listDisabled: (params = {}) => api.get('/admin/disabled', { params }),
  listSupervisors: (params = {}) => api.get('/admin/supervisors', { params }),
  listVolunteers: (params = {}) => api.get('/admin/volunteers', { params }),
  listPendingVolunteers: (params = {}) => api.get('/admin/volunteers/pending', { params }),
  approveVolunteer: (volunteerId) => api.patch(`/admin/volunteers/${volunteerId}/approve`),
  rejectVolunteer: (volunteerId) => api.patch(`/admin/volunteers/${volunteerId}/reject`),
}
