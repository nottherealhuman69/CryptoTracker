# Crypto Tracker

A real-time cryptocurrency tracking application that monitors the prices of Bitcoin, Ethereum, and Polygon (MATIC) using the CoinGecko API. The application updates prices every 2 hours and provides statistical analyses to help users stay informed about market trends.

## Features

- **Real-time Price Tracking**: Monitor the latest prices for Bitcoin, Ethereum, and MATIC.
- **User Authentication**: Secure user accounts with password hashing and email recovery.
- **Price Deviation Analysis**: Analyze price deviations over time.
- **Market Cap Tracking**: Stay updated with market cap changes.
- **24-hour Price Change Monitoring**: Keep track of significant price changes within a day.

## Public API Endpoints

These endpoints are publicly available as per the assignment requirements:

- **`/cryptos`**: Retrieve the latest data for all tracked cryptocurrencies.
  - **No authentication required**
  
- **`/stats`**: Get statistics for a specific cryptocurrency.
  - **Query parameter**: `?coin=bitcoin` (or `ethereum`, `matic-network`)
  - **No authentication required**

- **`/deviation`**: Obtain price deviation statistics.
  - **Query parameter**: `?coin=bitcoin` (or `ethereum`, `matic-network`)
  - **No authentication required**

## User Authentication

Although the main API endpoints are public, creating an account enhances the user experience:
- **Register** with email and password.
- Passwords are securely hashed using **bcrypt**.
- Email is used only for **password recovery**.
- We prioritize user privacy and do not share personal data.

## Technical Details

### Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "express": "^4.17.1",
  "mongoose": "^6.0.0",
  "node-cron": "^3.0.0",
  "nodemailer": "^6.0.0",
  "passport": "^0.6.0",
  "ejs": "^3.1.0"
}
```

### Database

- **MongoDB Atlas** is used for data storage.
- Defined schemas for **users** and **cryptocurrency data**.
- Data updates are automated every 2 hours.

### APIs Used

- **CoinGecko API** for fetching cryptocurrency data.
- **Nodemailer** for password reset functionality via Gmail.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** with the following variables:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   SESSION_SECRET=your-session-secret
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Deployment

- The application is deployed on **Heroku** with continuous updates from the GitHub repository.
- Access the live application: cryptotracker-y6o8.onrender.com

## Security Features

- **Password hashing** using bcrypt.
- **Session-based authentication**.
- **CSRF protection**.
- **Secure password reset workflow**.
- **Rate limiting** on API endpoints to prevent abuse.

## Data Update Frequency

- Cryptocurrency data is fetched every 2 hours.
- Price deviation calculations use the 100 most recent data points.
- Market cap and 24-hour change are updated with each fetch.

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests. For major changes, open an issue first to discuss proposed changes.
