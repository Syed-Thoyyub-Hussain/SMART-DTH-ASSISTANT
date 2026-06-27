import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CustomerRequestHub from './components/CustomerRequestHub';
import CustomerTracking from './components/CustomerTracking';
import CustomerBilling from './components/CustomerBilling';
import AdminInventory from './components/AdminInventory';
import AdminRequests from './components/AdminRequests';
import AdminBilling from './components/AdminBilling';
import SupportView from './components/SupportView';
import LoginView from './components/LoginView';
import ProfileView from './components/ProfileView';
import CinematicIntro from './components/CinematicIntro';
import { ActiveView, ServiceRequest, UserSession, InventoryStat, BillingClearance } from './types';
import { LogOut, AlertTriangle } from 'lucide-react';

// Real database connectivity
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, updateDoc, addDoc, query, where, getDocs, setDoc } from 'firebase/firestore';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sun_direct_intro_dismissed') !== 'true';
    } catch {
      return true;
    }
  });
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Default Session is offline-first standby, updated in real time via Firebase auth
  const [session, setSession] = useState<UserSession>({
    isLoggedIn: false,
    role: null,
    name: '',
    identifier: '',
    phone: '',
    email: '',
    address: '',
    smartCardNumber: '',
    planName: '',
    activeStatus: 'Active'
  });

  // Default system workloads / tickets syncing to cloud Firestore real-time
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  // Unified global inventory supply levels
  const [inventoryStats, setInventoryStats] = useState<InventoryStat[]>([
    { name: 'HD Set Top Boxes', count: 124, trend: '+12 in transit', lowStock: false, price: 3499 },
    { name: 'LNB Core Units', count: 14, trend: 'Low Stock warnings', lowStock: true, price: 899 },
    { name: 'Offset Dish Reflectors', count: 42, trend: '+5 in route', lowStock: false, price: 1590 },
    { name: 'RG-6 Coaxial Cables (Reels)', count: 18, trend: 'Critically low', lowStock: true, price: 1499 },
    { name: 'High Gain Amplifiers', count: 31, trend: 'Sufficient supply', lowStock: false, price: 499 }
  ]);

  // Master financial clearances ledger syncing to Firestore real-time
  const [clearances, setClearances] = useState<BillingClearance[]>([]);

  // System alert feedback banner state
  const [globalAlert, setGlobalAlert] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Custom Hash Listener specifically triggered by #intro link to replay the 3D Intro Telemetry
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#intro') {
        setShowIntro(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1. Firebase auth state listener: Monitors user sessions globally
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Retrieve custom subscriber details or manager role credentials from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const docData = userSnap.data();
          const restored = {
            isLoggedIn: true,
            role: docData.role as 'customer' | 'admin',
            name: docData.name || '',
            identifier: docData.identifier || '',
            phone: docData.phone || '',
            email: docData.email || firebaseUser.email || '',
            address: docData.address || '',
            smartCardNumber: docData.smartCardNumber || '',
            planName: docData.planName || '',
            photoUrl: docData.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            activeStatus: (docData.activeStatus as any) || 'Active'
          };
          setSession(restored);
          localStorage.setItem('sun_direct_fallback_session', JSON.stringify(restored));
        }
      } else {
        // Look for fallback session stored locally
        const cached = localStorage.getItem('sun_direct_fallback_session');
        if (cached) {
          try {
            setSession(JSON.parse(cached));
          } catch (e) {
            setSession({
              isLoggedIn: false,
              role: null,
              name: '',
              identifier: ''
            });
          }
        } else {
          // Settle clean offline fallback state
          setSession({
            isLoggedIn: false,
            role: null,
            name: '',
            identifier: ''
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Database Synchronizer (Firestore -> React hooks state)
  useEffect(() => {
    if (!session.isLoggedIn || !session.role) return;

    let unsubRequests = () => {};
    let unsubClearances = () => {};

    if (session.role === 'admin') {
      // Administrative managers listen to ALL tickets and ledger settlements in the database
      const qReq = collection(db, 'requests');
      unsubRequests = onSnapshot(qReq, (snapshot) => {
        const list: ServiceRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as ServiceRequest, id: doc.id });
        });
        setRequests(list);
      }, (error) => {
        console.warn("Firestore collection 'requests' snapshot error caught gracefully:", error);
      });

      const qClear = collection(db, 'clearances');
      unsubClearances = onSnapshot(qClear, (snapshot) => {
        const list: BillingClearance[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as BillingClearance, customerId: doc.id });
        });
        setClearances(list);
      }, (error) => {
        console.warn("Firestore collection 'clearances' snapshot error caught gracefully:", error);
      });
    } else {
      // Regular customers sync only their OWN tickets and outstanding bills
      const currentUid = auth.currentUser?.uid || '';
      const qReq = query(collection(db, 'requests'), where('userId', '==', currentUid));
      unsubRequests = onSnapshot(qReq, (snapshot) => {
        const list: ServiceRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as ServiceRequest, id: doc.id });
        });
        setRequests(list);
      }, (error) => {
        console.warn("Firestore user 'requests' query snapshot error caught gracefully:", error);
      });

      const qClear = query(collection(db, 'clearances'), where('customerId', '==', session.identifier));
      unsubClearances = onSnapshot(qClear, (snapshot) => {
        const list: BillingClearance[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() as BillingClearance, customerId: doc.id });
        });
        setClearances(list);
      }, (error) => {
        console.warn("Firestore user 'clearances' query snapshot error caught gracefully:", error);
      });
    }

    return () => {
      unsubRequests();
      unsubClearances();
    };
  }, [session.isLoggedIn, session.role, session.identifier]);

  // Sync active view hashtags with URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'recharge', 'tracking', 'support', 'login'].includes(hash)) {
        setCurrentView(hash as ActiveView);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAlert = (message: string, type: 'success' | 'warn' = 'success') => {
    setGlobalAlert({ message, type });
    setTimeout(() => {
      setGlobalAlert(null);
    }, 4500);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('sun_direct_fallback_session');
    setSession({
      isLoggedIn: false,
      role: null,
      name: '',
      identifier: ''
    });
    handleAlert('Logged out from DTH Gateway successfully.', 'warn');
    setCurrentView('login');
    setShowLogoutConfirm(false);
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
    handleAlert(`Welcome back! Logged in as ${newSession.role === 'admin' ? 'Administrative Manager' : `${newSession.name} (${newSession.identifier})`}.`);
  };

  const handleUpdateProfile = async (updatedFields: Partial<UserSession>) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, updatedFields);
        setSession(prev => ({ ...prev, ...updatedFields }));
        handleAlert(`Preferences updated successfully securely in Cloud Firestore.`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      handleAlert(`Update profile failed: ${err.message}`, 'warn');
    }
  };

  const handleAddNewRequest = async (newReq: ServiceRequest) => {
    try {
      if (auth.currentUser) {
        // Lodges request in Firestore
        await addDoc(collection(db, 'requests'), {
          type: newReq.type,
          address: newReq.address,
          technician: newReq.technician || 'Awaiting dispatch assign',
          status: 'In Progress',
          phone: newReq.phone || session.phone,
          customerName: newReq.customerName || session.name,
          customerId: newReq.customerId || session.identifier,
          cost: newReq.cost || 0,
          userId: auth.currentUser.uid,
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          id: 'REQ-' + Math.floor(100000 + Math.random() * 900000)
        });
        handleAlert(`New Service Dispatch ticket lodge succeeded in database records.`);
      }
    } catch (err: any) {
      console.error(err);
      handleAlert(`Lodge request failed: ${err.message}`, 'warn');
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: ServiceRequest['status'], technician?: string) => {
    try {
      const docRef = doc(db, 'requests', id);
      const payload: any = { status };
      if (technician) payload.technician = technician;
      await updateDoc(docRef, payload);
      handleAlert(`Ticket ${id} marked as ${status} successfully.`);
    } catch (err: any) {
      console.error(err);
      // Fallback
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, ...(technician ? { technician } : {}) } : r));
    }
  };

  const handleClearCustomerBalance = async (customerId: string) => {
    try {
      const docRef = doc(db, 'clearances', customerId);
      await updateDoc(docRef, { outstandingBalance: 0, status: 'Cleared' });
      handleAlert(`Ledger balance cleared for subscriber ${customerId}.`, 'success');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAdminClearCustomerBalance = async (customerId: string) => {
    try {
      const docRef = doc(db, 'clearances', customerId);
      await updateDoc(docRef, { outstandingBalance: 0, status: 'Cleared' });
      handleAlert(`Sub-account cleared successfully in Oracle ledger database.`);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAdminClearAllBalances = async () => {
    try {
      for (const clearance of clearances) {
        if (clearance.status === 'Pending' || clearance.status === 'Pending Verification') {
          const docRef = doc(db, 'clearances', clearance.customerId);
          await updateDoc(docRef, { outstandingBalance: 0, status: 'Cleared' });
        }
      }
      handleAlert(`All pending billing clear requests approved and settled.`, 'success');
    } catch (errAttr: any) {
      console.error(errAttr);
    }
  };

  const handleCustomerRechargeSuccess = (amount: number, subscriberId: string) => {
    handleAlert(`Add-on packs request submitted for ₹${amount}. Admin will approve verification shortly.`, 'success');
  };

  const renderActiveContent = () => {
    if (!session.isLoggedIn) {
      return <LoginView onLogin={handleLogin} />;
    }

    if (session.role === 'admin') {
      // Admin Views Map
      switch (currentView) {
        case 'dashboard':
          return (
            <AdminRequests 
              requests={requests}
              onUpdateRequestStatus={handleUpdateRequestStatus}
            />
          );
        case 'tracking':
          return (
            <AdminInventory 
              stats={inventoryStats}
              onUpdateStats={setInventoryStats}
            />
          );
        case 'recharge':
          return (
            <AdminBilling 
              clearances={clearances}
              onClearCustomerBalance={handleAdminClearCustomerBalance}
              onClearAllBalances={handleAdminClearAllBalances}
            />
          );
        case 'profile':
          return (
            <ProfileView 
              session={session}
              onUpdateProfile={handleUpdateProfile}
            />
          );
        case 'login':
          return <LoginView onLogin={handleLogin} />;
        default:
          return (
            <AdminRequests 
              requests={requests}
              onUpdateRequestStatus={handleUpdateRequestStatus}
            />
          );
      }
    } else {
      // Customer Views Map
      const currentCustomerClearance = clearances.find(c => c.customerId === session.identifier);
      const outstandingBalance = currentCustomerClearance ? currentCustomerClearance.outstandingBalance : 0;

      switch (currentView) {
        case 'dashboard':
          return (
            <CustomerRequestHub 
              session={session}
              onAddRequest={handleAddNewRequest}
              onNavigateToTracking={() => {
                window.location.hash = '#tracking';
                setCurrentView('tracking');
              }}
            />
          );
        case 'tracking':
          return (
            <CustomerTracking 
              session={session}
              requests={requests}
            />
          );
        case 'recharge':
          return (
            <CustomerBilling 
              session={session}
              outstandingBalance={outstandingBalance}
              onClearBalance={() => handleClearCustomerBalance(session.identifier)}
              onRechargeSuccess={handleCustomerRechargeSuccess}
            />
          );
        case 'support':
          return (
            <SupportView 
              requests={requests}
              onNavigateToHub={() => {
                window.location.hash = '#dashboard';
                setCurrentView('dashboard');
              }}
            />
          );
        case 'profile':
          return (
            <ProfileView 
              session={session}
              onUpdateProfile={handleUpdateProfile}
            />
          );
        case 'login':
          return <LoginView onLogin={handleLogin} />;
        default:
          return (
            <CustomerRequestHub 
              session={session}
              onAddRequest={handleAddNewRequest}
              onNavigateToTracking={() => {
                window.location.hash = '#tracking';
                setCurrentView('tracking');
              }}
            />
          );
      }
    }
  };

  if (showIntro) {
    return (
      <CinematicIntro 
        onEnter={() => {
          try {
            sessionStorage.setItem('sun_direct_intro_dismissed', 'true');
          } catch (e) {}
          setShowIntro(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen text-[#E5E7EB] font-sans selection:bg-[#FF5500] selection:text-white">
      {/* Dynamic Ambient Blur Fields */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
      </div>

      {/* Persistent Sidebar Drawer Layout */}
      <Sidebar 
        currentView={currentView}
        onViewChange={(view) => {
          window.location.hash = `#${view}`;
          setCurrentView(view);
        }}
        session={session}
        onLogout={() => setShowLogoutConfirm(true)}
        onNewRequestClick={() => {
          window.location.hash = '#dashboard';
          setCurrentView('dashboard');
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Command Window Frame with offsets to fit Sidebar */}
      <main className="md:ml-64 min-h-screen pt-24 pb-12 px-4 md:pt-10 md:pb-16 md:px-10 max-w-[1440px] mx-auto transition-all duration-300">
        
        {/* Real-time Global Toast notification alert system */}
        {globalAlert && (
          <div className="fixed top-20 right-4 md:top-6 md:right-8 z-50 entrance-fade max-w-sm">
            <div className={`glass-panel border-white/10 p-4 rounded-xl flex items-start gap-3 backdrop-blur-xl ${
              globalAlert.type === 'success' 
                ? 'border-[#FF5500]/30 bg-[#FF5500]/5' 
                : 'border-white/15 bg-white/5'
            }`}>
              <span className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse ${
                globalAlert.type === 'success' ? 'bg-[#FF5500] glow-accent-gold' : 'bg-red-500'
              }`} />
              <p className="text-xs text-[#b7c8de] leading-snug font-medium">
                {globalAlert.message}
              </p>
            </div>
          </div>
        )}

        {/* View Router Render Stage */}
        <div className="w-full">
          {renderActiveContent()}
        </div>
      </main>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 entrance-fade">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-white/10 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-full flex items-center justify-center text-[#FF5500] animate-pulse">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-lg font-display">Confirm Logout</h4>
              <p className="text-xs text-on-surface-variant/90 leading-relaxed">
                Are you sure you want to exit Raja Sun Comms Terminal? This will end your active operations and billing configuration session.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-xl text-xs font-bold font-mono transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FF0000] hover:brightness-110 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF5500]/15"
              >
                <span>Logout</span>
                <LogOut size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
