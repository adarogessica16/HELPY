const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configurar el almacenamiento con Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Usa la instancia de Cloudinary
  params: {
    folder: 'uploads',  // Nombre de la carpeta en Cloudinary donde se guardarán las imágenes
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],  // Formatos permitidos
  },
});

// Crear el middleware de multer para manejar la carga de archivos
const upload = multer({ storage: storage });

// Exportar el middleware para una sola imagen
module.exports = upload.single('images');  // Solo una imagen, no un arreglo
