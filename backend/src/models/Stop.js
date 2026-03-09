const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopId: {
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
  description: {
    type: String,
    trim: true
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
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    postalCode: String
  },
  facilities: {
    shelter: { type: Boolean, default: false },
    seating: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    restroom: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    atm: { type: Boolean, default: false }
  },
  nearbyLandmarks: [{
    name: String,
    distance: Number, // meters
    type: {
      type: String,
      enum: ['hospital', 'school', 'mall', 'station', 'airport', 'other']
    }
  }],
  operatingHours: {
    start: String, // HH:MM format
    end: String,   // HH:MM format
    is24Hours: { type: Boolean, default: false }
  },
  accessibility: {
    wheelchair: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    ramp: { type: Boolean, default: false }
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
stopSchema.index({ stopId: 1 });
stopSchema.index({ name: 1 });
stopSchema.index({ 'location.lat': 1, 'location.lng': 1 });
stopSchema.index({ isActive: 1 });

// Virtual for full address
stopSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.location.address,
    this.location.city,
    this.location.state,
    this.location.postalCode,
    this.location.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Method to calculate distance to another stop
stopSchema.methods.distanceTo = function(otherStop) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (otherStop.location.lat - this.location.lat) * Math.PI / 180;
  const dLng = (otherStop.location.lng - this.location.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.location.lat * Math.PI / 180) * Math.cos(otherStop.location.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to find nearby stops
stopSchema.statics.findNearby = function(lat, lng, radiusKm = 1) {
  return this.find({
    'location.lat': {
      $gte: lat - (radiusKm / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: lat + (radiusKm / 111)
    },
    'location.lng': {
      $gte: lng - (radiusKm / (111 * Math.cos(lat * Math.PI / 180))),
      $lte: lng + (radiusKm / (111 * Math.cos(lat * Math.PI / 180)))
    },
    isActive: true
  });
};

module.exports = mongoose.model('Stop', stopSchema);
