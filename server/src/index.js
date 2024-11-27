require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const uploadMiddelware= require('./middleware/upload')

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas (se agregarán después)
app.use('/api/users', require('./routes/users'));
app.use('/api/services',uploadMiddelware, require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));