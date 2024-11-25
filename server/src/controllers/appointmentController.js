const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
// Crear una cita
exports.createAppointment = async (req, res) => {
    try {
        const { serviceId, date, notes } = req.body;

        if (!serviceId || !date) {
            return res.status(400).send('Faltan datos necesarios');
        }

        // Verifica que el servicio exista
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).send('Servicio no encontrado');
        }

        // Crea la cita
        const newAppointment = new Appointment({
            service: serviceId,
            client: req.user.id,
            date,
            notes,
        });

        const appointment = await newAppointment.save();
        res.json(appointment);
    } catch (error) {
        console.error("Error al crear cita:", error);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todas las citas para el usuario (cliente o proveedor)
exports.getAppointments = async (req, res) => {
    try {
        // Primero, encontrar los servicios del usuario
        const userServices = await Service.find({ provider: req.user.id });
        const serviceIds = userServices.map(service => service._id);

        const appointments = await Appointment.find({
            $or: [
                { client: req.user.id },  // Citas donde el usuario es cliente
                { service: { $in: serviceIds } }  // Citas de servicios del usuario
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

exports.getPendingAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ 
            status: 'pending',
            $or: [
                { client: req.user.id },
                { service: { $in: await Service.find({ provider: req.user.id }).distinct('_id') } }
            ]
        })
        .populate('client', 'name email')
        .populate('service', 'title provider');

        res.json(appointments);
    } catch (error) {
        console.error("Error al obtener citas pendientes:", error);
        res.status(500).send("Error del servidor");
    }
};

exports.confirmAppointment = async (req, res) => {
    try {
        // Verificar que el usuario tenga permiso para confirmar
        const appointment = await Appointment.findById(req.params.id)
            .populate('service');

        if (!appointment) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        // Solo el proveedor del servicio puede confirmar
        if (appointment.service.provider.toString() !== req.user.id) {
            return res.status(403).json({ message: "No tienes permiso para confirmar esta cita" });
        }

        appointment.status = 'confirmed';
        await appointment.save();

        res.json({ message: 'Cita confirmada', appointment });
    } catch (error) {
        console.error("Error al confirmar cita:", error);
        res.status(500).send("Error del servidor");
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

exports.getConfirmedAppointments = async (req, res) => {
    try {
        // Primero, encontrar los servicios del usuario
        const userServices = await Service.find({ provider: req.user.id });
        const serviceIds = userServices.map(service => service._id);

        const appointments = await Appointment.find({
            status: 'confirmed',
            $or: [
                { client: req.user.id },  // Citas confirmadas donde el usuario es cliente
                { service: { $in: serviceIds } }  // Citas confirmadas de servicios del usuario
            ]
        })
        .populate('client', 'name email')
        .populate('service', 'title provider');

        res.json(appointments);
    } catch (error) {
        console.error("Error al obtener citas confirmadas:", error);
        res.status(500).send("Error del servidor");
    }
};