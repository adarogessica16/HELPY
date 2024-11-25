const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const uploadLogo = require('../middleware/uploadlogo');
const roleMiddleware = require('../middleware/role');

// Rutas públicas (sin autenticación)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, uploadLogo, userController.updateProfile);

// Rutas específicas para proveedores

router.get('/filter', auth, userController.filterProvidersByTags);
router.get('/random-tags', auth, userController.getRandomTagsAndProviders);
router.get('/all-providers', auth, userController.getAllProviders);
// Obtener perfil por ID de proveedor
router.get('/profile/:profileId', auth, userController.getProfileById);
// Ruta para valorar a un proveedor
router.post('/:id/rate', auth, roleMiddleware('cliente'), userController.rateProvider);

module.exports = router;
