const Service = require('../models/Service');

// Crear un nuevo servicio
exports.createService = async (req, res) => {
    try {
        const { title, description, price, category, images } = req.body;
        const newService = new Service({
            provider: req.user.id,
            title,
            description,
            price,
            category,
            images
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
        const { title, description, price, category, images } = req.body;
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { title, description, price, category, images },
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        res.json(updatedService);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
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


// Obtener todos los servicios
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('provider', 'name profileImage')
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

        // Encontrar el servicio al que se va a agregar la reseña
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Crear la reseña
        const review = {
            client: req.user.id,
            comment,
            rating,
            date: new Date()
        };

        // Agregar la reseña al array de reseñas del servicio
        service.reviews.push(review);

        // Calcular el nuevo rating promedio del servicio
        const totalRatings = service.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        service.rating = totalRatings / service.reviews.length;

        // Guardar los cambios
        await service.save();

        res.json(service);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};