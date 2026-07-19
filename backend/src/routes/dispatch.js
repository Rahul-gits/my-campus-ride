const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/dispatch/contact
// @desc    Contact dispatch control center
// @access  Private (Driver/Admin)
router.post('/contact', auth, authorize('driver', 'admin'), [
  body('reason')
    .notEmpty()
    .withMessage('Contact reason is required')
    .isString(),
  body('message')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
    .trim(),
  body('busId')
    .optional()
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

    const { reason, message, busId = '' } = req.body;

    // Simulate sending dispatch alert/logging it
    console.log(`📡 Dispatch Contacted: User ${req.user.username} (Role: ${req.user.role}) contacted dispatch for reason: "${reason}". Message: "${message}"`);

    res.status(200).json({
      success: true,
      message: 'Dispatch contacted successfully',
      data: {
        reason,
        message,
        busId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Dispatch contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while contacting dispatch'
    });
  }
});

module.exports = router;
