const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/favorites
// @desc    Add route to favorites
// @access  Private (Student/Admin)
router.post('/', auth, authorize('student', 'admin'), [
  body('routeId')
    .notEmpty()
    .withMessage('Route ID is required')
    .isString()
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

    const { routeId } = req.body;

    // Simulated favorites management for User
    console.log(`❤️ Route ${routeId} added to favorites by user ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Route added to favorites',
      data: {
        routeId,
        userId: req.user._id,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding favorite route'
    });
  }
});

// @route   DELETE /api/favorites/:routeId
// @desc    Remove route from favorites
// @access  Private (Student/Admin)
router.delete('/:routeId', auth, authorize('student', 'admin'), async (req, res) => {
  try {
    const { routeId } = req.params;

    // Simulated favorites removal
    console.log(`💔 Route ${routeId} removed from favorites by user ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Route removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing favorite route'
    });
  }
});

module.exports = router;
