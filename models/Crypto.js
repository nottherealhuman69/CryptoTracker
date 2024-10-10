
const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
    coin: { type: String, required: true },
    price_usd: { type: Number, required: true },
    market_cap_usd: { type: Number, required: true },
    change_24h: { type: Number, required: true },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crypto', cryptoSchema);
