// DT-610: Integrate supabase databse with backend
//  Locations API routes
const express = require('express');
const { requireAdmin } = require('../middleware/authMiddleware');

const {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
} = require('../controllers/locationController');

const router = express.Router();

// Anyone can view locations
router.get('/', getLocations);

// Only administrators can modify locations
router.post('/', requireAdmin, createLocation);
router.put('/:id', requireAdmin, updateLocation);
router.delete('/:id', requireAdmin, deleteLocation);

module.exports = router;