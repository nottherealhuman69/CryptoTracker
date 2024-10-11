const cron = require('node-cron');
const axios = require('axios'); // Import axios for making HTTP requests
const Crypto = require('./models/Crypto'); // Adjust the path to your Crypto model

async function fetchCoinData() {
    try {
        console.log("Fetching cryptocurrency data...");
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network&vs_currencies=usd&include_market_cap=true&include_24hr_change=true');
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        // Process and save the data to your database
        const cryptos = response.data;
        for (const [key, value] of Object.entries(cryptos)) {
            const newCrypto = new Crypto({
                coin: key,
                price_usd: value.usd,
                market_cap_usd: value.usd_market_cap,
                change_24h: value.usd_24h_change
            });
            await newCrypto.save();
        }
        console.log("Data fetched and saved successfully.");
    } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
    }
}

// Schedule the job to run every 2 hours
cron.schedule('0 */2 * * *', async () => {
    await fetchCoinData();
});
