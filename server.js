import Web3 from 'web3';
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import { error } from 'console';
import pg from 'pg';
const { Pool } = pg;
import crypto from 'crypto';
import Razorpay from "razorpay";

dotenv.config();
const app = express();
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const web3 = new Web3('https://rpc-amoy.polygon.technology/');
const ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "p_id", "type": "uint256"}, {"internalType": "string", "name": "p_name", "type": "string"}],
        "name": "addData", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "data", "outputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}, {"internalType": "string", "name": "product_name", "type": "string"}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "p_id", "type": "uint256"}],
        "name": "getData", "outputs": [{"internalType": "uint256", "name": ""}, {"internalType": "string", "name": ""}],
        "stateMutability": "view", "type": "function"
    },
    {
        "inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": ""}],
        "stateMutability": "view", "type": "function"
    }
];

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(ABI, contractAddress);
const privateKey = process.env.PRIVATE_KEY;
const walletAddress = process.env.WALLET_ADDRESS;


function encryptPrivateKey(privateKey, password) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'salt', 32); 
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

function decryptPrivateKey(encryptedKey, password) {
    const algorithm = 'aes-256-cbc';
    const [ivHex, encryptedData] = encryptedKey.split(':'); 
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex'); 

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

async function sendTransaction(txnData) {
    try {
        const estimatedGas = Number(await contract.methods.addData(...Object.values(txnData)).estimateGas({ from: walletAddress }));
        const gasPrice = BigInt(await web3.eth.getGasPrice());

        const txnObject = {
            to: contractAddress,
            gas: Math.floor(estimatedGas),
            gasPrice: gasPrice.toString(),
            nonce: Number(await web3.eth.getTransactionCount(walletAddress)),
            data: contract.methods.addData(...Object.values(txnData)).encodeABI()
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(txnObject, privateKey);
        return await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    } 
    catch (error) {
        console.error(`Transaction failed: ${error.message}`);
        throw error;
    }
}


app.post("/api/registeruser", async function(req,res)
{
    const { name, email, password } = req.body;
    try {
     
        const account = web3.eth.accounts.create();
        const walletAddress = account.address;
        const privateKey = account.privateKey;

        const encryptedPrivateKey = encryptPrivateKey(privateKey, password);

        const query = `INSERT INTO users (name, email, password ,wallet_address, private_key) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        const values = [name, email, password, walletAddress, encryptedPrivateKey];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            walletAddress,
        });
    } catch (error) {
        console.error(`Registration failed: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post("/api/addfund", async (req, res) => {
    const { email } = req.body;

    try {
        
        const userQuery = 'SELECT wallet_address FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);
        const walletAddress = userResult.rows[0].wallet_address;

        const transakUrl = `https://global-stg.transak.com/?apiKey=${process.env.TRANSAK_API_KEY}&environment=STAGING&walletAddress=${walletAddress}&defaultCryptoCurrency=MATIC&fiatCurrency=INR`;
        res.status(200).json({
            success: true,
            transakUrl, 
        });
    } 
    catch (error) 
    {
        console.error(`Failed to generate Transak URL: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(1000, () => {
    console.log('Server is running on port 1000');
});
