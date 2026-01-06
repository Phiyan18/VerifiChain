import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { credentialAPI } from '../services/api';
import './IssueCredential.css';

function IssueCredential() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentId: '',
        studentName: '',
        degree: '',
        major: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await credentialAPI.issue(formData);
            setResult(response.data);
            
            // Reset form
            setFormData({
                studentId: '',
                studentName: '',
                degree: '',
                major: ''
            });
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to issue credential';
            setError(String(errorMsg));
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="issue-container">
            <div className="issue-box">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>

                <h2>Issue New Credential</h2>

                {error && <div className="error">{error}</div>}
                {result && (
                    <div className="success">
                        <h3>✓ Credential Issued Successfully!</h3>
                        <p><strong>Credential ID:</strong> {result.credential.credentialId}</p>
                        <p><strong>Transaction:</strong> {result.credential.transactionHash}</p>
                        {result.credential.qrCode && (
                            <div className="qr-display">
                                <img src={result.credential.qrCode} alt="QR Code" />
                                <p>Scan to verify</p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Student ID</label>
                        <input
                            type="text"
                            placeholder="e.g., STU2024001"
                            value={formData.studentId}
                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Student Name</label>
                        <input
                            type="text"
                            placeholder="e.g., John Doe"
                            value={formData.studentName}
                            onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Degree</label>
                        <input
                            type="text"
                            placeholder="e.g., Bachelor of Technology"
                            value={formData.degree}
                            onChange={(e) => setFormData({...formData, degree: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Major/Specialization</label>
                        <input
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={formData.major}
                            onChange={(e) => setFormData({...formData, major: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Issuing Credential...' : 'Issue Credential'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default IssueCredential;