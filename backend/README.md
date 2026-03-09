# 🚌 Campus Ride Backend API

A comprehensive Node.js/Express backend API for the Campus Ride Bus Tracking System with real-time updates using Socket.IO.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Driver, Admin)
- Password hashing with bcrypt
- User profile management

### 🚌 Bus Management
- Real-time bus tracking
- Location updates with GPS coordinates
- Status management (moving, stopped, boarding, maintenance)
- Occupancy tracking
- Driver assignment

### 🛣️ Route Management
- Route creation and management
- Stop management and ordering
- Operating hours and schedules
- Fare management

### 📍 Stop Management
- Stop creation with facilities information
- Location-based stop search
- Nearby stops discovery
- Facility information (shelter, seating, etc.)

### 📊 Real-time Tracking
- Live bus location updates
- Historical tracking data
- Route-based tracking
- Location-based bus discovery

### 🔌 Real-time Communication
- Socket.IO integration
- Live bus location updates
- Route-based notifications
- Real-time status changes

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campus-ride
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "student1",
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91-9876543210",
    "department": "Computer Science",
    "year": "3rd Year",
    "studentId": "STU001"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Bus Endpoints

#### Get All Buses
```http
GET /api/buses
```

#### Get Bus by ID
```http
GET /api/buses/:id
```

#### Get Buses by Route
```http
GET /api/buses/route/:routeId
```

#### Get Buses Near Location
```http
GET /api/buses/near/:lat/:lng?radius=2
```

#### Update Bus Location (Driver only)
```http
POST /api/buses/:id/location
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "lat": 17.3850,
  "lng": 78.4867,
  "address": "Main Gate, Campus Road",
  "speed": 25,
  "direction": 45
}
```

#### Update Bus Status (Driver only)
```http
POST /api/buses/:id/status
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "status": "moving",
  "speed": 25,
  "direction": 45
}
```

### Route Endpoints

#### Get All Routes
```http
GET /api/routes
```

#### Get Route by ID
```http
GET /api/routes/:id
```

#### Create Route (Admin only)
```http
POST /api/routes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "routeNumber": "R001",
  "name": "Campus → Downtown",
  "description": "Main route from campus to downtown",
  "operatingHours": {
    "start": "06:00",
    "end": "22:00"
  },
  "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  "frequency": 15,
  "fare": 10
}
```

### Stop Endpoints

#### Get All Stops
```http
GET /api/stops
```

#### Get Stops Near Location
```http
GET /api/stops/near/:lat/:lng?radius=1
```

#### Create Stop (Admin only)
```http
POST /api/stops
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "stopId": "STOP001",
  "name": "Main Gate",
  "description": "Main entrance of the campus",
  "location": {
    "lat": 17.3850,
    "lng": 78.4867,
    "address": "Main Gate, Campus Road",
    "city": "Hyderabad",
    "state": "Telangana"
  },
  "facilities": {
    "shelter": true,
    "seating": true,
    "lighting": true,
    "security": true
  }
}
```

### Tracking Endpoints

#### Get Bus Tracking History
```http
GET /api/tracking/bus/:busId?startDate=2024-01-01&endDate=2024-01-31&limit=100
```

#### Get Latest Bus Tracking
```http
GET /api/tracking/bus/:busId/latest
```

#### Get Route Tracking
```http
GET /api/tracking/route/:routeId
```

#### Get Buses Near Location
```http
GET /api/tracking/near/:lat/:lng?radius=2
```

## 🔌 Socket.IO Events

### Client → Server Events

#### Join Bus Tracking Room
```javascript
socket.emit('join-bus-tracking', busId);
```

#### Join Route Tracking Room
```javascript
socket.emit('join-route-tracking', routeId);
```

#### Leave Bus Tracking Room
```javascript
socket.emit('leave-bus-tracking', busId);
```

#### Leave Route Tracking Room
```javascript
socket.emit('leave-route-tracking', routeId);
```

### Server → Client Events

#### Bus Location Update
```javascript
socket.on('bus-location-update', (data) => {
  console.log('Bus location updated:', data);
  // data: { busId, location: {lat, lng, address}, status, speed, timestamp }
});
```

