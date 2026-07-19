const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Book a bus ride
// @access  Private (Student/Admin)
router.post('/', auth, authorize('student', 'admin'), [
  body('busId')
    .notEmpty()
    .withMessage('Bus ID is required')
    .isString(),
  body('routeId')
    .notEmpty()
    .withMessage('Route ID is required')
    .isString(),
  body('passengerCount')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Passenger count must be between 1 and 10')
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

    const { busId, routeId, passengerCount = 1 } = req.body;

    const booking = new Booking({
      student: req.user._id,
      busId,
      routeId,
      passengerCount
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Bus ride booked successfully',
      data: booking
    });
  } catch (error) {
    console.error('Book ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking ride'
    });
  }
});

module.exports = router;
