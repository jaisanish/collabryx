import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AvatarDropdown from './AvatarDropdown';
import { Bell, Moon, Sun } from 'lucide-react';

const CxLogo = () => (
  <img src="/logo.png" alt="Collabryx" className="w-9 h-9 brightness-110 contrast-125" />
);

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('collabryx_token');
  const isEditor = location.pathname.startsWith('/workspace/');
  const isAuth = ['/login', '/signup'].includes(location.pathname);
  const [theme, setTheme] = useState<'dark' | 'light'>(localStorage.getItem('theme') as 'dark' | 'light' || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isEditor) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:px-6 sm:pt-6 transition-all duration-500">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`flex items-center justify-between w-full max-w-5xl h-[64px] px-6 rounded-[24px] border border-border/40 backdrop-blur-2xl shadow-xl transition-all duration-500 ${
           scrolled ? 'bg-surface/80 border-border' : 'bg-surface/10'
        }`}
      >
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="relative flex items-center gap-3">
            <CxLogo />
            <span className="text-xl font-black tracking-tighter text-text group-hover:text-primary transition-all uppercase italic">
              Collabryx
            </span>
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        
        {/* Navigation Links (Center) - Hidden for extreme minimalism per user request */}
        <div className="md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2" />

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 text-text-dim hover:text-text transition-all bg-surface border border-border/40 hover:border-text/20 rounded-full"
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center gap-4 mr-1">
                  <button className="text-text-dim hover:text-text transition-colors">
                    <Bell size={18} />
                  </button>
                </div>
                <div className="w-px h-1.5 bg-border mx-1 hidden sm:block" />
                <div className="flex items-center gap-2 group">
                  <AvatarDropdown />
                </div>
              </>
            ) : !isAuth ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-text-dim hover:text-text transition-colors px-2">
                  Sign In
                </Link>
                <Link to="/signup">
                  <button className="px-6 py-2.5 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                    Get Started
                  </button>
                </Link>
              </div>
            ) : null}
          </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
