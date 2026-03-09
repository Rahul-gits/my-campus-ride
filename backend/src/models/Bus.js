const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  currentLocation: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'breakdown'],
    default: 'active'
  },
  currentStatus: {
    type: String,
    enum: ['moving', 'stopped', 'boarding', 'maintenance'],
    default: 'stopped'
  },
  speed: {
    type: Number,
    default: 0,
    min: 0,
    max: 120
  },
  direction: {
    type: Number,
    min: 0,
    max: 360
  },
  occupancy: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    max: {
      type: Number,
      required: true
    }
  },
  nextStop: {
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop'
    },
    eta: {
      type: Number, // minutes
      default: 0
    },
    distance: {
      type: Number, // meters
      default: 0
    }
  },
  schedule: {
    startTime: String,
    endTime: String,
    frequency: Number, // minutes between trips
    operatingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  features: {
    wifi: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    wheelchair: { type: Boolean, default: false },
    charging: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
busSchema.index({ busNumber: 1 });
busSchema.index({ route: 1 });
busSchema.index({ status: 1 });
busSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });

// Virtual for occupancy percentage
busSchema.virtual('occupancyPercentage').get(function() {
  return Math.round((this.occupancy.current / this.occupancy.max) * 100);
});

// Method to update location
busSchema.methods.updateLocation = function(lat, lng, address) {
  this.currentLocation.lat = lat;
  this.currentLocation.lng = lng;
  this.currentLocation.address = address;
  this.currentLocation.lastUpdated = new Date();
  return this.save();
};

// Method to update status
busSchema.methods.updateStatus = function(status, speed = 0, direction = null) {
  this.currentStatus = status;
  this.speed = speed;
  if (direction !== null) {
    this.direction = direction;
  }
  return this.save();
};

module.exports = mongoose.model('Bus', busSchema);
