const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// Crear una cita
router.post('/', auth, appointmentController.createAppointment);

// Obtener todas las citas del usuario actual (cliente o proveedor)
router.get('/', auth, appointmentController.getAppointments);

// Actualizar solo el estado de una cita
router.put('/:id/status', auth, appointmentController.updateAppointment);

// Actualizar cualquier campo de una cita
router.put('/:id', auth, appointmentController.updateAppointment);

// Eliminar una cita
router.delete('/:id', auth, appointmentController.deleteAppointment);

module.exports = router;
