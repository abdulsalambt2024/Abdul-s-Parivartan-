
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, MessageSquare, Calendar, Image as ImageIcon, LogOut, Menu, X, Briefcase, Shield, QrCode, Users, UserCog, Settings, Phone, Mail, ArrowRight, MessageCircle, Heart, FileText, ClipboardCheck } from 'lucide-react';
import { User, UserRole, StartupConfig } from './types';
import { storageService } from './services/storageService';
import { supabase } from './services/supabaseClient';
import { Auth } from './components/Auth';
import { HeroCarousel } from './components/HeroCarousel';
import { Feed } from './components/Feed';
import { ChatInterface } from './components/ChatInterface';
import { AIStudio } from './components/AIStudio';
import { EventManager } from './components/EventManager';
import { Assistant } from './components/Assistant';
import { SundayAttendance } from './components/SundayAttendance';
import { ProfilePage } from './components/ProfilePage';

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

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 md:hidden flex justify-between items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Link to="/" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
        <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link to="/feed" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive('/feed') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
        <FileText size={24} strokeWidth={isActive('/feed') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Posts</span>
      </Link>
      <Link to="/events" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive('/events') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
        <Calendar size={24} strokeWidth={isActive('/events') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Events</span>
      </Link>
      <Link to="/donate" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive('/donate') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
        <Heart size={24} strokeWidth={isActive('/donate') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Donate</span>
      </Link>
       <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
        <Settings size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </div>
  );
};

// Keep StartupPopup same as previous... (Abbreviated for brevity, assume implementation exists)
const StartupPopup = () => {
    const [config, setConfig] = useState<StartupConfig | null>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const c = storageService.getStartupConfig();
        if (c && c.enabled && !sessionStorage.getItem('popup_seen')) {
            setConfig(c);
            setVisible(true);
            sessionStorage.setItem('popup_seen', 'true');
        }
    }, []);
    if (!visible || !config) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
                <p className="text-gray-600 mb-8">{config.message}</p>
                <button onClick={() => setVisible(false)} className="bg-primary text-white px-8 py-3 rounded-full font-bold w-full">Get Started</button>
            </div>
        </div>
    );
};

const HomeLayout = ({ user, onLogin }: { user: User | null, onLogin: () => void }) => {
    return (
    <div className="pb-4">
        <HeroCarousel userRole={user?.role || UserRole.USER} />
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" /> Community Feed
            </h2>
            <Feed currentUser={user} onLoginRequest={onLogin} />
        </div>
    </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await checkUser();
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
        }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const checkUser = async () => {
      const u = await storageService.getCurrentUser();
      setUser(u);
      setLoading(false);
  };

  const handleLogin = () => {
    checkUser();
    setShowAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center text-primary"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
        <StartupPopup />
        <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} onLogin={handleLogin} />

        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm/50 backdrop-blur-md bg-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="font-extrabold text-primary text-2xl tracking-tight flex items-center gap-2">
                        PARIVARTAN
                    </Link>

                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <input 
                            type="text" 
                            placeholder="Search members, posts, or events..." 
                            className="w-full bg-gray-100 border-transparent rounded-full px-5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-primary transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon={Home} label="Home" />
                        {user && user.role !== UserRole.USER && (
                            <>
                                <NavLink to="/chat" icon={MessageSquare} label="Chat" />
                                <NavLink to="/studio" icon={ImageIcon} label="AI Studio" />
                                <NavLink to="/attendance" icon={ClipboardCheck} label="Attendance" />
                            </>
                        )}
                        <NavLink to="/events" icon={Calendar} label="Events" />
                        {user && (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                            <NavLink to="/admin" icon={Users} label="Admin" />
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

                    <div className="md:hidden flex items-center">
                         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 p-2">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                         </button>
                    </div>
                </div>
            </div>
            
            {mobileMenuOpen && (
                 <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2 animate-fade-in shadow-xl absolute w-full z-40">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 hover:bg-gray-50 rounded-lg font-medium">Home</Link>
                    {user ? (
                        <button onClick={handleLogout} className="w-full text-left py-3 px-4 text-red-500 font-medium mt-2 hover:bg-red-50 rounded-lg">Sign Out</button>
                    ) : (
                        <button onClick={() => { setMobileMenuOpen(false); setShowAuth(true); }} className="w-full text-left py-3 px-4 text-primary font-medium mt-2 hover:bg-blue-50 rounded-lg">Sign In</button>
                    )}
                 </div>
            )}
        </header>

        <main className="flex-1 pb-20 md:pb-0">
            <Routes>
                <Route path="/" element={<HomeLayout user={user} onLogin={() => setShowAuth(true)} />} />
                <Route path="/feed" element={<div className="max-w-2xl mx-auto pt-4"><h2 className="text-2xl font-bold px-4 mb-4">Posts</h2><Feed currentUser={user} onLoginRequest={() => setShowAuth(true)} /></div>} />
                <Route path="/events" element={<EventManager currentUser={user} />} />
                <Route path="/donate" element={<EventManager currentUser={user} defaultTab="donate" />} />
                {/* Update Profile Route to accept guest access */}
                <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} onLogin={() => setShowAuth(true)} />} />
                <Route path="/chat" element={user && user.role !== UserRole.USER ? <ChatInterface currentUser={user} /> : <Navigate to="/" />} />
                <Route path="/studio" element={user && user.role !== UserRole.USER ? <AIStudio /> : <Navigate to="/" />} />
                <Route path="/attendance" element={user && user.role !== UserRole.USER ? <SundayAttendance currentUser={user} /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>

        <BottomNav />
        <Assistant />
      </div>
    </HashRouter>
  );
};

export default App;