#### Bus Status Update
```javascript
socket.on('bus-status-update', (data) => {
  console.log('Bus status updated:', data);
  // data: { busId, status, speed, direction, timestamp }
});
```

#### Route Update
```javascript
socket.on('route-update', (data) => {
  console.log('Route update:', data);
  // data: { busId, busNumber, location, status, timestamp }
});
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (student|driver|admin),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String,
    studentId: String,
    department: String,
    year: String
  },
  preferences: {
    notifications: { email, push, sms },
    favoriteRoutes: [ObjectId],
    language: String
  },
  isActive: Boolean,
  lastLogin: Date
}
```

### Bus Model
```javascript
{
  busNumber: String (unique),
  name: String,
  driver: ObjectId (ref: User),
  route: ObjectId (ref: Route),
  capacity: Number,
  currentLocation: {
    lat: Number,
    lng: Number,
    address: String,
    lastUpdated: Date
  },
  status: String (active|inactive|maintenance|breakdown),
  currentStatus: String (moving|stopped|boarding|maintenance),
  speed: Number,
  direction: Number,
  occupancy: {
    current: Number,
    max: Number
  },
  nextStop: {
    stop: ObjectId (ref: Stop),
    eta: Number,
    distance: Number
  },
  features: {
    wifi: Boolean,
    ac: Boolean,
    wheelchair: Boolean,
    charging: Boolean
  }
}
```

### Route Model
```javascript
{
  routeNumber: String (unique),
  name: String,
  description: String,
  stops: [{
    stop: ObjectId (ref: Stop),
    order: Number,
    estimatedTime: Number,
    isActive: Boolean
  }],
  totalDistance: Number,
  estimatedDuration: Number,
  operatingHours: {
    start: String,
    end: String
  },
  operatingDays: [String],
  frequency: Number,
  fare: Number,
  isActive: Boolean
}
```

### Stop Model
```javascript
{
  stopId: String (unique),
  name: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  facilities: {
    shelter: Boolean,
    seating: Boolean,
    lighting: Boolean,
    security: Boolean,
    parking: Boolean,
    restroom: Boolean,
    food: Boolean,
    atm: Boolean
  },
  nearbyLandmarks: [{
    name: String,
    distance: Number,
    type: String
  }],
  accessibility: {
    wheelchair: Boolean,
    elevator: Boolean,
    ramp: Boolean
  },
  isActive: Boolean
}
```

### Tracking Model
```javascript
{
  bus: ObjectId (ref: Bus),
  location: {
    lat: Number,
    lng: Number,
    address: String,
    accuracy: Number
  },
  status: String (moving|stopped|boarding|maintenance),
  speed: Number,
  direction: Number,
  occupancy: {
    current: Number,
    max: Number
  },
  nextStop: {
    stop: ObjectId (ref: Stop),
    eta: Number,
    distance: Number
  },
  timestamp: Date,
  deviceInfo: {
    deviceId: String,
    batteryLevel: Number,
    signalStrength: Number,
    lastSync: Date
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/campus-ride |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Bus Endpoints
```bash
# Get all buses
curl http://localhost:5000/api/buses

# Get buses near location
curl http://localhost:5000/api/buses/near/17.3850/78.4867?radius=2
```

## 🚀 Deployment

### Production Setup

1. **Set production environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-ride
   JWT_SECRET=your-production-secret-key
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name campus-ride-api
   pm2 save
   pm2 startup
   ```

3. **Set up reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **Password hashing** with bcrypt
- **JWT authentication** with expiration
- **Role-based authorization**
- **SQL injection protection** (MongoDB)
- **XSS protection**

## 📊 Monitoring & Logging

- **Morgan** for HTTP request logging
- **Error handling** middleware
- **Health check** endpoint
- **Process monitoring** with PM2
- **Database connection monitoring**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the console logs for error messages
- Verify MongoDB connection
- Ensure all environment variables are set
- Check API endpoint documentation

---

**Happy Coding! 🚌✨**
