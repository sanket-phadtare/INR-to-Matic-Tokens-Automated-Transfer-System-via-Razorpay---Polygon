import Web3 from 'web3';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import crypto from 'crypto';


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



app.listen(1000, () => {
    console.log('Server is running on port 1000');
});