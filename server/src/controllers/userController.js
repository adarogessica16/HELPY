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
        const { description, tags, logo } = req.body;

        // Buscar y actualizar el perfil del usuario
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar campos específicos
        user.description = description || user.description;
        user.tags = tags || user.tags;
        user.logo = logo || user.logo;

        // Guardar cambios
        await user.save();

        // Responder con el perfil actualizado
        res.json({
            message: 'Perfil actualizado correctamente',
            profile: {
                name: user.name,
                description: user.description,
                tags: user.tags,
                logo: user.logo,
            },
        });
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).send('Error del servidor');
    }
};



