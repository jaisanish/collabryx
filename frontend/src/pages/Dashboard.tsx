import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Terminal } from 'lucide-react';
import api from '../services/api';

interface WorkspaceData {
  _id: string;
  name: string;
  description: string;
  joinCode: string;
  language: string;
  createdAt: string;
  members: string[];
  isCreator?: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timeout: any;
    fetchWorkspaces();
    return () => clearTimeout(timeout);
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data.workspaces);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      setErrorMsg('Workspace name is required');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('/workspaces', { 
        name: newWorkspaceName,
        description: newWorkspaceDesc
      });
      const newWorkspaceId = response.data.workspace._id;
      navigate(`/workspace/${newWorkspaceId}`);
    } catch (err: any) {
      console.error('Failed to create workspace:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to create workspace');
      setIsSubmitting(false);
    }
  };

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      setErrorMsg('Join code is required');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const response = await api.post('/workspaces/join', { joinCode: joinCodeInput });
      const workspaceId = response.data.workspace._id;
      navigate(`/workspace/${workspaceId}`);
    } catch (err: any) {
      console.error('Failed to join workspace:', err);
      setErrorMsg(err.response?.data?.error || 'Invalid join code');
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    }
  };

  const copyJoinCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    const successful = copyToClipboard(code);
    if (successful) {
      alert('Join code copied!');
    }
  };

  const handleLeaveWorkspace = async (e: React.MouseEvent, id: string, isCreator: boolean, membersLength: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simplistic handling: if creator and others exist, warn they can't leave via this UI yet
    if (isCreator && membersLength > 1) {
      alert("You are the creator. You must transfer ownership to leave. Use the Delete instead, or transfer ownership within the workspace.");
      return;
    }

    if (window.confirm("Are you sure you want to leave this workspace?")) {
      try {
        await api.post(`/workspaces/${id}/leave`, {});
        fetchWorkspaces();
      } catch (err: any) {
        console.error('Failed to leave workspace:', err);
        setErrorMsg(err.response?.data?.error || 'Failed to leave workspace');
      }
    }
  };

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("WARNING: Are you sure you want to completely DELETE this workspace? This cannot be undone.")) {
      try {
        await api.delete(`/workspaces/${id}`);
        fetchWorkspaces();
      } catch (err: any) {
        console.error('Failed to delete workspace:', err);
        setErrorMsg(err.response?.data?.error || 'Failed to delete workspace');
      }
    }
  };

  return (
    <div className="h-screen flex flex-col pt-24 px-8 max-w-6xl mx-auto relative z-10 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-white/5 pb-10 gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-text uppercase italic flex items-center gap-6">
            <div className="w-1.5 h-12 bg-gradient-to-b from-primary to-accent rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)] shrink-0" />
            Workspaces
          </h1>
          <p className="text-text-dim/60 text-sm mt-2 font-medium tracking-wide uppercase tracking-[0.1em]">Manage your collaborative coding projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsJoining(true); setIsCreating(false); setErrorMsg(''); }}
             className="px-6 py-2.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-surface-elevated text-text-secondary hover:text-text text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Join Workspace
          </button>
          <button 
            onClick={() => { setIsCreating(true); setIsJoining(false); setErrorMsg(''); }}
             className="px-6 py-2.5 rounded-xl bg-primary text-background hover:scale-105 active:scale-95 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
          >
            Create New
          </button>
        </div>
      </div>
      
      {/* Modals for Create/Join */}
      <AnimatePresence>
        {(isCreating || isJoining) && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-xl"
               onClick={() => { setIsCreating(false); setIsJoining(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel p-10 max-w-lg w-full shadow-2xl relative z-10 border border-white/10 bg-surface/90 backdrop-blur-3xl overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-primary blur-md opacity-30" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-text tracking-tighter uppercase italic">
                    {isCreating ? 'Create' : 'Join'}
                  </h2>
                  <p className="text-[10px] text-text-dim/50 font-bold tracking-[0.2em] uppercase">
                    {isCreating ? 'Start a new workspace' : 'Enter a join code to access a workspace'}
                  </p>
                </div>
                <button 
                  onClick={() => { setIsCreating(false); setIsJoining(false); }}
                  className="p-3 bg-surface-elevated hover:bg-border/40 rounded-2xl transition-all text-text-secondary hover:text-text"
                >
                   <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              {isCreating ? (
                <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-dim/50 mb-3 block">Workspace Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. quantum-kernel"
                      className="w-full bg-surface border border-border/60 focus:border-primary focus:bg-surface-elevated rounded-2xl px-5 py-4 text-sm text-text transition-all outline-none"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-dim/50 mb-3 block">Description</label>
                    <input
                      type="text"
                      placeholder="Functional description..."
                      className="w-full bg-surface border border-border/60 focus:border-primary focus:bg-surface-elevated rounded-2xl px-5 py-4 text-sm text-text transition-all outline-none"
                      value={newWorkspaceDesc}
                      onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errorMsg && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs font-bold bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                  
                  <button type="submit" className="w-full py-4 bg-primary text-background rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Syncing...' : 'Create Workspace'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoinWorkspace} className="flex flex-col gap-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-dim/50 mb-3 block">Join Code</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. ALPHA-9"
                      className="w-full bg-surface border border-border/60 focus:border-primary focus:bg-surface-elevated rounded-2xl px-5 py-4 text-lg text-text transition-all outline-none font-mono tracking-[0.5em] uppercase text-center"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errorMsg && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs font-bold bg-red-400/10 px-4 py-3 rounded-xl border border-red-400/20"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                  
                  <button type="submit" className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] mt-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Authenticating...' : 'Establish Link'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 glass-panel p-6 flex flex-col justify-between border-white/5 bg-white/5">
              <div className="space-y-4">
                <div className="h-8 w-3/4 skeleton rounded-xl bg-white/5" />
                <div className="h-4 w-full skeleton rounded-lg bg-white/5 opacity-60" />
                <div className="h-4 w-2/3 skeleton rounded-lg bg-white/5 opacity-60" />
              </div>
              <div className="h-6 w-1/4 skeleton rounded-lg bg-white/5 mt-8" />
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center max-w-xl"
          >
            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
              <div className="relative w-32 h-32 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center transform group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                <Terminal className="text-primary w-12 h-12" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">No Workspaces Yet</h2>
            <p className="text-white/40 mb-10 leading-relaxed font-medium">
              You haven't joined any workspaces yet. Create a new one or join an existing one to get started.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <button onClick={() => setIsCreating(true)} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                 Create Workspace
               </button>
               <button onClick={() => setIsJoining(true)} className="px-10 py-4 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
                 Join Workspace
               </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 custom-scrollbar"
        >
          {workspaces.map((ws) => (
            <motion.div 
              key={ws._id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link to={`/workspace/${ws._id}`} className="block">
                <div className={`glass-panel p-5 flex flex-col group border border-border/40 hover:border-primary/40 hover:bg-surface-elevated/40 transition-colors cursor-pointer relative overflow-hidden bg-surface/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-primary/5 rounded-2xl`}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors truncate pr-4">
                    {ws.name}
                  </h3>
                  <span className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium uppercase tracking-wider bg-surface border border-border text-text-secondary">
                    {ws.language}
                  </span>
                </div>
                
                <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">
                  {ws.description || 'No description provided.'}
                </p>
                
                  <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium bg-surface px-2 py-1 rounded-md border border-border/50 shadow-inner">
                        <Users size={14} className="text-primary/70" />
                        <span>{ws.members?.length || 1}</span>
                      </div>
                      {ws.joinCode && (
                         <button 
                           onClick={(e) => copyJoinCode(e, ws.joinCode)}
                           className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors bg-surface px-2 py-1 rounded-md border border-border/50 hover:border-primary/30"
                         >
                           Code: <span className="font-mono text-text">{ws.joinCode}</span>
                         </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-auto self-end pl-6">
                       <span className="px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-[0.2em] bg-surface-elevated border border-border/10 text-text/40 shadow-sm whitespace-nowrap">
                         {new Date(ws.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                      {ws.isCreator ? (
                        <button 
                          onClick={(e) => handleDeleteWorkspace(e, ws._id)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-background hover:bg-red-500 px-2 py-1 rounded transition-all"
                        >
                          Delete
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => handleLeaveWorkspace(e, ws._id, false, ws.members?.length || 1)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-orange-500 hover:text-background hover:bg-orange-500 px-2 py-1 rounded transition-all"
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
