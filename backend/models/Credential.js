const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
    credentialId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    studentId: { 
        type: String, 
        required: true 
    },
    studentName: { 
        type: String, 
        required: true 
    },
    dateOfBirth: { 
        type: String, 
        required: false 
    },
    degree: { 
        type: String, 
        required: true 
    },
    major: { 
        type: String, 
        required: true 
    },
    university: { 
        type: String, 
        required: true 
    },
    issueDate: { 
        type: Date, 
        required: true 
    },
    ipfsHash: { 
        type: String, 
        required: true 
    },
    transactionHash: { 
        type: String, 
        required: true 
    },
    blockNumber: Number,
    isRevoked: { 
        type: Boolean, 
        default: false 
    },
    qrCode: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Credential', CredentialSchema);