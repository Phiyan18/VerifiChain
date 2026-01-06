const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Credential = require('../models/Credential');

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, organization } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        user = new User({
            email,
            password: hashedPassword,
            name,
            role: role || 'verifier',
            organization
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role, walletAddress: user.walletAddress, organization: user.organization },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Student Login - Find credential by studentId/enrollment and DOB
router.post('/student/login', async (req, res) => {
    try {
        const { enrollment, dob } = req.body;
        
        if (!enrollment) {
            return res.status(400).json({ message: 'Enrollment ID is required' });
        }
        
        // Find credential by studentId (enrollment)
        const credential = await Credential.findOne({ studentId: enrollment });
        
        if (!credential) {
            return res.status(404).json({ message: 'No credential found for this enrollment ID' });
        }
        
        // If DOB is provided and stored in credential, verify it
        if (dob && credential.dateOfBirth) {
            if (credential.dateOfBirth !== dob) {
                return res.status(400).json({ message: 'Invalid date of birth' });
            }
        }
        
        // Check if credential is revoked
        if (credential.isRevoked) {
            return res.status(403).json({ message: 'This credential has been revoked' });
        }
        
        // Return credential data for student session
        res.json({
            success: true,
            credential: {
                credentialId: credential.credentialId,
                studentId: credential.studentId,
                studentName: credential.studentName,
                degree: credential.degree,
                major: credential.major,
                university: credential.university,
                issueDate: credential.issueDate,
                transactionHash: credential.transactionHash,
                blockNumber: credential.blockNumber,
                ipfsHash: credential.ipfsHash,
                qrCode: credential.qrCode,
                isRevoked: credential.isRevoked
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;