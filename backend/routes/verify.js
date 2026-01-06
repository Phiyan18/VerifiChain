const express = require('express');
const router = express.Router();
const { verifyCredentialOnChain } = require('../services/blockchain');
const Credential = require('../models/Credential');

// Verify credential
router.get('/:credentialId', async (req, res) => {
    try {
        const { credentialId } = req.params;
        
        console.log('Verifying credential:', credentialId);
        
        // 1. Verify on blockchain
        const blockchainData = await verifyCredentialOnChain(credentialId);
        
        // 2. Get from database
        const dbCredential = await Credential.findOne({ credentialId });
        
        if (!dbCredential) {
            return res.status(404).json({ 
                valid: false,
                message: 'Credential not found in database' 
            });
        }
        
        res.json({
            valid: blockchainData.isValid && !dbCredential.isRevoked,
            credential: {
                studentName: blockchainData.studentName,
                degree: blockchainData.degree,
                major: blockchainData.major,
                university: dbCredential.university,
                issueDate: blockchainData.issueDate,
                credentialId: credentialId
            },
            blockchain: {
                transactionHash: dbCredential.transactionHash,
                blockNumber: dbCredential.blockNumber,
                ipfsHash: dbCredential.ipfsHash
            }
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            valid: false,
            error: error.message 
        });
    }
});

module.exports = router;