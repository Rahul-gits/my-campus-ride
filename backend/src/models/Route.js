const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
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
  stops: [{
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    estimatedTime: {
      type: Number, // minutes from start
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  totalDistance: {
    type: Number, // kilometers
    default: 0
  },
  estimatedDuration: {
    type: Number, // minutes
    default: 0
  },
  operatingHours: {
    start: {
      type: String, // HH:MM format
      required: true
    },
    end: {
      type: String, // HH:MM format
      required: true
    }
  },
  operatingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  }],
  frequency: {
    type: Number, // minutes between buses
    default: 15
  },
  fare: {
    type: Number,
    default: 0
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
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ isActive: 1 });
routeSchema.index({ 'stops.stop': 1 });

// Virtual for route path
routeSchema.virtual('path').get(function() {
  return this.stops
    .filter(stop => stop.isActive)
    .sort((a, b) => a.order - b.order)
    .map(stop => stop.stop);
});

// Method to add stop to route
routeSchema.methods.addStop = function(stopId, order, estimatedTime = 0) {
  const existingStop = this.stops.find(s => s.stop.toString() === stopId.toString());
  if (existingStop) {
    throw new Error('Stop already exists in this route');
  }
  
  this.stops.push({
    stop: stopId,
    order: order,
    estimatedTime: estimatedTime,
    isActive: true
  });
  
  // Sort stops by order
  this.stops.sort((a, b) => a.order - b.order);
  
  return this.save();
};

// Method to remove stop from route
routeSchema.methods.removeStop = function(stopId) {
  this.stops = this.stops.filter(s => s.stop.toString() !== stopId.toString());
  return this.save();
};

module.exports = mongoose.model('Route', routeSchema);
