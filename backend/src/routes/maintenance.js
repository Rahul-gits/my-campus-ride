const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/maintenance/schedule
// @desc    Schedule maintenance for a bus
// @access  Private (Admin only)
router.post('/schedule', auth, authorize('admin'), [
  body('busId')
    .notEmpty()
    .withMessage('Bus ID is required')
    .isString(),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date (ISO8601 format) is required')
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

    const { busId, scheduledDate = new Date().toISOString() } = req.body;

    console.log(`🔧 Maintenance Scheduled: Bus ${busId} scheduled for maintenance on ${scheduledDate} by admin ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Maintenance scheduled successfully',
      data: {
        busId,
        scheduledDate,
        scheduledBy: req.user._id,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Schedule maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling maintenance'
    });
  }
});

module.exports = router;
