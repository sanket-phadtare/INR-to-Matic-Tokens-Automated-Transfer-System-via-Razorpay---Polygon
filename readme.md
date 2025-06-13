# INR-to-MATIC Payment Automation with Razorpay, Web3 & PostgreSQL

This project automates the flow of purchasing Polygon MATIC tokens using Indian Rupees (INR). It handles Razorpay INR payments, verifies them securely via webhooks, fetches real-time MATIC prices from CoinGecko, and sends tokens to users' Web3 wallets registered in the PostgreSQL database. It also offers secure wallet creation and private key encryption.

### Sample Flow
1. User registers → wallet generated → data stored.
2. User requests MATIC → payment link sent via Razorpay.
3. On payment success, webhook triggers auto transfer of tokens.

---

## Features

-  **User Registration with Wallet Generation**
-  **AES-256 Encryption for Private Keys**
-  **Payment Link Creation using Razorpay**
-  **Webhook Verification & Handling**
-  **Real-Time MATIC Price Fetch via CoinGecko**
-  **Automatic Token Transfer via Web3**
- ️ **PostgreSQL Integration**
-  **Check Wallet Balance**
-  **Retrieve Decrypted Private Key**



---
## Libraries Imported

- **Node.js + Express** – Backend server
- **Web3.js** – Blockchain interaction (Polygon Amoy)
- **PostgreSQL** – User data storage
- **Razorpay** – INR payment gateway
- **CoinGecko API** – Fetch live MATIC-INR prices
- **dotenv** – Environment configuration
- **crypto** – AES encryption/decryption
- **axios** – API call to CoinGecko
- **open** – Auto-opens payment link in browser

---
## Installation
```
git clone https://github.com/sanket-phadtare/INR-to-Matic-Tokens-Automated-Transfer-System-via-Razorpay---Polygon
node server.js

```
---
## Environment Variables (.env)
```
PORT=1000

DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_NAME=your_database
DB_PORT=5432

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
WEBHOOK_SECRET=razorpay_webhook_secret

PRIVATE_KEY=admin_wallet_private_key
WALLET_ADDRESS=admin_wallet_address

```
---
##  API Endpoints

### `/api/registeruser` – Register User
Creates a new wallet, encrypts private key, and stores in DB.

```
POST /api/registeruser
{
  "name": "xyz",
  "email": "name@example.com",
  "password": "***"
}
```

### `/api/getprivatekey` – Get Decrypted Private Key
```
POST /api/getprivatekey
{
  "email": "john@example.com",
  "password": "securePassword"
}
```
### `/api/getbalance` – Get Wallet Balance

```
POST /api/getbalance
{
  "walletAddress": "0x..."
}

```
### `/api/razorpay-payment` – Create Razorpay Payment Link
```
POST /api/razorpay-payment
{
  "amount": 100,
  "name": "XYZ",
  "email": "name@gmail.com"
}
```
---
### `/webhook` – Razorpay Webhook Listener
#### Listens for payment_link.paid and payment.captured events. On successful payment:
* Fetches live MATIC-INR rate.
* Calculates token amount.
* Signs & sends tokens to user's wallet using admin credentials.
---
### Security
* AES-256-CBC used for private key encryption.
* Razorpay webhook signature validation included.
* Wallet credentials securely handled through environment variables.

