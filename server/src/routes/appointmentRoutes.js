// Appointment routes (DT-563 / DT-564). Mounted at /api/appointments.
const express = require('express');
const {
    createAppointment,
    getAvailability,
    getMyAppointments,
    cancelAppointment,
} = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/availability', getAvailability);
router.post('/', createAppointment);

// DT-564: a signed-in user's own appointments.
router.get('/mine', requireAuth, getMyAppointments);

// DT-278: cancel one of the signed in user's appointments
router.patch('/:id/cancel', requireAuth, cancelAppointment);

module.exports = router;
