// cronJob.js
const cron = require('node-cron');
const fetchCryptoData = require('./fetchCryptoData');

// Schedule the job to run every 2 hours
cron.schedule('*/2 * * * *', () => {
    console.log('Fetching cryptocurrency data...');
    fetchCryptoData();
});
