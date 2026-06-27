import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Check, 
  Activity, 
  Wrench, 
  Navigation,
  RefreshCw,
  Tv,
  MessageSquare,
  ExternalLink,
  Satellite,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { ServiceRequest, UserSession } from '../types';

interface CustomerTrackingProps {
  session: UserSession;
  requests: ServiceRequest[];
}

export default function CustomerTracking({ session, requests }: CustomerTrackingProps) {
  // Filter requests belonging to this customer
  const customerRequests = requests.filter(r => r.customerId === session.identifier);

  // If there are any requests, default to the first one, else default to REQ-4091 or REQ-4092 if they exist
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  
  useEffect(() => {
    if (customerRequests.length > 0) {
      setSelectedReq(customerRequests[0]);
    } else if (requests.length > 0) {
      // Fallback if no specific request has customer ID, just let them see the public ones for robust demo
      setSelectedReq(requests[0]);
    }
  }, [requests, session.identifier]);

  const [typedId, setTypedId] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string>('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  // Simulation parameters
  const [simulationActive, setSimulationActive] = useState(false);
  const [transitPercentage, setTransitPercentage] = useState(35);
  const [etaMinutes, setEtaMinutes] = useState(18);

  const steps = [
    { name: 'Dispatched', desc: 'Equipment allocated from Raja outer Hub storage', done: true },
    { name: 'En-Route', desc: `Service team transiting through city sectors (eta ~${etaMinutes}m)`, done: transitPercentage >= 40 },
    { name: 'On-Site Diagnostic', desc: 'Antenna gain alignment & high signal locking sweep', done: transitPercentage >= 90 },
    { name: 'Provision Completed', desc: 'Settle OTA activations & clear system telemetry feedback', done: transitPercentage === 100 }
  ];

  // Run a beautiful animation to simulate live technician moving on map coordinates
  useEffect(() => {
    let timer: any;
    if (simulationActive) {
      timer = setInterval(() => {
        setTransitPercentage((prev) => {
          if (prev >= 100) {
            setSimulationActive(false);
            setEtaMinutes(0);
            return 100;
          }
          const nextVal = prev + 5;
          const remainingEta = Math.max(0, Math.round((100 - nextVal) * 0.3));
          setEtaMinutes(remainingEta);
          return nextVal;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [simulationActive]);

  const handleIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedId.trim()) return;

    const matched = requests.find(r => r.id.toLowerCase() === typedId.trim().toLowerCase());
    if (matched) {
      setSelectedReq(matched);
      setSearchFeedback('');
      // Reset simulator slightly
      setTransitPercentage(matched.status === 'Completed' ? 100 : 35);
      setEtaMinutes(matched.status === 'Completed' ? 0 : 22);
    } else {
      setSearchFeedback('Request/Subscriber ID not active on local sector registers.');
      setTimeout(() => setSearchFeedback(''), 4000);
    }
  };

  const startTransitSimulation = () => {
    setTransitPercentage(35);
    setEtaMinutes(20);
    setSimulationActive(true);
  };

  const currentStep = transitPercentage < 40 ? 1 : transitPercentage < 90 ? 2 : transitPercentage < 100 ? 3 : 4;

  return (
    <div className="space-y-8 entrance-fade">
      {/* Upper info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
            TRACKING MATRIX
          </span>
          <h2 className="font-display text-3xl text-white font-bold tracking-tight mt-1">
            My Order Status
          </h2>
          <p className="text-sm font-sans text-on-surface-variant mt-1">
            Real-time GPS technician coordinate streams, over-the-air signals, and dispatch updates.
          </p>
        </div>

        {/* Action simulators */}
        {selectedReq && selectedReq.status !== 'Completed' && (
          <button
            onClick={startTransitSimulation}
            disabled={simulationActive}
            className="flex items-center gap-2 bg-[#1A1818] border border-white/10 text-xs px-4 py-2 rounded-xl text-[#FF5500] hover:bg-white/5 font-semibold transition-all select-none self-start md:self-auto disabled:opacity-50"
          >
            <RefreshCw className={simulationActive ? 'animate-spin' : ''} size={13} />
            <span>Simulate Live Movement</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Requests list selector & Lookup tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-4">
            <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider">Search Workspace</h3>
            
            <form onSubmit={handleIdSearch} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-on-surface-variant/70">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Insert ticket (e.g. REQ-4091)"
                  value={typedId}
                  onChange={(e) => setTypedId(e.target.value)}
                  className="w-full bg-[#0E0E0F] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-white hover:bg-[#FF5500] hover:text-white text-black text-xs font-bold font-sans px-4 py-2 rounded-xl transition-all h-full"
              >
                Match
              </button>
            </form>

            {searchFeedback && (
              <p className="text-[10px] text-red-500 font-medium font-mono">{searchFeedback}</p>
            )}
          </div>

          {/* Customer Orders list */}
          <div className="glass-panel p-5 rounded-2xl border-white/10 space-y-4">
            <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider">My Active Requests</h3>
            
            {customerRequests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-on-surface-variant leading-relaxed">No orders booked yet.</p>
                <p className="text-[10px] text-on-surface-variant/60 mt-1">Submit product orders or installations inside request hub!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
                {customerRequests.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReq(r);
                      setTransitPercentage(r.status === 'Completed' ? 100 : 35);
                      setEtaMinutes(r.status === 'Completed' ? 0 : 18);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                      selectedReq?.id === r.id
                        ? 'bg-[#FF5500]/10 border-[#FF5500]/30 shadow-md shadow-[#FF5500]/5 text-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-on-surface-variant'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold font-mono tracking-tight">{r.id}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        r.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                        r.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                        'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/20 animate-pulse'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-none truncate text-white">{r.type}</p>
                      <p className="text-[10px] text-on-surface-variant/80 mt-1 truncate">{r.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Tracking detail dashboard */}
        <div className="lg:col-span-8">
          {selectedReq ? (
            <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
              
              {/* Tracker detail card header */}
              <div className="p-6 border-b border-white/5 bg-[#0A0A0B]/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#FF5500] border border-white/5">
                    {selectedReq.type.includes('Signal') ? <Satellite size={22} /> : <Tv size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#FF5500] font-bold">{selectedReq.id}</span>
                      <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full" />
                      <span className="text-xs text-on-surface-variant font-mono">{selectedReq.createdAt || 'Active Workload'}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-white mt-0.5">{selectedReq.type}</h3>
                  </div>
                </div>

                <div className="text-sm text-right shrink-0">
                  <span className="text-[10px] text-on-surface-variant/85 font-mono uppercase tracking-wider block">Service Status</span>
                  <span className={`inline-block px-3 py-1 font-mono text-[10px] uppercase font-bold rounded-full mt-1.5 ${
                    selectedReq.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    selectedReq.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/30 glow-accent-gold animate-pulse'
                  }`}>
                    {selectedReq.status}
                  </span>
                </div>
              </div>

              {/* Simulated Map visual container */}
              <div className="relative h-64 bg-[#09090A] border-b border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                  <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.015)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.015)_2px,transparent_2px)] bg-[size:40px_40px] pointer-events-none" />
                </div>

                <div className="absolute top-1/4 left-1/5 w-16 h-16 rounded-full bg-[#FF5500]/5 filter blur-xl pointer-events-none" />
                <div className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full bg-[#1A2B3C]/10 filter blur-2xl pointer-events-none" />

                {/* SVG Path Route Illustration */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1A2B3C" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FF5500" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer active road track path */}
                  <path
                    d="M 120,180 Q 280,60 440,160 T 640,90"
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  
                  {/* Inner line */}
                  <path
                    d="M 120,180 Q 280,60 440,160 T 640,90"
                    fill="none"
                    stroke="#FF5500"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
                  
                  {/* Outer nodes */}
                  <circle cx="120" cy="180" r="10" fill="#141314" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="640" cy="90" r="12" fill="#FF5500" stroke="rgba(255,85,0,0.2)" strokeWidth="8" className="animate-pulse" />
                </svg>

                {/* Moving Engineer dynamic marker position along the vector route layout */}
                <div 
                  className="absolute transition-all duration-1000 ease-out"
                  style={{
                    left: `${15 + transitPercentage * 0.65}%`,
                    top: `${48 - (transitPercentage * 0.15) + (Math.sin(transitPercentage * 0.1) * 12)}%`,
                  }}
                >
                  <div className="relative">
                    <span className="absolute -inset-4 bg-[#FF5500]/30 rounded-full animate-ping pointer-events-none" />
                    <div className="w-10 h-10 bg-[#FF5500] rounded-full border-2 border-[#0A0A0B] shadow-xl flex items-center justify-center text-white scale-105">
                      <Navigation size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>

                {/* Live indicators */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                    <span className="text-[10px] font-bold text-white font-mono tracking-wider uppercase">Live GPS Active</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 max-w-xs text-right">
                  <div className="bg-black/95 backdrop-blur-md p-3.5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono tracking-wider">Active Technician</p>
                    <p className="text-xs text-white font-bold mt-0.5">{selectedReq.technician || 'Engineering Core Unit'}</p>
                    <p className="text-[9px] text-on-surface-variant/80 font-mono mt-1">{selectedReq.phone || '+91 94451 09842'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Stepper Timeline layout */}
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-white/5 border border-white/5 rounded-xl backdrop-blur-md gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FF5500]/15 flex items-center justify-center text-[#FF5500]">
                      <Wrench size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs text-white font-bold">Technician Dispatch ETA</h4>
                      <p className="text-[10px] text-on-surface-variant">Estimated based on city traffic logs</p>
                    </div>
                  </div>

                  <div className="text-right w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-mono">Estimated Arrival</p>
                    <p className="text-sm text-[#FF5500] font-bold font-mono mt-0.5">
                      {selectedReq.status === 'Completed' ? 'ARRIVED & CLOSED' : etaMinutes > 0 ? `${etaMinutes} MINS` : 'ARRIVED'}
                    </p>
                  </div>
                </div>

                {/* Timeline display listing current processes completed or en-route */}
                <div className="space-y-6 relative before:absolute before:inset-y-3 before:left-5 before:w-[1px] before:bg-white/10">
                  {steps.map((step, idx) => {
                    const isActive = currentStep >= idx + 1;
                    const isCurrent = currentStep === idx + 1;
                    
                    return (
                      <div key={idx} className="flex gap-4 relative">
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border transition-all duration-300 ${
                          isActive 
                            ? 'bg-[#FF5500] border-transparent text-white font-bold shadow-md shadow-[#FF5500]/15' 
                            : 'bg-[#141313] border-white/5 text-on-surface-variant'
                        }`}>
                          {isActive && currentStep > idx + 1 ? <Check size={14} /> : <span className="text-xs font-mono">{idx + 1}</span>}
                        </div>
                        
                        <div className="pt-1 select-none">
                          <h4 className={`text-xs font-bold font-display ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>
                            {step.name}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant/80 font-sans mt-0.5">
                            {step.desc}
                          </p>
                          {isCurrent && selectedReq.status !== 'Completed' && (
                            <span className="inline-block px-2.5 py-0.5 mt-2 bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] font-mono text-[9px] uppercase font-semibold rounded-full">
                              Active State
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowWhatsAppModal(true)}
                    className="flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white hover:brightness-110 py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FF5500]/10"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp Chat Engineer</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
              <Satellite size={48} className="text-on-surface-variant/50 border border-white/5 p-3 rounded-full bg-white/5" />
              <h4 className="text-white font-semibold font-display">No Tracking Target Active</h4>
              <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
                Please register a product request or schedule an installation under the **Request Hub** view, or filter your active order cards under list row.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* WhatsApp Redirect Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-white/10 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
              <MessageSquare size={28} />
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-lg font-display">Chat via WhatsApp</h4>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                Connect directly with service assistant coordinating your hardware dispatches on WhatsApp.
              </p>
              <p className="text-sm font-mono font-bold text-[#FF5500] bg-white/5 py-1.5 px-3 rounded border border-white/5 inline-block">
                +91 9849500936
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-xl text-xs font-bold font-mono transition-all"
              >
                Close
              </button>
              <a
                href={`https://wa.me/919849500936?text=${encodeURIComponent("Hello Raja Sun Communicatios! 👋 I am reaching out regarding my DTH connection. Could you please help me with a service request? 📺")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Proceed</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
