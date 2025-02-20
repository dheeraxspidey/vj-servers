import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';



const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const loginWithGoogle = () => {
  window.location.href = 'http://localhost:5000/auth/google';
};

const setPassword = async (token, password) => {
  const response = await api.post('/auth/set-password', { token, password });
  return response.data;
};

const fetchUserProfile = async () => {
  const response = await api.get('/api/profile');
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

const submitLostItem = async (itemData) => {
  try {
    const response = await api.post('/api/items/lost', itemData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit lost item:', error);
    throw error;
  }
};

const submitFoundItem = async (itemData) => {
  try {
    const response = await api.post('/api/items/found', itemData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit found item:', error);
    throw error;
  }
};

const fetchFoundItems = async () => {
  try {
    const response = await api.get('/api/items/found');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch found items:', error);
    throw error;
  }
};

const fetchLostItems = async () => {
  try {
    const response = await api.get('/api/items/lost');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch lost items:', error);
    throw error;
  }
};

const fetchReportedItems = async (user) => {
  try {
    if (!user?.email) throw new Error("User email is required");
    
    // Extract roll number from email
    const atIndex = user.email.indexOf('@');
    if (atIndex === -1) throw new Error("Invalid email format");
    
    const rollNo = user.email.substring(0, atIndex);

    const response = await api.get(`/api/items/reported/${rollNo}`);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch reported items:", err);
    throw err;
  }
};


export {
  loginWithGoogle,
  setPassword,
  fetchUserProfile,
  logout,
  submitFoundItem,
  submitLostItem,
  fetchFoundItems,
  fetchLostItems,
  fetchReportedItems,
};
