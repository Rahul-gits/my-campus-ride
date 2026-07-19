const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  busId: {
    type: String,
    required: true,
    trim: true
  },
  routeId: {
    type: String,
    required: true,
    trim: true
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  passengerCount: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

bookingSchema.index({ student: 1 });
bookingSchema.index({ busId: 1 });
bookingSchema.index({ routeId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
