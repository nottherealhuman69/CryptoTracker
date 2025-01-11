const cron = require('node-cron');
const axios = require('axios');
const Crypto = require('./models/Crypto');

async function fetchCryptoData() {
    try {
        console.log("Fetching cryptocurrency data...");
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network&vs_currencies=usd&include_market_cap=true&include_24hr_change=true';
        
        const response = await axios.get(url);
        const data = response.data;
        
        // Process and save each cryptocurrency
        for (const [coin, coinData] of Object.entries(data)) {
            await Crypto.findOneAndUpdate(
                { coin },
                {
                    coin,
                    price_usd: coinData.usd,
                    market_cap_usd: coinData.usd_market_cap,
                    change_24h: coinData.usd_24h_change
                },
                { upsert: true }
            );
        }
        
        console.log("Data fetched and stored successfully");
    } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
    }
}

// Schedule the job to run every 2 hours
cron.schedule('0 */2 * * *', fetchCryptoData);

// Export for potential manual triggering if needed
module.exports = fetchCryptoData;