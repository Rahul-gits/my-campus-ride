@echo off
REM Campus Ride - Mapbox Setup Script for Windows
REM This script helps you set up Mapbox integration for your campus ride application

echo 🚌 Campus Ride - Mapbox Integration Setup
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
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

REM Install dependencies
echo 📦 Installing Mapbox dependencies...
npm install mapbox-gl react-map-gl @mapbox/mapbox-gl-geocoder @types/mapbox-gl

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
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
    echo ✅ .env file created
) else (
    echo ⚠️  .env file already exists
)

REM Add .env to .gitignore if not already there
if exist .gitignore (
    findstr /C:".env" .gitignore >nul 2>&1
    if %errorlevel% neq 0 (
        echo. >> .gitignore
        echo # Environment variables >> .gitignore
        echo .env >> .gitignore
        echo ✅ Added .env to .gitignore
    ) else (
        echo ✅ .env is already in .gitignore
    )
) else (
    echo .env > .gitignore
    echo ✅ Created .gitignore with .env
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Get your Mapbox access token from: https://account.mapbox.com/access-tokens/
echo 2. Replace 'your_mapbox_access_token_here' in the .env file with your actual token
echo 3. Run 'npm run dev' to start the development server
echo 4. Open your browser and navigate to the student dashboard to see the map
echo.
echo 🔧 Configuration options:
echo - Modify map center coordinates in .env file
echo - Customize map styles in MapboxMap.tsx
echo - Add your own bus data in useBusTracking.ts
echo.
echo 📚 Documentation:
echo - Integration guide: MAPBOX_INTEGRATION_GUIDE.md
echo - Mapbox docs: https://docs.mapbox.com/mapbox-gl-js/
echo - React Map GL: https://visgl.github.io/react-map-gl/
echo.
echo 🆘 Need help?
echo - Check the console for any error messages
echo - Verify your Mapbox token has the correct permissions
echo - Review the troubleshooting section in the integration guide
echo.
echo Happy mapping! 🗺️✨
pause
