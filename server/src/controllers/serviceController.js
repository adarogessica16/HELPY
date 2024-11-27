const Service = require('../models/Service');

// Obtener servicios de un proveedor específico
exports.getProviderServicesById = async (req, res) => {
    try {
        const services = await Service.find({ 
            provider: req.params.providerId 
        })
        .select('images title price') // Asegúrate de que 'images' esté incluido
        .limit(2); // Limita a 2 servicios
        res.json(services); // Devuelve los servicios con las imágenes
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};


exports.getProviderServicesAllById = async (req, res) => {
    try {
        const services = await Service.find({ provider: req.params.profileId })
            .select('title description price category images') // Puedes agregar o quitar campos según lo que necesites
            .populate('provider', 'name profileImage'); // Poblamos la información del proveedor si es necesario (puedes ajustarlo a tus necesidades)

        if (services.length === 0) {
            return res.status(404).json({ message: 'No se encontraron servicios para este proveedor' });
        }

        res.json(services);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};



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

exports.createService = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        // Obtener la URL de la imagen cargada a Cloudinary
        const images = req.file ? req.file.path : '';

        const newService = new Service({
            provider: req.user.id,
            title,
            description,
            price,
            category,
            images: images  // Asigna la URL de la imagen
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

        // Obtiene el servicio existente para conservar la imagen si no se sube una nueva
        const existingService = await Service.findById(req.params.id);
        if (!existingService) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Maneja la imagen: si se sube una nueva, se reemplaza; si no, se mantiene la existente
        const images = req.file ? req.file.path : existingService.images;

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { title, description, price, category, images: images },  // Actualiza solo una imagen
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

