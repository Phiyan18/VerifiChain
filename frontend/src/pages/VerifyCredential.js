import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyAPI } from '../services/api';
import './VerifyCredential.css';

function VerifyCredential() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [credentialId, setCredentialId] = useState(id || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            verifyCredential(id);
        }
    }, [id]);

    const verifyCredential = async (cId) => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await verifyAPI.verify(cId);
            setResult(response.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Verification failed';
            setError(String(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        verifyCredential(credentialId);
    };

    return (
        <div className="verify-container">
            <div className="verify-box">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>

                <h2>Verify Credential</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Credential ID"
                        value={credentialId}
                        onChange={(e) => setCredentialId(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                {error && (
                    <div className="result invalid">
                        <h3>✗ Verification Failed</h3>
                        <p>{error}</p>
                    </div>
                )}

                {result && (
                    <div className={`result ${result.valid ? 'valid' : 'invalid'}`}>
                        {result.valid ? (
                            <>
                                <h3>✓ Valid Credential</h3>
                                <div className="credential-details">
                                    <p><strong>Student Name:</strong> {result.credential.studentName}</p>
                                    <p><strong>Degree:</strong> {result.credential.degree}</p>
                                    <p><strong>Major:</strong> {result.credential.major}</p>
                                    <p><strong>University:</strong> {result.credential.university}</p>
                                    <p><strong>Issue Date:</strong> {new Date(result.credential.issueDate).toLocaleDateString()}</p>
                                    
                                    <div className="blockchain-info">
                                        <h4>Blockchain Details</h4>
                                        <p><strong>Transaction Hash:</strong></p>
                                        <p className="hash">{result.blockchain.transactionHash}</p>
                                        <p><strong>Block Number:</strong> {result.blockchain.blockNumber}</p>
                                        <p><strong>IPFS Hash:</strong></p>
                                        <p className="hash">{result.blockchain.ipfsHash}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <h3>✗ Invalid or Revoked Credential</h3>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyCredential;