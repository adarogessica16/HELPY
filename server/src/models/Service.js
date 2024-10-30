const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [String],
    rating: { type: Number, default: 0 },
    reviews: [{
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        rating: Number,
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Service', serviceSchema);
