import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { credentialAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        try {
            const response = await credentialAPI.getAll();
            setCredentials(response.data);
        } catch (error) {
            console.error('Error fetching credentials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>VerifiChain Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="dashboard-nav">
                <button onClick={() => navigate('/issue')}>Issue New Credential</button>
                <button onClick={() => navigate('/verify')}>Verify Credential</button>
            </div>

            <div className="credentials-section">
                <h2>Issued Credentials</h2>
                
                {loading ? (
                    <p>Loading...</p>
                ) : credentials.length === 0 ? (
                    <p>No credentials issued yet.</p>
                ) : (
                    <div className="credentials-grid">
                        {credentials.map(cred => (
                            <div key={cred.credentialId} className="credential-card">
                                <h3>{cred.studentName}</h3>
                                <p><strong>Degree:</strong> {cred.degree}</p>
                                <p><strong>Major:</strong> {cred.major}</p>
                                <p><strong>Student ID:</strong> {cred.studentId}</p>
                                <p><strong>Issued:</strong> {new Date(cred.issueDate).toLocaleDateString()}</p>
                                {cred.qrCode && (
                                    <div className="qr-code">
                                        <img src={cred.qrCode} alt="QR Code" />
                                    </div>
                                )}
                                <button onClick={() => navigate(`/verify/${cred.credentialId}`)}>
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
