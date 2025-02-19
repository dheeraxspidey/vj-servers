import { io } from 'socket.io-client';

const socket = io('http://10.45.8.186:6040', {
  withCredentials: true,
});

export default socket;