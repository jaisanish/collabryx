import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CodeMockupProps {
  className?: string;
  code?: string;
  title?: string;
  typingSpeed?: number;
}

const CodeMockup: React.FC<CodeMockupProps> = ({ 
  className, 
  code = `const workspace = await createSession({
  name: 'my-project',
  language: 'typescript'
});`,
  title = "workspace.ts",
  typingSpeed = 50
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: any;
    
    const tick = () => {
      if (isTyping) {
        if (displayText.length < code.length) {
          setDisplayText(code.slice(0, displayText.length + 1));
          timeout = setTimeout(tick, typingSpeed);
        } else {
          setIsTyping(false);
          timeout = setTimeout(tick, 3000); // Wait after finishing typing
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(code.slice(0, displayText.length - 1));
          timeout = setTimeout(tick, typingSpeed / 2); // Untype faster
        } else {
          setIsTyping(true);
          timeout = setTimeout(tick, 1000); // Wait before starting again
        }
      }
    };

    timeout = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timeout);
  }, [displayText, isTyping, code, typingSpeed]);

  return (
    <div className={`glass-panel border-border/40 overflow-hidden shadow-2xl bg-surface/40 backdrop-blur-2xl ${className}`}>
      <div className="flex items-center px-4 py-3 bg-surface/60 border-b border-border/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-[10px] font-black text-text-dim/40 uppercase tracking-[0.2em] italic">{title}</span>
        </div>
      </div>
      
      <div className="p-6 font-mono text-[13px] leading-relaxed overflow-hidden">
        {displayText.split('\n').map((line: string, i: number) => (
          <div key={i} className="flex gap-4 group">
            <span className="text-text-dim/20 w-4 text-right inline-block select-none font-bold">{i + 1}</span>
            <code className="whitespace-pre-wrap text-text-secondary">
              {line.split(/(\s+|['"].*?['"]|[{}()[\],.:;])/).map((part: string, j: number) => {
                if (['const', 'await', 'import', 'async', 'return', 'export', 'default'].includes(part)) return <span key={j} className="text-purple-400 font-bold">{part}</span>;
                if (['createSession', 'push', 'join', 'emit', 'syncNode', 'on'].includes(part)) return <span key={j} className="text-amber-400 font-medium">{part}</span>;
                if (part.startsWith("'") || part.startsWith('"')) return <span key={j} className="text-emerald-400">{part}</span>;
                if (['{', '}', '(', ')', '[', ']', ':', ';', ',', '.'].includes(part)) return <span key={j} className="text-text-dim/40">{part}</span>;
                return <span key={j}>{part}</span>;
              })}
              {i === displayText.split('\n').length - 1 && (
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-4 bg-primary align-middle ml-0.5"
                />
              )}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeMockup;
