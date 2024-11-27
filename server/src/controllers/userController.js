const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Verificar si el usuario ya existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }
        // Crear nuevo usuario
        user = new User({
            name,
            email,
            password,
            role
        });
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        // Crear y devolver JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                // Incluir role en la respuesta
                res.json({ token, role: user.role });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Verificar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        // Crear y devolver JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                // Incluir role en la respuesta
                res.json({ token, role: user.role });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar perfil del proveedor
exports.updateProfile = async (req, res) => {
    try {
        const { description, tags } = req.body;
        const logo = req.file ? req.file.path : undefined;

        // Encontrar el usuario por su ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar los campos del usuario, sin tocar la calificación
        user.description = description || user.description;
        user.tags = tags ? tags.split(",") : user.tags;
        if (logo) {
            user.logo = logo;
        }

        // Guardar los cambios en el perfil
        await user.save();

        // Responder con el perfil actualizado, incluyendo la calificación
        res.json({
            message: "Perfil actualizado correctamente",
            profile: {
                name: user.name,
                description: user.description,
                tags: user.tags,
                logo: user.logo,
                rating: user.rating, // No modificar la calificación
            },
        });
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).send("Error del servidor");
    }
};



// Filtrar proveedores por tags
exports.filterProvidersByTags = async (req, res) => {
    try {
        const { tags } = req.query;

        // Verifica que el valor de tags sea suficientemente largo (o que al menos se ingrese algo)
        if (!tags || tags.length < 3) {
            return res.status(400).json({ message: 'Por favor, proporciona al menos 3 caracteres para filtrar los tags.' });
        }

        // Crear expresión regular para búsqueda insensible a mayúsculas/minúsculas
        const regex = new RegExp(tags, 'i');

        // Buscar proveedores con los tags correspondientes
        const providers = await User.find({
            role: 'proveedor',
            tags: { $regex: regex },
        }).select('-password');  // Excluyendo el campo password

        if (providers.length === 0) {
            return res.status(404).json({ message: 'No se encontraron proveedores con esos tags.' });
        }

        res.json(providers);
    } catch (error) {
        console.error('Error al filtrar proveedores:', error);
        res.status(500).send('Error del servidor');
    }
};

exports.getRandomTagsAndProviders = async (req, res) => {
    try {
        const { tag } = req.query;

        // Si se pasa un tag, filtrar los proveedores por ese tag
        if (tag) {
            const providers = await User.find({
                role: 'proveedor',
                tags: tag,
            }).select('-password'); // Excluir el campo password
            return res.json({ tag, providers });
        }

        // Obtener todos los tags únicos de la base de datos
        const allTags = await User.distinct('tags', { role: 'proveedor' });

        if (!allTags || allTags.length === 0) {
            return res.status(404).json({ message: 'No hay tags disponibles.' });
        }

        // Seleccionar 6 tags aleatorios
        const randomTags = allTags.sort(() => 0.5 - Math.random()).slice(0, 6);

        res.json({ randomTags });
    } catch (error) {
        console.error('Error al obtener tags y proveedores:', error);
        res.status(500).send('Error del servidor');
    }
};

exports.getAllProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: 'proveedor' }); // Filtra solo los proveedores
        res.json(providers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

exports.getProfileById = async (req, res) => {
    try {
      const { profileId } = req.params; // Obtener el profileId de los parámetros de la URL
  
      const profile = await User.findById(profileId); // Buscar el perfil por el ID
      if (!profile) {
        return res.status(404).json({ message: 'Perfil no encontrado' });
      }
  
      res.json(profile); // Devolver el perfil encontrado
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el perfil' });
    }
  };

  exports.rateProvider = async (req, res) => {
    try {
        const { rating } = req.body;
        const provider = await User.findById(req.params.id); // Buscar el proveedor

        if (!provider) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        // Verificar si el cliente ya ha valorado este proveedor
        const existingRating = provider.ratings.find(
            r => r.user.toString() === req.user.id.toString()
        );

        if (existingRating) {
            // Actualizar valoración existente
            existingRating.value = rating;
            existingRating.date = new Date();
        } else {
            // Agregar nueva valoración
            provider.ratings.push({
                user: req.user.id,
                value: rating
            });
        }

        // Calcular nueva valoración promedio
        const totalRating = provider.ratings.reduce((acc, curr) => acc + curr.value, 0);
        provider.rating = totalRating / provider.ratings.length;

        await provider.save();
        res.json({ 
            rating: provider.rating,
            message: 'Valoración del proveedor actualizada exitosamente' 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};
