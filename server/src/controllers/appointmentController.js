const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
// Crear una cita
exports.createAppointment = async (req, res) => {
    try {
        const { serviceId, date, notes } = req.body;

        if (!serviceId || !date) {
            return res.status(400).send('Faltan datos necesarios');
        }

        // Aquí se asegura que el serviceId esté disponible
        const service = await Service.findById(serviceId); // Verifica si el servicio existe
        if (!service) {
            return res.status(404).send('Servicio no encontrado');
        }

        const newAppointment = new Appointment({
            service: serviceId, // Este es el ID que estás pasando desde el frontend
            client: req.user.id,
            date,
            notes,
        });

        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (error) {
        console.error(error.message);  // Verifica los logs aquí
        res.status(500).send('Error del servidor');
    }
};

exports.getPendingAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ status: 'pending' }).populate('client service');
        res.json(appointments);
    } catch (error) {
        console.error("Error al obtener citas pendientes:", error);
        res.status(500).send("Error del servidor");
    }
};

exports.confirmAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed' },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ message: "Cita no encontrada" });
        res.json({ message: 'Cita confirmada', appointment });
    } catch (error) {
        console.error("Error al confirmar cita:", error);
        res.status(500).send("Error del servidor");
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