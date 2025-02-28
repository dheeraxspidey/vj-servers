// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const handleSocketConnection = require('./controllers/socketController');
// const routes = require('./routes/routes'); // Import routes
// require('dotenv').config(); // Load environment variables from .env file

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: [process.env.VITE_FRONTEND_URL, "http://10.45.8.186:3108", "http://10.45.8.186:3108", "https://undoubt.vnrzone.site"], // Specify the allowed origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow DELETE method
//     credentials: true, // Allow credentials
//   },
// });

// app.use(cors({
//   origin: process.env.VITE_FRONTEND_URL, // Specify the allowed origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow DELETE method
//   credentials: true, // Allow credentials
// }));

// app.use(express.json()); // Middleware to parse JSON bodies
// app.use('/api', routes); // Use routes with /api prefix

// // Connect to MongoDB Atlas
// const mongoUri = process.env.MONGO_URI; // Use MONGO_URI from .env file
// mongoose.connect(mongoUri)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// io.on('connection', (socket) => {
//   console.log('New client connected');
//   handleSocketConnection(io, socket);
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// // Update the port to 3108
// const PORT = process.env.PORT || 3108;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const handleSocketConnection = require('./controllers/socketController');
const routes = require('./routes/routes'); // Import routes
require('dotenv').config(); // Load environment variables

const app = express();
const apiServer = http.createServer(app); // ✅ API server instance
const wsServer = http.createServer(); // ✅ Separate WebSocket server instance

// ✅ Allow multiple frontend origins
const allowedOrigins = [
  process.env.VITE_FRONTEND_URL || "https://undoubt.vnrzone.site",
  "http://localhost:3108",
  "http://10.45.8.186:3108"
];

// ✅ WebSocket Server (Runs on a separate HTTP server)
const io = new Server(wsServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, auth headers)
  }
});

// ✅ Middleware: Enable CORS for Express API
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middleware: JSON Parser
app.use(express.json());

// ✅ API Routes
app.use('/api', routes);

// ✅ Connect to MongoDB Atlas
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// ✅ WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log(`✅ New WebSocket Connection: ${socket.id}`);
  
  handleSocketConnection(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client Disconnected: ${socket.id}`);
  });
});

// ✅ Start API Server
const API_PORT = process.env.PORT || 6108;
apiServer.listen(API_PORT, () => console.log(`🚀 API Server running on port ${API_PORT}`));

// ✅ Start WebSocket Server on a Different Port
const WS_PORT = process.env.WEBSOCKET_PORT || 6500;
wsServer.listen(WS_PORT, () => console.log(`🌐 WebSocket Server running on port ${WS_PORT}`));

