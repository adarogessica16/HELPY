const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Obtener servicios del proveedor autenticado
router.get('/my-services', auth, roleMiddleware('proveedor'), serviceController.getProviderServices);

// Crear un nuevo servicio
router.post('/service', auth, roleMiddleware('proveedor'), serviceController.createService);

// Obtener todos los servicios
router.get('/', auth, serviceController.getAllServices);

// Obtener un servicio por ID
router.get('/:id', auth, serviceController.getServiceById);

// Actualizar un servicio por ID
router.put('/:id', auth, roleMiddleware('proveedor'), serviceController.updateService);

// Eliminar un servicio por ID
router.delete('/:id', auth, roleMiddleware('proveedor'), serviceController.deleteService);

// Filtrar servicios por categoría
router.get('/category/:category', auth, serviceController.getServicesByCategory);

// Filtrar servicios por rango de precios
router.get('/price', auth, serviceController.getServicesByPriceRange);

// Filtrar servicios por valoración mínima
router.get('/rating/:rating', auth, serviceController.getServicesByRating);

// Filtrar servicios por palabra clave
router.get('/keyword/:keyword', auth, serviceController.getServicesByKeyword);

// Filtrar servicios por disponibilidad
router.get('/availability/:available', auth, serviceController.getServicesByAvailability);

// Agregar una reseña a un servicio
router.post('/:id/reviews', auth, roleMiddleware('cliente'), serviceController.addReview);

module.exports = router;
