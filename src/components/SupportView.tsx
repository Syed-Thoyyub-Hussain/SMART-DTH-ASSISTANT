import React, { useState } from 'react';
import { 
  Tv, 
  Satellite, 
  Check, 
  Headphones, 
  HelpCircle,
  MessageSquare,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { ServiceRequest } from '../types';

interface SupportViewProps {
  requests: ServiceRequest[];
  onNavigateToHub: () => void;
}

export default function SupportView({ requests, onNavigateToHub }: SupportViewProps) {
  // FAQ section toggle
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { 
      q: "How to bind STAR Sports or HBO packs?", 
      a: "Go to the 'My Billing' interface. Select the target product, enter your subscriber identifier, and click Pay & Activate. Satellite feeds update over-the-air in roughly 60 seconds." 
    },
    { 
      q: "What does Oracle Clearing Ledger mean?", 
      a: "Raja Communications is synchronized directly with regional Oracle Financial Ledger networks. Accounts with outstandings are cleared automatically upon regional manager authorization or digital payments." 
    },
    { 
      q: "My Set Top Box shows 'E48-32 No Signal'?", 
      a: "This signifies rain fade, dish antenna misalignment, or coaxial cable issues. You can instantly book a certified engineer under our centralized Request Hub dispatch scheduler." 
    },
    {
      q: "Are activation fees refundable?",
      a: "All equipment activation, gold-plated coaxial connectors and antenna installations cataloged inside the Request Hub include a 1-year brand warranty."
    }
  ];

  return (
    <div className="space-y-10 entrance-fade">
      
      {/* Upper info */}
      <div>
        <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
          OPERATIONS CENTER
        </span>
        <h2 className="font-display text-3xl text-white font-bold tracking-tight mt-1">
          Help Desk & Troubleshooting
        </h2>
        <p className="text-sm font-sans text-on-surface-variant mt-1">
          Connect directly with live technicians, browse diagnostic FAQs, or access our centralized dispatch scheduler.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: WhatsApp support center and Redundant Form clearout */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* WhatsApp Direct Line Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-[#0c1811] via-[#08080a] to-[#0A0A0B] border border-[#25D366]/20 shadow-xl shadow-[#25D366]/5 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-full filter blur-2xl pointer-events-none group-hover:bg-[#25D366]/10 transition-all duration-500" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl flex items-center justify-center text-[#25D366] shrink-0 shadow-lg">
                    <MessageSquare size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse" />
                      <span className="text-[10px] text-[#25D366] font-mono font-bold tracking-widest uppercase">
                        Active live chat
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight mt-1">WhatsApp Live Support Desk</h3>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Direct Helpline</span>
                  <span className="text-base text-white font-mono font-bold font-display block">
                    +91 9849500936
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Have setup queries, signal issues, or custom billing requests? Chat directly with our regional customer care executive for quick resolution and over-the-air signal activations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#b7c8de]/90">
                  <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                    <Check size={14} className="text-[#25D366]" />
                    <span>Average response time: &lt;5 mins</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
                    <Check size={14} className="text-[#25D366]" />
                    <span>Direct engineering escalation</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/919849500936?text=${encodeURIComponent("Hello Raja Sun Communicatios! 👋 I am reaching out regarding my DTH connection. Could you please help me with a service request? 📺")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex bg-[#25D366] hover:bg-[#1ebd5d] text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 font-sans"
                >
                  <span>Chat with Us on WhatsApp</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Booking / Service Dispatch Redirector (replaces double form) */}
          <div className="glass-panel rounded-3xl p-8 border-white/10 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#FF5500]/5 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 flex-1">
                <h3 className="font-display text-lg text-white font-bold flex items-center gap-2.5">
                  <Satellite size={20} className="text-[#FF5500]" />
                  <span>Physical Installation & Equipment Dispatched</span>
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Looking to schedule service engineers, align satellite dish antennas, setup secondary boxes, or order amplifiers? Settle logistics at our unified scheduler hub.
                </p>
              </div>

              <button
                onClick={onNavigateToHub}
                className="w-full md:w-auto shrink-0 bg-white hover:bg-[#FF5500] hover:text-white text-black px-6 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 duration-200 uppercase tracking-wider"
              >
                <span>Go to Request Hub</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* DTH Trouble FAQ System */}
          <div className="glass-panel rounded-3xl p-6 border-white/10 space-y-4">
            <h3 className="font-display text-lg text-white font-bold flex items-center gap-2">
              <HelpCircle size={18} className="text-[#FF5500]" />
              <span>Subscriber Diagnostic FAQs</span>
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="border-b border-white/5 pb-3.5 cursor-pointer last:border-none"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                  >
                    <div className="flex justify-between items-center gap-3 py-1">
                      <span className="text-xs font-bold text-white hover:text-[#FF5500] duration-200 transition-colors">{faq.q}</span>
                      <span className="text-on-surface-variant/60 font-mono text-xs">{isOpen ? '−' : '+'}</span>
                    </div>
                    {isOpen && (
                      <p className="text-xs text-on-surface-variant/95 mt-2 leading-relaxed bg-[#0A0A0B]/80 p-4 rounded-xl border border-white/10">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Active Dispatches Recap Log */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border-white/10 space-y-4">
            <div>
              <h3 className="font-display text-sm tracking-wide text-white font-bold uppercase">
                Active Tech Dispatches ({requests.length})
              </h3>
              <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">Operations Sub-Branch: C-Bill RO-88</p>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 channel-scroll">
              {requests.map((req) => (
                <div 
                  key={req.id}
                  className="bg-white/5 rounded-xl p-3.5 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#FF5500]">
                      {req.id}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      req.status === 'In Progress' 
                        ? 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/25' 
                        : 'bg-white/5 text-on-surface-variant'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-white font-semibold">{req.type}</p>
                  <p className="text-[10px] text-on-surface-variant/80 truncate">{req.address}</p>
                  
                  <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] text-on-surface-variant/90">
                    <span>Tech: {req.technician}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
