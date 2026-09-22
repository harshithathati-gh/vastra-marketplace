const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const { setupSocket } = require('./src/socket/chatHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/tailors', require('./src/routes/tailors'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/messages', require('./src/routes/messages'));
app.use('/api/measurements', require('./src/routes/measurements'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/colors', require('./src/routes/colorRoutes'));
app.use('/api/contact', require('./src/routes/contact'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Vastra API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(require('./src/middleware/errorHandler'));

// Setup socket handlers
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🧵 Vastra API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = { app, server };
