# CryptoTracker

**CryptoTracker** is a cryptocurrency tracking application that fetches real-time price, market capitalization, and 24-hour price change data for Bitcoin, Ethereum, and MATIC using the CoinGecko API. The application also stores the data in a MongoDB database and provides routes to display the latest crypto stats.

## Features
- Fetches real-time cryptocurrency data every 2 hours.
- Tracks Bitcoin, Ethereum, and MATIC.
- Displays price, market cap, and 24-hour change.
- Stores data in MongoDB for historical reference.
- Routes to display current stats and calculate price deviation over time.

## Technologies Used
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ORM)
- **Scheduling**: Node-cron
- **API**: CoinGecko API
- **Templating**: EJS (Embedded JavaScript)

## Installation

1. **Clone the repository**:
   git clone https://github.com/your-username/crypto-tracker.git
   cd crypto-tracker
2. **Install Dependencies**:
   npm install
3. **Set up MongoDB**:
   MONGODB_URI=your-mongodb-uri
4. **Run the Application**:
   node server.js
5. **Access the Application**:
   open browser and go to http://localhost:3000
## Routes
- / – The home page.
- /cryptos – Displays the cryptocurrency stats.
- /stats – View detailed stats for a specific coin (via query parameters like ?coin=bitcoin).
- /deviation – Shows the standard deviation of prices for a selected coin over time.

## Scheduling Cryptocurrency Data Fetching
The application uses the **node-cron** package to schedule data fetching from the CoinGecko API every 2 hours.
cron.schedule('0 */2 * * *', async () => {
    await fetchCoinData();
    console.log("Fetched crypto data at 2-hour intervals.");
});
## Example API Response from CoinGecko
{
  "bitcoin": {
    "usd": 60256,
    "usd_market_cap": 1191573603473.1294,
    "usd_24h_change": -0.4575358442501923
  },
  "ethereum": {
    "usd": 2382.49,
    "usd_market_cap": 287049138546.08746,
    "usd_24h_change": 0.4739374739686845
  },
  "matic": {
    "usd": 1.12,
    "usd_market_cap": 11725863763.1294,
    "usd_24h_change": 0.2351358442501923
  }
}

   
