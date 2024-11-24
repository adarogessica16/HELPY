const multer = require('multer');
const path = require('path');

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos/'); // Carpeta específica para los logos de perfil
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
    }
});

// Filtrar archivos por tipo (solo imágenes)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Tipos de archivo permitidos
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: El archivo debe ser una imagen válida'));
};

// Crear el middleware de multer
const uploadLogo = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1000000 } // Límite de tamaño: 1MB
});

module.exports = uploadLogo.single('logo'); // Manejar un único archivo
