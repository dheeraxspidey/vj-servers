import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

export default {
  login: (credentials) => api.post('/login', credentials),
  signup: (userData) => api.post('/signup', userData),
  getActivities: () => api.get('/activities'),
  addActivity: (activity) => api.post('/activities', activity),
  syncGithub: (token) => api.post('/sync/github', { token }),
  syncLeetcode: (username) => api.post('/sync/leetcode', { username }),
  generateResume: (data) => api.post('/generate-resume', data, { responseType: 'blob' })
} 