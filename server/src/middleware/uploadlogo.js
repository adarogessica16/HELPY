const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,  // Usamos la instancia de Cloudinary
  params: {
    folder: 'logos',  // Carpeta específica donde se guardarán los logos en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],  // Formatos permitidos
  },
});

// Crear el middleware de multer para manejar la carga del logo
const uploadLogo = multer({
  storage: storage,  // Usamos el almacenamiento configurado con Cloudinary
  limits: { fileSize: 1000000 },  // Limitar el tamaño a 1MB
});

module.exports = uploadLogo.single('logo');  // Usar .single('logo') para un solo archivo

