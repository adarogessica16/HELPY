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
});

module.exports = mongoose.model('User', userSchema);
