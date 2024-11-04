const Service = require('../models/Service');

// Obtener servicios del proveedor autenticado
exports.getProviderServices = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.user.id });
        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Crear un nuevo servicio
exports.createService = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;
        const images = req.files ? req.files.map(file => file.path) : []; // Maneja múltiples imágenes

        const newService = new Service({
            provider: req.user.id,
            title,
            description,
            price,
            category,
            images // Asigna las imágenes a la propiedad `images`
        });

        const service = await newService.save();
        res.json(service);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener un servicio por ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('provider', 'name profileImage description')
            .populate('reviews.client', 'name profileImage');

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json(service);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar un servicio por ID
exports.updateService = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        // Obtiene el servicio existente para conservar las imágenes si no se suben nuevas
        const existingService = await Service.findById(req.params.id);
        if (!existingService) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Maneja múltiples imágenes: si se suben nuevas, se reemplazan; si no, se mantienen las existentes
        const images = req.files ? req.files.map(file => file.path) : existingService.images;

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { title, description, price, category, images }, // Actualiza también las imágenes
            { new: true }
        );

        res.json(updatedService);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
};

// Eliminar un servicio por ID
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todos los servicios con nombre del proveedor incluido
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('provider', 'name profileImage') // Incluye el nombre e imagen del proveedor
            .sort({ rating: -1 });

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Filtrar servicios por categoría
exports.getServicesByCategory = async (req, res) => {
    try {
        const services = await Service.find({ category: req.params.category })
            .populate('provider', 'name profileImage')
            .sort({ rating: -1 });

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Filtrar servicios por rango de precios
exports.getServicesByPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.query;
        let priceFilter = {};
        if (minPrice) priceFilter.$gte = minPrice;
        if (maxPrice) priceFilter.$lte = maxPrice;

        const services = await Service.find({ price: priceFilter })
            .populate('provider', 'name profileImage')
            .sort({ rating: -1 });

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Filtrar servicios por valoración mínima
exports.getServicesByRating = async (req, res) => {
    try {
        const services = await Service.find({ rating: { $gte: req.params.rating } })
            .populate('provider', 'name profileImage')
            .sort({ rating: -1 });

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Filtrar servicios por palabra clave
exports.getServicesByKeyword = async (req, res) => {
    try {
        const keyword = req.params.keyword;
        const services = await Service.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
            .populate('provider', 'name profileImage')
            .sort({ rating: -1 });

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Filtrar servicios por disponibilidad
exports.getServicesByAvailability = async (req, res) => {
    try {
        const available = req.params.available === 'true';
        const services = await Service.find({ available })
            .populate('provider', 'name profileImage')
            .sort({ rating: -1 });

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Agregar una reseña a un servicio
exports.addReview = async (req, res) => {
    try {
        const { comment, rating } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        const review = {
            client: req.user.id,
            comment,
            rating,
            date: new Date()
        };

        service.reviews.push(review);
        const totalRatings = service.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        service.rating = totalRatings / service.reviews.length;

        await service.save();
        res.json(service);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};
