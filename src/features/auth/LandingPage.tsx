import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  useEffect(() => {
    const canvas = document.getElementById('aegis-particles') as HTMLCanvasElement | null;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let animationId = 0;
    const particles = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 1.5 + Math.random() * 2
    }));
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      if (document.hidden) {
        animationId = requestAnimationFrame(loop);
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgba(37,99,235,0.7)';
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(particle.x - particle.vx * 6, particle.y - particle.vy * 6, Math.max(0.5, particle.r - 1), 0, Math.PI * 2);
        context.fillStyle = 'rgba(16,185,129,0.35)';
        context.fill();
      });
      context.strokeStyle = 'rgba(99,102,241,0.12)';
      particles.forEach((particle, index) => {
        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex++) {
          const other = particles[nextIndex];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            context.globalAlpha = (100 - distance) / 200;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
            context.globalAlpha = 1;
          }
        }
      });
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <canvas id="aegis-particles" className="fixed inset-0 will-change-transform" />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(1000px 400px at 20% 10%, rgba(59,130,246,0.15), transparent), radial-gradient(800px 300px at 80% 20%, rgba(16,185,129,0.15), transparent)'
      }} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/30">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 bg-clip-text text-transparent">
          Aegis Link
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }} className="mt-4 max-w-2xl text-base md:text-lg text-gray-700">
          Smart, beautiful healthcare for Patients, Caregivers, and Doctors.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-10 flex items-center gap-4">
          <button onClick={onGetStarted} className="group relative px-8 py-3 rounded-2xl text-white font-semibold">
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-green-600 animate-gradient-x" />
            <span className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-400/60 via-indigo-300/60 to-green-400/60 blur opacity-70 group-hover:opacity-90 transition" />
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <Sparkles className="w-4 h-4 opacity-90 group-hover:animate-ping" />
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
