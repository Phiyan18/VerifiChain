import React, { useState, useEffect, useMemo } from 'react';
import { authAPI, credentialAPI } from '../services/api';
import './Login.css'; 


import { 
  Shield, 
  CheckCircle, 
  Database, 
  Globe, 
  Menu, 
  X, 
  Lock, 
  Award, 
  Search, 
  User, 
  Building2, 
  ArrowRight,
  Loader2,
  FileCheck,
  Mail,
  Calendar,
  Hash,
  LogOut,
  Plus,
  Download,
  Share2,
  BarChart3,
  Users,
  Filter,
  Briefcase,
  AlertTriangle,
  Upload,
  XCircle,
  Check,
  Cpu,
  Zap,
  Key
} from 'lucide-react';

// --- CUSTOM STYLES FOR ANIMATIONS ---
const Web3Styles = () => (
  <style>{`
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    @keyframes float-delayed {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }
    @keyframes grid-move {
      0% { background-position: 0 0; }
      100% { background-position: 50px 50px; }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5); }
    }
    @keyframes cyber-scan {
      0% { top: -100%; opacity: 0; }
      50% { opacity: 1; }
      100% { top: 200%; opacity: 0; }
    }
    .web3-grid-bg {
      background-image: 
        linear-gradient(rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)),
        linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
      background-size: cover, 50px 50px, 50px 50px;
      animation: grid-move 20s linear infinite;
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 3s infinite; }
    .cyber-card {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .cyber-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, #3b82f6, transparent);
      opacity: 0.5;
    }
    .cyber-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.3);
      border-color: rgba(59, 130, 246, 0.5);
    }
    .scan-line::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 50px;
      background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.2), transparent);
      animation: cyber-scan 3s linear infinite;
      pointer-events: none;
    }
  `}</style>
);

// --- MOCK DATA ---

const INITIAL_CERTIFICATES = [
  {
    id: 'cert_839201',
    studentName: 'Alex Rivera',
    enrollment: 'E-2023-001',
    dob: '1998-05-15',
    course: 'Bachelor of Computer Science',
    department: 'Engineering',
    university: 'Stanford University',
    issueDate: '2023-06-01',
    status: 'Verified',
    hash: '0x7f83...92a1'
  },
  {
    id: 'cert_992811',
    studentName: 'Sarah Chen',
    enrollment: 'E-2023-002',
    dob: '1999-11-20',
    course: 'Master of Data Science',
    department: 'Data Science',
    university: 'Stanford University',
    issueDate: '2024-01-15',
    status: 'Verified',
    hash: '0x3b21...88c4'
  },
  {
    id: 'cert_112233',
    studentName: 'James Wilson',
    enrollment: 'E-2023-003',
    dob: '1997-03-10',
    course: 'MBA - Finance',
    department: 'Business',
    university: 'Stanford University',
    issueDate: '2023-12-20',
    status: 'Revoked',
    hash: '0x9c44...11b2'
  },
  {
    id: 'cert_445566',
    studentName: 'Emily Zhang',
    enrollment: 'E-2023-004',
    dob: '2000-08-05',
    course: 'Bachelor of Arts in History',
    department: 'Arts & Humanities',
    university: 'Stanford University',
    issueDate: '2023-05-20',
    status: 'Pending',
    hash: '0x1d22...33f1'
  }
];

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null); // Admin User
  const [studentSession, setStudentSession] = useState(null); // Student User
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('vc_admin');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleAdminLogout = () => {
    setUser(null);
    localStorage.removeItem('vc_admin');
    navigate('landing');
  };

  const handleStudentLogout = () => {
    setStudentSession(null);
    navigate('landing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <Web3Styles />
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer gap-2 group" 
              onClick={() => navigate('landing')}
            >
              <img 
                src="/logo.png" 
                alt="VerifiChain Logo" 
                className="h-12 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-200">
                VerifiChain
              </span>
            </div>
              

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {!user && !studentSession && (
                <>
                  <button onClick={() => navigate('landing')} className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">Home</button>
                  <button onClick={() => navigate('student-login')} className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">Student Portal</button>
                </>
              )}
              
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden lg:block">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-blue-400 uppercase tracking-wider font-bold">Admin</div>
                  </div>
                  <button onClick={handleAdminLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate('admin-dashboard')}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/25 border border-blue-400/20"
                  >
                    Dashboard
                  </button>
                </div>
              ) : studentSession ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-300">Welcome, {studentSession.studentName}</span>
                  <button 
                    onClick={handleStudentLogout}
                    className="px-4 py-2 text-sm font-medium border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('admin-login')}
                  className="group relative px-5 py-2 text-sm font-medium text-white rounded-lg overflow-hidden transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 border border-white/10 rounded-lg"></div>
                  <span className="relative flex items-center gap-2">
                     Admin Access <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Router */}
      <main className="pt-16 min-h-screen relative web3-grid-bg">
        {currentPage === 'landing' && <LandingPage navigate={navigate} certificates={certificates} />}
        
        {currentPage === 'admin-login' && <AdminLoginPage navigate={navigate} setUser={setUser} />}
        {currentPage === 'admin-dashboard' && (
          <AdminDashboard 
            user={user} 
            certificates={certificates} 
            setCertificates={setCertificates} 
          />
        )}

        {currentPage === 'student-login' && (
          <StudentLoginPage 
            navigate={navigate} 
            certificates={certificates}
            setStudentSession={setStudentSession}
          />
        )}
        {currentPage === 'student-dashboard' && (
          <StudentDashboard 
            studentSession={studentSession} 
            navigate={navigate}
          />
        )}
      </main>

      <footer className="bg-slate-950/80 backdrop-blur border-t border-slate-900 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm flex items-center justify-center gap-2">
            <Cpu className="w-4 h-4" /> Powered by Ethereum Layer-2
          </p>
          <p className="text-slate-700 text-xs mt-2">© 2025 VerifiChain Network.</p>
        </div>
      </footer>
    </div>
  );
}

