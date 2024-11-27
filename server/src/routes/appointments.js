const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// Crear una cita
router.post('/', auth, appointmentController.createAppointment);

// Obtener citas pendientes solo para usuarios autenticados
router.get('/pending', auth, appointmentController.getPendingAppointments);

// Actualizar solo el estado de una cita
router.put('/:id/status', auth, appointmentController.updateAppointment);

// Actualizar cualquier campo de una cita
router.put('/:id', auth, appointmentController.updateAppointment);

// Eliminar una cita
router.delete('/:id', auth, appointmentController.deleteAppointment);

// Confirmar cita (posiblemente solo para proveedores)
router.patch('/confirm/:id', auth, appointmentController.confirmAppointment);

// Obtener citas confirmadas
router.get('/confirmed', auth, appointmentController.getConfirmedAppointments);

// Obtener todas las citas del cliente
router.get('/all', auth, appointmentController.getClientAppointments); 

module.exports = router;