// server.js
const express = require('express');
const mongoose = require('mongoose');
const Crypto = require('./models/Crypto'); // Import Crypto model
const fetchCryptoData = require('./fetchCryptoData');
require('./cronJob'); // Import the cron job

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
// MongoDB connection
mongoose.connect('mongodb+srv://suryan_pinnoju:Human69420@info.u9bxg.mongodb.net/cryptoTrackerDB?retryWrites=true&w=majority&appName=Info', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// A simple route for testing
app.get('/', (req, res) => {
    res.render('index');  // Render the 'index.ejs' file
});
// Route to display cryptocurrency data
// server.js
// Update the route to render the data on the stats page
app.get('/stats', async (req, res) => {
    const coin = req.query.coin; // Get the coin name from query params
    let cryptoData = null;

    if (coin) {
        try {
            // Fetch the cryptocurrency data from the database
            cryptoData = await Crypto.findOne({ coin });

            if (!cryptoData) {
                return res.status(404).json({ error: 'Cryptocurrency not found' });
            }
        } catch (err) {
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
    }

    // Render the stats page with or without crypto data
    return res.render('stats', {
        coin: coin || null,
        price: cryptoData ? cryptoData.price_usd : null,
        marketCap: cryptoData ? cryptoData.market_cap_usd : null,
        change_24h: cryptoData ? cryptoData.change_24h : null
    });
});


app.get('/cryptos', async (req, res) => {
    try {
        const cryptos = await Crypto.find({});
        res.render('cryptos', { cryptos });
    } catch (err) {
        res.status(500).send('Error fetching data');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
