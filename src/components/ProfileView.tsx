import React, { useState, useRef } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Tv, 
  Upload, 
  Check, 
  AlertCircle,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { UserSession } from '../types';

interface ProfileViewProps {
  session: UserSession;
  onUpdateProfile: (updated: Partial<UserSession>) => void;
}

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', label: 'Classic Corporate' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', label: 'Executive Guy' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150', label: 'Pristine Headshot' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', label: 'Elegance Elite' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', label: 'Operations Specialist' },
  { id: 'av6', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3Bvo3A-EbU7m0xyNOPoOgK2hacOzHfSriSsc6_7HS160_i0S_UOQuAy_vsA84HKAsFoEhkTPPO2okBKM8FKD3Onipmc8Qeml5Umr0AFvmyffG61jNc4BQnN6uSCK1Z_NNEfm5_KPKhstzhqyd_HVE-vysvQz6FvMx1mR_cmjwOQJN23PeNVyEzMNCbhkNxEhbb0Ve0SlBKwPeIMRYpgrffafn_xa6urTRHA8iUdJdF7rzVquc0RH-thBuz9oqV6g6YEgUiE3BQ9E', label: 'Regional Manager' },
];

export default function ProfileView({ session, onUpdateProfile }: ProfileViewProps) {
  // Local form states initialized with session values
  const [name, setName] = useState(session.name || '');
  const [phone, setPhone] = useState(session.phone || '+91 94451 09842');
  const [email, setEmail] = useState(session.email || 'customer.care@rajacommunications.com');
  const [address, setAddress] = useState(session.address || 'Plot 12, Main Sec-4, Electronics City, Bangalore, India');
  const [planName, setPlanName] = useState(session.planName || 'Super Gold Telugu Ultra HD Pack');
  const [smartCardNumber, setSmartCardNumber] = useState(session.smartCardNumber || '6009-8821-4478');
  const [photoUrl, setPhotoUrl] = useState(session.photoUrl || PRESET_AVATARS[0].url);
  const [activeStatus, setActiveStatus] = useState<'Active' | 'Suspended' | 'In Grace Period'>(session.activeStatus || 'Active');

  const [dragActive, setDragActive] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomUrlForm, setShowCustomUrlForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Invalid file type. Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64Url = event.target.result as string;
        setPhotoUrl(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      phone,
      email,
      address,
      planName,
      smartCardNumber,
      photoUrl,
      activeStatus
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  const loadPresetAvatar = (url: string) => {
    setPhotoUrl(url);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setPhotoUrl(customUrlInput.trim());
      setShowCustomUrlForm(false);
      setCustomUrlInput('');
    }
  };

  return (
    <div className="space-y-8 entrance-fade">
      <div>
        <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
          USER PROFILE & PREFERENCES
        </span>
        <h2 className="font-display text-3xl text-white font-bold tracking-tight mt-1">
          Subscriber Credentials
        </h2>
        <p className="text-sm font-sans text-on-surface-variant mt-1">
          Modify your avatar portrait, account holder information, installation address coordinates, and active smartcard profile.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-2xl flex items-center gap-3 backdrop-blur-xl animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shrink-0" />
          <p className="text-xs text-[#b7c8de] leading-snug font-semibold font-mono">
            SUCCESS: Profile changes compiled & coordinated with Oracle ledger authority.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Avatar & Photo Customizer */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border-white/10 space-y-6">
            <h3 className="font-display text-sm tracking-widest uppercase text-white font-bold flex items-center gap-2">
              <Camera size={16} className="text-[#FF5500]" />
              <span>AVATAR PORTRAIT</span>
            </h3>

            {/* Current Photo Preview */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7A00] to-[#FF0000] rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <img 
                  src={photoUrl} 
                  alt="Avatar Preview" 
                  className="w-32 h-32 rounded-full border-4 border-white/10 object-cover relative z-10 shadow-xl"
                  onError={(e) => {
                    // Fallback source if custom url breaks
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                  }}
                />
                
                {/* Active Role Stamp */}
                <div className="absolute -bottom-1 right-2 bg-[#FF5500] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded-full z-20 uppercase shadow-md pointer-events-none">
                  {session.role === 'admin' ? 'MD' : 'Sub'}
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-sm font-bold text-white max-w-[200px] truncate">{name || 'Guest User'}</h4>
                <p className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">{session.identifier || 'SUB-0000'}</p>
              </div>
            </div>

            {/* Interactive Image Choice Presets */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant block uppercase text-center">
                Select from Curated Presets
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => loadPresetAvatar(av.url)}
                    className={`relative rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                      photoUrl === av.url ? 'border-[#FF5500] ring-4 ring-[#FF5500]/20' : 'border-white/10'
                    }`}
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-10 h-10 object-cover rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Upload block - Strict Usability constraint */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-on-surface-variant block uppercase text-center">
                OR Upload Offline Picture
              </span>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                  dragActive 
                    ? 'border-[#FF5500] bg-[#FF5500]/5 text-white' 
                    : 'border-white/15 bg-black/20 hover:border-white/40 text-on-surface-variant hover:text-white'
                }`}
              >
                <Upload size={20} className={dragActive ? 'text-[#FF5500]' : 'text-on-surface-variant'} />
                <span className="text-xs font-semibold block">Drag image here or click</span>
                <span className="text-[9px] font-mono opacity-65">PNG, JPG, or WEBP up to 2MB</span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </div>
            </div>

            {/* Custom URL Input toggle button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowCustomUrlForm(!showCustomUrlForm)}
                className="text-[10px] text-on-surface-variant hover:text-[#FF5500] font-bold underline cursor-pointer uppercase tracking-wider"
              >
                {showCustomUrlForm ? 'Cancel URL Entry' : 'Enter Custom Image URL'}
              </button>

              {showCustomUrlForm && (
                <div className="mt-3 bg-black/40 p-3 rounded-xl border border-white/5 space-y-2 text-left animate-slide-up">
                  <label className="text-[10px] text-white/75 font-semibold font-mono block">Image Web URL</label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 bg-[#0A0A0B] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FF5500] font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCustomUrlSubmit}
                      className="bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-[#FF5500] hover:text-white transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Subscriber/Admin Detail Fields */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Identity Fields Card */}
          <div className="glass-panel rounded-3xl p-6 border-white/10 space-y-4">
            <h3 className="font-display text-sm tracking-widest uppercase text-white font-bold flex items-center gap-2">
              <User size={16} className="text-[#FF5500]" />
              <span>Holder Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Display Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-on-surface-variant">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                    placeholder="Enter subscriber name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Smartcard / ID Identifier (Read Only)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-on-surface-variant">
                    <CreditCard size={14} />
                  </span>
                  <input
                    type="text"
                    disabled
                    value={session.identifier}
                    className="w-full bg-[#0A0A0B]/60 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-white/50 text-xs font-mono select-none"
                    title="Account ID modifier locked. Contact administrator to override."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Primary Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-on-surface-variant">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#FF5500]"
                    placeholder="+91 12345 67890"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Billing Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-on-surface-variant">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#FF5500]"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                DTH Hardware Hub Installation Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-on-surface-variant">
                  <MapPin size={14} />
                </span>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-xs focus:outline-none focus:border-[#FF5500] resize-none leading-relaxed"
                  placeholder="Enter complete installation/billing address"
                />
              </div>
            </div>
          </div>

          {/* DTH Connection Node Settings Card */}
          <div className="glass-panel rounded-3xl p-6 border-white/10 space-y-4">
            <h3 className="font-display text-sm tracking-widest uppercase text-white font-bold flex items-center gap-2">
              <Tv size={16} className="text-[#FF5500]" />
              <span>DTH Feed Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Core Rental Subscription Plan {session.role === 'admin' ? '(Internal Tag)' : ''}
                </label>
                {session.role === 'admin' ? (
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                  />
                ) : (
                  <select
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                  >
                    <option value="Super Gold Telugu Ultra HD Pack">Super Gold Telugu Ultra HD Pack (₹450/mo)</option>
                    <option value="Ultimate Sports & Premium Cinema HD Pack">Ultimate Sports & Premium Cinema HD Pack (₹590/mo)</option>
                    <option value="South Star Family Pack HD">South Star Family Pack HD (₹320/mo)</option>
                    <option value="Telugu Regional Value Pack">Telugu Regional Value Pack (₹190/mo)</option>
                    <option value="Raja Diamond Comprehensive 4K Bundle">Raja Diamond Comprehensive 4K Bundle (₹899/mo)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  LNB / STB Smartcard ID
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-on-surface-variant">
                    <Layers size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={smartCardNumber}
                    onChange={(e) => setSmartCardNumber(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#FF5500]"
                    placeholder="xxxx-xxxx-xxxx"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant font-semibold block mb-1.5">
                  Signal Feed Authorization Status
                </label>
                <div className="flex gap-2">
                  {(['Active', 'Suspended', 'In Grace Period'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveStatus(status)}
                      className={`flex-1 py-2 text-center rounded-xl text-[10px] font-bold font-mono transition-all border ${
                        activeStatus === status
                          ? status === 'Active'
                            ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30 shadow-md shadow-[#25D366]/5'
                            : status === 'Suspended'
                              ? 'bg-red-500/10 text-red-500 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-black/40 text-on-surface-variant border-white/5 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-3">
                <ShieldCheck className="text-[#FF5500] shrink-0" size={20} />
                <div className="text-[10px] leading-relaxed text-on-surface-variant">
                  <span className="text-white font-bold block">128-bit Encryption Synchronized</span>
                  Security status vetted by Oracle Global Clearance Authority. Smartcard verified.
                </div>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="flex items-center justify-between gap-4 py-2 pt-1 border-t border-white/5">
            <div className="hidden sm:flex items-center gap-2.5 text-[10px] text-on-surface-variant/80 font-mono">
              <Sparkles size={12} className="text-[#FF5500]" />
              <span>Updates apply instantly to layouts</span>
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto bg-white hover:bg-[#FF5500] hover:text-white text-black px-8 py-4 rounded-xl text-xs font-black transition-all hover:scale-[1.01] active:scale-95 shadow-lg tracking-wider"
            >
              COMPILE & SAVE CHANGES
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
