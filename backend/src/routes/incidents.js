const express = require('express');
const { body, validationResult } = require('express-validator');
const Incident = require('../models/Incident');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/incidents
// @desc    Report an incident
// @access  Private (Driver/Admin)
router.post('/', auth, authorize('driver', 'admin'), [
  body('busId')
    .notEmpty()
    .withMessage('Bus ID is required')
    .isString(),
  body('type')
    .isIn(['delay', 'accident', 'breakdown', 'maintenance', 'other'])
    .withMessage('Invalid incident type'),
  body('description')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters')
    .trim(),
  body('location')
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

    const { busId, type, description, location = 'Unknown Location' } = req.body;

    const incident = new Incident({
      busId,
      type,
      description,
      location,
      reportedBy: req.user._id
    });

    await incident.save();

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: incident
    });
  } catch (error) {
    console.error('Report incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reporting incident'
    });
  }
});

// @route   POST /api/incidents/photo
// @desc    Upload incident photo metadata
// @access  Private (Driver/Admin)
router.post('/photo', auth, authorize('driver', 'admin'), [
  body('busId')
    .notEmpty()
    .withMessage('Bus ID is required')
    .isString(),
  body('type')
    .notEmpty()
    .withMessage('Photo type is required')
    .isString(),
  body('description')
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

    // Return success mock url for photo upload
    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading photo metadata'
    });
  }
});

module.exports = router;
