import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut } from 'lucide-react';
import SettingsDrawer from './SettingsDrawer';

const AvatarDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Decode JWT or use a dummy for now.
  const email = localStorage.getItem('collabryx_email') || 'User'; 
  const initial = email.charAt(0).toUpperCase();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'profile'|'settings'>('profile');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('collabryx_token');
    localStorage.removeItem('collabryx_email');
    navigate('/');
  };

  const openDrawer = (tab: 'profile' | 'settings') => {
    setDrawerTab(tab);
    setDrawerOpen(true);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-background tracking-tighter hover:shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all z-[100] shadow-md ring-2 ring-background border border-primary/20"
      >
        {initial}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-48 rounded-xl glass-panel p-2 shadow-2xl z-[250] origin-top-right border border-border/60 bg-surface/90 backdrop-blur-xl"
          >
            <div className="px-3 py-2 border-b border-border/30 mb-1.5 hidden">
              {/* Removed Email per request */}
            </div>
            
            <button 
              onClick={() => openDrawer('profile')}
              className="w-full flex items-center justify-between gap-2 text-left px-4 py-3 text-sm text-white font-bold rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <User size={16} className="text-white/40 group-hover:text-primary transition-colors" /> 
                <span>Profile</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => openDrawer('settings')}
              className="w-full flex items-center justify-between gap-2 text-left px-4 py-3 text-sm text-white font-bold rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Settings size={16} className="text-white/40 group-hover:text-primary transition-colors" /> 
                <span>Settings</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <div className="h-px bg-border/40 my-1.5 mx-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={14} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        initialTab={drawerTab} 
        email={email} 
        initial={initial} 
      />
    </div>
  );
};

export default AvatarDropdown;
