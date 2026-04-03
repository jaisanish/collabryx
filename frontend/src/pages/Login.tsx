import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import CodeMockup from '../components/CodeMockup';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      const { token } = response.data;
      localStorage.setItem('collabryx_token', token);
      localStorage.setItem('collabryx_email', formData.email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid identifier or passcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background relative overflow-hidden">
      {/* Left Column: Code Mockup */}
      <div className="hidden lg:flex flex-1 relative bg-surface/30 items-center justify-center p-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-30" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative z-10 w-full max-w-2xl"
        >
          <CodeMockup 
            className="shadow-[0_40px_100px_rgba(0,0,0,0.4)] transform rotate-1 scale-105" 
            title="auth_verify.ts"
            code={`// Identity Verification
async function verifyAccess(req, res) {
  const result = await auth.verify(req.token);
  
  if (result.status === 'VALID') {
    return grantAccess(result.userId);
  }
  
  throw new AuthError('Connection Timed Out');
}`}
          />
          <div className="mt-8 space-y-4">
             <h2 className="text-2xl font-black text-text tracking-tight uppercase italic">Secure Authentication</h2>
             <p className="text-text-dim text-sm max-w-md font-medium leading-relaxed">
               Your credentials are encrypted using top-tier protocols before establishing a link to the collaborative network.
             </p>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-[500px] xl:w-[600px] h-full flex flex-col justify-center pt-40 pb-20 px-10 sm:px-20 relative bg-background border-l border-border/40 overflow-hidden">
        <div className="scanlines" />
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative z-10 w-full max-w-md mx-auto"
        >
          <div className="mb-4">
             <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheck size={14} className="text-primary" />
             </div>
             <h1 className="text-xl font-black tracking-tighter text-text uppercase italic mb-1">Sign In</h1>
             <p className="text-text-dim/60 text-[8px] font-bold tracking-widest uppercase mb-4">Access your workspaces</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="mb-8 p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-text-dim/50 ml-1">Universal Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim/20 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  className="w-full bg-surface border border-border/60 rounded-2xl py-2.5 pl-14 pr-5 text-xs text-text focus:outline-none focus:border-primary focus:bg-surface-elevated transition-all font-medium"
                  placeholder="nexus@collabryx.dev"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-text-dim/50 ml-1">Security Passcode</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim/20 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="password"
                  required
                  className="w-full bg-surface border border-border/60 rounded-2xl py-2.5 pl-14 pr-5 text-xs text-text focus:outline-none focus:border-primary focus:bg-surface-elevated transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-background text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                 {loading ? "AUTHENTICATING..." : (
                   <>
                     LOG IN TO NETWORK
                     <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                   </>
                 )}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
            <p className="text-text-dim/40 text-[8px] font-bold uppercase tracking-widest">
              New to Collabryx?
            </p>
            <Link to="/signup" className="text-text hover:text-primary transition-all text-[8px] font-black uppercase tracking-[0.2em] border-b-2 border-primary/20 hover:border-primary pb-1">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


export default Login;
