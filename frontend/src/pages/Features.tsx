import { motion } from 'framer-motion';
import { CheckCircle2, Rocket, Zap, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Core Development',
    icon: <CheckCircle2 className="text-emerald-400" />,
    items: [
      { name: 'Isolated Containers', desc: 'Secure, sandboxed environments for each project.', status: 'done' },
      { name: 'Language Stack', desc: 'Syntax highlighting for 50+ languages.', status: 'done' },
      { name: 'Temporal Snapshots', desc: 'Real-time state captures and rollbacks.', status: 'done' },
      { name: 'Quantum Themes', desc: 'Premium Dark/Light mode optimization.', status: 'done' },
    ]
  },
  {
    title: 'Network & Sync',
    icon: <Zap className="text-amber-400" />,
    items: [
      { name: 'Real-time Push', desc: 'Zero-latency sync via dedicated sockets.', status: 'done' },
      { name: 'Smart Join', desc: '6-digit deterministic join codes.', status: 'done' },
      { name: 'Identity Layer', desc: 'Profile management and alias control.', status: 'done' },
      { name: 'Asset Bridge', desc: 'Secure file transfer across the collective.', status: 'done' },
    ]
  },
  {
    title: 'Upcoming Modules',
    icon: <Rocket className="text-blue-400" />,
    items: [
      { name: 'AI Autocomplete', desc: 'Context-aware code completion.', status: 'planned' },
      { name: 'VOIP/Video', desc: 'Face-to-face collaboration in-IDE.', status: 'planned' },
      { name: 'Edge Deploy', desc: 'One-click global edge deployment.', status: 'planned' },
      { name: 'AI Reviewer', desc: 'Automated code quality audits.', status: 'planned' },
    ]
  }
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full w-full pt-32 pb-16 px-6 max-w-6xl mx-auto relative z-10 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4 inline-block">
          Capabilities
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-text mb-4 tracking-tight">
          Modern Tooling for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Modern Teams</span>
        </h1>
        <p className="text-text-muted text-base max-w-2xl mx-auto">
          Explore the features that make Collabryx the most powerful collaborative IDE for elite developers.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {features.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 border border-border/40 bg-surface/40 backdrop-blur-xl rounded-2xl flex flex-col h-full ring-1 ring-white/5"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/5">
              <div className="p-1.5 rounded-lg bg-white/5">
                {section.icon}
              </div>
              <h2 className="text-lg font-bold text-text">{section.title}</h2>
            </div>

            <div className="flex-1 space-y-6">
              {section.items.map((item) => (
                <div key={item.name} className="group cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {item.status === 'done' ? <Zap size={14} className="text-emerald-400" /> : 
                       item.status === 'progress' ? <Circle size={14} className="text-amber-400" /> : 
                       <Circle size={14} className="text-white/20" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <button 
          onClick={() => navigate('/signup')} 
          className="btn-primary !px-8 !py-3 rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Join the Beta
        </button>
      </motion.div>
    </div>
  );
}
