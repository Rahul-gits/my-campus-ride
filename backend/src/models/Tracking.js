const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: String,
    accuracy: Number // GPS accuracy in meters
  },
  status: {
    type: String,
    enum: ['moving', 'stopped', 'boarding', 'maintenance'],
    required: true
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
  timestamp: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    deviceId: String,
    batteryLevel: Number,
    signalStrength: Number,
    lastSync: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
trackingSchema.index({ bus: 1, timestamp: -1 });
trackingSchema.index({ timestamp: -1 });
trackingSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Compound index for bus tracking queries
trackingSchema.index({ bus: 1, timestamp: -1 }, { background: true });

// Method to get latest tracking for a bus
trackingSchema.statics.getLatestForBus = function(busId) {
  return this.findOne({ bus: busId })
    .sort({ timestamp: -1 })
    .populate('bus', 'busNumber name driver route')
    .populate('nextStop.stop', 'name location');
};

// Method to get tracking history for a bus
trackingSchema.statics.getHistoryForBus = function(busId, startDate, endDate, limit = 100) {
  const query = { bus: busId };
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('bus', 'busNumber name')
    .populate('nextStop.stop', 'name');
};

// Method to get buses near a location
trackingSchema.statics.getBusesNearLocation = function(lat, lng, radiusKm = 2) {
  const radiusDegrees = radiusKm / 111; // Rough conversion
  
  return this.find({
    'location.lat': {
      $gte: lat - radiusDegrees,
      $lte: lat + radiusDegrees
    },
    'location.lng': {
      $gte: lng - radiusDegrees,
      $lte: lng + radiusDegrees
    },
    timestamp: {
      $gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    }
  })
  .sort({ timestamp: -1 })
  .populate('bus', 'busNumber name route status')
  .populate('nextStop.stop', 'name');
};

module.exports = mongoose.model('Tracking', trackingSchema);
