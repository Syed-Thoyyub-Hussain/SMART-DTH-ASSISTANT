import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Calendar, 
  Check, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone,
  Filter,
  Wifi,
  Receipt,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  Mail,
  X
} from 'lucide-react';
import { ServiceRequest, UserSession } from '../types';

interface CustomerRequestHubProps {
  session: UserSession;
  onAddRequest: (newReq: ServiceRequest) => void;
  onNavigateToTracking: () => void;
}

interface Product {
  id: string;
  name: string;
  category: 'Equipments' | 'Cables & Boosters' | 'Upgrades';
  description: string;
  price: number;
  specs: string[];
  inStock: boolean;
}

export default function CustomerRequestHub({ 
  session, 
  onAddRequest, 
  onNavigateToTracking 
}: CustomerRequestHubProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'schedule' | 'cbill'>('products');
  const [productFilter, setProductFilter] = useState<string>('All');
  
  // Ticked Products ID Array for "tick down" shopping style
  const [tickedProductIds, setTickedProductIds] = useState<string[]>([]);
  
  // Bulks purchase addresses & details
  const [orderAddress, setOrderAddress] = useState(session.address || 'Plot 12, Main Sec-4, Electronics City');
  const [orderPhone, setOrderPhone] = useState(session.phone || '+91 94451 09842');
  const [orderOrdered, setOrderOrdered] = useState(false);

  // Schedule Installation Form State
  const [installType, setInstallType] = useState('New Satellite Dish Installation');
  const [address, setAddress] = useState(session.address || '');
  const [phone, setPhone] = useState(session.phone || '+91 94451 09842');
  const [date, setDate] = useState('2026-06-25');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [scScheduled, setScScheduled] = useState(false);

  // C-Bill Payment Request State
  const [smartCardNumber, setSmartCardNumber] = useState(session.smartCardNumber || '6009-8821-4478');
  const [billMonth, setBillMonth] = useState('June 2026');
  const [requestAmount, setRequestAmount] = useState('590');
  const [clearanceMode, setClearanceMode] = useState('Admin Cash Pick-up Courier'); // Courier pickup, Wire proof, Add to cycle
  const [wireReference, setWireReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [cbillSubmitted, setCbillSubmitted] = useState(false);

  // Expanded Product catalog with Sun Direct relevant accessories, NO IMAGES
  const productCatalog: Product[] = [
    {
      id: 'PROD-SMART-4K',
      name: 'Sun Smart 4K Ultra HD Box',
      category: 'Upgrades',
      description: 'Next-gen Dolby Atmos enabled receiver with built-in streaming integrations and 1080p-to-4K dynamic upscaling.',
      price: 3499,
      specs: ['Dolby Digital Plus 7.1', 'HDR10+ Playback', 'Wi-Fi / Ethernet dual mode', '1 Year Brand Warranty'],
      inStock: true
    },
    {
      id: 'PROD-STB-RECORDER',
      name: 'Sun Direct Prime HD HEVC Recorder Box',
      category: 'Upgrades',
      description: 'Premium recording-enabled Set-Top Box allowing simultaneous channel recording, schedules, and live pausing.',
      price: 2899,
      specs: ['USB recording support', 'HEVC H.265 compression', 'Dolby Digital Plus audio', 'Instant pause / rewind'],
      inStock: true
    },
    {
      id: 'PROD-WIFI-ROUTER',
      name: 'Sun Direct Dual-Band Smart WiFi Gigabit Extender',
      category: 'Equipments',
      description: 'High gain multi-antenna hardware unit optimizing home WiFi coverage for smart IPTV feeds and local network streaming.',
      price: 1499,
      specs: ['1200Mbps max speeds', '4 external omni antennas', 'Beamforming technology', 'Ideal for home IPTV casting'],
      inStock: true
    },
    {
      id: 'PROD-WIFI-DONGLE',
      name: 'Sun Direct Official Smart STB WiFi Dongle',
      category: 'Upgrades',
      description: 'Authentic high-gain USB Wi-Fi receiver for quick web applications and OTT activation on legacy digital boxes.',
      price: 599,
      specs: ['Dual-band 2.4/5GHz support', 'Plug & play matching codes', 'Sleek mini form factor'],
      inStock: true
    },
    {
      id: 'PROD-DISH-85',
      name: 'High-Gain 85cm Parabolic Offset Dish Reflector',
      category: 'Equipments',
      description: 'Anti-corrosive powder galvanized steel reflector engineered to resist monsoon gale-force winds and heavy rain.',
      price: 1590,
      specs: ['85cm parabolic offset', 'Powder galvanized steel', 'Anti-rust gray coating', 'Mast mount bracket included'],
      inStock: true
    },
    {
      id: 'PROD-LNB-DUAL',
      name: 'Optima Dual LNB Core Feedhorn Unit',
      category: 'Equipments',
      description: 'Gold-plated weather-shielded Feedhorn that splits signal feeds cleanly to multiple rooms without gain degradation.',
      price: 899,
      specs: ['0.1dB ultra low noise figure', 'LTE frequency filters', 'Coaxial direct lock', 'Fully gold plated'],
      inStock: true
    },
    {
      id: 'PROD-TRIPLE-BRACKET',
      name: 'Multi-Directional Triple LNB Bracket System',
      category: 'Equipments',
      description: 'Engineered bracket clamp supporting up to three independent Feedhorns on a singular offset dish.',
      price: 299,
      specs: ['Precision steel alloy', 'Weather-proof electroplating', 'Universal screw anchors'],
      inStock: true
    },
    {
      id: 'PROD-MAST-STAND',
      name: 'Galvanized Wind-Resistant Antenna Ground Pole/Mast',
      category: 'Equipments',
      description: 'Heavy gauge steel installation pipe for secure vertical mounting on concrete decks and brick surfaces.',
      price: 750,
      specs: ['Hot-dip galvanized steel', 'Integral footer plate', 'Resists 120km/h gales'],
      inStock: true
    },
    {
      id: 'PROD-COAX-BOOST',
      name: 'RG-6 High Gain Coaxial Line Booster',
      category: 'Cables & Boosters',
      description: 'Active digital amplifier powered line circuit that stabilizes signal DB gain when line run is over 35 meters.',
      price: 499,
      specs: ['+24dB flat gain sweep', 'Solid-state shielding', '5 - 2400 MHz range', 'Cascade compatible'],
      inStock: true
    },
    {
      id: 'PROD-MULTI-ROOM',
      name: 'Raja Multi-Room Master Switch Splice (4-Way)',
      category: 'Cables & Boosters',
      description: 'Master distribution toggle allowing up to 4 companion Set-Top Boxes to latch on to a singular outdoor antenna.',
      price: 1290,
      specs: ['4-Way heavy duty multiport', 'Internal diode steering', 'Zero passive attenuation', 'Rugged zinc diecast'],
      inStock: true
    },
    {
      id: 'PROD-CABLE-RG11',
      name: 'Premium Grade Low-Loss RG-11 Shielded Coaxial (30m)',
      category: 'Cables & Boosters',
      description: 'High-tier low-attenuation burial/outdoor coaxial wire run maximizing signal integrity over extreme distances.',
      price: 799,
      specs: ['Quad-shield braid design', 'Waterproof PVC casing', 'Terminated F metallic adapters'],
      inStock: true
    },
    {
      id: 'PROD-HDMI-GOLD',
      name: 'Premium 8K Gold-Plated HDMI Interface Link (3m)',
      category: 'Cables & Boosters',
      description: 'Triple-shielded oxygen-free copper digital lead ensuring pristine pixel throughput between HD receiver and TV.',
      price: 290,
      specs: ['48Gbps ultra bandwidth', 'Dolby Vision compatible', 'Heavy nylon braid casing'],
      inStock: true
    },
    {
      id: 'PROD-REMOTE-UNIV',
      name: 'Universal DTH Programmable Remote Controller',
      category: 'Equipments',
      description: 'Ergonomic controller pre-programmed with Sun Direct frequency codes and major smart TV brand setups.',
      price: 350,
      specs: ['IR learning functions', 'Soft tactile rubber keys', 'Pre-calibrated out of the box'],
      inStock: true
    },
    {
      id: 'PROD-DISH-SHIELD',
      name: 'Monsoon Parabolic Dish Rain Fade Protector',
      category: 'Equipments',
      description: 'Clear hydrophobic weather guard that prevents water film accumulation over the LNB feedhorn to stop rain fade-outs.',
      price: 420,
      specs: ['Anti-static polymer', 'Stops heavy wet signal drop', 'Includes steel fasteners'],
      inStock: true
    },
    {
      id: 'PROD-DIY-METER',
      name: 'SAT-Link Digital DB Alignment Signal Finder Meter',
      category: 'Equipments',
      description: 'Handheld dynamic frequency alignment tool with acoustic tone tracking for DIY satellite pointing.',
      price: 1895,
      specs: ['LCD backlit display', 'Real-time dB readout', 'Supports high-band transponders'],
      inStock: true
    }
  ];

  // Tick toggle handler
  const handleToggleProductTick = (id: string) => {
    setTickedProductIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (filtered: Product[]) => {
    const filteredIds = filtered.map(p => p.id);
    const allSelected = filteredIds.every(id => tickedProductIds.includes(id));
    if (allSelected) {
      setTickedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setTickedProductIds(prev => {
        const unique = new Set([...prev, ...filteredIds]);
        return Array.from(unique);
      });
    }
  };

  // Create combined dispatch for tapped/ticked hardware items 
  const handleCreateTickedProductsRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetedProducts = productCatalog.filter(p => tickedProductIds.includes(p.id));
    if (targetedProducts.length === 0) return;

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = targetedProducts.reduce((sum, p) => sum + p.price, 0);
    const itemNames = targetedProducts.map(p => p.name).join(', ');

    const newReq: ServiceRequest = {
      id: reqId,
      type: `Hardware Dispatch: ${itemNames}`,
      address: orderAddress || 'Plot 12, Main Sec-4, Electronics City',
      technician: 'Administrative Standby - Dispatch team allocated',
      status: 'Pending',
      phone: orderPhone,
      customerName: session.name,
      customerId: session.identifier,
      cost: totalCost,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    onAddRequest(newReq);
    setOrderOrdered(true);
    setTimeout(() => {
      setTickedProductIds([]);
      setOrderOrdered(false);
      onNavigateToTracking();
    }, 2000);
  };

  const handleScheduleInstallation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) return;

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Fee mapping
    let cost = 999;
    if (installType.includes('Broadband') || installType.includes('WiFi')) {
      cost = 1499;
    } else if (installType.includes('C-Bill')) {
      cost = 250;
    } else if (installType.includes('Box')) {
      cost = 1299;
    }

    const newReq: ServiceRequest = {
      id: reqId,
      type: `Installation: ${installType}`,
      address: address,
      technician: 'Awaiting dispatch coordinator assignment',
      status: 'Pending',
      phone: phone,
      customerName: session.name,
      customerId: session.identifier,
      cost: cost,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      appointmentSlot: `${date} (${timeSlot})`
    };

    onAddRequest(newReq);
    setScScheduled(true);
    setTimeout(() => {
      setScScheduled(false);
      setAddress('');
      onNavigateToTracking();
    }, 2000);
  };

  // Handle C-Bill Clearance Submission
  const handleCbillClearanceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount.trim()) return;

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const costValue = parseInt(requestAmount, 10) || 590;

    const details = `C-Bill payment clearance request. Card ID: ${smartCardNumber}. Month: ${billMonth}. Mode: ${clearanceMode}. ${
      wireReference ? `Reference: ${wireReference}. ` : ''
    }${customerNotes ? `Notes: ${customerNotes}` : ''}`;

    const newReq: ServiceRequest = {
      id: reqId,
      type: `C-Bill Admin Settle: ₹${costValue} Clearing (${clearanceMode})`,
      address: session.address || 'Direct Account Balance Adjustment',
      technician: 'Oracle Billing Administrator',
      status: 'Pending',
      phone: phone || session.phone,
      customerName: session.name,
      customerId: session.identifier,
      cost: costValue,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      appointmentSlot: `Awaiting Admin Clearance Verification`
    };

    onAddRequest(newReq);
    setCbillSubmitted(true);
    setTimeout(() => {
      setCbillSubmitted(false);
      setWireReference('');
      setCustomerNotes('');
      onNavigateToTracking();
    }, 2000);
  };

  const filteredProducts = productFilter === 'All' 
    ? productCatalog 
    : productCatalog.filter(p => p.category === productFilter);

  const tickedProductsCount = tickedProductIds.length;
  const tickedProductsCost = productCatalog
    .filter(p => tickedProductIds.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-8 entrance-fade">
      {/* Page Title */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
            SUBSCRIBER PORTAL
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-white font-bold tracking-tight mt-1">
            Request Hub
          </h2>
          <p className="text-sm font-sans text-on-surface-variant mt-1.5 max-w-2xl">
            Acquire official Sun Direct parts, schedule expert broadband & WiFi engineers, or submit physical C-Bill collection and clearing requests to home or office.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap bg-black/40 border border-white/5 p-1 rounded-xl shrink-0 gap-1 font-mono">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'products'
                ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/15'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <ShoppingCart size={13} />
            <span>Products Catalog</span>
          </button>
          
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'schedule'
                ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/15'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Schedule Service</span>
          </button>

          <button
            onClick={() => setActiveTab('cbill')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'cbill'
                ? 'bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/15'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <Receipt size={13} />
            <span>C-Bill Admin Clears</span>
          </button>
        </div>
      </div>

      {/* Welcome Email Dispatch Banner Alert Row */}
      <div className="bg-gradient-to-r from-[#FF5500]/15 via-black/40 to-black/60 border border-[#FF5500]/25 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5500]/5 rounded-full filter blur-2xl pointer-events-none" />
        <div className="flex gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] shrink-0 self-start md:self-center">
            <Mail size={22} className="text-[#FF5500]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-white font-bold text-sm font-display">
                Raja Communications Onboarding Dispatch
              </h4>
              {session.emailDeliveryStatus === 'Failed' ? (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <AlertTriangle size={11} className="text-amber-400" />
                  <span>Sandbox Restrained</span>
                </span>
              ) : (
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span>Email Delivered Directly</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#b8c9de]/80 mt-1 max-w-2xl leading-relaxed">
              {session.emailDeliveryStatus === 'Failed' ? (
                <span>
                  Hey <strong className="text-white font-medium">{session.name || 'subscriber'}</strong>, we compiled your welcome onboarding package for <code className="text-[#FF5500] bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">{session.email}</code>, but the active Resend developer key is in <strong>trial mode</strong> which restrains delivery strictly to the owner's verification email address. <strong>To send real emails instantly to your friend's inbox or any address, configure SMTP_HOST, SMTP_USER, and SMTP_PASS in the Secrets Option!</strong>
                </span>
              ) : (
                <span>
                  Hey <strong className="text-white font-medium">{session.name || 'subscriber'}</strong>! We successfully dispatched your welcoming portfolio directly to <code className="text-[#FF5500] bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">{session.email}</code>. Open your personal mail app to check your inbox!
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Product checklist column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filtering row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Filter className="text-[#FF5500]" size={14} />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Filter Accessories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Equipments', 'Cables & Boosters', 'Upgrades'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans border transition-all ${
                      productFilter === cat
                        ? 'bg-white text-black border-transparent font-semibold shadow-sm'
                        : 'bg-white/5 text-on-surface-variant border-white/5 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Selection Bar */}
            <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 text-xs text-on-surface-variant">
              <span>Select/Tick components below to construct your dispatch voucher.</span>
              <button 
                type="button"
                onClick={() => handleSelectAllFiltered(filteredProducts)}
                className="text-xs font-mono font-semibold text-[#FF5500] hover:underline"
              >
                {filteredProducts.every(p => tickedProductIds.includes(p.id)) 
                  ? '⚠️ Untick All Page' 
                  : '✓ Tick All Page'}
              </button>
            </div>

            {/* Product list - COMPLETELY REMOVED PHOTOS - KEEPING PRODUCT NAME AND TICKS */}
            <div className="space-y-3">
              {filteredProducts.map((prod) => {
                const isTicked = tickedProductIds.includes(prod.id);
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => handleToggleProductTick(prod.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 select-none ${
                      isTicked 
                        ? 'bg-[#FF5500]/10 border-[#FF5500] text-white shadow-md shadow-[#FF5500]/5' 
                        : 'bg-[#151516] border-white/5 hover:border-white/10 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {/* Ticked Checkbox indicator */}
                    <div className="mt-1 shrink-0">
                      {isTicked ? (
                        <div className="w-5 h-5 rounded-md bg-[#FF5500] flex items-center justify-center text-white scale-110 transition-transform">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border border-white/20 hover:border-white/40 flex items-center justify-center bg-black/20" />
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-semibold text-sm md:text-base tracking-tight transition-colors group-hover:text-white">
                          {prod.name}
                        </h4>
                        <span className="text-xs font-mono font-bold text-[#FF5500] shrink-0">
                          ₹{prod.price}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#b7c8de]/70 leading-relaxed font-sans">
                        {prod.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[9px] uppercase font-mono font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded text-on-surface-variant">
                          {prod.category}
                        </span>
                        {prod.specs.map((spec, index) => (
                          <span key={index} className="text-[9px] font-sans bg-white/5 border border-transparent px-2 py-0.5 rounded text-[#b7c8de]/50">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout voucher dispatch panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-white/10 relative">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <ShoppingCart size={16} className="text-[#FF5500]" />
                <h4 className="text-white font-bold text-sm tracking-tight uppercase font-mono">Requisition Voucher</h4>
              </div>

              {orderOrdered ? (
                <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Check size={24} className="animate-bounce" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Dispatches Lodged!</h5>
                    <p className="text-[11px] text-emerald-400/80 mt-1">
                      Your components requests have been aggregated under subscriber files. Redirecting to status ledger...
                    </p>
                  </div>
                </div>
              ) : tickedProductsCount === 0 ? (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto text-on-surface-variant/40">
                    <CheckSquare size={18} />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-white">Voucher Empty</h5>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                      Select or "Tick" accessory items from the product list on the left to initiate direct commercial dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateTickedProductsRequest} className="space-y-4">
                  {/* Selected items receipt */}
                  <div className="space-y-2 bg-[#0E0E0F] p-3 rounded-xl border border-white/5 max-h-48 overflow-y-auto">
                    <p className="text-[10px] text-on-surface-variant uppercase font-mono">Ticked Items ({tickedProductsCount})</p>
                    {productCatalog
                      .filter(p => tickedProductIds.includes(p.id))
                      .map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs text-white py-1.5 border-b border-white/5 last:border-0">
                          <span className="truncate pr-3 font-medium">{p.name}</span>
                          <span className="font-mono text-[#FF5500] shrink-0 font-bold">₹{p.price}</span>
                        </div>
                      ))}
                    <div className="flex justify-between pt-2 text-xs border-t border-white/10 font-bold text-white">
                      <span>Sub-Total Code Balance</span>
                      <span className="font-mono text-lg text-[#FF5500]">₹{tickedProductsCost}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                      Dispatch physical Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-on-surface-variant">
                        <MapPin size={14} />
                      </span>
                      <input
                        type="text"
                        required
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        placeholder="e.g. Plot 12, Main Sec-4, Bangalore"
                        className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                      Verified Contact Phone
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-on-surface-variant">
                        <Phone size={14} />
                      </span>
                      <input
                        type="tel"
                        required
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        placeholder="+91 94451 09842"
                        className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 text-[10px] text-on-surface-variant leading-relaxed flex gap-2">
                    <Clock size={14} className="text-[#FF5500] shrink-0 mt-0.5" />
                    <span>
                      Administrative managers cross-verify stock ledger balances instantly. Delivery and hardware setup are dispatched as high-priority tasks.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white py-3 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <span>Lodge Requisition (₹{tickedProductsCost})</span>
                    <ShoppingCart size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'schedule' ? (
        /* Schedule Installation Section with WiFi setup */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border-white/10 relative">
            <h3 className="font-display text-lg text-white font-bold mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-[#FF5500]" />
              <span>Request Service Dispatch & Setup</span>
            </h3>

            {scScheduled ? (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Service Booked Successfully!</h4>
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Your service dispatch under {session.identifier} is registered in the database, handing over to dispatch team.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleScheduleInstallation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Hardware & Field Configuration
                    </label>
                    <select
                      value={installType}
                      onChange={(e) => setInstallType(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                    >
                      <option value="Broadband WiFi Router Installation & Line Setup">Broadband WiFi Router Installation & Line Setup (₹1,499)</option>
                      <option value="WiFi DTH Convergence: Smart Box Signal Linking">WiFi DTH Convergence: Smart Box Signal Linking (₹599)</option>
                      <option value="New Satellite Antenna Dish Mounting">New Satellite Antenna Array Setup (₹999)</option>
                      <option value="Multi-Room Secondary Box Extension Setup">Multi-Room Secondary Box Installation (₹1,299)</option>
                      <option value="Low-Noise Feedhorn (LNB) Core Alignment">Low-Noise Feedhorn (LNB) Core Alignment (₹999)</option>
                      <option value="Master Signal Booster Amplifier Calibration">Signal Booster Line Amplifier Setup (₹999)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 94451 09842"
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Preferred Hours slot
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                    >
                      <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning slots)</option>
                      <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Mid-day slots)</option>
                      <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening slots)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                    Installation Coordinates / Residential Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter flat coordinate data, block numbers, street name..."
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-white hover:bg-[#FF5500] hover:text-white text-black px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-white/5 flex items-center gap-2"
                >
                  <Truck size={14} />
                  <span>Book Installation Appointment</span>
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Wifi className="text-[#FF5500]" size={16} />
                <span>Broadband & WiFi Setup</span>
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect your brand new Smart TV Set-Top box over high-speed networks. Our experts specialize in complex optical layouts:
              </p>
              <div className="space-y-2.5 text-[11px] text-on-surface-variant">
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-1 shrink-0" />
                  <span>Full optical cable router setup for IPTV content.</span>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-1 shrink-0" />
                  <span>Interactive setup with zero buffering warranties.</span>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-1 shrink-0" />
                  <span>Wired ethernet adapters customized on-premises.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* C-Bill Payment Request Area targeting Oracle Admin clearance balance */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border-white/10 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-lg text-white font-bold flex items-center gap-2">
                  <Receipt size={18} className="text-[#FF5500]" />
                  <span>C-Bill Admin Payment Clearance</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Request direct administrative clearance of physical billing receipts. Send collection agents to your door steps!
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono bg-white/5 border border-white/10 px-2.5 py-1 text-on-surface-variant rounded-full font-bold">
                C-Bill Gateway
              </span>
            </div>

            {cbillSubmitted ? (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">C-Bill Clearance Lodged with Admin!</h4>
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Receipt verification ID created under {session.identifier}. Admin will reconcile with Oracle Billing ledgers.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCbillClearanceRequest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Subscriber Smartcard Number
                    </label>
                    <input 
                      type="text"
                      required
                      value={smartCardNumber}
                      onChange={(e) => setSmartCardNumber(e.target.value)}
                      placeholder="e.g. 6009-8821-4478"
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Bill Ledger Period (Month)
                    </label>
                    <select
                      value={billMonth}
                      onChange={(e) => setBillMonth(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                    >
                      <option value="June 2026">June 2026 (Current Active Billing)</option>
                      <option value="May 2026">May 2026 (Overdue Arrears Cycle)</option>
                      <option value="April 2026">April 2026 (Prior Cumulative Outstanding)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Clearance Settle Requested Amount (₹)
                    </label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="e.g. 590"
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      Payment Verification Channel
                    </label>
                    <select
                      value={clearanceMode}
                      onChange={(e) => setClearanceMode(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                    >
                      <option value="Admin Cash Pick-up Courier">Dispatched Cash Collection Courier (₹250 service fee)</option>
                      <option value="GPay / PhonePe Mobile wire proof">GPay / UPI Wire Verification Key (Insta Check)</option>
                      <option value="Oracle Cheque Ledger Submission">Cheque / Demand Draft post clearance</option>
                    </select>
                  </div>
                </div>

                {clearanceMode.includes('wire') && (
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                      UPI Transaction Reference ID / Verification UTR ID
                    </label>
                    <input 
                      type="text"
                      required
                      value={wireReference}
                      onChange={(e) => setWireReference(e.target.value)}
                      placeholder="e.g. UTR-9884019284910"
                      className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                    Additional Administrative Message
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="E.g., Please credit current South Star Pack. Courier is requested to visit flat 402 on Saturday morning..."
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] resize-none"
                  />
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-2 items-start text-xs text-on-surface-variant leading-relaxed">
                  <Sparkles size={16} className="text-[#FF5500] shrink-0 mt-0.5" />
                  <span>
                    Upon dispatch ledger validation, the administrative module directly updates your linked account balance inside the **Oracle Billing Master**.
                  </span>
                </div>

                <button
                  type="submit"
                  className="bg-white hover:bg-[#FF5500] hover:text-white text-black px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-white/5 flex items-center gap-2"
                >
                  <Receipt size={14} />
                  <span>Submit C-Bill Settle Request (₹{requestAmount})</span>
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent space-y-4">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Receipt className="text-[#FF5500]" size={16} />
                <span>How C-Billing Works</span>
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Our DTH network features physical counter collections to facilitate rural and suburban subscribers:
              </p>
              <div className="space-y-3 pt-1 text-[11px] text-[#b7c8de]/70 leading-relaxed font-sans">
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] shrink-0 font-bold font-mono text-[10px]">1</div>
                  <span>Admin reviews your submitted card receipt / pick-up address voucher.</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] shrink-0 font-bold font-mono text-[10px]">2</div>
                  <span>Couriers visit or online wire transactions are confirmed via bank gateway records.</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] shrink-0 font-bold font-mono text-[10px]">3</div>
                  <span>Your balance is adjusted to zero on **Oracle Billing Master** instantly.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
