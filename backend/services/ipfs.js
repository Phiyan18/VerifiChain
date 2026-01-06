const { create } = require('ipfs-http-client');
const crypto = require('crypto');

// Initialize IPFS client with error handling
let ipfs = null;

// Create IPFS client (doesn't throw until first use)
try {
    // For public gateways (like Infura, Pinata)
    if (process.env.IPFS_GATEWAY_URL) {
        ipfs = create({
            url: process.env.IPFS_GATEWAY_URL
        });
        console.log('✅ IPFS client initialized with gateway:', process.env.IPFS_GATEWAY_URL);
    } else {
        const ipfsConfig = {
            host: process.env.IPFS_HOST || '127.0.0.1',
            port: process.env.IPFS_PORT || 5001,
            protocol: process.env.IPFS_PROTOCOL || 'http'
        };
        ipfs = create(ipfsConfig);
        console.log('✅ IPFS client initialized:', `${ipfsConfig.protocol}://${ipfsConfig.host}:${ipfsConfig.port}`);
    }
} catch (error) {
    console.warn('⚠️  IPFS client creation failed, will use fallback mode:', error.message);
    ipfs = null;
}

// Generate a mock IPFS hash when IPFS is unavailable
function generateMockHash(data, metadata) {
    const content = JSON.stringify({ data, metadata, timestamp: new Date().toISOString() });
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    // Return in IPFS CID format (Qm... for v0 or bafy... for v1)
    // Using a simple base58-like encoding for demo purposes
    return `Qm${hash.substring(0, 44)}`; // Mock IPFS hash format
}

async function uploadToIPFS(data, metadata) {
    // If IPFS is disabled or not configured, use fallback
    if (process.env.IPFS_DISABLED === 'true' || !ipfs) {
        console.warn('⚠️  IPFS unavailable, using fallback hash generation');
        const mockHash = generateMockHash(data, metadata);
        console.log('📝 Generated mock IPFS hash:', mockHash);
        return mockHash;
    }
    
    try {
        const document = {
            data: data,
            metadata: metadata,
            timestamp: new Date().toISOString()
        };
        
        const result = await ipfs.add(JSON.stringify(document));
        return result.path || result.cid.toString();
    } catch (error) {
        console.error('❌ IPFS upload error:', error.message);
        
        // If connection fails, fall back to mock hash
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            console.warn('⚠️  IPFS connection failed, using fallback hash generation');
            const mockHash = generateMockHash(data, metadata);
            console.log('📝 Generated mock IPFS hash:', mockHash);
            return mockHash;
        }
        
        throw new Error('Failed to upload to IPFS: ' + error.message);
    }
}

async function retrieveFromIPFS(hash) {
    // If IPFS is disabled or not configured, return mock data
    if (process.env.IPFS_DISABLED === 'true' || !ipfs) {
        console.warn('⚠️  IPFS unavailable, cannot retrieve data for hash:', hash);
        return {
            data: 'Data not available (IPFS offline)',
            metadata: { note: 'This is a mock hash generated when IPFS was unavailable' },
            timestamp: new Date().toISOString()
        };
    }
    
    try {
        const stream = ipfs.cat(hash);
        let data = '';
        
        for await (const chunk of stream) {
            data += chunk.toString();
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ IPFS retrieval error:', error.message);
        
        // If connection fails, return mock data
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            console.warn('⚠️  IPFS connection failed, returning mock data');
            return {
                data: 'Data not available (IPFS connection failed)',
                metadata: { note: 'This is a mock response due to IPFS unavailability' },
                timestamp: new Date().toISOString()
            };
        }
        
        throw new Error('Failed to retrieve from IPFS: ' + error.message);
    }
}

module.exports = { uploadToIPFS, retrieveFromIPFS };