// 1. LANDING PAGE (With Verification)

function LandingPage({ navigate, certificates }) {
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); 
  const [foundCert, setFoundCert] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyId) return;
    setVerifyResult('loading');
    
    setTimeout(() => {
      const cert = certificates.find(c => c.id === verifyId);
      if (cert) {
        setFoundCert(cert);
        setVerifyResult(cert.status === 'Verified' ? 'valid' : cert.status === 'Revoked' ? 'revoked' : 'invalid');
      } else {
        setVerifyResult('invalid');
        setFoundCert(null);
      }
    }, 1500);
  };

  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 min-h-screen flex flex-col justify-center">
        
        {/* NEW: Background Video Layer */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 z-10 mix-blend-multiply" /> {/* Dark overlay for text readability */}
          {/*<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 z-10" />  Top/Bottom fade */}
          
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src="/hero-animation.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Floating Background Elements (Kept for depth) */}
        <div className="absolute top-20 right-[10%] w-24 h-24 bg-blue-500/10 rounded-xl blur-md border border-blue-500/20 animate-float pointer-events-none rotate-12 flex items-center justify-center z-0">
          <Database className="w-10 h-10 text-blue-400/50" />
        </div>
        <div className="absolute bottom-40 left-[10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-md border border-indigo-500/20 animate-float-delayed pointer-events-none flex items-center justify-center z-0">
          <Shield className="w-12 h-12 text-indigo-400/50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-blue-500/30 text-blue-300 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Mainnet Live Status: Active
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-white mb-2 drop-shadow-lg">Trustless Academic</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 animate-pulse-glow">
              Verification Layer
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
            Mint tamper-proof degrees on the blockchain. Students own their data identity. Employers verify in milliseconds without intermediaries.
          </p>
          
          {/* Verification Widget */}
          <div className="max-w-xl mx-auto mb-16 relative perspective-1000">
            <div className="bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-2 transform transition-all hover:scale-[1.02] hover:border-blue-500/50 group">
              <div className="pl-4">
                <Search className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Paste Certificate Hash or ID..." 
                className="w-full bg-transparent border-none text-white placeholder-slate-500 px-4 py-3 focus:outline-none focus:ring-0 font-mono text-sm"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
              />
              <button 
                onClick={handleVerify}
                disabled={verifyResult === 'loading'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyResult === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </button>
            </div>

            {/* Verification Result Card */}
            {verifyResult && verifyResult !== 'loading' && (
              <div className="mt-4 absolute w-full animate-fade-in z-20">
                <div className={`p-6 rounded-2xl border backdrop-blur-xl shadow-2xl scan-line overflow-hidden ${
                  verifyResult === 'valid' ? 'bg-slate-900/95 border-green-500/50 shadow-green-900/20' : 
                  verifyResult === 'revoked' ? 'bg-slate-900/95 border-red-500/50 shadow-red-900/20' :
                  'bg-slate-900/95 border-amber-500/50 shadow-amber-900/20'
                }`}>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`p-3 rounded-full ${
                       verifyResult === 'valid' ? 'bg-green-500/10 text-green-400' : 
                       verifyResult === 'revoked' ? 'bg-red-500/10 text-red-400' :
                       'bg-slate-700 text-slate-400'
                    }`}>
                      {verifyResult === 'valid' ? <CheckCircle className="w-8 h-8" /> : 
                       verifyResult === 'revoked' ? <XCircle className="w-8 h-8" /> :
                       <AlertTriangle className="w-8 h-8" />}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${
                        verifyResult === 'valid' ? 'text-green-400' : 
                        verifyResult === 'revoked' ? 'text-red-400' : 'text-slate-200'
                      }`}>
                        {verifyResult === 'valid' ? 'Verified Authentic' : 
                         verifyResult === 'revoked' ? 'Credential Revoked' : 'Not Found on Chain'}
                      </h3>
                      {foundCert ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300 font-mono border-t border-slate-700/50 pt-3 mt-1">
                          <p><span className="text-slate-500">Holder:</span> <br/>{foundCert.studentName}</p>
                          <p><span className="text-slate-500">Issuer:</span> <br/>{foundCert.university}</p>
                          <p className="col-span-2"><span className="text-slate-500">Credential:</span> <span className="text-white">{foundCert.course}</span></p>
                          <p className="col-span-2 text-xs text-slate-600 truncate mt-1">Hash: {foundCert.hash}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">
                          The ID provided was not found in the decentralized ledger.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('student-login')} 
              className="group relative px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">
                <User className="w-5 h-5" /> Student Portal
              </span>
            </button>
            <button 
              onClick={() => navigate('admin-login')} 
              className="group relative px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">
                <Building2 className="w-5 h-5" /> University Node
              </span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// 2. ADMIN AUTHENTICATION (Login, Register, Reset)

function AdminLoginPage({ navigate, setUser }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Form States
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', name: '', university: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      if (mode === 'login') {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        if (response.data.token && response.data.user) {
          const adminUser = {
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            university: response.data.user.organization || 'University'
          };
          setUser(adminUser);
          localStorage.setItem('vc_admin', JSON.stringify(adminUser));
          localStorage.setItem('token', response.data.token);
          navigate('admin-dashboard');
        }
      } 
      else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setMsg({ type: 'error', text: 'Passwords do not match!' });
          setLoading(false);
          return;
        }

        const response = await authAPI.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          organization: formData.university,
          role: 'admin'
        });

        if (response.data.token) {
          setMsg({ type: 'success', text: 'Registration successful! Please login.' });
          setMode('login');
          setFormData({ ...formData, password: '', confirmPassword: '' });
        }
      }
      else if (mode === 'reset') {
        // Password reset functionality would need a separate endpoint
        // For now, show a message
        setMsg({ type: 'error', text: 'Password reset functionality coming soon. Please contact administrator.' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'An error occurred. Please try again.';
      setMsg({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative perspective-1000">
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl animate-pulse delay-700"></div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 relative z-10 cyber-card">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              {mode === 'login' && <Lock className="w-7 h-7 text-white" />}
              {mode === 'register' && <User className="w-7 h-7 text-white" />}
              {mode === 'reset' && <Key className="w-7 h-7 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {mode === 'login' && 'Node Access'}
              {mode === 'register' && 'New Node Registration'}
              {mode === 'reset' && 'Reset Access Key'}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === 'login' && 'Secure authentication for University Admins.'}
              {mode === 'register' && 'Join the network as an issuing authority.'}
              {mode === 'reset' && 'Securely update your admin credentials.'}
            </p>
          </div>

          {msg.text && (
            <div className={`mb-6 p-3 rounded-lg text-sm text-center border ${
              msg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <>
                 <div className="group relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input required type="text" placeholder="Full Name" className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="group relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input required type="text" placeholder="University Name" className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
                </div>
              </>
            )}

            <div className="group relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input required type="email" placeholder="Institutional Email" className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="group relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input required type="password" placeholder={mode === 'reset' ? "New Password" : "Password"} className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            {(mode === 'register' || mode === 'reset') && (
               <div className="group relative">
                <Check className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input required type="password" placeholder="Confirm Password" className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               mode === 'login' ? 'Authenticate' : 
               mode === 'register' ? 'Register Node' : 'Reset Credentials'}
            </button>
          </form>

          {/* Mode Switching */}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            {mode === 'login' && (
              <>
                <p className="text-slate-500">
                  New institution? <button onClick={() => setMode('register')} className="text-blue-400 hover:text-blue-300 font-medium">Apply for Node Access</button>
                </p>
                <button onClick={() => setMode('reset')} className="text-slate-500 hover:text-slate-300">Forgot Password?</button>
              </>
            )}
            {mode === 'register' && (
              <p className="text-slate-500">
                Already have a node? <button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-medium">Login</button>
              </p>
            )}
            {mode === 'reset' && (
              <button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300 font-medium">Back to Login</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. ADMIN DASHBOARD (Enhanced Features)
// ----------------------------------------------------------------------

function AdminDashboard({ user, certificates, setCertificates }) {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [newCert, setNewCert] = useState({
    studentName: '', enrollment: '', dob: '',
    course: 'Bachelor of Computer Science', department: 'Engineering',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [issuedCredential, setIssuedCredential] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch credentials from backend
  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialAPI.getAll();
      // Map backend credentials to UI format
      const mappedCerts = response.data.map(cred => ({
        id: cred.credentialId,
        credentialId: cred.credentialId,
        studentName: cred.studentName,
        enrollment: cred.studentId,
        dob: cred.dateOfBirth || '',
        course: `${cred.degree} - ${cred.major}`,
        degree: cred.degree,
        major: cred.major,
        department: cred.major,
        university: cred.university,
        issueDate: new Date(cred.issueDate).toISOString().split('T')[0],
        status: cred.isRevoked ? 'Revoked' : 'Verified',
        hash: cred.transactionHash,
        transactionHash: cred.transactionHash,
        blockNumber: cred.blockNumber,
        ipfsHash: cred.ipfsHash,
        qrCode: cred.qrCode
      }));
      setCertificates(mappedCerts);
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setErrorMsg('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  // --- STATS LOGIC ---
  const stats = useMemo(() => {
    const total = certificates.length;
    const verified = certificates.filter(c => c.status === 'Verified').length;
    const pending = certificates.filter(c => c.status === 'Pending').length;
    const revoked = certificates.filter(c => c.status === 'Revoked').length;
    
    const deptCounts = certificates.reduce((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});

    return { total, verified, pending, revoked, deptCounts };
  }, [certificates]);

  // --- FILTER LOGIC ---
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cert.enrollment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || cert.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || cert.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // --- ACTIONS ---
  const handleIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setIssuedCredential(null);
    setSuccessMsg('');

    try {
      // Map form data to backend format
      const credentialData = {
        studentId: newCert.enrollment,
        studentName: newCert.studentName,
        degree: newCert.course,
        major: newCert.department,
        dateOfBirth: newCert.dob
      };

      const response = await credentialAPI.issue(credentialData);
      
      if (response.data.success && response.data.credential) {
        const cred = response.data.credential;
        
        // Map backend credential to UI format
        const mappedCert = {
          id: cred.credentialId,
          credentialId: cred.credentialId,
          studentName: cred.studentName,
          enrollment: cred.studentId,
          dob: newCert.dob,
          course: `${cred.degree} - ${cred.major}`,
          degree: cred.degree,
          major: cred.major,
          department: cred.major,
          university: cred.university,
          issueDate: new Date(cred.issueDate).toISOString().split('T')[0],
          status: 'Verified',
          hash: cred.transactionHash,
          transactionHash: cred.transactionHash,
          blockNumber: cred.blockNumber,
          ipfsHash: cred.ipfsHash,
          qrCode: cred.qrCode
        };

        // Update certificates list
        setCertificates([mappedCert, ...certificates]);
        setIssuedCredential(cred);
        setSuccessMsg(`Credential issued successfully for ${newCert.studentName}!`);
        
        // Reset form
        setNewCert({ 
          studentName: '', 
          enrollment: '', 
          dob: '', 
          course: 'Bachelor of Computer Science', 
          department: 'Engineering', 
          date: new Date().toISOString().split('T')[0] 
        });
        
        setTimeout(() => {
          setSuccessMsg('');
          setIssuedCredential(null);
        }, 10000);
        
        setActiveTab('records');
      }
    } catch (err) {
      console.error('Error issuing credential:', err);
      
      // Extract error message from various possible locations
      let errorMsg = 'Failed to issue credential';
      
      if (err.response) {
        // API responded with error
        errorMsg = err.response.data?.error || 
                   err.response.data?.message || 
                   err.response.data?.msg ||
                   `Server error: ${err.response.status} ${err.response.statusText}`;
        
        // Handle specific error types with user-friendly messages
        if (errorMsg.includes('not authorized')) {
          errorMsg = 'Your account is not authorized to issue credentials. Please contact the administrator.';
        } else if (errorMsg.includes('Transaction reverted')) {
          errorMsg = 'Blockchain transaction failed. Your account may not be authorized or there was an issue with the contract.';
        } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('Insufficient funds')) {
          errorMsg = 'Insufficient funds to pay for blockchain transaction fees. Please add funds to your wallet.';
        } else if (errorMsg.includes('Failed to extract credentialId')) {
          errorMsg = 'Credential was issued on blockchain but verification failed. Please check the transaction manually.';
        } else if (errorMsg.includes('gas') || errorMsg.includes('Gas')) {
          errorMsg = 'Transaction failed due to gas issues. Please try again or check your network connection.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMsg = 'Network error: Unable to connect to the server. Please check your internet connection.';
      } else {
        // Error setting up the request
        errorMsg = err.message || 'An unexpected error occurred. Please try again.';
      }
      
      setErrorMsg(errorMsg);
      
      // Auto-hide error after 10 seconds
      setTimeout(() => {
        setErrorMsg('');
      }, 10000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCertStatus = async (id, newStatus) => {
    try {
      const isRevoked = newStatus === 'Revoked';
      await credentialAPI.updateStatus(id, isRevoked);
      
      // Update local state
      const updated = certificates.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      );
      setCertificates(updated);
    } catch (err) {
      console.error('Error updating credential status:', err);
      setErrorMsg('Failed to update credential status');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> {user.university} - <span className="text-slate-500">Registrar Node</span>
          </p>
        </div>
        <div className="bg-slate-800/80 p-1 rounded-xl flex border border-slate-700 backdrop-blur-sm">
          {['overview', 'records', 'issue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab === 'issue' ? 'Issue New' : tab}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-fade-in">
          <XCircle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {/* Issued Credential Display with QR Code */}
      {issuedCredential && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Credential Issued Successfully!
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300"><strong className="text-slate-400">Credential ID:</strong> <span className="font-mono text-blue-300">{issuedCredential.credentialId}</span></p>
                <p className="text-slate-300"><strong className="text-slate-400">Student:</strong> {issuedCredential.studentName}</p>
                <p className="text-slate-300"><strong className="text-slate-400">Transaction:</strong> <span className="font-mono text-xs break-all">{issuedCredential.transactionHash}</span></p>
              </div>
            </div>
            {issuedCredential.qrCode && (
              <div className="flex-shrink-0 bg-white p-4 rounded-lg">
                <img src={issuedCredential.qrCode} alt="QR Code" className="w-32 h-32" />
                <p className="text-xs text-slate-600 text-center mt-2">Scan to verify</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard label="Total Issued" value={stats.total} icon={<FileCheck className="w-5 h-5 text-blue-400" />} color="blue" />
            <StatsCard label="Verified" value={stats.verified} icon={<CheckCircle className="w-5 h-5 text-green-400" />} color="green" />
            <StatsCard label="Pending Approval" value={stats.pending} icon={<Loader2 className="w-5 h-5 text-amber-400" />} color="amber" />
            <StatsCard label="Revoked/Flagged" value={stats.revoked} icon={<XCircle className="w-5 h-5 text-red-400" />} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-xl border border-slate-700 cyber-card">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-400" /> Department Distribution
              </h3>
              <div className="space-y-5">
                {Object.entries(stats.deptCounts).map(([dept, count]) => (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">{dept}</span>
                      <span className="text-slate-400">{count} students</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full relative overflow-hidden" style={{ width: `${(count / stats.total) * 100}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-xl border border-slate-700 cyber-card">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <Zap className="w-5 h-5 text-amber-400" /> Action Items
                 </h3>
                 <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20 shadow-red-500/10 shadow-lg">{stats.revoked} Revoked</span>
               </div>
               <div className="space-y-3">
                 {certificates.filter(c => c.status === 'Revoked').slice(0, 3).map(cert => (
                   <div key={cert.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg flex justify-between items-center group hover:border-blue-500/30 transition-all">
                     <div>
                       <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{cert.studentName}</p>
                       <p className="text-xs text-slate-400">{cert.course}</p>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => toggleCertStatus(cert.id, 'Verified')} className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-all border border-transparent hover:border-green-500/30"><Check className="w-4 h-4"/></button>
                     </div>
                   </div>
                 ))}
                 {stats.revoked === 0 && <div className="text-center py-8 text-slate-500 italic">All records verified. System synced.</div>}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RECORDS TAB (Management) --- */}
      {activeTab === 'records' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-700">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name, ID, or enrollment..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {Object.keys(stats.deptCounts).map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <select 
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 overflow-hidden shadow-xl cyber-card">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400 mb-4" />
                <p className="text-slate-400">Loading credentials...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-700">
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">ID & Name</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Department</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{cert.studentName}</div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                             <Hash className="w-3 h-3" /> {cert.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                            {cert.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <StatusBadge status={cert.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {cert.status === 'Verified' && (
                               <button onClick={() => toggleCertStatus(cert.id, 'Revoked')} className="px-3 py-1 bg-red-900/20 hover:bg-red-900/40 border border-red-800 text-red-300 text-xs font-bold rounded">Revoke</button>
                            )}
                            {cert.status === 'Revoked' && (
                               <button onClick={() => toggleCertStatus(cert.id, 'Verified')} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg shadow-green-900/20">Restore</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCertificates.length === 0 && !loading && (
                  <div className="text-center py-12 text-slate-500">No records found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ISSUE TAB --- */}
      {activeTab === 'issue' && (
        <div className="space-y-6 animate-fade-in">
           {/* Bulk Upload Placeholder */}
           <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700 border-dashed p-10 text-center hover:bg-slate-800/80 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                 <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Bulk Import via CSV</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Batch process multiple student records securely. Supports standardized templates.</p>
              <button className="px-6 py-2 text-sm text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors">Select Data File</button>
           </div>

           <div className="flex items-center gap-4 py-4 opacity-50">
              <div className="h-px bg-slate-700 flex-1"></div>
              <span className="text-slate-500 text-sm font-mono">SINGLE ENTRY MODE</span>
              <div className="h-px bg-slate-700 flex-1"></div>
           </div>

           <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 max-w-2xl mx-auto shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-400" /> Issue Credential
            </h3>
            
            <form onSubmit={handleIssue} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Student Name</label>
                  <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                    value={newCert.studentName} onChange={e => setNewCert({...newCert, studentName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Enrollment ID</label>
                  <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                     value={newCert.enrollment} onChange={e => setNewCert({...newCert, enrollment: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
                  <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none [color-scheme:dark] transition-all" 
                     value={newCert.dob} onChange={e => setNewCert({...newCert, dob: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Issue Date</label>
                  <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none [color-scheme:dark] transition-all" 
                     value={newCert.date} onChange={e => setNewCert({...newCert, date: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Department</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                     value={newCert.department} onChange={e => setNewCert({...newCert, department: e.target.value})} >
                    <option>Engineering</option>
                    <option>Data Science</option>
                    <option>Business</option>
                    <option>Arts & Humanities</option>
                    <option>Law</option>
                    <option>Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Degree / Course</label>
                  <input required type="text" placeholder="e.g. B.Sc Computer Science" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                     value={newCert.course} onChange={e => setNewCert({...newCert, course: e.target.value})} />
                </div>
              </div>

              <button disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 border border-blue-500/20">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mint to Blockchain'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function StatsCard({ label, value, icon, color }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-xl border border-slate-700 hover:border-blue-500/30 transition-all cyber-card group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <div className={`p-2 rounded-lg bg-${color}-500/10 group-hover:bg-${color}-500/20 transition-colors`}>{icon}</div>
      </div>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Verified: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Revoked: 'bg-red-500/10 text-red-400 border-red-500/20'
  };
  
  const Icons = {
    Verified: CheckCircle,
    Pending: Loader2,
    Revoked: XCircle
  };

  const Icon = Icons[status] || CheckCircle;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

// ----------------------------------------------------------------------
// 3. STUDENT LOGIN & DASHBOARD (Updated with Aesthetics)
// ----------------------------------------------------------------------

function StudentLoginPage({ navigate, certificates, setStudentSession }) {
  const [formData, setFormData] = useState({ enrollment: '', dob: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.studentLogin({
        enrollment: formData.enrollment,
        dob: formData.dob
      });

      if (response.data.success && response.data.credential) {
        const cred = response.data.credential;
        // Map backend credential data to match UI expectations
        const studentData = {
          id: cred.credentialId,
          credentialId: cred.credentialId,
          studentName: cred.studentName,
          enrollment: cred.studentId,
          dob: formData.dob,
          course: `${cred.degree} - ${cred.major}`,
          degree: cred.degree,
          major: cred.major,
          department: cred.major,
          university: cred.university,
          issueDate: new Date(cred.issueDate).toISOString().split('T')[0],
          status: cred.isRevoked ? 'Revoked' : 'Verified',
          hash: cred.transactionHash,
          transactionHash: cred.transactionHash,
          blockNumber: cred.blockNumber,
          ipfsHash: cred.ipfsHash,
          qrCode: cred.qrCode
        };
        setStudentSession(studentData);
        navigate('student-dashboard');
      } else {
        setError('No credential found. Please check your credentials.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      setError(errorMsg);
      console.error('Student login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 cyber-card">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <User className="w-6 h-6 text-blue-400" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Student Access</h2>
           <p className="text-slate-400 text-sm">Retrieve your blockchain-verified credentials.</p>
        </div>
        
        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
             <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
             <input type="text" required className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" placeholder="Enrollment ID" value={formData.enrollment} onChange={e => setFormData({...formData, enrollment: e.target.value})} />
          </div>
          <div className="relative">
             <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
             <input type="date" required className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none [color-scheme:dark] transition-all" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          </div>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/30 flex justify-center">
            {loading ? <Loader2 className="animate-spin" /> : 'View Credential'}
          </button>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ studentSession }) {
  if (!studentSession) return null;
  
  const credentialCode = studentSession.credentialId || studentSession.id;
  
  // Generate verification URL
  const verificationUrl = `${window.location.origin}/verify/${credentialCode}`;
  
  // Download handler
  const handleDownload = () => {
    if (studentSession.qrCode) {
      // Download QR code image
      const link = document.createElement('a');
      link.href = studentSession.qrCode;
      link.download = `credential-${credentialCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Download as text file with credential details
      const credentialText = `VERIFICHAIN CREDENTIAL

Student Name: ${studentSession.studentName}
Credential ID: ${credentialCode}
Degree: ${studentSession.degree || 'N/A'}
Major: ${studentSession.major || 'N/A'}
University: ${studentSession.university || 'N/A'}
Issue Date: ${new Date(studentSession.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Transaction Hash: ${studentSession.transactionHash || studentSession.hash || 'N/A'}
Block Number: ${studentSession.blockNumber || 'N/A'}
IPFS Hash: ${studentSession.ipfsHash || 'N/A'}

Verify this credential at: ${verificationUrl}
`;
      const blob = new Blob([credentialText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credential-${credentialCode}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: 'VerifiChain Credential',
      text: `Check out my credential: ${studentSession.studentName} - ${studentSession.course || `${studentSession.degree} - ${studentSession.major}`}`,
      url: verificationUrl
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(verificationUrl);
        alert('Verification link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(verificationUrl);
          alert('Verification link copied to clipboard!');
        } catch (clipboardErr) {
          alert('Unable to share. Please copy the link manually: ' + verificationUrl);
        }
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-white">My Credential</h1>
         <div className="flex gap-3">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors"><Download className="w-4 h-4"/> Download</button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"><Share2 className="w-4 h-4"/> Share</button>
         </div>
      </div>
      
      <div className="bg-white text-slate-900 p-8 md:p-16 rounded-xl shadow-2xl text-center border-[12px] border-slate-200 relative overflow-hidden">
        {/* Paper texture overlay could go here */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
        
        <div className="mb-8 flex justify-center items-center gap-2 relative z-10">
           <Building2 className="w-8 h-8 text-slate-700"/> 
           <span className="font-bold text-xl uppercase tracking-widest border-b-2 border-slate-900 pb-1">{studentSession.university}</span>
        </div>
        
        <p className="italic text-slate-500 font-serif text-lg">This certifies that</p>
        <h2 className="text-4xl md:text-5xl font-bold my-6 font-serif text-slate-900">{studentSession.studentName}</h2>
        <p className="italic text-slate-500 font-serif text-lg">has successfully completed</p>
        <h3 className="text-2xl md:text-3xl font-bold text-blue-900 my-6 font-serif">{studentSession.course || `${studentSession.degree} - ${studentSession.major}`}</h3>
        <p className="text-slate-500 mb-8 font-serif">Given on {new Date(studentSession.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        {/* Credential Code - Prominently Displayed */}
        <div className="flex flex-col items-center mb-8 gap-3">
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 px-6 py-4 rounded-xl border-2 border-blue-200 flex items-center gap-3 shadow-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                 <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Credential Code</div>
                 <div className="text-lg font-mono font-bold">{credentialCode}</div>
              </div>
           </div>
           <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full border border-amber-200 flex items-center gap-2 text-sm font-bold shadow-sm">
              <CheckCircle className="w-4 h-4" /> Verified on Blockchain
           </div>
        </div>

        {/* QR Code */}
        {studentSession.qrCode && (
          <div className="flex justify-center items-center mb-8 relative z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-slate-200">
              <img src={studentSession.qrCode} alt="QR Code" className="w-48 h-48" />
              <p className="text-xs text-slate-500 mt-2">Scan to verify</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500 font-mono">
           <div className="text-center">
              <div className="text-slate-400 mb-1">Transaction Hash</div>
              <div className="text-slate-700 break-all">{studentSession.transactionHash || studentSession.hash || 'N/A'}</div>
           </div>
           {studentSession.blockNumber && (
              <div className="text-center">
                 <div className="text-slate-400 mb-1">Block Number</div>
                 <div className="text-slate-700">#{studentSession.blockNumber}</div>
              </div>
           )}
           {studentSession.ipfsHash && (
              <div className="text-center">
                 <div className="text-slate-400 mb-1">IPFS Hash</div>
                 <div className="text-slate-700 break-all">{studentSession.ipfsHash}</div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}