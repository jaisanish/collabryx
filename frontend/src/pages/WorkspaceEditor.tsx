import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, History, ChevronRight, Copy, RefreshCw, Check, Plus, Moon, Sun, Play, Terminal, X, Zap } from 'lucide-react';
import api from '../services/api';
import AvatarDropdown from '../components/AvatarDropdown';

interface WorkspaceData {
  _id: string;
  name: string;
  language: string;
  code: string;
  joinCode: string;
  createdBy: string;
  members: string[];
}

interface SnapshotData {
  _id: string;
  name: string;
  code: string;
  savedAt: string;
}

const WorkspaceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState<boolean>(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  
  // Language UI State
  const [localLanguage, setLocalLanguage] = useState<string>('javascript');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('collabryx_userId') || '';

  // Reference to the socket connection
  const socketRef = useRef<Socket | null>(null);
  const isExternalChange = useRef<boolean>(false);

  // Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ output: string; executionTime: number; error: string | null } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showConsole, setShowConsole] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(localStorage.getItem('theme') as 'dark' | 'light' || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSnapshots = async () => {
    try {
      const response = await api.get(`/snapshots/${id}`);
      setSnapshots(response.data.snapshots);
    } catch (err) {
      console.error('Failed to load snapshots:', err);
    }
  };

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get(`/workspaces/${id}`);
        setWorkspace(response.data.workspace);
        setCode(response.data.workspace.code || '');
        setLocalLanguage(response.data.workspace.language || 'javascript');
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load workspace.');
        setLoading(false);
      }
    };

    fetchWorkspace();
    fetchSnapshots();
    
    api.post(`/workspaces/${id}/join`).catch((e) => console.log('Already joined or error joining:', e));

  }, [id]);

  useEffect(() => {
    if (loading || error) return;
    // Point the socket to the same host for production (proxied by Nginx)
    socketRef.current = io();
    socketRef.current.emit('join-workspace', id);
    socketRef.current.on('code-change', (newCode: string) => {
      isExternalChange.current = true;
      setCode(newCode);
    });

    socketRef.current.on('language-change', (newLanguage: string) => {
      setLocalLanguage(newLanguage);
    });

    return () => { socketRef.current?.disconnect(); };
  }, [id, loading, error]);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    if (!isExternalChange.current) {
      setCode(newValue);
      socketRef.current?.emit('code-change', { workspaceId: id, newCode: newValue });
    } else {
      isExternalChange.current = false;
    }
  };

  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) return;
    
    setSnapshotLoading(true);
    try {
      await api.post('/snapshots', { workspaceId: id, name: newSnapshotName });
      await fetchSnapshots();
      setShowSnapshotModal(false);
      setNewSnapshotName('');
    } catch (err) {
      console.error('Failed to save snapshot:', err);
      alert('Failed to save snapshot');
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!window.confirm("Are you sure you want to delete this snapshot?")) return;
    try {
      await api.delete(`/snapshots/${snapshotId}`);
      await fetchSnapshots();
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
      alert('Failed to delete snapshot');
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!window.confirm("Are you sure you want to restore this snapshot? Current code will be replaced.")) return;
    try {
      const response = await api.post(`/snapshots/${snapshotId}/restore`);
      const restoredCode = response.data.restoredCode;
      isExternalChange.current = true;
      setCode(restoredCode);
      socketRef.current?.emit('code-change', { workspaceId: id, newCode: restoredCode });
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
      alert('Failed to restore snapshot');
    }
  };

  const copyToClipboard = (text: string) => {
    // Modern API (Requires HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    } else {
      // Legacy Fallback (Works on HTTP)
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
        console.error('Fallback: Oops, unable to copy', err);
        textArea.remove();
        return false;
      }
    }
  };

  const handleCopyCode = () => {
    if (!workspace?.joinCode) return;
    const successful = copyToClipboard(workspace.joinCode);
    if (successful) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setShowConsole(true);
    setExecutionResult(null);
    try {
      const response = await api.post('/execute', { 
        code, 
        language: localLanguage,
        input: userInput
      });
      setExecutionResult(response.data);
    } catch (err: any) {
      setExecutionResult({
        output: err.response?.data?.output || '',
        executionTime: err.response?.data?.executionTime || 0,
        error: err.response?.data?.error || 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm("Regenerating the join code will invalidate the old one. Continue?")) return;
    setIsRegenerating(true);
    try {
      const response = await api.patch(`/workspaces/${id}/regenerate-code`);
      setWorkspace(prev => prev ? { ...prev, joinCode: response.data.joinCode } : null);
    } catch (err) {
      console.error('Failed to regenerate code:', err);
      alert('Failed to regenerate join code');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="skeleton w-32 h-32 rounded-full opacity-50"></div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center text-danger mx-auto mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Workspace Not Found</h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost w-full">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      
      {/* Header Toolbar */}
      <div className="h-14 bg-surface/80 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="flex flex-col">
            <h2 className="font-bold text-text text-sm tracking-tight">{workspace.name}</h2>
            
            <div className="flex items-center gap-3">
              {/* Language Selector Dropdown */}
              <div className="relative" ref={langRef}>
                <button 
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-1 text-[10px] uppercase font-mono font-medium text-text-secondary hover:text-text transition-colors"
                >
                  {localLanguage}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-surface text-text border border-border shadow-2xl p-1 z-50 rounded animate-fade-in-up">
                    {['python', 'javascript', 'c++', 'java', 'text'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => { 
                          setLocalLanguage(lang); 
                          setShowLanguageDropdown(false); 
                          socketRef.current?.emit('language-change', { workspaceId: id, newLanguage: lang });
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs font-mono rounded transition-colors ${localLanguage === lang ? 'bg-primary text-background font-bold' : 'text-text hover:bg-surface-elevated'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-2.5 bg-white/10" />

              {/* Join Code Display */}
              <div className="flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Join:</span>
                <span className="text-[11px] text-primary font-mono font-bold tracking-widest">{workspace.joinCode}</span>
                <button 
                  onClick={handleCopyCode}
                  className="text-text-muted hover:text-primary transition-colors ml-1"
                  title="Copy Join Code"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
                {workspace.createdBy === userId && (
                  <button 
                    onClick={handleRegenerateCode}
                    className={`text-text-muted hover:text-primary transition-colors ${isRegenerating ? 'animate-spin' : ''}`}
                    title="Regenerate Join Code"
                  >
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Online Status (Mock) */}
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/5 border border-emerald-400/20 text-[11px] font-bold text-emerald-400">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             Live
           </div>

           <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 text-text-dim hover:text-text transition-all bg-surface/5 border border-border/20 hover:border-text/10 rounded-lg"
              >
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
           </button>

           <div className="flex -space-x-2 mr-2">
             <AvatarDropdown />
             {workspace.members && workspace.members.length > 1 && (
               <div className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-background flex items-center justify-center text-xs font-bold text-text-secondary z-10 shadow-md">
                 +{workspace.members.length - 1}
               </div>
             )}
           </div>
           
           <button 
             onClick={handleExecuteCode}
             disabled={isExecuting}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${isExecuting ? 'bg-primary/20 text-primary cursor-not-allowed' : 'bg-primary text-background hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)]'}`}
           >
             {isExecuting ? (
               <RefreshCw size={14} className="animate-spin" />
             ) : (
               <Play size={14} fill="currentColor" />
             )}
             {isExecuting ? 'Running...' : 'Run Code'}
           </button>

           <button 
             onClick={() => setShowSnapshotModal(true)} 
             className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-bold text-text-secondary transition-all"
           >
             <History size={14} /> Snapshot
           </button>
        </div>
      </div>

      {/* Snapshot Naming Modal */}
      <AnimatePresence>
        {showSnapshotModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-xl"
               onClick={() => setShowSnapshotModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel p-10 max-w-lg w-full shadow-2xl relative z-10 border border-white/10 bg-surface/90 backdrop-blur-3xl overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-primary blur-md opacity-50" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                    Save Snapshot
                  </h2>
                  <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase">
                    Save your current progress to a snapshot
                  </p>
                </div>
                <button 
                  onClick={() => setShowSnapshotModal(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
                >
                   <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveSnapshot} className="flex flex-col gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-3 block">Snapshot Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Initial Prototype"
                    className="w-full bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all outline-none"
                    value={newSnapshotName}
                    onChange={(e) => setNewSnapshotName(e.target.value)}
                    disabled={snapshotLoading}
                  />
                </div>
                
                <div className="flex gap-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowSnapshotModal(false)} 
                    className="flex-1 py-4 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
                    disabled={snapshotLoading}
                  >
                    {snapshotLoading ? 'Saving...' : 'Save Snapshot'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full flex bg-transparent relative overflow-hidden">
        {/* Editor */}
        <div className="flex-1 h-full relative border-r border-border/40 bg-background/30 backdrop-blur-sm">
          <Editor
            height="100%"
            language={localLanguage === 'text' ? 'plaintext' : localLanguage}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              lineHeight: 24,
              wordWrap: 'on',
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderWhitespace: 'none',
              guides: { indentation: true },
            }}
          />
        </div>

        {/* Snapshots Sidebar */}
        <div className="w-80 bg-surface/30 h-full flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between shrink-0 bg-surface/50">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Snapshots</h3>
            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{snapshots.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {snapshots.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center mt-10"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-elevated/50 flex items-center justify-center mx-auto mb-4 border border-border/40">
                    <History className="w-5 h-5 text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-muted">No snapshots yet.</p>
                </motion.div>
              ) : (
                snapshots.map((snapshot) => {
                  const d = new Date(snapshot.savedAt);
                  const formatTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formatDate = d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      key={snapshot._id} 
                      className="glass-panel p-4 group hover:border-primary/40 focus-within:border-primary/40 transition-colors bg-surface/50 hover:bg-surface-elevated/40 rounded-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start justify-between mb-2 pl-1">
                        <h4 className="text-sm font-bold text-text truncate pr-3">{snapshot.name}</h4>
                        <button
                          onClick={() => handleDeleteSnapshot(snapshot._id)}
                          className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-400/10 p-1.5 rounded-lg transition-all flex-shrink-0"
                          title="Delete Snapshot"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4 pl-1">
                        <History size={12} className="text-text-muted/70" />
                        <p className="text-[11px] text-text-muted/80 font-medium">
                          {formatDate} at {formatTime}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleRestoreSnapshot(snapshot._id)}
                        className="w-full py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 text-primary border border-primary/20 bg-primary/5 rounded-lg hover:bg-primary hover:text-background transition-all group/btn"
                      >
                        Restore Code <ChevronRight size={14} className="opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Output Console */}
      <AnimatePresence>
        {showConsole && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-64 bg-surface/95 backdrop-blur-xl border-t border-border/60 z-[100] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="h-10 px-4 border-b border-border/40 flex items-center justify-between shrink-0 bg-surface/40">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
                  <Terminal size={14} className="text-primary" />
                  Console Output
                </div>
                {executionResult && (
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-text-muted">
                    <Zap size={10} className="text-amber-400" />
                    {(executionResult.executionTime / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <img src="/favicon.png" alt="Collabryx" className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" title="Powered by Collabryx" />
                <button 
                  onClick={() => setShowConsole(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-text-muted"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Input Section */}
              <div className="w-1/3 border-r border-border/40 flex flex-col">
                <div className="px-4 py-1 bg-surface/60 border-b border-border/20 text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                   Program Input
                </div>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter inputs here (e.g. for input() or cin >>)..."
                  className="flex-1 bg-transparent p-4 resize-none outline-none font-mono text-sm text-text placeholder:text-text-dim/30"
                />
              </div>

              {/* Output Section */}
              <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-black/20">
                {isExecuting ? (
                  <div className="flex items-center gap-2 text-primary animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Executing code in isolated container...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {executionResult?.error && (
                      <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs whitespace-pre-wrap font-bold">
                        <span className="uppercase mr-2">[Error]</span>
                        {executionResult.error}
                      </div>
                    )}
                    {executionResult?.output ? (
                      <div className="text-white whitespace-pre-wrap leading-relaxed">
                        {executionResult.output}
                      </div>
                    ) : !executionResult?.error && (
                      <div className="text-text-dim italic mt-2 opacity-50">
                        Program finished with no output.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceEditor;
