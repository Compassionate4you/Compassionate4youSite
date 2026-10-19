// Appointment routes (DT-563 / DT-564). Mounted at /api/appointments.
const express = require('express');
const {
    createAppointment,
    createAdminAppointment,
    updateAdminAppointment,
    deleteAdminAppointment,
    getAvailability,
    getMyAppointments,
    getAllAppointments,
} = require('../controllers/appointmentController');

const { 
    requireAuth, 
    requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/availability', getAvailability);
// Admin-only list of every appointment
router.get('/', requireAdmin, getAllAppointments);
// Admin-only appointment creation
router.post('/admin', requireAdmin, createAdminAppointment);
// Admin-only appointment update
router.patch('/:id', requireAdmin, updateAdminAppointment);
// Admin-only permanent deletion
router.delete('/:id', requireAdmin, deleteAdminAppointment);

router.post('/', createAppointment);

// DT-564: a signed-in user's own appointments.
router.get('/mine', requireAuth, getMyAppointments);

module.exports = router;
