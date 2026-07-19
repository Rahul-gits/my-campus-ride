const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/ratings
// @desc    Submit rating and feedback for completed ride
// @access  Private (Student/Admin)
router.post('/', auth, authorize('student', 'admin'), [
  body('rideId')
    .notEmpty()
    .withMessage('Ride ID is required'),
  body('rating')
    .isInt({ min: 1, max: 500 }) // allow custom id or number
    .withMessage('Rating must be an integer')
    .custom((val) => {
      // If rating is within 1 to 5
      const num = parseInt(val);
      if (num < 1 || num > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      return true;
    }),
  body('comment')
    .optional()
    .isString()
    .trim()
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

    const { rideId, rating, comment = '' } = req.body;

    // Simulate database rating insert
    console.log(`⭐ Ride Rating: Ride ${rideId} rated ${rating}/5 by Student ${req.user.username}. Comment: "${comment}"`);

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rideId,
        rating,
        comment,
        submittedBy: req.user._id,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting rating'
    });
  }
});

module.exports = router;
