// Appointment routes (DT-563 / DT-564). Mounted at /api/appointments.
const express = require('express');
const {
    createAppointment,
    getAvailability,
    getMyAppointments,
} = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/availability', getAvailability);
router.post('/', createAppointment);

// DT-564: a signed-in user's own appointments.
router.get('/mine', requireAuth, getMyAppointments);

module.exports = router;
