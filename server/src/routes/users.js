const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const uploadLogo = require('../middleware/uploadlogo');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, uploadLogo, userController.updateProfile);
// Filtrar proveedores por tags
router.get('/filter', auth,userController.filterProvidersByTags);
router.get('/random-tags',auth, userController.getRandomTagsAndProviders);
module.exports = router;