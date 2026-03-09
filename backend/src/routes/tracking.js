const express = require('express');
const Tracking = require('../models/Tracking');
const Bus = require('../models/Bus');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tracking/bus/:busId
// @desc    Get tracking history for a bus
// @access  Public
router.get('/bus/:busId', async (req, res) => {
  try {
    const { busId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    const tracking = await Tracking.getHistoryForBus(busId, start, end, parseInt(limit));

    res.json({
      success: true,
      count: tracking.length,
      data: tracking
    });
  } catch (error) {
    console.error('Get tracking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tracking history'
    });
  }
});

// @route   GET /api/tracking/bus/:busId/latest
// @desc    Get latest tracking for a bus
// @access  Public
router.get('/bus/:busId/latest', async (req, res) => {
  try {
    const { busId } = req.params;

    const tracking = await Tracking.getLatestForBus(busId);

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'No tracking data found for this bus'
      });
    }

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('Get latest tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching latest tracking'
    });
  }
});

// @route   GET /api/tracking/near/:lat/:lng
// @desc    Get buses near location
// @access  Public
router.get('/near/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const radius = parseFloat(req.query.radius) || 2;

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

// @route   GET /api/tracking/route/:routeId
// @desc    Get all buses tracking for a route
// @access  Public
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;

    // Get all buses for this route
    const buses = await Bus.find({ 
      route: routeId,
      isActive: true 
    });

    const busIds = buses.map(bus => bus._id);

    // Get latest tracking for all buses
    const trackingPromises = busIds.map(busId => 
      Tracking.getLatestForBus(busId)
    );

    const trackingData = await Promise.all(trackingPromises);

    // Filter out null results and populate data
    const activeTracking = trackingData
      .filter(tracking => tracking !== null)
      .map(tracking => ({
        bus: tracking.bus,
        location: tracking.location,
        status: tracking.status,
        speed: tracking.speed,
        direction: tracking.direction,
        occupancy: tracking.occupancy,
        nextStop: tracking.nextStop,
        timestamp: tracking.timestamp
      }));

    res.json({
      success: true,
      count: activeTracking.length,
      data: activeTracking
    });
  } catch (error) {
    console.error('Get route tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching route tracking'
    });
  }
});

// @route   POST /api/tracking/simulate
// @desc    Simulate bus movement (for testing)
// @access  Private (Admin only)
router.post('/simulate', auth, async (req, res) => {
  try {
    const { busId, lat, lng, status = 'moving', speed = 25 } = req.body;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Update bus location
    await bus.updateLocation(lat, lng);
    await bus.updateStatus(status, speed);

    // Create tracking record
    const tracking = new Tracking({
      bus: bus._id,
      location: { lat, lng },
      status: bus.currentStatus,
      speed: bus.speed,
      occupancy: bus.occupancy,
      nextStop: bus.nextStop
    });

    await tracking.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`bus-${bus._id}`).emit('bus-location-update', {
      busId: bus._id,
      location: { lat, lng },
      status: bus.currentStatus,
      speed: bus.speed,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Tracking simulation successful',
      data: {
        busId: bus._id,
        location: { lat, lng },
        status: bus.currentStatus,
        speed: bus.speed,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Tracking simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during tracking simulation'
    });
  }
});

module.exports = router;
