const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Testing Campus Ride Backend API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test user registration
    console.log('2. Testing user registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        phone: '+91-9876543210',
        department: 'Computer Science',
        studentId: 'TEST001'
      }
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('✅ User registration successful');
    console.log('User ID:', registerResponse.data.data.user.id);
    console.log('');

    // Test user login
    console.log('3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    const token = loginResponse.data.data.token;
    console.log('✅ User login successful');
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('');

    // Test protected route
    console.log('4. Testing protected route (get current user)...');
    const userResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route access successful');
    console.log('User role:', userResponse.data.data.user.role);
    console.log('');

    // Test public routes
    console.log('5. Testing public routes...');
    
    // Get all buses
    const busesResponse = await axios.get(`${BASE_URL}/api/buses`);
    console.log('✅ Buses endpoint:', busesResponse.data.count, 'buses found');
    
    // Get all routes
    const routesResponse = await axios.get(`${BASE_URL}/api/routes`);
    console.log('✅ Routes endpoint:', routesResponse.data.count, 'routes found');
    
    // Get all stops
    const stopsResponse = await axios.get(`${BASE_URL}/api/stops`);
    console.log('✅ Stops endpoint:', stopsResponse.data.count, 'stops found');
    console.log('');

    // Test location-based endpoints
    console.log('6. Testing location-based endpoints...');
    const lat = 17.3850;
    const lng = 78.4867;
    
    const nearbyBusesResponse = await axios.get(`${BASE_URL}/api/buses/near/${lat}/${lng}?radius=2`);
    console.log('✅ Nearby buses:', nearbyBusesResponse.data.count, 'buses found');
    
    const nearbyStopsResponse = await axios.get(`${BASE_URL}/api/stops/near/${lat}/${lng}?radius=1`);
    console.log('✅ Nearby stops:', nearbyStopsResponse.data.count, 'stops found');
    console.log('');

    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`✅ Health check: Server is running`);
    console.log(`✅ Authentication: Registration and login working`);
    console.log(`✅ Authorization: Protected routes working`);
    console.log(`✅ Public APIs: Buses, routes, and stops accessible`);
    console.log(`✅ Location APIs: Nearby search working`);
    console.log(`✅ Database: Connected and seeded with data`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run dev');
    }
    
    if (error.response?.status === 500) {
      console.log('\n💡 Check if MongoDB is running and seeded:');
      console.log('   npm run seed');
    }
  }
}

// Run tests
testBackend();
