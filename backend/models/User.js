const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'university', 'student', 'verifier'],
        default: 'verifier'
    },
    name: { 
        type: String, 
        required: true 
    },
    organization: String,
    walletAddress: String,
    dateOfBirth: {
        type: String,
        required: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', UserSchema);