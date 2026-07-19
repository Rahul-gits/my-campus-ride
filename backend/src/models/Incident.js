const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['delay', 'accident', 'breakdown', 'maintenance', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  location: {
    type: String,
    trim: true,
    default: 'Unknown Location'
  },
  photoUrl: {
    type: String,
    trim: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

incidentSchema.index({ busId: 1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ resolved: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
