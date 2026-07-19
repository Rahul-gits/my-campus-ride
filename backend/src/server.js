const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./utils/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const stopRoutes = require('./routes/stops');
const trackingRoutes = require('./routes/tracking');
const userRoutes = require('./routes/users');
const incidentRoutes = require('./routes/incidents');
const bookingRoutes = require('./routes/bookings');
const dispatchRoutes = require('./routes/dispatch');
const ratingRoutes = require('./routes/ratings');
const favoriteRoutes = require('./routes/favorites');
const maintenanceRoutes = require('./routes/maintenance');
const reportRoutes = require('./routes/reports');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_123456');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    if (!user.isActive) {
      return next(new Error('Authentication error: User account is inactive'));
    }

    socket.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Socket authorization error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  const { id: userId, username, role } = socket.user;
  console.log(`User connected via socket: ${username} (${role}), ID: ${userId}, Socket ID: ${socket.id}`);

  // Join role & user specific rooms
  socket.join(`user:${userId}`);
  socket.join(`role:${role}`);

  // Join bus tracking room
  socket.on('join-bus-tracking', (busId) => {
    socket.join(`bus-${busId}`);
    console.log(`Socket ${socket.id} joined bus tracking room: bus-${busId}`);
  });

  // Join route tracking room
  socket.on('join-route-tracking', (routeId) => {
    socket.join(`route-${routeId}`);
    console.log(`Socket ${socket.id} joined route tracking room: route-${routeId}`);
  });

  // Leave rooms
  socket.on('leave-bus-tracking', (busId) => {
    socket.leave(`bus-${busId}`);
    console.log(`Socket ${socket.id} left bus tracking room: bus-${busId}`);
  });

  socket.on('leave-route-tracking', (routeId) => {
    socket.leave(`route-${routeId}`);
    console.log(`Socket ${socket.id} left route tracking room: route-${routeId}`);
  });

  // Handle high-frequency driver coordinates updates directly via Websocket
  socket.on('driver-location-update', async (data) => {
    const { busId, lat, lng, speed, direction, occupancy } = data;
    try {
      const Bus = require('./models/Bus');
      const bus = await Bus.findById(busId);
      if (bus) {
        await bus.updateLocation(lat, lng);
        if (speed !== undefined || direction !== undefined) {
          await bus.updateStatus(bus.currentStatus, speed, direction);
        }
        if (occupancy !== undefined) {
          bus.occupancy.current = occupancy;
          await bus.save();
        }

        // Broadcast to bus subscribers
        io.to(`bus-${busId}`).emit('bus-location-update', {
          busId,
          location: { lat, lng },
          status: bus.currentStatus,
          speed: bus.speed,
          direction: bus.direction,
          occupancy: bus.occupancy,
          timestamp: new Date()
        });

        // Broadcast to route subscribers
        io.to(`route-${bus.route}`).emit('route-update', {
          busId,
          busNumber: bus.busNumber,
          location: { lat, lng },
          status: bus.currentStatus,
          speed: bus.speed,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Error updating bus location via socket event:', err);
    }
  });

  // Handle driver incident report broadcast
  socket.on('driver-incident', (incidentData) => {
    console.log(`Incident reported by driver:`, incidentData);
    // Broadcast to all admin sockets in real time
    io.to('role:admin').emit('incident-report', {
      ...incidentData,
      reportedBy: username,
      userId: userId,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id} (User: ${username})`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚌 Campus Ride Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.IO enabled for real-time updates`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
