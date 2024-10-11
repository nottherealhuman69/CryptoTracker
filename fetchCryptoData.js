// fetchCryptoData.js
const axios = require('axios');
const Crypto = require('./models/Crypto');



async function fetchCryptoData() {
    try {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network&vs_currencies=usd&include_market_cap=true&include_24hr_change=true';
        
        const response = await axios.get(url);
        const data = response.data;
        const coins = ['bitcoin', 'ethereum', 'matic-network'];

        for (const coin of coins) {
            const coinData = data[coin];
            
            // Store or update data in the database
            await Crypto.findOneAndUpdate(
                { coin: coin },
                {
                    coin: coin,
                    price_usd: coinData.usd,
                    market_cap_usd: coinData.usd_market_cap,
                    change_24h: coinData.usd_24h_change
                },
                { upsert: true } // Create if doesn't exist
            );
        }

        console.log("Data fetched and stored successfully");
    } catch (error) {
        console.error("Error fetching crypto data: ", error);
    }
}

module.exports = fetchCryptoData;
