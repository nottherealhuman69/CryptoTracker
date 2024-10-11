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
app.get('/cryptos', async (req, res) => {
    try {
        // Fetch the latest cryptocurrency data from the database
        const cryptos = await Crypto.find({}).sort({ createdAt: -1 }); // Fetch all cryptos, sorted by the most recent

        // Render the cryptos page with the fetched data
        return res.render('cryptos', { cryptos: cryptos }); // Pass the fetched data to the view
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).send('An error occurred while fetching cryptocurrencies');
    }
});


// Update the /stats route
app.get('/stats', async (req, res) => {
    const coin = req.query.coin;
    let cryptoData = null;

    if (coin) {
        try {
            // Find the latest record for the specified cryptocurrency
            cryptoData = await Crypto.findOne({ coin }).sort({ createdAt: -1 }); // Sort by creation date descending

            if (!cryptoData) {
                return res.status(404).json({ error: 'Cryptocurrency not found' });
            }
        } catch (err) {
            return res.status(500).json({ error: 'An error occurred while fetching data' });
        }
    }

    // Render the stats page with or without crypto data
    return res.render('stats', {
        error: null,
        coin: coin,
        price: cryptoData ? cryptoData.price_usd : null,
        marketCap: cryptoData ? cryptoData.market_cap_usd : null,
        change_24h: cryptoData ? cryptoData.change_24h : null
    });
});


function std(values) {
    const n = values.length;

    // If there are no values, return 0
    if (n === 0) return 0;

    // Calculate the mean
    const mean = values.reduce((sum, val) => sum + val, 0) / n;

    // Calculate the variance
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;

    // Return the standard deviation
    return Math.sqrt(variance);
}

// Update the /deviation route
app.get('/deviation', async (req, res) => {
    const coin = req.query.coin; // Get the coin name from query params
    let deviationData = null;

    if (coin) {
        try {
            // Fetch the last 100 records or fewer if there are not enough records
            const records = await Crypto.find({ coin }).sort({ createdAt: -1 }).limit(100);
            const prices = records.map(record => record.price_usd);
            const deviation = std(prices); // Calculate the standard deviation

            deviationData = {
                coin: coin,
                deviation: deviation
            };
        } catch (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).send('An error occurred while fetching deviation data');
        }
    }

    // Render the deviation page with the deviation data
    return res.render('deviation', { deviationData: deviationData });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
