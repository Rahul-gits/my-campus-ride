@echo off
REM Campus Ride - Complete Setup Script for Windows
REM This script sets up both frontend and backend for the Campus Ride application

echo 🚌 Campus Ride - Complete Setup Script
echo =====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Setup Frontend
echo.
echo 📦 Setting up Frontend...
cd frontend 2>nul || (
    echo ⚠️  Frontend directory not found. Setting up from root...
    cd ..
)

REM Install frontend dependencies
echo Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Setup Mapbox environment
if not exist .env (
    echo Creating frontend .env file...
    (
        echo # Mapbox Configuration
        echo # Get your access token from https://account.mapbox.com/access-tokens/
        echo VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
        echo.
        echo # Optional: Custom Mapbox style URL ^(if using custom styles^)
        echo # VITE_MAPBOX_STYLE_URL=mapbox://styles/your-username/your-style-id
        echo.
        echo # Optional: Default center coordinates for the map
        echo # VITE_MAPBOX_DEFAULT_LAT=17.3850
        echo # VITE_MAPBOX_DEFAULT_LNG=78.4867
    ) > .env
    echo ✅ Frontend .env file created
) else (
    echo ✅ Frontend .env file already exists
)

echo ✅ Frontend setup completed

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd ..\backend

REM Install backend dependencies
echo Installing backend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Setup backend environment
if not exist .env (
    echo Creating backend .env file...
    (
        echo # Backend Environment Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # Database Configuration
        echo MONGODB_URI=mongodb://localhost:27017/campus-ride
        echo # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/campus-ride
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRE=7d
        echo.
        echo # Mapbox Configuration ^(for backend API calls^)
        echo MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # Security Configuration
        echo BCRYPT_ROUNDS=12
        echo SESSION_SECRET=your-session-secret-key
    ) > .env
    echo ✅ Backend .env file created
) else (
    echo ✅ Backend .env file already exists
)

echo ✅ Backend setup completed

REM Check for MongoDB
echo.
echo 🗄️  Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is installed
    echo 💡 Make sure MongoDB is running: mongod
) else (
    echo ⚠️  MongoDB not found. Please install MongoDB:
    echo    - Download from: https://www.mongodb.com/try/download/community
    echo    - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
    echo.
    echo 💡 If using MongoDB Atlas, update MONGODB_URI in backend/.env
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Get your Mapbox access token from: https://account.mapbox.com/access-tokens/
echo 2. Update both .env files with your Mapbox token
echo 3. Start MongoDB (if using local installation)
echo 4. Seed the database: cd backend ^&^& npm run seed
echo 5. Start the backend: cd backend ^&^& npm run dev
echo 6. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo 🔧 Configuration:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - Health Check: http://localhost:5000/health
echo.
echo 🔑 Default login credentials (after seeding):
echo - Admin: admin@campusride.com / password123
echo - Driver 1: driver1@campusride.com / password123
echo - Driver 2: driver2@campusride.com / password123
echo - Student: student1@campusride.com / password123
echo.
echo 📚 Documentation:
echo - Frontend: MAPBOX_INTEGRATION_GUIDE.md
echo - Backend: backend/README.md
echo.
echo 🆘 Need help?
echo - Check the console for any error messages
echo - Verify MongoDB is running
echo - Ensure Mapbox token is configured
echo - Review the documentation files
echo.
echo Happy coding! 🗺️✨
pause
