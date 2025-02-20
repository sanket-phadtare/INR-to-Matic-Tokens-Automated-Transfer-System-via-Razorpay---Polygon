import Web3 from 'web3';
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import { error } from 'console';
import Razorpay from "razorpay";

dotenv.config();
const app = express();
app.use(express.json());

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

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});




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

});


app.post("/api/payment", async function(req, res) {
    const { id, product_name } = req.body;

    try {
        console.log("Transaction under process...");
        const txnData = { id, product_name };
        const receipt  =await sendTransaction(txnData);
        console.log("Transaction Successfull");

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(1000, () => {
    console.log('Server is running on port 1000');
});
