import React, { useState } from 'react';
import { User, Lock, Tv, Mail, ArrowRight, Chromium as Chrome, Circle as HelpCircle, Info, KeyRound, ArrowLeft, CircleCheck as CheckCircle2 } from 'lucide-react';
import { UserSession } from '../types';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

interface LoginViewProps {
  onLogin: (session: UserSession) => void;
}

const friendlyAuthError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email. Please create an account first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or use Forgot Password.';
    case 'auth/invalid-credential':
      return 'Email or password is incorrect. Please check and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Contact the administrator.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export default function LoginView({ onLogin }: LoginViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Forgot password input
  const [resetEmail, setResetEmail] = useState('');

  const adminAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Bvo3A-EbU7m0xyNOPoOgK2hacOzHfSriSsc6_7HS160_i0S_UOQuAy_vsA84HKAsFoEhkTPPO2okBKM8FKD3Onipmc8Qeml5Umr0AFvmyffG61jNc4BQnN6uSCK1Z_NNEfm5_KPKhstzhqyd_HVE-vysvQz6FvMx1mR_cmjwOQJN23PeNVyEzMNCbhkNxEhbb0Ve0SlBKwPeIMRYpgrffafn_xa6urTRHA8iUdJdF7rzVquc0RH-thBuz9oqV6g6YEgUiE3BQ9E";

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = email.trim().toLowerCase();
    if (!inputEmail || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const credentials = await signInWithEmailAndPassword(auth, inputEmail, password);
      const uid = credentials.user.uid;

      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      let docData: any;
      if (userSnap.exists()) {
        docData = userSnap.data();
      } else {
        // Auto-provision customer profile if missing
        const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
        const smartCardNumber = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        docData = {
          role: 'customer' as const,
          name: inputEmail.split('@')[0],
          identifier: subId,
          phone: '+91 94451 09842',
          email: inputEmail,
          address: 'No Address Saved',
          smartCardNumber,
          planName: 'Basic regional feed pack',
          photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          activeStatus: 'Active' as const
        };
        await setDoc(userDocRef, docData);
        await setDoc(doc(db, 'clearances', subId), {
          customerId: subId,
          customerName: docData.name,
          outstandingBalance: 590,
          packRental: 320,
          equipmentFee: 150,
          installFee: 120,
          status: 'Pending',
          smartCardNumber,
          phone: '+91 98495 00936',
          userId: uid,
          lastUpdated: new Date().toISOString()
        });
      }

      const fullSes = { isLoggedIn: true, ...docData };
      localStorage.setItem('sun_direct_fallback_session', JSON.stringify(fullSes));
      onLogin(fullSes);
    } catch (err: any) {
      setErrorMsg(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Check if Google provider is available
      if (!auth.app.options.apiKey) {
        throw new Error('Google sign-in is not configured. Please use email and password.');
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error('Google account is missing an email address.');
      }

      const emailLower = user.email.trim().toLowerCase();
      const isReservedAdmin = emailLower === 'raja.sundirect@gmail.com';
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      let docData: any = null;

      if (userSnap.exists()) {
        docData = userSnap.data();
      } else {
        if (isReservedAdmin) {
          docData = {
            role: 'admin',
            name: user.displayName || 'Raja Sundirect Admin',
            identifier: 'ADMIN-8891',
            phone: '+91 98495 00936',
            email: emailLower,
            address: 'Central Operations Command, Sector-V, Bangalore, India',
            smartCardNumber: '9984-1102-7788',
            planName: 'Oracle General Administration Feed',
            photoUrl: user.photoURL || adminAvatar,
            activeStatus: 'Active'
          };
          await setDoc(userDocRef, docData);
        } else {
          const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
          const smartCardNumber = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

          docData = {
            role: 'customer' as const,
            name: user.displayName || emailLower.split('@')[0] || 'Subscriber',
            identifier: subId,
            phone: '+91 98495 00936',
            email: emailLower,
            address: 'No static installation address logged yet. Please schedule an installation.',
            smartCardNumber,
            planName: 'Ultimate Sports & Premium Cinema HD Pack',
            photoUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            activeStatus: 'Active' as const,
          };

          await setDoc(userDocRef, docData);

          await setDoc(doc(db, 'clearances', subId), {
            customerId: subId,
            customerName: docData.name,
            outstandingBalance: 590,
            packRental: 320,
            equipmentFee: 150,
            installFee: 120,
            status: 'Pending',
            smartCardNumber,
            phone: '+91 98495 00936',
            userId: user.uid,
            lastUpdated: new Date().toISOString()
          });
        }
      }

      const sessionObj = { isLoggedIn: true, ...docData };
      localStorage.setItem('sun_direct_fallback_session', JSON.stringify(sessionObj));
      onLogin(sessionObj);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google sign-in is not enabled. Please use Email & Password instead.');
      } else {
        setErrorMsg(friendlyAuthError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail.trim() || !signUpName.trim() || !signUpPassword.trim()) {
      setErrorMsg('Full name, email, and password are required.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailLower = signUpEmail.trim().toLowerCase();

    if (emailLower === 'raja.sundirect@gmail.com') {
      setErrorMsg('This administrator email is reserved. Please use a different email.');
      setLoading(false);
      return;
    }

    const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const smartCardNumber = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProfile = {
      role: 'customer' as const,
      name: signUpName.trim(),
      identifier: subId,
      phone: '+91 98495 00936',
      email: signUpEmail.trim(),
      address: 'No static installation address logged yet. Please schedule an installation.',
      smartCardNumber,
      planName: 'Ultimate Sports & Premium Cinema HD Pack',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      activeStatus: 'Active' as const,
    };

    try {
      const credentials = await createUserWithEmailAndPassword(auth, signUpEmail.trim(), signUpPassword);
      const uid = credentials.user.uid;

      await setDoc(doc(db, 'users', uid), newProfile);
      await setDoc(doc(db, 'clearances', subId), {
        customerId: subId,
        customerName: signUpName.trim(),
        outstandingBalance: 590,
        packRental: 320,
        equipmentFee: 150,
        installFee: 120,
        status: 'Pending',
        smartCardNumber,
        phone: '+91 98495 00936',
        userId: uid,
        lastUpdated: new Date().toISOString()
      });

      const sessionObj = { isLoggedIn: true, ...newProfile };
      localStorage.setItem('sun_direct_fallback_session', JSON.stringify(sessionObj));
      onLogin(sessionObj);
    } catch (err: any) {
      setErrorMsg(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = resetEmail.trim().toLowerCase();
    if (!inputEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, inputEmail);
      setSuccessMsg('Password reset email sent! Check your inbox and follow the link.');
      setResetEmail('');
    } catch (err: any) {
      setErrorMsg(friendlyAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 entrance-fade">
      <div className="text-center space-y-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500] mx-auto border border-[#FF5500]/25">
          <Tv size={24} />
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-white font-bold tracking-tight">
          {mode === 'forgot' ? 'Reset Password' : 'RAJA COMMUNICATIONS'}
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          {mode === 'forgot'
            ? 'Enter your email and we will send you a password reset link.'
            : 'Authorized Sun Direct Distributor Portal. Register, manage sessions, and access your account.'}
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-6">
        {/* Mode Toggle (hidden on forgot) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-[#FF5500] text-white font-bold shadow-md'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2">
            <Lock className="shrink-0 mt-0.5" size={14} />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex gap-2">
            <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
            <p>{successMsg}</p>
          </div>
        )}

        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-[10px] text-[#FF5500] hover:text-white font-semibold transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-[#FF5500] hover:text-white disabled:bg-white/15 text-black py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Balaji Reddy"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Password (min 6 chars)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white py-3 rounded-xl text-xs font-bold transition-all hover:brightness-110 disabled:bg-white/15 flex items-center justify-center gap-2 mt-3 shadow-md shadow-[#FF5500]/10"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white py-3 rounded-xl text-xs font-bold transition-all hover:brightness-110 disabled:bg-white/15 flex items-center justify-center gap-2 shadow-md shadow-[#FF5500]/10"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={14} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full flex items-center justify-center gap-2 text-xs text-on-surface-variant hover:text-white py-2 transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* Google Authentication Gateway */}
        {mode !== 'forgot' && (
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-zinc-500 text-[10px] uppercase font-mono tracking-wider">or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm duration-200"
            >
              <Chrome size={14} className="text-[#FF5500]" />
              <span>Continue with Google</span>
            </button>
            <p className="text-[10px] text-zinc-500 text-center">
              If Google sign-in fails, please use Email & Password instead.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-zinc-400">
            <Info size={14} className="text-[#FF5500] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Security & Data Protection</p>
              {mode === 'signin' ? (
                <p className="leading-relaxed">
                  Your data is securely stored under your unique Firebase UID. Each user can only access their own documents.
                </p>
              ) : mode === 'forgot' ? (
                <p className="leading-relaxed">
                  A secure password reset link will be sent to your email. The link expires after a short time for your safety.
                </p>
              ) : (
                <p className="leading-relaxed">
                  Registering creates your customer profile under your Firebase UID. All data is isolated and protected by Firestore security rules.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-1 text-center">
          <p className="text-[10px] text-on-surface-variant font-mono flex items-center justify-center gap-1">
            <HelpCircle size={10} />
            <span>Firebase Auth · UID-Isolated Data · Secure Sessions</span>
          </p>
        </div>
      </div>
    </div>
  );
}
