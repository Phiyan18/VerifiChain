// backend/services/blockchain.js
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
  provider = new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URL);
} else {
  // fallback to URL string — Web3 constructors in some builds accept URL directly
  provider = process.env.BLOCKCHAIN_URL;
}

const web3 = new Web3(provider);

const contract = new web3.eth.Contract(
  contractJSON.abi,
  process.env.CONTRACT_ADDRESS
);

async function issueCredentialOnChain(data) {
  try {
    const account = process.env.ADMIN_WALLET_ADDRESS;
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!account || !privateKey) {
      throw new Error('ADMIN_WALLET_ADDRESS or ADMIN_PRIVATE_KEY not set in environment');
    }

    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('CONTRACT_ADDRESS not set in environment or is invalid. Please deploy the contract and set CONTRACT_ADDRESS in .env');
    }

    // Ensure addresses are checksummed
    const checksummedAccount = web3.utils.toChecksumAddress(account);
    const checksummedContractAddress = web3.utils.toChecksumAddress(contractAddress);
    
    console.log(`Using contract address: ${checksummedContractAddress}`);
    console.log(`Using account: ${checksummedAccount}`);
    
    // Verify contract exists at the address
    const contractCode = await web3.eth.getCode(checksummedContractAddress);
    if (!contractCode || contractCode === '0x' || contractCode === '0x0') {
      throw new Error(`No contract found at address ${checksummedContractAddress}. Please verify CONTRACT_ADDRESS in .env matches the deployed contract address.`);
    }
    console.log(`Contract code found at address (length: ${contractCode.length} chars)`);
    
    // Create a new contract instance with checksummed address
    const contractInstance = new web3.eth.Contract(
      contractJSON.abi,
      checksummedContractAddress
    );
    
    // Check if account is authorized BEFORE creating transaction
    let isAuthorized = false;
    try {
      isAuthorized = await contractInstance.methods.authorizedIssuers(checksummedAccount).call();
      console.log(`Account authorized status: ${isAuthorized}`);
    } catch (authCheckErr) {
      console.error('Error checking authorization:', authCheckErr.message);
      throw new Error(`Failed to check authorization. Contract address may be incorrect or contract may not be deployed. Error: ${authCheckErr.message}`);
    }
    
    if (!isAuthorized) {
      throw new Error(`Account ${checksummedAccount} is not authorized to issue credentials. Please authorize this account first using the authorizeIssuer function. The deployer account is automatically authorized.`);
    }
    
    // Check account balance first
    const balance = await web3.eth.getBalance(checksummedAccount);
    const balanceInEth = web3.utils.fromWei(balance.toString(), 'ether');
    console.log(`Account balance: ${balanceInEth} ETH`);

    // Create transaction
    const tx = contractInstance.methods.issueCredential(
      data.studentId,
      data.studentName,
      data.degree,
      data.major,
      data.ipfsHash
    );
    
    // Estimate gas
    let gas;
    try {
      gas = await tx.estimateGas({ from: checksummedAccount });
    } catch (gasEstimateErr) {
      console.error('Gas estimation error:', gasEstimateErr.message);
      throw new Error(`Failed to estimate gas. This usually means the transaction would revert. Error: ${gasEstimateErr.message}`);
    }
    
    // Get the latest block to check if EIP-1559 is supported
    const latestBlock = await web3.eth.getBlock('latest');
    const baseFeePerGas = latestBlock.baseFeePerGas;
    
    let gasPrice, maxFeePerGas, maxPriorityFeePerGas, gasCost;
    
    // Use EIP-1559 if baseFeePerGas is available (London fork+)
    if (baseFeePerGas) {
      const baseFeePerGasBigInt = BigInt(baseFeePerGas.toString());
      // Set maxPriorityFeePerGas to 1 gwei (1000000000 wei) or 10% of baseFee, whichever is higher
      const priorityFee = BigInt(1000000000); // 1 gwei
      maxPriorityFeePerGas = priorityFee > (baseFeePerGasBigInt / BigInt(10)) 
        ? priorityFee 
        : (baseFeePerGasBigInt / BigInt(10));
      
      // Set maxFeePerGas to baseFee * 2 + priorityFee (with buffer)
      maxFeePerGas = baseFeePerGasBigInt * BigInt(2) + maxPriorityFeePerGas;
      
      gasPrice = null; // Not used for EIP-1559
      gasCost = BigInt(gas.toString()) * maxFeePerGas;
      
      console.log(`Using EIP-1559 transaction format`);
      console.log(`Base fee: ${web3.utils.fromWei(baseFeePerGas.toString(), 'gwei')} gwei`);
      console.log(`Max fee per gas: ${web3.utils.fromWei(maxFeePerGas.toString(), 'gwei')} gwei`);
      console.log(`Max priority fee per gas: ${web3.utils.fromWei(maxPriorityFeePerGas.toString(), 'gwei')} gwei`);
    } else {
      // Fallback to legacy gasPrice for older networks
      gasPrice = await web3.eth.getGasPrice();
      maxFeePerGas = null;
      maxPriorityFeePerGas = null;
      gasCost = BigInt(gas.toString()) * BigInt(gasPrice.toString());
      
      console.log(`Using legacy transaction format`);
      console.log(`Gas price: ${web3.utils.fromWei(gasPrice.toString(), 'gwei')} gwei`);
    }
    
    const gasCostInEth = web3.utils.fromWei(gasCost.toString(), 'ether');
    
    console.log(`Estimated gas: ${gas}`);
    console.log(`Estimated gas cost: ${gasCostInEth} ETH`);
    
    // Convert to BigInt for safe arithmetic
    const balanceBigInt = BigInt(balance.toString());
    
    // Check if balance is sufficient (add 10% buffer for safety)
    const requiredWithBuffer = (gasCost * BigInt(110)) / BigInt(100);
    if (balanceBigInt < requiredWithBuffer) {
      const shortfall = requiredWithBuffer - balanceBigInt;
      const shortfallInEth = web3.utils.fromWei(shortfall.toString(), 'ether');
      throw new Error(
        `Insufficient funds. Balance: ${balanceInEth} ETH, Required (with buffer): ${web3.utils.fromWei(requiredWithBuffer.toString(), 'ether')} ETH, Shortfall: ${shortfallInEth} ETH. ` +
        `Please add funds to account ${checksummedAccount}`
      );
    }
    
    // Get nonce for the account
    const nonce = await web3.eth.getTransactionCount(checksummedAccount, 'pending');

    // Build transaction object
    const txObject = {
      from: checksummedAccount,
      to: checksummedContractAddress,
      data: tx.encodeABI(),
      gas,
      nonce
    };
    
    // Add EIP-1559 fields if supported, otherwise use legacy gasPrice
    if (baseFeePerGas) {
      txObject.maxFeePerGas = maxFeePerGas.toString();
      txObject.maxPriorityFeePerGas = maxPriorityFeePerGas.toString();
      txObject.type = '0x2'; // EIP-1559 transaction type
    } else {
      txObject.gasPrice = gasPrice.toString();
    }

    // Sign transaction
    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

    if (!signedTx || !signedTx.rawTransaction) {
      throw new Error('Signing transaction failed');
    }

    // Send transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    console.log('Transaction hash:', receipt.transactionHash);
    console.log('Transaction status:', receipt.status, typeof receipt.status);
    console.log('Gas used:', receipt.gasUsed);
    console.log('Receipt logs count:', receipt.logs ? receipt.logs.length : 0);
    
    // Check if transaction reverted (status === 0 or false or '0x0')
    const statusValue = receipt.status;
    const isReverted = statusValue === false || 
                       statusValue === '0x0' || 
                       statusValue === 0 || 
                       statusValue === '0' ||
                       (typeof statusValue === 'string' && statusValue.toLowerCase() === '0x0') ||
                       (typeof statusValue === 'bigint' && statusValue === BigInt(0));
    
    if (isReverted) {
      throw new Error('Transaction reverted. The transaction was included in a block but the execution failed. The account may not be authorized to issue credentials. Check contract requirements and permissions.');
    }

    // Extract credential ID from event
    // The contract emits: CredentialIssued(bytes32 indexed credentialId, string studentId)
    let credentialId = null;
    
    try {
      // Method 1: Try to get from receipt.events (Web3 v1.x style)
      if (receipt.events && receipt.events.CredentialIssued) {
        const evt = receipt.events.CredentialIssued;
        if (evt.returnValues && evt.returnValues.credentialId) {
          credentialId = evt.returnValues.credentialId;
          console.log('Found credentialId from receipt.events:', credentialId);
        }
      } else if (receipt.events) {
        // Try first event if named event not found
        const evt = Object.values(receipt.events)[0];
        if (evt && evt.returnValues && evt.returnValues.credentialId) {
          credentialId = evt.returnValues.credentialId;
          console.log('Found credentialId from first receipt event:', credentialId);
        }
      }
      
      // Method 2: Decode logs using contract instance (Web3 v4.x compatible)
      if (!credentialId && receipt.logs && receipt.logs.length > 0) {
        try {
          // Try to decode logs using the contract's decodeEventLogs method (Web3 v4.x)
          if (contractInstance.events && contractInstance.events.CredentialIssued) {
            for (const log of receipt.logs) {
              try {
                // Check if this log matches the contract address
                if (log.address && log.address.toLowerCase() === checksummedContractAddress.toLowerCase()) {
                  // Try to decode the log
                  const decodedLog = contractInstance.events.CredentialIssued.decode(log);
                  if (decodedLog && decodedLog.returnValues && decodedLog.returnValues.credentialId) {
                    credentialId = decodedLog.returnValues.credentialId;
                    console.log('Found credentialId from decoded log:', credentialId);
                    break;
                  }
                }
              } catch (decodeErr) {
                // Continue to next log if decoding fails
                continue;
              }
            }
          }
          
          // Fallback: Extract from topics directly (works when decode fails)
          if (!credentialId) {
            for (const log of receipt.logs) {
              // Check if this log matches the contract address
              if (log.address && log.address.toLowerCase() === checksummedContractAddress.toLowerCase()) {
                if (log.topics && log.topics.length > 1) {
                  // topics[0] is the event signature hash (keccak256("CredentialIssued(bytes32,string)"))
                  // topics[1] is the indexed credentialId (bytes32)
                  // Compute event signature hash to verify
                  const eventSignature = web3.utils.keccak256('CredentialIssued(bytes32,string)');
                  if (log.topics[0] && log.topics[0].toLowerCase() === eventSignature.toLowerCase()) {
                    credentialId = log.topics[1];
                    console.log('Found credentialId from log topics:', credentialId);
                    break;
                  }
                }
              }
            }
          }
        } catch (logDecodeErr) {
          console.error('Error decoding logs:', logDecodeErr.message);
        }
      }
      
      // Method 3: Query past events as fallback (most reliable for Web3 v4.x)
      if (!credentialId) {
        try {
          const blockNum = typeof receipt.blockNumber === 'bigint' 
            ? Number(receipt.blockNumber) 
            : parseInt(receipt.blockNumber.toString(), 10);
          
          console.log(`Querying past events from block ${blockNum} for transaction ${receipt.transactionHash}`);
          
          // Query events from the block (include a few blocks before/after for safety)
          const fromBlock = Math.max(0, blockNum - 1);
          const toBlock = blockNum + 1;
          
          const pastEvents = await contractInstance.getPastEvents('CredentialIssued', {
            fromBlock: fromBlock,
            toBlock: toBlock,
            filter: {}
          });
          
          console.log(`Found ${pastEvents ? pastEvents.length : 0} past events in blocks ${fromBlock}-${toBlock}`);
          
          if (pastEvents && pastEvents.length > 0) {
            // Find event matching our transaction hash
            for (const event of pastEvents) {
              if (event.transactionHash && event.transactionHash.toLowerCase() === receipt.transactionHash.toLowerCase()) {
                if (event.returnValues && event.returnValues.credentialId) {
                  credentialId = event.returnValues.credentialId;
                  console.log('Found credentialId from getPastEvents (matched tx hash):', credentialId);
                  break;
                }
              }
            }
            // If no match by tx hash, try the most recent event (should be ours if only one)
            if (!credentialId && pastEvents.length > 0) {
              const lastEvent = pastEvents[pastEvents.length - 1];
              if (lastEvent.returnValues && lastEvent.returnValues.credentialId) {
                credentialId = lastEvent.returnValues.credentialId;
                console.log('Found credentialId from getPastEvents (last event):', credentialId);
              }
            }
          }
        } catch (pastEventsErr) {
          console.error('Error querying past events:', pastEventsErr.message);
          console.error('Error details:', pastEventsErr);
        }
      }
      
      // Ensure credentialId is a string (convert from hex if needed)
      if (credentialId) {
        // If it's already a hex string starting with 0x, keep it
        // Otherwise ensure it's properly formatted
        if (typeof credentialId !== 'string') {
          credentialId = credentialId.toString();
        }
        // Ensure it starts with 0x if it's a hex string
        if (!credentialId.startsWith('0x') && /^[0-9a-fA-F]{64}$/.test(credentialId)) {
          credentialId = '0x' + credentialId;
        }
        // Remove 0x prefix if it's not needed (but keep it for consistency)
        // Actually, keep 0x for bytes32 values
      }
      
    } catch (err) {
      console.error('Error extracting credentialId from receipt:', err);
      console.error('Error stack:', err.stack);
    }

    if (!credentialId) {
      console.error('Failed to extract credentialId. Receipt structure:', {
        hasEvents: !!receipt.events,
        eventsKeys: receipt.events ? Object.keys(receipt.events) : [],
        logsCount: receipt.logs ? receipt.logs.length : 0,
        firstLogTopics: receipt.logs && receipt.logs[0] ? receipt.logs[0].topics : null,
        contractAddress: checksummedContractAddress,
        receiptLogs: receipt.logs ? receipt.logs.map(log => ({
          address: log.address,
          topics: log.topics,
          data: log.data ? log.data.substring(0, 50) + '...' : null
        })) : [],
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status
      });
      
      // Provide helpful error message with debugging steps
      let errorMessage = 'Failed to extract credentialId from transaction receipt. ';
      errorMessage += `Transaction hash: ${receipt.transactionHash}, Block: ${receipt.blockNumber}. `;
      errorMessage += `Receipt has ${receipt.logs ? receipt.logs.length : 0} logs. `;
      errorMessage += 'Possible causes: ';
      errorMessage += '1) Contract address mismatch - verify CONTRACT_ADDRESS in .env matches deployed contract. ';
      errorMessage += '2) Transaction reverted silently - check if account is authorized. ';
      errorMessage += '3) Events not being emitted - verify contract code emits CredentialIssued event. ';
      errorMessage += `4) Web3 v4.x event parsing issue - try querying events manually at block ${receipt.blockNumber}.`;
      
      throw new Error(errorMessage);
    }

    console.log('Extracted credentialId:', credentialId);

    // Convert blockNumber from BigInt to Number for MongoDB
    const blockNumber = typeof receipt.blockNumber === 'bigint' 
      ? Number(receipt.blockNumber) 
      : parseInt(receipt.blockNumber.toString(), 10);

    console.log('Block number (converted):', blockNumber, typeof blockNumber);

    return {
      credentialId,
      transactionHash: receipt.transactionHash,
      blockNumber
    };
  } catch (error) {
    console.error('Blockchain error:', error);
    
    // Provide more helpful error messages for common issues
    if (error.message && error.message.includes('insufficient funds')) {
      throw new Error(
        'Insufficient funds for transaction. The account does not have enough ETH to pay for gas fees. ' +
        'Please add funds to your wallet address or use a different account with sufficient balance.'
      );
    }
    
    throw new Error('Failed to issue credential on blockchain: ' + error.message);
  }
}

async function verifyCredentialOnChain(credentialId) {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('CONTRACT_ADDRESS not set in environment');
    }
    
    const checksummedContractAddress = web3.utils.toChecksumAddress(contractAddress);
    const contractInstance = new web3.eth.Contract(
      contractJSON.abi,
      checksummedContractAddress
    );
    
    const result = await contractInstance.methods.verifyCredential(credentialId).call();

    return {
      studentName: result.studentName,
      degree: result.degree,
      major: result.major,
      issueDate: result.issueDate ? new Date(parseInt(result.issueDate) * 1000) : null,
      isValid: result.isValid
    };
  } catch (error) {
    console.error('Verification error:', error);
    throw new Error('Credential not found or verification failed: ' + error.message);
  }
}

module.exports = { issueCredentialOnChain, verifyCredentialOnChain };
