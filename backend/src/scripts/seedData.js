const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Tracking = require('../models/Tracking');

const connectDB = async () => {
  try {
    // Use default MongoDB URI if not provided in environment
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-ride';
    await mongoose.connect(mongoURI);
    console.log('📊 MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('💡 Make sure MongoDB is running on your system');
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Stop.deleteMany({});
    await Tracking.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const admin = new User({
      username: 'admin',
      email: 'admin@campusride.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+91-9876543210',
        department: 'IT',
        studentId: 'ADMIN001'
      }
    });

    const driver1 = new User({
      username: 'driver1',
      email: 'driver1@campusride.com',
      password: hashedPassword,
      role: 'driver',
      profile: {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        phone: '+91-9876543211',
        department: 'Transport',
        studentId: 'DRV001'
      }
    });

    const driver2 = new User({
      username: 'driver2',
      email: 'driver2@campusride.com',
      password: hashedPassword,
      role: 'driver',
      profile: {
        firstName: 'Suresh',
        lastName: 'Singh',
        phone: '+91-9876543212',
        department: 'Transport',
        studentId: 'DRV002'
      }
    });

    const student1 = new User({
      username: 'student1',
      email: 'student1@campusride.com',
      password: hashedPassword,
      role: 'student',
      profile: {
        firstName: 'Amit',
        lastName: 'Sharma',
        phone: '+91-9876543213',
        department: 'Computer Science',
        year: '3rd Year',
        studentId: 'STU001'
      }
    });

    await admin.save();
    await driver1.save();
    await driver2.save();
    await student1.save();

    console.log('👥 Created users');

    // Create stops
    const stops = [
      {
        stopId: 'STOP001',
        name: 'Main Gate',
        description: 'Main entrance of the campus',
        location: {
          lat: 17.3850,
          lng: 78.4867,
          address: 'Main Gate, Campus Road',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500001'
        },
        facilities: {
          shelter: true,
          seating: true,
          lighting: true,
          security: true
        }
      },
      {
        stopId: 'STOP002',
        name: 'Library',
        description: 'Central Library stop',
        location: {
          lat: 17.3900,
          lng: 78.4900,
          address: 'Central Library, Academic Block',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500001'
        },
        facilities: {
          shelter: true,
          seating: true,
          lighting: true
        }
      },
      {
        stopId: 'STOP003',
        name: 'Cafeteria',
        description: 'Student cafeteria stop',
        location: {
          lat: 17.3950,
          lng: 78.4950,
          address: 'Student Cafeteria, Food Court',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500001'
        },
        facilities: {
          shelter: true,
          seating: true,
          lighting: true,
          food: true
        }
      },
      {
        stopId: 'STOP004',
        name: 'Sports Complex',
        description: 'Sports and recreation center',
        location: {
          lat: 17.4000,
          lng: 78.5000,
          address: 'Sports Complex, Recreation Area',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500001'
        },
        facilities: {
          shelter: true,
          seating: true,
          lighting: true,
          parking: true
        }
      },
      {
        stopId: 'STOP005',
        name: 'Downtown Hub',
        description: 'Main downtown transportation hub',
        location: {
          lat: 17.4100,
          lng: 78.5100,
          address: 'Downtown Hub, City Center',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500001'
        },
        facilities: {
          shelter: true,
          seating: true,
          lighting: true,
          security: true,
          parking: true,
          restroom: true,
          food: true,
          atm: true
        }
      }
    ];

    const createdStops = await Stop.insertMany(stops);
    console.log('🚏 Created stops');

    // Create routes
    const route1 = new Route({
      routeNumber: 'R001',
      name: 'Campus → Downtown',
      description: 'Main route from campus to downtown area',
      stops: [
        { stop: createdStops[0]._id, order: 1, estimatedTime: 0 },
        { stop: createdStops[1]._id, order: 2, estimatedTime: 5 },
        { stop: createdStops[2]._id, order: 3, estimatedTime: 10 },
        { stop: createdStops[3]._id, order: 4, estimatedTime: 15 },
        { stop: createdStops[4]._id, order: 5, estimatedTime: 25 }
      ],
      totalDistance: 12.5,
      estimatedDuration: 30,
      operatingHours: {
        start: '06:00',
        end: '22:00'
      },
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      frequency: 15,
      fare: 10
    });

    const route2 = new Route({
      routeNumber: 'R002',
      name: 'Campus → Mall',
      description: 'Route from campus to shopping mall',
      stops: [
        { stop: createdStops[0]._id, order: 1, estimatedTime: 0 },
        { stop: createdStops[2]._id, order: 2, estimatedTime: 8 },
        { stop: createdStops[4]._id, order: 3, estimatedTime: 20 }
      ],
      totalDistance: 8.2,
      estimatedDuration: 25,
      operatingHours: {
        start: '07:00',
        end: '21:00'
      },
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      frequency: 20,
      fare: 8
    });

    await route1.save();
    await route2.save();
    console.log('🛣️  Created routes');

    // Create buses
    const bus1 = new Bus({
      busNumber: 'BUS001',
      name: 'Campus Express',
      driver: driver1._id,
      route: route1._id,
      capacity: 45,
      currentLocation: {
        lat: 17.3850,
        lng: 78.4867,
        address: 'Main Gate, Campus Road',
        lastUpdated: new Date()
      },
      status: 'active',
      currentStatus: 'moving',
      speed: 25,
      direction: 45,
      occupancy: {
        current: 32,
        max: 45
      },
      nextStop: {
        stop: createdStops[1]._id,
        eta: 3,
        distance: 500
      },
      schedule: {
        startTime: '06:00',
        endTime: '22:00',
        frequency: 15,
        operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      features: {
        wifi: true,
        ac: true,
        wheelchair: false,
        charging: true
      }
    });

    const bus2 = new Bus({
      busNumber: 'BUS002',
      name: 'Downtown Shuttle',
      driver: driver2._id,
      route: route1._id,
      capacity: 40,
      currentLocation: {
        lat: 17.3950,
        lng: 78.4950,
        address: 'Student Cafeteria, Food Court',
        lastUpdated: new Date()
      },
      status: 'active',
      currentStatus: 'stopped',
      speed: 0,
      occupancy: {
        current: 28,
        max: 40
      },
      nextStop: {
        stop: createdStops[3]._id,
        eta: 8,
        distance: 800
      },
      schedule: {
        startTime: '06:15',
        endTime: '22:15',
        frequency: 15,
        operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      },
      features: {
        wifi: true,
        ac: true,
        wheelchair: true,
        charging: false
      }
    });

    await bus1.save();
    await bus2.save();
    console.log('🚌 Created buses');

    // Create tracking records
    const tracking1 = new Tracking({
      bus: bus1._id,
      location: {
        lat: 17.3850,
        lng: 78.4867,
        address: 'Main Gate, Campus Road',
        accuracy: 5
      },
      status: 'moving',
      speed: 25,
      direction: 45,
      occupancy: {
        current: 32,
        max: 45
      },
      nextStop: {
        stop: createdStops[1]._id,
        eta: 3,
        distance: 500
      },
      timestamp: new Date()
    });

    const tracking2 = new Tracking({
      bus: bus2._id,
      location: {
        lat: 17.3950,
        lng: 78.4950,
        address: 'Student Cafeteria, Food Court',
        accuracy: 3
      },
      status: 'stopped',
      speed: 0,
      occupancy: {
        current: 28,
        max: 40
      },
      nextStop: {
        stop: createdStops[3]._id,
        eta: 8,
        distance: 800
      },
      timestamp: new Date()
    });

    await tracking1.save();
    await tracking2.save();
    console.log('📍 Created tracking records');

    console.log('✅ Data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👥 Users: 4 (1 admin, 2 drivers, 1 student)`);
    console.log(`🚏 Stops: ${createdStops.length}`);
    console.log(`🛣️  Routes: 2`);
    console.log(`🚌 Buses: 2`);
    console.log(`📍 Tracking records: 2`);
    console.log('\n🔑 Default login credentials:');
    console.log('Admin: admin@campusride.com / password123');
    console.log('Driver 1: driver1@campusride.com / password123');
    console.log('Driver 2: driver2@campusride.com / password123');
    console.log('Student: student1@campusride.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});
