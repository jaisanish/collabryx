import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Shield, Cloud, ArrowRight, Zap } from 'lucide-react';
import CodeMockup from './CodeMockup';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 100 } },
  };

  const features = [
    { name: 'AI-Powered Sync', icon: <Zap size={14} className="text-emerald-400" /> },
    { name: 'Cloud Workspaces', icon: <Cloud size={14} className="text-blue-400" /> },
    { name: 'Secure Containers', icon: <Shield size={14} className="text-purple-400" /> },
  ];

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-20 pb-20 px-6 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Left Side: Content */}
        <div className="flex flex-col items-start text-left space-y-10 order-2 lg:order-1">
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="flex gap-4">
              {features.map((f) => (
                <div key={f.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border/40 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {f.icon} {f.name}
                </div>
              ))}
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-text"
            >
              CODE <span className="text-text-muted font-light italic">TOGETHER</span> <br />
              SHIP <span className="bg-clip-text text-transparent bg-gradient-to-b from-text to-text-secondary">FASTER</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg text-text-muted max-w-lg leading-relaxed font-medium"
            >
              The world's most advanced collaborative development environment.
              Designed for high-velocity teams who demand precision and scale.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
            <Link to="/signup">
              <button className="group relative px-10 py-5 bg-text text-surface text-xs font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(var(--text-rgb),0.2)] flex items-center gap-4 uppercase tracking-[0.2em]">
                Start Collaborating
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link to="/features">
              <button 
                className="px-8 py-5 border border-border/40 hover:border-text/20 bg-surface/5 hover:bg-surface-elevated text-text-dim hover:text-text rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
              >
                See All Features
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Code Mockup */}
        <motion.div 
          variants={itemVariants}
          className="relative order-1 lg:order-2 group"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <CodeMockup 
            className="relative transform lg:rotate-2 lg:scale-110 shadow-2xl" 
            title="collabryx.config.ts"
            code={`import { defineConfig } from 'collabryx';

export default defineConfig({
  project: 'Neural Engine',
  region: 'us-east-1',
  collaborators: ['lex', 'nex'],
  realtime: {
    latency: 'ultra-low',
    protocol: 'secure-socket'
  }
});`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
