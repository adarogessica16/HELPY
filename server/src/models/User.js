const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['proveedor', 'cliente'], required: true },
    profileImage: String,
    description: { type: String },
    tags: [String],
    logo: { type: String },
    ratings: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        value: Number,
        date: { type: Date, default: Date.now }
    }],
    rating: { type: Number, default: 0 }, // Promedio de la valoración
});

module.exports = mongoose.model('User', userSchema);
