import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, MessageSquare, Calendar, Image as ImageIcon, LogOut, Menu, X, Briefcase, Shield, QrCode, Users, UserCog } from 'lucide-react';
import { User, UserRole } from './types';
import { storageService } from './services/storageService';
import { Auth } from './components/Auth';
import { HeroCarousel } from './components/HeroCarousel';
import { Feed } from './components/Feed';
import { ChatInterface } from './components/ChatInterface';
import { AIStudio } from './components/AIStudio';
import { EventManager } from './components/EventManager';
import { Assistant } from './components/Assistant';
import { SundayAttendance } from './components/SundayAttendance';
import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';

const NavLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

// Admin Panel Component
const AdminPanel = () => {
    const [users, setUsers] = useState<User[]>([]);
    
    useEffect(() => {
        setUsers(storageService.getAllUsers());
    }, []);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        storageService.updateUserRole(userId, newRole);
        setUsers(storageService.getAllUsers());
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <UserCog className="text-primary" /> Member Management
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Current Role</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                    <span className="font-medium text-gray-900">{u.name}</span>
                                </td>
                                <td className="p-4 text-gray-600">{u.email}</td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                        u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-700' :
                                        u.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-700' :
                                        u.role === UserRole.MEMBER ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>{u.role}</span>
                                </td>
                                <td className="p-4">
                                    <select 
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                        className="text-sm border rounded p-1"
                                        disabled={u.email === 'abdul.salam.bt.2024@miet.ac.in' || u.email === 'hayatamr9608@gmail.com'}
                                    >
                                        <option value={UserRole.USER}>User</option>
                                        <option value={UserRole.MEMBER}>Member</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Profile Component
const ProfileSettings = ({ user, onUpdate }: { user: User, onUpdate: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(user);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');

    const handleSave = () => {
        storageService.updateProfile(user.id, formData);
        onUpdate();
        setIsEditing(false);
    };

    const start2FASetup = async () => {
        const newSecret = storageService.generate2FASecret();
        setSecret(newSecret);
        
        const totp = new OTPAuth.TOTP({
            issuer: 'PARIVARTAN',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(newSecret)
        });

        const uri = totp.toString();
        const url = await QRCode.toDataURL(uri);
        setQrCodeUrl(url);
        setShow2FASetup(true);
    };

    const confirm2FA = () => {
        const isValid = storageService.verify2FAToken(secret, token);
        if (isValid) {
            storageService.updateProfile(user.id, { twoFactorEnabled: true, twoFactorSecret: secret });
            onUpdate();
            setShow2FASetup(false);
            alert('2FA Enabled Successfully!');
        } else {
            alert('Invalid Code');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                <div className="flex items-start justify-between">
                     <div className="flex items-center gap-6">
                        <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-blue-50" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-blue-100 text-primary text-xs px-3 py-1 rounded-full font-bold">{user.role}</span>
                                {user.twoFactorEnabled && <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"><Shield size={12} /> 2FA Secured</span>}
                            </div>
                        </div>
                    </div>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="text-primary font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition">Edit Profile</button>}
                </div>
                
                {isEditing ? (
                    <div className="mt-6 space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea 
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" 
                                rows={3}
                                value={formData.bio || ''} 
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" 
                                    value={formData.location || ''} 
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                                <input 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none" 
                                    value={formData.social?.twitter || ''} 
                                    onChange={e => setFormData({...formData, social: {...formData.social, twitter: e.target.value}})}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-4">
                             <button onClick={() => setIsEditing(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
                            <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        <h3 className="font-bold text-gray-900 mb-2">About</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{user.bio || "No bio added yet. Tell the community about yourself!"}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Location</span>
                                <span className="font-medium text-gray-900">{user.location || "Not specified"}</span>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Social</span>
                                <div className="flex gap-3 text-sm text-primary font-medium">
                                    {user.social?.twitter && <a href="#" className="hover:underline">Twitter</a>}
                                    {user.social?.linkedin && <a href="#" className="hover:underline">LinkedIn</a>}
                                    {!user.social?.twitter && !user.social?.linkedin && <span className="text-gray-400 font-normal">No links added</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Security Settings */}
            {(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MEMBER) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Shield size={20} /> Two-Factor Authentication</h3>
                    
                    {!user.twoFactorEnabled ? (
                        !show2FASetup ? (
                            <div>
                                <p className="text-gray-500 mb-4">Secure your account with Google Authenticator.</p>
                                <button onClick={start2FASetup} className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition">
                                    <QrCode size={18} /> Enable 2FA
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="bg-white p-2 border rounded-lg">
                                        <img src={qrCodeUrl} className="w-40 h-40" alt="QR Code" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-2">Scan with Authenticator App</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Open Google Authenticator on your phone, scan the QR code, and enter the 6-digit code below to verify.
                                        </p>
                                        <div className="flex gap-2">
                                            <input 
                                                className="border border-gray-300 p-3 rounded-lg w-40 text-center tracking-widest text-xl focus:ring-2 focus:ring-primary outline-none" 
                                                placeholder="000000" 
                                                maxLength={6}
                                                value={token}
                                                onChange={e => setToken(e.target.value.replace(/\D/g,''))}
                                            />
                                            <button onClick={confirm2FA} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">Verify</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-100">
                            <span className="text-green-800 font-medium flex items-center gap-2"><Shield size={18} /> 2FA is active on your account</span>
                            <button className="text-red-500 text-sm hover:underline font-medium">Disable</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Donation Component
const DonationBanner = () => (
    <div className="bg-gradient-to-r from-primary to-indigo-600 text-white p-6 rounded-2xl shadow-lg mx-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <h3 className="text-xl font-bold mb-2">Support PARIVARTAN</h3>
            <p className="opacity-90 text-sm max-w-lg">Your contribution helps us organize village visits, educational programs, and community events. Every rupee counts.</p>
        </div>
        <div className="bg-white p-3 rounded-xl flex items-center gap-4 shadow-lg">
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center rounded border border-gray-200">
                <QrCode className="text-gray-800" />
            </div>
            <div className="text-gray-900">
                <p className="text-xs font-bold uppercase text-gray-500">Donate via UPI</p>
                <p className="font-mono font-bold text-lg">parivartan@upi</p>
            </div>
        </div>
    </div>
);

const HomeLayout = ({ user, onLogin }: { user: User | null, onLogin: () => void }) => (
    <div className="pb-20">
        <HeroCarousel userRole={user?.role || UserRole.USER} />
        <div className="max-w-4xl mx-auto mt-8">
            <DonationBanner />
            <h2 className="px-4 text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" /> Community Feed
            </h2>
            <Feed currentUser={user} onLoginRequest={onLogin} />
        </div>
    </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [, forceUpdate] = useState({}); // Hack to force re-render on profile update

  useEffect(() => {
    const storedUser = storageService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const u = storageService.getUser();
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = () => {
    storageService.clearUser();
    setUser(null);
    window.location.hash = '/';
  };

  const handleProfileUpdate = () => {
      const u = storageService.getUser();
      setUser(u);
      forceUpdate({});
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center text-primary"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
        {/* Auth Modal */}
        <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} onLogin={handleLogin} />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm/50 backdrop-blur-md bg-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="font-extrabold text-primary text-2xl tracking-tight flex items-center gap-2">
                        PARIVARTAN
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <input 
                            type="text" 
                            placeholder="Search members, posts, or events..." 
                            className="w-full bg-gray-100 border-transparent rounded-full px-5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon={Home} label="Home" />
                        
                        {/* Protected Routes Visibility */}
                        {user && user.role !== UserRole.USER && (
                            <>
                                <NavLink to="/chat" icon={MessageSquare} label="Chat" />
                                <NavLink to="/studio" icon={ImageIcon} label="AI Studio" />
                            </>
                        )}
                        <NavLink to="/events" icon={Calendar} label="Events" />
                        
                        {user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                            <>
                                <NavLink to="/attendance" icon={Briefcase} label="Visits" />
                                <NavLink to="/admin" icon={Users} label="Admin" />
                            </>
                        )}
                    </nav>

                    <div className="hidden md:flex items-center gap-4 ml-4">
                        {user ? (
                            <>
                                <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-full transition">
                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                                    <span>{user.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition p-2" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setShowAuth(true)}
                                className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition shadow-md"
                            >
                                Join / Login
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 p-2">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                         </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2 animate-fade-in shadow-xl absolute w-full z-40">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">Home</Link>
                    <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">Events</Link>
                    
                    {user && (
                        <>
                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">My Profile</Link>
                            {user.role !== UserRole.USER && (
                                <>
                                    <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">Chat</Link>
                                    <Link to="/studio" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">AI Studio</Link>
                                </>
                            )}
                            {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                                <Link to="/attendance" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">Sunday Visits</Link>
                            )}
                            <button onClick={handleLogout} className="w-full text-left py-3 px-4 text-red-500 font-medium mt-2 hover:bg-red-50 rounded-lg">Logout</button>
                        </>
                    )}
                    {!user && (
                        <button onClick={() => { setMobileMenuOpen(false); setShowAuth(true); }} className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4">
                            Sign In / Sign Up
                        </button>
                    )}
                </div>
            )}
        </header>

        <main className="flex-1">
            <Routes>
                <Route path="/" element={<HomeLayout user={user} onLogin={() => setShowAuth(true)} />} />
                <Route path="/events" element={<EventManager />} />
                
                {/* Protected Routes */}
                <Route path="/profile" element={user ? <ProfileSettings user={user} onUpdate={handleProfileUpdate} /> : <Navigate to="/" />} />
                <Route path="/chat" element={user && user.role !== UserRole.USER ? <ChatInterface currentUser={user} /> : <Navigate to="/" />} />
                <Route path="/studio" element={user && user.role !== UserRole.USER ? <AIStudio /> : <Navigate to="/" />} />
                <Route path="/attendance" element={user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) ? <SundayAttendance currentUser={user} /> : <Navigate to="/" />} />
                <Route path="/admin" element={user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) ? <AdminPanel /> : <Navigate to="/" />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h3 className="text-primary font-black text-2xl mb-2 tracking-tight">PARIVARTAN</h3>
                <p className="text-gray-500 mb-6 font-medium">Empowering Communities. Transforming Lives.</p>
                <div className="flex justify-center gap-6 text-gray-400 mb-8">
                    <a href="#" className="hover:text-primary transition">Twitter</a>
                    <a href="#" className="hover:text-primary transition">Instagram</a>
                    <a href="#" className="hover:text-primary transition">LinkedIn</a>
                </div>
                <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Parivartan Foundation. All rights reserved.
                </div>
            </div>
        </footer>
        
        {user && user.role !== UserRole.USER && <Assistant />}
      </div>
    </HashRouter>
  );
};

export default App;