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
        .populate({
            path: 'service',
            select: 'title price provider',
            populate: {
                path: 'provider',
                select: 'name profileImage'
            }
        });

        // Formatea la respuesta de manera consistente
        const formattedAppointments = appointments.map(appointment => ({
            _id: appointment._id,
            date: appointment.date,
            status: appointment.status,
            notes: appointment.notes,
            client: appointment.client,
            service: appointment.service ? {
                _id: appointment.service._id,
                title: appointment.service.title || 'Servicio no disponible',
                price: appointment.service.price || 0,
                provider: appointment.service.provider ? {
                    _id: appointment.service.provider._id,
                    name: appointment.service.provider.name || 'Proveedor no disponible',
                    profileImage: appointment.service.provider.profileImage || null
                } : {
                    _id: null,
                    name: 'Proveedor no disponible',
                    profileImage: null
                }
            } : {
                _id: null,
                title: 'Servicio no disponible',
                price: 0,
                provider: {
                    _id: null,
                    name: 'Proveedor no disponible',
                    profileImage: null
                }
            }
        }));

        res.json(formattedAppointments);
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
        const userServices = await Service.find({ provider: req.user.id });
        const serviceIds = userServices.map(service => service._id);

        const appointments = await Appointment.find({
            status: 'confirmed',
            $or: [
                { client: req.user.id },
                { service: { $in: serviceIds } }
            ]
        })
        .populate('client', 'name email')
        .populate({
            path: 'service',
            select: 'title price provider',
            populate: {
                path: 'provider',
                select: 'name profileImage'
            }
        });

        // Formatea la respuesta de manera consistente
        const formattedAppointments = appointments.map(appointment => ({
            _id: appointment._id,
            date: appointment.date,
            status: appointment.status,
            notes: appointment.notes,
            client: appointment.client,
            service: appointment.service ? {
                _id: appointment.service._id,
                title: appointment.service.title || 'Servicio no disponible',
                price: appointment.service.price || 0,
                provider: appointment.service.provider ? {
                    _id: appointment.service.provider._id,
                    name: appointment.service.provider.name || 'Proveedor no disponible',
                    profileImage: appointment.service.provider.profileImage || null
                } : {
                    _id: null,
                    name: 'Proveedor no disponible',
                    profileImage: null
                }
            } : {
                _id: null,
                title: 'Servicio no disponible',
                price: 0,
                provider: {
                    _id: null,
                    name: 'Proveedor no disponible',
                    profileImage: null
                }
            }
        }));

        res.json(formattedAppointments);
    } catch (error) {
        console.error("Error al obtener citas confirmadas:", error);
        res.status(500).send("Error del servidor");
    }
};

// Obtener todos los agendamientos del cliente
exports.getClientAppointments = async (req, res) => {
    try {
        // Filtra las citas donde el cliente sea el usuario autenticado
        const appointments = await Appointment.find({ client: req.user.id })
            .populate({
                path: 'service',
                select: 'title price provider',
                populate: {
                    path: 'provider',
                    select: 'name profileImage'
                }
            })
            .sort({ date: 1 }); // Ordena por fecha (ascendente)

        if (appointments.length === 0) {
            return res.status(404).json({ 
                message: 'No se encontraron agendamientos realizados por este cliente.' 
            });
        }

        // Transforma la respuesta para incluir el nombre del proveedor de forma más accesible
        const formattedAppointments = appointments.map(appointment => {
            // Objeto base del appointment con verificación de null
            const formattedAppointment = {
                _id: appointment._id,
                date: appointment.date,
                status: appointment.status,
                notes: appointment.notes
            };

            // Añade la información del servicio solo si existe
            if (appointment.service) {
                formattedAppointment.service = {
                    _id: appointment.service._id,
                    title: appointment.service.title || 'Servicio no disponible',
                    price: appointment.service.price || 0,
                    provider: appointment.service.provider ? {
                        _id: appointment.service.provider._id,
                        name: appointment.service.provider.name || 'Proveedor no disponible',
                        profileImage: appointment.service.provider.profileImage || null
                    } : {
                        _id: null,
                        name: 'Proveedor no disponible',
                        profileImage: null
                    }
                };
            } else {
                formattedAppointment.service = {
                    _id: null,
                    title: 'Servicio no disponible',
                    price: 0,
                    provider: {
                        _id: null,
                        name: 'Proveedor no disponible',
                        profileImage: null
                    }
                };
            }

            return formattedAppointment;
        });

        res.json(formattedAppointments);
    } catch (error) {
        console.error('Error al obtener agendamientos del cliente:', error);
        res.status(500).send('Error del servidor');
    }
}; 
