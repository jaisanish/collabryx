import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  icon: React.ReactNode;
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ icon, text }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.05 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full glass glass-hover cursor-default shadow-xl"
    >
      <span className="text-white opacity-60 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
      <span className="text-[11px] font-medium tracking-wide text-white/60">
        {text}
      </span>
    </motion.div>
  );
};

export default Badge;
