const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
// Filtrar proveedores por tags
router.get('/filter', auth,userController.filterProvidersByTags);
router.get('/random-tags',auth, userController.getRandomTagsAndProviders);
module.exports = router;