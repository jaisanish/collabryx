import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Moon, X, Info, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'profile' | 'settings';
  email: string;
  initial: string;
}

export default function SettingsDrawer({ isOpen, onClose, initialTab, email, initial }: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(initialTab);
  const [displayName, setDisplayName] = useState(localStorage.getItem('collabryx_name') || email.split('@')[0]);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    // Sync theme state when drawer opens
    if (isOpen) {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }
  }, [initialTab, isOpen]);

  const handleSaveName = () => {
    setIsSaving(true);
    localStorage.setItem('collabryx_name', displayName);
    setTimeout(() => setIsSaving(false), 800);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 pointer-events-auto"
            onClick={onClose}
          />
          
          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] glass-panel border-l border-border/40 flex flex-col shadow-2xl bg-surface/95 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-10 border-b border-border/40">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tighter text-text uppercase italic">Account</h2>
                <p className="text-[9px] text-text-dim font-bold tracking-[0.2em] uppercase">Manage your synaptic profile</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-surface/50 hover:bg-surface border border-border/40 rounded-2xl transition-all text-text-dim hover:text-text"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40 px-10">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-6 mr-10 text-xs font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === 'profile' ? 'text-text' : 'text-text-dim hover:text-text-secondary'}`}
              >
                <div className="flex items-center gap-3"><User size={16} /> Profile</div>
                {activeTab === 'profile' && (
                  <motion.div layoutId="drawer-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary blur-[2px]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-6 text-xs font-black uppercase tracking-[0.2em] relative transition-all ${activeTab === 'settings' ? 'text-text' : 'text-text-dim hover:text-text-secondary'}`}
              >
                <div className="flex items-center gap-3"><Settings size={16} /> Settings</div>
                {activeTab === 'settings' && (
                  <motion.div layoutId="drawer-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary blur-[2px]" />
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' ? (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-12"
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl font-black text-background shadow-xl ring-4 ring-text/5 ring-offset-8 ring-offset-surface">
                        {initial}
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-2xl font-black text-text italic uppercase tracking-tight">{displayName}</p>
                        <p className="text-xs text-text-dim font-medium">{email}</p>
                      </div>
                    </div>

                    <div className="space-y-8 pt-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim ml-1 block">Network Alias</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            className="w-full bg-surface border border-border/60 rounded-2xl px-5 py-4 text-sm text-text focus:outline-none focus:border-primary transition-all font-medium placeholder:text-text-dim/30" 
                            placeholder="Display Name" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                          <button 
                            onClick={handleSaveName}
                            className={`px-6 py-4 bg-primary text-background text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all ${isSaving ? 'opacity-50' : 'shadow-lg shadow-primary/20'}`}
                          >
                            {isSaving ? 'Done' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                      <div className="flex items-center gap-3 text-primary mb-2">
                         <Info size={18} />
                         <span className="text-xs font-black uppercase tracking-widest">Neural Sync</span>
                      </div>
                      <p className="text-xs text-text-secondary font-medium leading-relaxed">
                        Your synaptic preferences are sharded and synced across the Collabryx infrastructure.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="group flex items-center justify-between p-6 rounded-3xl bg-surface border border-border/60 hover:border-primary/40 transition-all">
                        <div className="space-y-1">
                          <div className="font-black text-xs text-text uppercase tracking-widest flex items-center gap-3">
                            <Moon size={16} className="text-primary" /> Visual Mode
                          </div>
                          <div className="text-[9px] text-text-dim font-bold uppercase tracking-widest">{theme === 'dark' ? 'Neural Dark' : 'Optic Light'}</div>
                        </div>
                        <div 
                          onClick={toggleTheme}
                          className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 ring-2 ${theme === 'dark' ? 'bg-primary/20 ring-primary/50' : 'bg-surface-elevated ring-border'}`}
                        >
                          <motion.div 
                            animate={{ x: theme === 'dark' ? 30 : 4 }}
                            className="absolute top-1 w-5 h-5 bg-primary rounded-full shadow-lg"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          localStorage.removeItem('collabryx_token');
                          localStorage.removeItem('collabryx_email');
                          window.location.href = '/';
                        }}
                        className="w-full flex items-center justify-center gap-3 py-5 px-6 rounded-2xl bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 transition-all text-xs font-black uppercase tracking-[0.2em] mt-20"
                      >
                         <LogOut size={16} /> Disconnect from Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
}
