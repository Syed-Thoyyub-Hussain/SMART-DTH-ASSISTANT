import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Wifi, 
  FileText, 
  Play, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Database,
  Globe2,
  Signal,
  CreditCard,
  Zap
} from 'lucide-react';

interface CinematicIntroProps {
  onEnter: () => void;
}

export default function CinematicIntro({ onEnter }: CinematicIntroProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Uplinking to GSAT-15 Satellite...');

  const step = progress < 25 ? 0 : progress < 75 ? 1 : 2;

  // Symmetrical progressive loader timeline
  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Increments dynamically for realistic signal connection behavior
      const increment = Math.floor(Math.random() * 3) + 2; 
      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(currentProgress);

      if (currentProgress < 20) {
        setStatusText('Uplinking to GSAT-15 Transponder (93.5°E)...');
      } else if (currentProgress < 45) {
        setStatusText('Synchronizing cross-polarized DTH HD feeds...');
      } else if (currentProgress < 70) {
        setStatusText('Routing optical GPON Fiber broadband maps...');
      } else if (currentProgress < 90) {
        setStatusText('Initializing secure consumer ledger clearances...');
      } else if (currentProgress < 100) {
        setStatusText('Encrypting secure workspace handshake portals...');
      } else {
        setStatusText('Gateways cleared! Transferring to primary console...');
        clearInterval(interval);
        
        const autoEnterTimer = setTimeout(() => {
          onEnter();
        }, 600);
        return () => clearTimeout(autoEnterTimer);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onEnter]);

  // Premium Indian channel list for aesthetic stream display
  const channels = ['Sun TV HD', 'KTV HD', 'Sun Music', 'Star Sports', 'HBO', 'Discovery'];

  return (
    <div className="fixed inset-0 z-50 bg-[#030305] text-[#E2E8F0] font-sans overflow-hidden flex flex-col justify-between selection:bg-[#FF5500] selection:text-white">
      
      {/* Dynamic 3D Laser Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 select-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 85, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 85, 0, 0.05) 1px, transparent 1px),
            radial-gradient(ellipse at 50% 50%, rgba(13, 14, 20, 0.3) 0%, rgba(3, 3, 5, 1) 100%)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(25deg) translateY(-30px)',
          transformOrigin: 'top center',
        }}
      />

      {/* Decorative Blur Ambient Fields */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#FF5500]/5 rounded-full filter blur-[120px] mix-blend-screen animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full filter blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* HEADER SECTION */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF7A00] to-red-500 p-[1px] shadow-lg shadow-[#FF5500]/10 flex items-center justify-center">
            <div className="w-full h-full bg-[#0E0E12] rounded-[10px] flex items-center justify-center">
              <Zap size={14} className="text-[#FF5500]" />
            </div>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-[0.3em] text-white">RAJA SUN COMMS</h1>
            <p className="text-[8px] uppercase tracking-wider text-[#FF5500] font-mono leading-none">Global Broadcast Node</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[9px] text-[#5f7491] uppercase tracking-[0.2em] block">SIGNAL UPLINK</span>
          <span className="text-xs font-black text-[#FF5500] animate-pulse">{progress}% ESTABLISHED</span>
        </div>
      </header>

      {/* CENTRAL CINEMATIC STAGE */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 flex flex-col items-center justify-center">
        
        {/* STEP 0: INITIAL HIGH-CONTRAST SATELLITE & LOGO BEACON */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center space-y-4"
          >
            {/* Spinning Satellite Dish Beacon */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#FF5500]/20 animate-ping" />
              <div className="absolute inset-4 rounded-full border border-blue-500/10 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#12131a] to-[#251510] border border-[#FF5500]/30 shadow-2xl flex items-center justify-center relative">
                <Globe2 size={24} className="text-[#FF5500] animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-[0.25em] text-white font-mono">INITIATING CARRIER LINK</h2>
              <p className="text-[10px] font-mono text-zinc-500 tracking-widest mt-1">GSAT-15 SATELLITE TRANSPONDER</p>
            </div>
          </motion.div>
        )}

        {/* STEP 1 & 2: REVEAL SERVICES WITH LUXURY 3D MOTION CARDS */}
        {step >= 1 && (
          <div className="w-full flex flex-col items-center justify-center">
            
            {/* Title Block */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl mb-12 space-y-3"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                Interactive DTH, fiber wifi <br/> & online billing systems
              </h2>
              <p className="text-xs md:text-sm text-[#8fa2be] max-w-lg mx-auto">
                Step-up to Raja Sun Comms. Sleek, high-definition satellite TV broadcasts coupled with premium ultra-fast fiber nodes and electronic clearance ledgers.
              </p>
            </motion.div>

            {/* 3D-feeling Floating Card Presentation */}
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left"
              style={{
                perspective: '1200px',
              }}
            >
              {/* CARD 1: DTH TV Channels */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: -15, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                whileHover={{ y: -8, rotateY: 3, rotateX: 2, borderColor: 'rgba(255, 85, 0, 0.4)' }}
                className="bg-[#0e0e13]/85 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md group shadow-xl"
              >
                {/* Visual Glow Gradient Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5500]/5 rounded-full filter blur-2xl pointer-events-none group-hover:bg-[#FF5500]/10 transition-colors" />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500] border border-[#FF5500]/20">
                    <Tv size={18} />
                  </div>
                  <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-2 bg-[#FF5500]/10 text-[#FF5500] rounded-full">HD MULTI-ROOM</span>
                </div>

                <h3 className="text-white font-extrabold text-base mb-2 flex items-center gap-1">
                  <span>DTH TV Broadcaster</span>
                  <Signal size={13} className="text-[#FF5500] animate-pulse" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Experience seamless, crystal-clear satellite feeds on the GSAT-15 band. Enjoy perfect stereo sound & ultra high definition regional package listings.
                </p>

                {/* Animated visual channels carousel element */}
                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">Premium Channel Bundles</span>
                  <div className="flex flex-wrap gap-1">
                    {channels.map((chan, idx) => (
                      <span key={idx} className="text-[9px] font-mono bg-white/[0.03] text-white/90 px-2 py-0.5 rounded border border-white/5">
                        {chan}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* CARD 2: HIGH-SPEED WIFI FIBER */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: -15, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ y: -8, rotateY: 0, rotateX: 3, borderColor: 'rgba(59, 130, 246, 0.4)' }}
                className="bg-[#0e0e13]/85 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md group shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Wifi size={18} className="animate-pulse" />
                  </div>
                  <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-2 bg-blue-500/10 text-blue-400 rounded-full">GIGABIT RANGE</span>
                </div>

                <h3 className="text-white font-extrabold text-base mb-2 flex items-center gap-1">
                  <span>Fast Gigabit WiFi</span>
                  <Sparkles size={13} className="text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
                </h3>
                <p className="text-xs text-[#8fa2be] leading-relaxed mb-6">
                  Symmetrical optical broadband fibers engineered with intelligent GPON pathways to guarantee low lag gaming, high speed streaming & perfect network rates.
                </p>

                {/* Animated coverage indicator */}
                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                    <span>PATHWAY STATUS:</span>
                    <span className="text-emerald-400 font-bold">1 Gbps ONLINE</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full w-[88%] animate-pulse" />
                  </div>
                </div>
              </motion.div>

              {/* CARD 3: BILLING & TRANSACTION CLEARANCE */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: 15, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ y: -8, rotateY: -3, rotateX: 2, borderColor: 'rgba(16, 185, 129, 0.4)' }}
                className="bg-[#0e0e13]/85 border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md group shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <CreditCard size={18} />
                  </div>
                  <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-2 bg-emerald-500/10 text-emerald-400 rounded-full">REALTIME SETTLEMENT</span>
                </div>

                <h3 className="text-white font-extrabold text-base mb-2 flex items-center gap-1">
                  <span>Sleek Online Billing</span>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Clear outstanding DTH or Fiber bills with instant automated ledger clearance. Securely synced directly to databases with instant proof references.
                </p>

                {/* Simulated Ledger entry */}
                <div className="pt-3 border-t border-white/5">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">Ledger Gateway</span>
                    <span className="text-emerald-400 font-extrabold">Active & Latency Free</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        )}

        {/* PROGRESS LOADING BAR SYSTEM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-14 w-full max-w-xl mx-auto flex flex-col space-y-3.5 px-4 relative z-30"
        >
          {/* Telemetry status & percentage text */}
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-[#FF5500] uppercase tracking-wider flex items-center gap-2 font-bold animate-pulse">
              <span className="w-2 h-2 bg-[#FF5500] rounded-full" />
              <span>{statusText}</span>
            </span>
            <span className="text-white font-black text-sm">{progress}%</span>
          </div>

          {/* Symmetrical High-Tech Progress Loading Line */}
          <div className="w-full h-[6px] bg-white/5 rounded-full overflow-hidden border border-white/5 relative p-[1px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#FF7A00] via-[#FF5500] to-red-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
            <span>STATION SYSTEM LOAD: ACTIVE</span>
            <span>SECURE CRYPTO HANDSHAKE CLIENT</span>
          </div>
        </motion.div>

      </main>

      {/* FOOTER METRICS BAR */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/5 flex flex-wrap gap-6 items-center justify-between text-[10px] font-mono text-[#5f7491]">
        <div>
          <span>© 2026 Raja Sun Comms Satellite Labs. Centralized DB Certification.</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#FF5500] rounded-full animate-pulse" />
            <span>DTH TRANSPO: ACTIVE</span>
          </span>
          <span>|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span>FIBER NODE: GPON-1029</span>
          </span>
          <span>|</span>
          <span className="text-emerald-400 font-extrabold uppercase">SECURE PORTAL CONNECTION</span>
        </div>
      </footer>
    </div>
  );
}
