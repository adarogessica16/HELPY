const Appointment = require('../models/Appointment');

// Crear una cita
exports.createAppointment = async (req, res) => {
    try {
        const { serviceId, date, notes } = req.body;
        const newAppointment = new Appointment({
            service: serviceId,
            client: req.user.id,
            date,
            notes
        });

        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todas las citas para el usuario (cliente o proveedor)
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            $or: [
                { client: req.user.id },
                { 'service.provider': req.user.id }
            ]
        })
            .populate('service')
            .populate('client', 'name email');

        res.json(appointments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar una cita
exports.updateAppointment = async (req, res) => {
    try {
        const updatedData = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json(appointment);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Eliminar una cita
exports.deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        res.json({ message: 'Cita eliminada exitosamente' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};
