import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://activity.vnrzone.site/ac-be' 
    : '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance; 