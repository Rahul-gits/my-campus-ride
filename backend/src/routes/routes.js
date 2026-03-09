const express = require('express');
const { body, validationResult } = require('express-validator');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Bus = require('../models/Bus');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/routes
// @desc    Get all routes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};

    if (active !== undefined) filter.isActive = active === 'true';

    const routes = await Route.find(filter)
      .populate('stops.stop', 'name location')
      .sort({ routeNumber: 1 });

    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching routes'
    });
  }
});

// @route   GET /api/routes/:id
// @desc    Get single route
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stops.stop', 'name location facilities');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Get active buses on this route
    const buses = await Bus.find({ 
      route: req.params.id,
      isActive: true 
    })
      .populate('driver', 'username profile.firstName profile.lastName')
      .populate('nextStop.stop', 'name');

    res.json({
      success: true,
      data: {
        route,
        buses
      }
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching route'
    });
  }
});

// @route   POST /api/routes
// @desc    Create new route
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('routeNumber')
    .notEmpty()
    .withMessage('Route number is required'),
  body('name')
    .notEmpty()
    .withMessage('Route name is required'),
  body('operatingHours.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('operatingHours.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('operatingDays')
    .isArray({ min: 1 })
    .withMessage('At least one operating day is required')
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

    const route = new Route(req.body);
    await route.save();

    const populatedRoute = await Route.findById(route._id)
      .populate('stops.stop', 'name location');

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: populatedRoute
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating route'
    });
  }
});

// @route   PUT /api/routes/:id
// @desc    Update route
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('stops.stop', 'name location');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating route'
    });
  }
});

// @route   POST /api/routes/:id/stops
// @desc    Add stop to route
// @access  Private (Admin only)
router.post('/:id/stops', auth, authorize('admin'), [
  body('stopId')
    .isMongoId()
    .withMessage('Valid stop ID is required'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  body('estimatedTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated time must be a non-negative integer')
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

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const { stopId, order, estimatedTime = 0 } = req.body;

    await route.addStop(stopId, order, estimatedTime);

    const updatedRoute = await Route.findById(route._id)
      .populate('stops.stop', 'name location');

    res.json({
      success: true,
      message: 'Stop added to route successfully',
      data: updatedRoute
    });
  } catch (error) {
    console.error('Add stop to route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding stop to route'
    });
  }
});

// @route   DELETE /api/routes/:id
// @desc    Delete route
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if route has active buses
    const activeBuses = await Bus.countDocuments({ 
      route: req.params.id, 
      isActive: true 
    });

    if (activeBuses > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route with active buses'
      });
    }

    await Route.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting route'
    });
  }
});

module.exports = router;
