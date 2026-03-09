const express = require('express');
const { body, validationResult } = require('express-validator');
const Stop = require('../models/Stop');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stops
// @desc    Get all stops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active, city } = req.query;
    const filter = {};

    if (active !== undefined) filter.isActive = active === 'true';
    if (city) filter['location.city'] = new RegExp(city, 'i');

    const stops = await Stop.find(filter)
      .sort({ name: 1 });

    res.json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    console.error('Get stops error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stops'
    });
  }
});

// @route   GET /api/stops/near/:lat/:lng
// @desc    Get stops near location
// @access  Public
router.get('/near/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radius = parseFloat(req.query.radius) || 1; // Default 1km radius

    const stops = await Stop.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius
    );

    res.json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    console.error('Get stops near location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby stops'
    });
  }
});

// @route   GET /api/stops/:id
// @desc    Get single stop
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    console.error('Get stop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stop'
    });
  }
});

// @route   POST /api/stops
// @desc    Create new stop
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('stopId')
    .notEmpty()
    .withMessage('Stop ID is required'),
  body('name')
    .notEmpty()
    .withMessage('Stop name is required'),
  body('location.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('location.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  body('location.address')
    .notEmpty()
    .withMessage('Address is required')
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

    const stop = new Stop(req.body);
    await stop.save();

    res.status(201).json({
      success: true,
      message: 'Stop created successfully',
      data: stop
    });
  } catch (error) {
    console.error('Create stop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating stop'
    });
  }
});

// @route   PUT /api/stops/:id
// @desc    Update stop
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    res.json({
      success: true,
      message: 'Stop updated successfully',
      data: stop
    });
  } catch (error) {
    console.error('Update stop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stop'
    });
  }
});

// @route   DELETE /api/stops/:id
// @desc    Delete stop
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    await Stop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Stop deleted successfully'
    });
  } catch (error) {
    console.error('Delete stop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting stop'
    });
  }
});

module.exports = router;
