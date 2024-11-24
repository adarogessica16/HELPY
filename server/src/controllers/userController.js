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
        const logo = req.file ? `/uploads/logos/${req.file.filename}` : undefined;

        // Encontrar el usuario por su ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar los campos del usuario
        user.description = description || user.description;
        user.tags = tags ? tags.split(",") : user.tags;
        if (logo) {
            user.logo = logo;
        }

        await user.save();

        // Responder con el perfil actualizado
        res.json({
            message: "Perfil actualizado correctamente",
            profile: {
                name: user.name,
                description: user.description,
                tags: user.tags,
                logo: user.logo,
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

        if (!tags || tags.length < 3) {
            return res.status(400).json({ message: 'Por favor, proporciona al menos 3 letras para filtrar.' });
        }

        // Crear expresión regular para buscar tags que contengan las letras ingresadas
        const regex = new RegExp(tags, 'i'); // 'i' hace que la búsqueda no sea sensible a mayúsculas/minúsculas

        // Buscar proveedores cuyos tags coincidan parcialmente
        const providers = await User.find({
            role: 'proveedor',
            tags: { $regex: regex },
        }).select('-password');

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
