const express = require('express');
const { body, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Tracking = require('../models/Tracking');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/buses
// @desc    Get all buses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { route, status, active } = req.query;
    const filter = {};

    if (route) filter.route = route;
    if (status) filter.status = status;
    if (active !== undefined) filter.isActive = active === 'true';

    const buses = await Bus.find(filter)
      .populate('driver', 'username profile.firstName profile.lastName')
      .populate('route', 'routeNumber name')
      .populate('nextStop.stop', 'name location')
      .sort({ busNumber: 1 });

    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching buses'
    });
  }
});

// @route   GET /api/buses/:id
// @desc    Get single bus
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('driver', 'username profile.firstName profile.lastName email')
      .populate('route', 'routeNumber name stops')
      .populate('nextStop.stop', 'name location facilities');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Get latest tracking data
    const latestTracking = await Tracking.getLatestForBus(bus._id);

    res.json({
      success: true,
      data: {
        bus,
        latestTracking
      }
    });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bus'
    });
  }
});

// @route   GET /api/buses/route/:routeId
// @desc    Get buses by route
// @access  Public
router.get('/route/:routeId', async (req, res) => {
  try {
    const buses = await Bus.find({ 
      route: req.params.routeId,
      isActive: true 
    })
      .populate('driver', 'username profile.firstName profile.lastName')
      .populate('nextStop.stop', 'name location')
      .sort({ busNumber: 1 });

    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    console.error('Get buses by route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching buses by route'
    });
  }
});

// @route   GET /api/buses/near/:lat/:lng
// @desc    Get buses near location
// @access  Public
router.get('/near/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radius = parseFloat(req.query.radius) || 2; // Default 2km radius

    const buses = await Tracking.getBusesNearLocation(
      parseFloat(lat),
      parseFloat(lng),
      radius
    );

    res.json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    console.error('Get buses near location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby buses'
    });
  }
});

// @route   POST /api/buses
// @desc    Create new bus
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('busNumber')
    .notEmpty()
    .withMessage('Bus number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Bus number must be between 1 and 20 characters'),
  body('name')
    .notEmpty()
    .withMessage('Bus name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Bus name must be between 1 and 100 characters'),
  body('driver')
    .isMongoId()
    .withMessage('Valid driver ID is required'),
  body('route')
    .isMongoId()
    .withMessage('Valid route ID is required'),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('currentLocation.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('currentLocation.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const busData = req.body;
    busData.occupancy = {
      current: 0,
      max: busData.capacity
    };

    const bus = new Bus(busData);
    await bus.save();

    const populatedBus = await Bus.findById(bus._id)
      .populate('driver', 'username profile.firstName profile.lastName')
      .populate('route', 'routeNumber name');

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: populatedBus
    });
  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bus'
    });
  }
});

// @route   PUT /api/buses/:id
// @desc    Update bus
// @access  Private (Admin/Driver)
router.put('/:id', auth, authorize('admin', 'driver'), [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Bus name must be between 1 and 100 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance', 'breakdown'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if user is driver and owns this bus
    if (req.user.role === 'driver' && bus.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bus'
      });
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('driver', 'username profile.firstName profile.lastName')
      .populate('route', 'routeNumber name');

    res.json({
      success: true,
      message: 'Bus updated successfully',
      data: updatedBus
    });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bus'
    });
  }
});

// @route   POST /api/buses/:id/location
// @desc    Update bus location
// @access  Private (Driver)
router.post('/:id/location', auth, authorize('driver'), [
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('speed')
    .optional()
    .isFloat({ min: 0, max: 120 })
    .withMessage('Speed must be between 0 and 120 km/h'),
  body('direction')
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage('Direction must be between 0 and 360 degrees')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if user is the driver of this bus
    if (bus.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bus location'
      });
    }

    const { lat, lng, address, speed, direction } = req.body;

    // Update bus location
    await bus.updateLocation(lat, lng, address);

    // Update speed and direction if provided
    if (speed !== undefined || direction !== undefined) {
      await bus.updateStatus(bus.currentStatus, speed, direction);
    }

    // Create tracking record
    const tracking = new Tracking({
      bus: bus._id,
      location: { lat, lng, address },
      status: bus.currentStatus,
      speed: speed || bus.speed,
      direction: direction || bus.direction,
      occupancy: bus.occupancy,
      nextStop: bus.nextStop
    });

    await tracking.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`bus-${bus._id}`).emit('bus-location-update', {
      busId: bus._id,
      location: { lat, lng, address },
      status: bus.currentStatus,
      speed: bus.speed,
      direction: bus.direction,
      occupancy: bus.occupancy,
      timestamp: new Date()
    });

    // Emit to route subscribers
    io.to(`route-${bus.route}`).emit('route-update', {
      busId: bus._id,
      busNumber: bus.busNumber,
      location: { lat, lng, address },
      status: bus.currentStatus,
      speed: bus.speed,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Bus location updated successfully',
      data: {
        location: { lat, lng, address },
        status: bus.currentStatus,
        speed: bus.speed,
        direction: bus.direction,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Update bus location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bus location'
    });
  }
});

// @route   POST /api/buses/:id/status
// @desc    Update bus status
// @access  Private (Driver)
router.post('/:id/status', auth, authorize('driver'), [
  body('status')
    .isIn(['moving', 'stopped', 'boarding', 'maintenance'])
    .withMessage('Invalid status'),
  body('speed')
    .optional()
    .isFloat({ min: 0, max: 120 })
    .withMessage('Speed must be between 0 and 120 km/h'),
  body('direction')
    .optional()
    .isFloat({ min: 0, max: 360 })
    .withMessage('Direction must be between 0 and 360 degrees')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if user is the driver of this bus
    if (bus.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bus status'
      });
    }

    const { status, speed, direction } = req.body;

    await bus.updateStatus(status, speed, direction);

    // Create tracking record
    const tracking = new Tracking({
      bus: bus._id,
      location: bus.currentLocation,
      status: bus.currentStatus,
      speed: bus.speed,
      direction: bus.direction,
      occupancy: bus.occupancy,
      nextStop: bus.nextStop
    });

    await tracking.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`bus-${bus._id}`).emit('bus-status-update', {
      busId: bus._id,
      status: bus.currentStatus,
      speed: bus.speed,
      direction: bus.direction,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Bus status updated successfully',
      data: {
        status: bus.currentStatus,
        speed: bus.speed,
        direction: bus.direction,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Update bus status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating bus status'
    });
  }
});

// @route   DELETE /api/buses/:id
// @desc    Delete bus
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting bus'
    });
  }
});

module.exports = router;
