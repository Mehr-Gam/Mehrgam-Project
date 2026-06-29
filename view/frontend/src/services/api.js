import axios from 'axios'
import { clearSession, getAccessToken, saveSession } from '../utils/auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export class ApiClientError extends Error {
  constructor(message, { status, code, fields } = {}) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.fields = fields || {}
  }
}

const normalizeFieldPath = (path) => path.replace(/^(body|query|params)\./, '')

const normalizeFields = (fields) => {
  if (!fields || typeof fields !== 'object') {
    return {}
  }

  return Object.entries(fields).reduce((result, [path, messages]) => {
    const fieldName = normalizeFieldPath(path)
    const message = Array.isArray(messages) ? messages.join('، ') : String(messages)

    result[fieldName] = message
    return result
  }, {})
}

const createClientError = (error, fallbackMessage = 'خطایی در ارتباط با سرور رخ داد.') => {
  if (error instanceof ApiClientError) {
    return error
  }

  const backendError = error.response?.data?.error
  const message = backendError?.message || error.response?.data?.message || error.message || fallbackMessage
  const fields = normalizeFields(backendError?.fields)

  return new ApiClientError(message, {
    status: error.response?.status,
    code: backendError?.code,
    fields,
  })
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let refreshPromise = null

const authRefreshPath = '/auth/refresh'
const authPathsWithoutRefresh = ['/auth/login', '/auth/register', '/auth/logout', authRefreshPath]

const isAuthPathWithoutRefresh = (url = '') => authPathsWithoutRefresh.some((path) => url.includes(path))

const shouldRefreshAccessToken = (error) => {
  const status = error.response?.status
  const code = error.response?.data?.error?.code
  const requestConfig = error.config || {}
  const requestUrl = requestConfig.url || ''

  return (
    status === 401 &&
    !requestConfig._retry &&
    !isAuthPathWithoutRefresh(requestUrl) &&
    ['INVALID_ACCESS_TOKEN', 'ACCESS_TOKEN_REQUIRED'].includes(code)
  )
}

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post(authRefreshPath)
      .then((response) => response.data?.data)
      .then((session) => {
        if (!session?.accessToken) {
          throw new ApiClientError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.', {
            status: 401,
            code: 'SESSION_EXPIRED',
          })
        }

        saveSession({
          accessToken: session.accessToken,
          user: session.user,
        })

        return session
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

const redirectToLoginAfterSessionExpired = () => {
  if (typeof window === 'undefined') {
    return
  }

  const isAuthPage = ['/login', '/signup', '/logout'].includes(window.location.pathname)

  if (!isAuthPage) {
    window.location.assign('/login?expired=1')
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (shouldRefreshAccessToken(error)) {
      originalRequest._retry = true

      try {
        const session = await refreshSession()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`

        return api(originalRequest)
      } catch {
        clearSession()
        redirectToLoginAfterSessionExpired()

        return Promise.reject(
          new ApiClientError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.', {
            status: 401,
            code: 'SESSION_EXPIRED',
          }),
        )
      }
    }

    return Promise.reject(createClientError(error))
  },
)

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: () => refreshClient.post(authRefreshPath).then((response) => response.data),
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


export const mapApi = {
  search: (params = {}) => api.get('/maps/search', { params }),
  reverse: (params = {}) => api.get('/maps/reverse', { params }),
  distanceEstimate: (payload) => api.post('/maps/distance-estimate', payload),
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
