#!/usr/bin/env node
/**
 * Script to deploy CredentialRegistry contract to Ganache
 * This script should be run after Ganache is running and ready
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BLOCKCHAIN_DIR = path.join(__dirname, '../../blockchain');
const CONTRACT_JSON_PATH = path.join(BLOCKCHAIN_DIR, 'build/contracts/CredentialRegistry.json');

async function waitForGanache(url, maxRetries = 30, delay = 2000) {
  const Web3 = require('web3');
  const web3 = new Web3(url);
  
  console.log(`Waiting for Ganache at ${url}...`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const blockNumber = await web3.eth.getBlockNumber();
      console.log(`✅ Ganache is ready! Current block: ${blockNumber}`);
      return true;
    } catch (error) {
      if (i < maxRetries - 1) {
        console.log(`⏳ Attempt ${i + 1}/${maxRetries}: Ganache not ready yet, retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error(`Ganache not available after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
}

async function deployContract() {
  try {
    const blockchainUrl = process.env.BLOCKCHAIN_URL || 'http://ganache:7545';
    
    console.log('🚀 Starting contract deployment...');
    console.log(`📡 Blockchain URL: ${blockchainUrl}`);
    
    // Wait for Ganache to be ready
    await waitForGanache(blockchainUrl);
    
    // Check if contract is already compiled
    if (!fs.existsSync(CONTRACT_JSON_PATH)) {
      console.log('📦 Compiling contracts...');
      execSync('truffle compile', { 
        cwd: BLOCKCHAIN_DIR,
        stdio: 'inherit'
      });
    } else {
      console.log('✅ Contracts already compiled');
    }
    
    // Deploy contract
    console.log('📤 Deploying CredentialRegistry contract...');
    const output = execSync('truffle migrate --network docker --reset', {
      cwd: BLOCKCHAIN_DIR,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    console.log(output);
    
    // Extract contract address from build file
    const contractData = JSON.parse(fs.readFileSync(CONTRACT_JSON_PATH, 'utf8'));
    const networks = contractData.networks || {};
    
    // Find the deployed network (should be the one with the highest block number)
    let deployedNetwork = null;
    let highestBlock = 0;
    
    for (const [networkId, networkData] of Object.entries(networks)) {
      if (networkData.address && networkData.transactionHash) {
        if (!deployedNetwork || networkData.blockNumber > highestBlock) {
          deployedNetwork = networkData;
          highestBlock = networkData.blockNumber || 0;
        }
      }
    }
    
    if (deployedNetwork && deployedNetwork.address) {
      const contractAddress = deployedNetwork.address;
      console.log('\n✅ Contract deployed successfully!');
      console.log(`📍 Contract Address: ${contractAddress}`);
      console.log(`📝 Transaction Hash: ${deployedNetwork.transactionHash}`);
      console.log(`🔢 Block Number: ${deployedNetwork.blockNumber || 'N/A'}`);
      console.log('\n⚠️  IMPORTANT: Update your CONTRACT_ADDRESS environment variable:');
      console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
      
      // Try to get the deployer account (first account from Ganache)
      try {
        const Web3 = require('web3');
        const web3 = new Web3(blockchainUrl);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          console.log(`\n💼 Deployer Account (automatically authorized): ${accounts[0]}`);
          console.log(`   ADMIN_WALLET_ADDRESS=${accounts[0]}`);
          console.log(`   ADMIN_PRIVATE_KEY=<get from Ganache mnemonic>`);
        }
      } catch (err) {
        console.log('\n⚠️  Could not fetch accounts. Make sure Ganache is running.');
      }
      
      return contractAddress;
    } else {
      throw new Error('Could not find deployed contract address in build file');
    }
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.stdout) console.error('Output:', error.stdout);
    if (error.stderr) console.error('Error:', error.stderr);
    process.exit(1);
  }
}

// Run deployment
deployContract()
  .then(() => {
    console.log('\n✨ Deployment script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

