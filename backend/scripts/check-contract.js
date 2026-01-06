// Script to verify contract deployment and authorization
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Defensive import to support web3 v1.x and v4.x export shapes
let Web3 = require('web3');
if (Web3 && Web3.default) Web3 = Web3.default;
if (Web3 && Web3.Web3) Web3 = Web3.Web3;

if (!Web3 || (typeof Web3 !== 'function' && typeof Web3 !== 'object')) {
  console.error('Unexpected `web3` import shape:', Web3);
  throw new Error('Web3 import failed - check installed web3 package version');
}

async function checkContract() {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const adminAddress = process.env.ADMIN_WALLET_ADDRESS;
    const blockchainUrl = process.env.BLOCKCHAIN_URL;

    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      console.error('❌ CONTRACT_ADDRESS not set in .env');
      return;
    }

    if (!adminAddress) {
      console.error('❌ ADMIN_WALLET_ADDRESS not set in .env');
      return;
    }

    if (!blockchainUrl) {
      console.error('❌ BLOCKCHAIN_URL not set in .env');
      return;
    }

    console.log('🔍 Checking contract setup...\n');
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Admin Address: ${adminAddress}`);
    console.log(`Blockchain URL: ${blockchainUrl}\n`);

    // Load contract ABI
    const contractJSON = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../../blockchain/build/contracts/CredentialRegistry.json'),
        'utf8'
      )
    );

    // Create provider (accepts URL or explicit HttpProvider if available)
    let provider;
    if (Web3.providers && Web3.providers.HttpProvider) {
      provider = new Web3.providers.HttpProvider(blockchainUrl);
    } else {
      // fallback to URL string — Web3 constructors in some builds accept URL directly
      provider = blockchainUrl;
    }

    // Create Web3 instance
    const web3 = new Web3(provider);

    // Checksum addresses
    const checksummedContractAddress = web3.utils.toChecksumAddress(contractAddress);
    const checksummedAdminAddress = web3.utils.toChecksumAddress(adminAddress);

    console.log('📋 Step 1: Checking if contract exists at address...');
    const contractCode = await web3.eth.getCode(checksummedContractAddress);
    if (!contractCode || contractCode === '0x' || contractCode === '0x0') {
      console.error(`❌ No contract found at address ${checksummedContractAddress}`);
      console.error('   Please deploy the contract first using: cd blockchain && truffle migrate --network development');
      return;
    }
    console.log(`✅ Contract code found (${contractCode.length} characters)\n`);

    console.log('📋 Step 2: Creating contract instance...');
    const contract = new web3.eth.Contract(contractJSON.abi, checksummedContractAddress);
    console.log('✅ Contract instance created\n');

    console.log('📋 Step 3: Checking admin address...');
    try {
      const contractAdmin = await contract.methods.admin().call();
      console.log(`✅ Contract admin: ${contractAdmin}`);
      console.log(`   Your admin address: ${checksummedAdminAddress}`);
      if (contractAdmin.toLowerCase() !== checksummedAdminAddress.toLowerCase()) {
        console.log('⚠️  Warning: Your admin address does not match the contract admin');
      } else {
        console.log('✅ Admin addresses match\n');
      }
    } catch (err) {
      console.error(`❌ Error getting admin: ${err.message}\n`);
    }

    console.log('📋 Step 4: Checking authorization status...');
    try {
      const isAuthorized = await contract.methods.authorizedIssuers(checksummedAdminAddress).call();
      if (isAuthorized) {
        console.log(`✅ Account ${checksummedAdminAddress} is AUTHORIZED to issue credentials\n`);
      } else {
        console.log(`❌ Account ${checksummedAdminAddress} is NOT AUTHORIZED to issue credentials`);
        console.log('   You need to authorize this account using the authorizeIssuer function\n');
      }
    } catch (err) {
      console.error(`❌ Error checking authorization: ${err.message}`);
      console.error('   This might indicate the contract address is incorrect or ABI mismatch\n');
    }

    console.log('📋 Step 5: Checking account balance...');
    try {
      const balance = await web3.eth.getBalance(checksummedAdminAddress);
      const balanceInEth = web3.utils.fromWei(balance.toString(), 'ether');
      console.log(`✅ Account balance: ${balanceInEth} ETH`);
      if (parseFloat(balanceInEth) < 0.01) {
        console.log('⚠️  Warning: Low balance, you may not have enough funds for transactions\n');
      } else {
        console.log('✅ Sufficient balance for transactions\n');
      }
    } catch (err) {
      console.error(`❌ Error getting balance: ${err.message}\n`);
    }

    console.log('📋 Step 6: Checking deployed contract addresses in build file...');
    const networks = contractJSON.networks || {};
    if (Object.keys(networks).length > 0) {
      console.log('   Deployed contract addresses:');
      Object.keys(networks).forEach(networkId => {
        const networkInfo = networks[networkId];
        console.log(`   Network ${networkId}: ${networkInfo.address}`);
        if (networkInfo.address.toLowerCase() === checksummedContractAddress.toLowerCase()) {
          console.log('   ✅ This matches your CONTRACT_ADDRESS');
        }
      });
    } else {
      console.log('   ⚠️  No deployed addresses found in build file');
    }

    console.log('\n✅ Contract check complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

checkContract();

