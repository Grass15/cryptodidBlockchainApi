require('dotenv').config();
const Web3 = require('web3');

// Connect to the Ethereum network
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const web3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${infuraProjectId}`));

// The account that will interact with the smart contract
const account = process.env.ACCOUNT_ADDRESS;
const privateKey = Buffer.from(process.env.WALLET_PRIVATE_KEY, 'hex');

// Contract details
const abi = require('./build/contracts/StateContract.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(abi, contractAddress);

module.exports = { web3, account, privateKey, contract, contractAddress };
