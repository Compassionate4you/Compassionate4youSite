// Appointment routes (DT-563 / DT-564). Mounted at /api/appointments.
const express = require('express');
const {
    createAppointment,
    createAdminAppointment,
    updateAdminAppointment,
    deleteAdminAppointment,
    getAvailability,
    getMyAppointments,
    // DT-278 (721): cancel route for the Customer Portal    
    cancelAppointment,
    // DT-720: Admin Dashboard list of all appointments
    getAllAppointments,
    // DT-278 (722): reschedule route for the Customer Portal
    rescheduleAppointment,
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

// DT-278: cancel one of the signed in user's appointments
router.patch('/:id/cancel', requireAuth, cancelAppointment);

// DT-278 (722): move one of the signed in user appointments to a new date/time
router.patch('/:id/reschedule', requireAuth, rescheduleAppointment);

module.exports = router;
