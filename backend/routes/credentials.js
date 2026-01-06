const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const { uploadToIPFS } = require('../services/ipfs');
const { issueCredentialOnChain } = require('../services/blockchain');
const Credential = require('../models/Credential');

// Issue credential
router.post('/issue', auth, async (req, res) => {
    try {
        const { studentId, studentName, degree, major, documentData } = req.body;
        
        console.log('Issuing credential for:', studentName);
        
        // 1. Upload to IPFS
        const ipfsHash = await uploadToIPFS(documentData || 'Sample document', {
            studentId,
            degree,
            major,
            university: req.user.organization
        });
        
        console.log('Uploaded to IPFS:', ipfsHash);
        
        // 2. Issue on blockchain
        const blockchainResult = await issueCredentialOnChain({
            studentId,
            studentName,
            degree,
            major,
            ipfsHash
        });
        
        console.log('Issued on blockchain:', blockchainResult.credentialId);
        
        // 3. Generate QR code
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationUrl = `${frontendUrl}/verify/${blockchainResult.credentialId}`;
        const qrCode = await QRCode.toDataURL(verificationUrl);
        
        // 4. Save to database
        const credential = new Credential({
            credentialId: blockchainResult.credentialId,
            studentId,
            studentName,
            degree,
            major,
            university: req.user.organization || 'Demo University',
            issueDate: new Date(),
            ipfsHash,
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            qrCode,
            dateOfBirth: req.body.dateOfBirth || null
        });
        
        await credential.save();
        
        res.json({
            success: true,
            credential,
            message: 'Credential issued successfully'
        });
        
    } catch (error) {
        console.error('Error issuing credential:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.toString()
        });
    }
});

// Get all credentials
router.get('/list', auth, async (req, res) => {
    try {
        const credentials = await Credential.find()
            .sort({ issueDate: -1 });
        res.json(credentials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Get single credential
router.get('/:id', async (req, res) => {
    try {
        const credential = await Credential.findOne({ 
            credentialId: req.params.id 
        });
        
        if (!credential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        
        res.json(credential);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Update credential status (revoke/unrevoke)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { isRevoked } = req.body;
        const credential = await Credential.findOne({ 
            credentialId: req.params.id 
        });
        
        if (!credential) {
            return res.status(404).json({ message: 'Credential not found' });
        }
        
        credential.isRevoked = isRevoked;
        await credential.save();
        
        res.json({
            success: true,
            credential,
            message: `Credential ${isRevoked ? 'revoked' : 'verified'} successfully`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;