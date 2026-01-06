import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            if (error.response.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('vc_admin');
                // Optionally redirect to login page
                if (window.location.pathname !== '/admin-login') {
                    window.location.href = '/admin-login';
                }
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error: No response from server. Make sure the backend is running on', API_URL);
        } else {
            // Error setting up the request
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    studentLogin: (data) => api.post('/auth/student/login', data)
};

export const credentialAPI = {
    issue: (data) => api.post('/credentials/issue', data),
    getAll: () => api.get('/credentials/list'),
    getOne: (id) => api.get(`/credentials/${id}`),
    getByStudentId: (studentId) => api.get(`/credentials/student/${studentId}`),
    updateStatus: (id, isRevoked) => api.patch(`/credentials/${id}/status`, { isRevoked })
};

export const verifyAPI = {
    verify: (id) => api.get(`/verify/${id}`)
};

export default api;