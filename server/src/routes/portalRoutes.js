// DT-846: Customer Portal routes
const express = require('express');
const { getProfile, updateProfile } = require('../controllers/portalController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router(); 

// Every portal route needs a signed-in user
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;