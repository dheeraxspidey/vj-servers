import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'https://activity.vnrzone.site' 
    : '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance; 