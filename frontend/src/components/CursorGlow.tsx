import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CursorGlow: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Enable custom cursor mode globally
    document.documentElement.classList.add('custom-cursor-active');

    const onMouseMove = (e: MouseEvent) => {
      // Main dot
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });
      // Outer glow
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      {/* Light dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      />
      {/* Soft glow orb */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_80px_rgba(255,255,255,0.05)]"
      />
    </>
  );
};

export default CursorGlow;
