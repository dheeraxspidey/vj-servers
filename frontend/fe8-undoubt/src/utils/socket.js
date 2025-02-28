import { io } from 'socket.io-client';

// Use the correct backend URL
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true, // Enable credentials (if needed)
});

export default socket;

// import { io } from "socket.io-client";

// const SOCKET_SERVER_URL = "https://undoubt.vnrzone.site/ud-be";  // Correct URL

// const socket = io(SOCKET_SERVER_URL, {
//   path: "/ud-be/socket.io/",  // Explicitly set path
//   transports: ["websocket", "polling"], // Ensure WebSocket first
//   withCredentials: true, // Enable credentials (if required)
// });

// export default socket;

