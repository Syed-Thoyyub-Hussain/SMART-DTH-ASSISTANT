import { 
  Home, 
  Tv, 
  Zap, 
  MapPin, 
  Headphones, 
  Plus, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  User,
  Layers,
  Database,
  Sparkles
} from 'lucide-react';
import { ActiveView, UserSession } from '../types';

interface SidebarProps {
  currentView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  session: UserSession;
  onLogout: () => void;
  onNewRequestClick: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  session,
  onLogout,
  onNewRequestClick,
  mobileMenuOpen,
  setMobileMenuOpen
}: SidebarProps) {
  
  const customerNavItems = [
    { id: 'dashboard' as ActiveView, label: 'Request Hub', icon: Home },
    { id: 'tracking' as ActiveView, label: 'My Order Status', icon: MapPin },
    { id: 'recharge' as ActiveView, label: 'My Billing', icon: Zap },
    { id: 'support' as ActiveView, label: 'Help Desk', icon: Headphones },
    { id: 'profile' as ActiveView, label: 'My Profile', icon: User },
  ];

  const adminNavItems = [
    { id: 'dashboard' as ActiveView, label: 'Global Requests', icon: Home },
    { id: 'tracking' as ActiveView, label: 'Supplies & Inventory', icon: Layers },
    { id: 'recharge' as ActiveView, label: 'Oracle Billing Master', icon: Database },
    { id: 'profile' as ActiveView, label: 'Admin Profile', icon: User },
  ];

  const navItems = session.role === 'admin' ? adminNavItems : customerNavItems;

  const adminAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Bvo3A-EbU7m0xyNOPoOgK2hacOzHfSriSsc6_7HS160_i0S_UOQuAy_vsA84HKAsFoEhkTPPO2okBKM8FKD3Onipmc8Qeml5Umr0AFvmyffG61jNc4BQnN6uSCK1Z_NNEfm5_KPKhstzhqyd_HVE-vysvQz6FvMx1mR_cmjwOQJN23PeNVyEzMNCbhkNxEhbb0Ve0SlBKwPeIMRYpgrffafn_xa6urTRHA8iUdJdF7rzVquc0RH-thBuz9oqV6g6YEgUiE3BQ9E";

  const renderUserInfo = () => {
    if (!session.isLoggedIn) {
      return (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-full bg-[#1A1818] flex items-center justify-center text-[#b7c8de]">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant font-medium">Guest Mode</p>
            <button 
              onClick={() => {
                onViewChange('login');
                setMobileMenuOpen(false);
              }}
              className="text-xs text-[#FF5500] font-semibold hover:underline text-left block"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
        <img 
          src={session.photoUrl || (session.role === 'admin' ? adminAvatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150')} 
          alt={session.name}
          className="w-10 h-10 rounded-full border border-white/10 object-cover" 
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-semibold truncate leading-none mb-1">
            {session.role === 'admin' ? 'Admin Portal' : session.name}
          </p>
          <span className="text-[10px] uppercase text-[#b7c8de]/70 tracking-widest font-mono">
            {session.role === 'admin' ? 'Operations Core' : 'Subscriber Desk'}
          </span>
        </div>
      </div>
    );
  };

  const handleNavClick = (view: ActiveView) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Tv className="text-[#FF5500]" size={20} />
          <span className="font-serif text-sm tracking-[0.1em] text-white font-bold">RAJA <span className="text-[#FF5500] font-light italic">COMMUNICATIONS</span></span>
        </div>
        <div className="flex items-center gap-2">
          {!session.isLoggedIn ? (
            <button 
              onClick={() => handleNavClick('login')} 
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white"
            >
              Login
            </button>
          ) : (
            <button 
              onClick={onLogout} 
              className="p-1.5 rounded-full bg-white/5 text-on-surface-variant hover:text-white"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white border border-white/10 rounded-lg bg-white/5 active:scale-95"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#050505]/95 backdrop-blur-2xl z-30 flex flex-col justify-between p-6">
          <div className="space-y-6">
            {renderUserInfo()}
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                      active 
                        ? 'bg-[#FF5500]/10 text-white border border-[#FF5500]/25' 
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-[#FF5500]' : 'text-on-surface-variant'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* WhatsApp Contact Action */}
            {session.role !== 'admin' && (
              <a 
                href={`https://wa.me/919849500936?text=${encodeURIComponent("Hello Raja Sun Communicatios! 👋 I am reaching out regarding my DTH connection. Could you please help me with a service request? 📺")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#25D366]/15 hover:bg-[#25D366]/20 text-[#25D366] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 border border-[#25D366]/35 shadow-lg shadow-[#25D366]/5 text-xs text-center inline-block"
              >
                <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
                <span>WhatsApp Helpline: +91 9849500936</span>
              </a>
            )}
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            {session.isLoggedIn && (
              <button 
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-white/5 rounded-xl transition-all font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
            <p className="text-[10px] text-center text-on-surface-variant font-mono">
              © 2026 RAJA COMMUNICATIONS
            </p>
          </div>
        </div>
      )}

      {/* Desktop Permanent Drawer */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-[#0A0A0B]/90 backdrop-blur-3xl border-r border-white/5 fixed left-0 top-0 pt-8 pb-6 justify-between z-40 overflow-y-auto">
        <div>
          {/* Logo Header */}
          <div className="px-6 mb-8">
            <h1 className="font-serif text-2xl font-black text-white tracking-[0.1em] leading-none mb-1 flex items-center gap-1.5">
              RAJA
            </h1>
            <p className="font-serif text-xs italic tracking-[0.1em] text-[#FF5500] font-medium">
              Communications
            </p>
            
            <div className="mt-6">
              {renderUserInfo()}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                    active 
                      ? 'bg-[#FF5500]/10 text-white border border-[#FF5500]/30 shadow-md shadow-[#FF5500]/5' 
                      : 'text-on-surface-variant hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-[#FF5500]' : 'text-on-surface-variant group-hover:text-white'} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute right-3 w-1.5 h-1.5 bg-[#FF5500] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

          {/* Footer & CTA */}
        <div className="px-4 space-y-6">
          {session.role !== 'admin' && (
            <a 
              href={`https://wa.me/919849500936?text=${encodeURIComponent("Hello Raja Sun Communicatios! 👋 I am reaching out regarding my DTH connection. Could you please help me with a service request? 📺")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366]/10 text-white hover:bg-[#25D366]/25 border border-[#25D366]/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 text-xs inline-block text-center shadow-lg shadow-[#25D366]/5"
            >
              <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse" />
              <span className="text-[10px] tracking-wider font-bold text-[#25D366]">WHATSAPP HELPLINE</span>
            </a>
          )}

          <div className="border-t border-white/5 pt-4">
            {session.isLoggedIn ? (
              <button 
                onClick={onLogout}
                className="w-full px-4 py-3 flex items-center gap-4 text-on-surface-variant hover:text-red-500 font-semibold transition-colors duration-200 rounded-xl hover:bg-white/[0.02]"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => onViewChange('login')}
                className="w-full px-4 py-3 flex items-center gap-4 text-on-surface-variant hover:text-[#FF5500] font-semibold transition-colors duration-200 rounded-xl hover:bg-white/[0.02]"
              >
                <LogIn size={16} />
                <span className="text-sm">Sign In</span>
              </button>
            )}
            <p className="text-[10px] text-center text-on-surface-variant/40 font-mono mt-4">
              © 2026 Raja Communications
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
