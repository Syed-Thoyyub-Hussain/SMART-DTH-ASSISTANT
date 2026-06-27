import React, { useState } from 'react';
import { 
  User, 
  Key, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  Tv, 
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  HelpCircle,
  Info,
  Chrome
} from 'lucide-react';
import { UserSession } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
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

export default function LoginView({ onLogin }: LoginViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const adminAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC3Bvo3A-EbU7m0xyNOPoOgK2hacOzHfSriSsc6_7HS160_i0S_UOQuAy_vsA84HKAsFoEhkTPPO2okBKM8FKD3Onipmc8Qeml5Umr0AFvmyffG61jNc4BQnN6uSCK1Z_NNEfm5_KPKhstzhqyd_HVE-vysvQz6FvMx1mR_cmjwOQJN23PeNVyEzMNCbhkNxEhbb0Ve0SlBKwPeIMRYpgrffafn_xa6urTRHA8iUdJdF7rzVquc0RH-thBuz9oqV6g6YEgUiE3BQ9E";

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = email.trim().toLowerCase();
    if (!inputEmail || !password.trim()) {
      setErrorMsg('Please specify both valid email address and password passphrase.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const isReservedAdmin = inputEmail === 'raja.sundirect@gmail.com';

    // Strictly enforce direct password verification for the admin account
    if (isReservedAdmin && password !== '500936') {
      setLoading(false);
      setErrorMsg('Invalid password for the administrator account. Please use correct terminal security passphrase.');
      return;
    }

    try {
      let credentials;
      try {
        credentials = await signInWithEmailAndPassword(auth, inputEmail, password);
      } catch (authErr: any) {
        // If user is Admin but not in standard Auth DB yet, auto-provision on-the-fly to keep sandbox stable!
        if (isReservedAdmin && (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential')) {
          try {
            credentials = await createUserWithEmailAndPassword(auth, inputEmail, password);
          } catch (createErr) {
            // locally simulated UID
          }
        } else {
          throw authErr;
        }
      }

      const uid = credentials ? credentials.user.uid : 'admin-secure-local-uid';
      let docData: any = null;

      if (isReservedAdmin) {
        docData = {
          role: 'admin',
          name: 'Raja Sundirect Admin',
          identifier: 'ADMIN-8891',
          phone: '+91 98495 00936',
          email: inputEmail,
          address: 'Central Operations Command, Sector-V, Bangalore, India',
          smartCardNumber: '9984-1102-7788',
          planName: 'Oracle General Administration Feed',
          photoUrl: adminAvatar,
          activeStatus: 'Active'
        };

        // Write to database to guarantee records are correctly mapped
        try {
          await setDoc(doc(db, 'users', uid), docData, { merge: true });
        } catch (dbErr) {
          console.warn("Could not save Admin profile to database:", dbErr);
        }
      } else {
        // Standard Member
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          docData = userSnap.data();
        } else {
          docData = {
            role: 'customer' as const,
            name: inputEmail.split('@')[0],
            identifier: 'SUB-' + Math.floor(100000 + Math.random() * 900000),
            phone: '+91 94451 09842',
            email: inputEmail,
            address: 'No Address Saved',
            smartCardNumber: '6000-' + Math.floor(1000+Math.random()*9000) + '-' + Math.floor(1000+Math.random()*9000),
            planName: 'Basic regional feed pack',
            photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            activeStatus: 'Active' as const
          };
          try {
            await setDoc(userDocRef, docData);
          } catch (e) {}
        }
      }

      const fullSes = {
        isLoggedIn: true,
        ...docData
      };
      localStorage.setItem('sun_direct_fallback_session', JSON.stringify(fullSes));
      onLogin(fullSes);

    } catch (err: any) {
      const isOpNotAllowed = err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed');
      if (isOpNotAllowed) {
        // For fallback sandbox, query the `users` collection in Firestore to see if they signed up previously!
        try {
          const q = query(collection(db, 'users'), where('email', '==', inputEmail));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Document represents an existing user! Let's check password.
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Check stored password (fallback check)
            if (userData.password && userData.password !== password) {
              setLoading(false);
              setErrorMsg('Incorrect password for this email. Please verify credentials.');
              return;
            }

            const restoredProfile = {
              isLoggedIn: true,
              role: (userData.role || 'customer') as 'customer' | 'admin',
              name: userData.name || inputEmail.split('@')[0],
              identifier: userData.identifier || 'SUB-' + Math.floor(100000 + Math.random() * 900000),
              phone: userData.phone || '+91 94451 09842',
              email: userData.email || inputEmail,
              address: userData.address || 'No Address Logged Yet',
              smartCardNumber: userData.smartCardNumber || '6000-1111-2222',
              planName: userData.planName || 'Ultimate Sports & Premium Cinema HD Pack',
              photoUrl: userData.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
              activeStatus: (userData.activeStatus || 'Active') as 'Active' | 'Suspended'
            };

            localStorage.setItem('sun_direct_fallback_session', JSON.stringify(restoredProfile));
            onLogin(restoredProfile);
            return;
          } else {
            // No registered user. But if they typed the Reserved Admin email, we'll let them through securely
            if (isReservedAdmin) {
              const fallbackAdmin = {
                isLoggedIn: true,
                role: 'admin' as const,
                name: 'Raja Sundirect Admin',
                identifier: 'ADMIN-8891',
                phone: '+91 98495 00936',
                email: inputEmail,
                address: 'Central Operations Command, Sector-V, Bangalore, India',
                smartCardNumber: '9984-1102-7788',
                planName: 'Oracle General Administration Feed',
                photoUrl: adminAvatar,
                activeStatus: 'Active' as const,
                password: password
              };
              await setDoc(doc(db, 'users', 'local-user-ADMIN-8891'), fallbackAdmin);
              localStorage.setItem('sun_direct_fallback_session', JSON.stringify(fallbackAdmin));
              onLogin(fallbackAdmin);
              return;
            }

            setLoading(false);
            setErrorMsg('Account not found with this email. Please click "Create Account" tab above first!');
            return;
          }
        } catch (dbReadErr: any) {
          console.error("Failed to fetch user database fallback record:", dbReadErr);
          setErrorMsg('Secure Database handshake failed. Verify internet connection: ' + dbReadErr.message);
        }
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Authentication mismatch. Verify email address and passphrase pin.');
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
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
          
          const welcomeSubject = 'Welcome to Raja Communications! 📺 Your DTH Journey Starts Here';
          const welcomeHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
              <div style="text-align: center; border-bottom: 2px solid #FF5500; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color: #FF5500; margin: 0;">Raja Communications</h2>
                <p style="font-size: 12px; color: #666; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Premium DTH & Satellite Connection Center</p>
              </div>

              <p>Hi <strong>${docData.name}</strong>,</p>

              <p>Welcome to the Raja Communications family! We are thrilled to have you on board.</p>

              <p>Your account has been successfully created. You now have full access to explore the best DTH connections, browse custom channel packs, and manage your home entertainment seamlessly.</p>

              <p style="font-weight: bold; color: #FF5500; font-size: 15px; border-left: 3px solid #FF5500; padding-left: 10px; margin: 25px 0 10px 0;">Here’s what you can do next:</p>
              
              <ul style="padding-left: 20px; margin-top: 0;">
                <li style="margin-bottom: 8px;"><strong>Explore Connections:</strong> Find the perfect DTH setup for your home directly on our platform.</li>
                <li style="margin-bottom: 8px;"><strong>Manage Subscriptions:</strong> Easily track your active plans, channel add-ons, and upcoming recharges.</li>
                <li style="margin-bottom: 8px;"><strong>Exclusive Offers:</strong> Keep an eye out for special pricing on new connections and upgrades available only to registered members.</li>
              </ul>

              <p style="font-weight: bold; color: #FF5500; font-size: 15px; border-left: 3px solid #FF5500; padding-left: 10px; margin: 25px 0 10px 0;">Need Assistance?</p>
              <p>If you have any questions, need help picking the right channel pack, or require installation support, our WhatsApp helpline is ready. Just drop us a message, and our support team will assist you right away.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/#dashboard" style="background-color: #FF5500; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; box-shadow: 0 4px 6px rgba(255,85,0,0.2);">Log In to Your Account</a>
              </div>

              <p>Thank you for choosing us for your home entertainment!</p>

              <p style="margin-bottom: 0;">Warm regards,</p>
              <p style="margin-top: 5px; font-weight: bold; color: #FF5500;">The Raja Communications Team</p>

              <div style="border-t: 1px solid #eee; padding-top: 15px; margin-top: 25px; font-size: 12px; color: #777; border-top: 1px solid #eee;">
                <p style="margin: 3px 0;">🌐 Website: <a href="${window.location.origin}" style="color: #FF5500; text-decoration: none;">Launch Comms Hub</a></p>
                <p style="margin: 3px 0;">💬 WhatsApp Support Helpline: <a href="https://wa.me/919849500936" style="color: #25D366; text-decoration: none; font-weight: bold;">+91 98495 00936</a></p>
              </div>
            </div>
          `;
          
          let deliveryStatus: 'Delivered' | 'Failed' | 'Pending' = 'Pending';
          let deliveryError: string = '';
          try {
            const mailResponse = await fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: emailLower,
                subject: welcomeSubject,
                htmlBody: welcomeHtml,
                customerName: docData.name
              })
            });
            const resData = await mailResponse.json();
            if (mailResponse.ok && resData.success !== false) {
              deliveryStatus = 'Delivered';
            } else {
              deliveryStatus = 'Failed';
              deliveryError = resData.error || resData.message || 'Verification restricted by Resend sandbox limits.';
            }
          } catch (triggerErr: any) {
            console.warn("Real email service call failed, proceeding safely:", triggerErr);
            deliveryStatus = 'Failed';
            deliveryError = triggerErr.message || 'Connection handshake timeout to email service.';
          }
          
          await setDoc(doc(db, 'sent_emails', user.uid), {
            to: emailLower,
            subject: welcomeSubject,
            htmlBody: welcomeHtml,
            customerName: docData.name,
            sentAt: new Date().toISOString(),
            status: deliveryStatus,
            errorDetails: deliveryError,
            smsFallback: 'Queued'
          });
        }
      }
      
      const sessionObj = {
        isLoggedIn: true,
        ...docData
      };
      
      localStorage.setItem('sun_direct_fallback_session', JSON.stringify(sessionObj));
      onLogin(sessionObj);
      
    } catch (err: any) {
      console.error("Google login failed:", err);
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail.trim() || !signUpName.trim() || !signUpPassword.trim()) {
      setErrorMsg('Full name, email address, and password are fully mandatory.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const emailLower = signUpEmail.trim().toLowerCase();
    
    // Check reserved admin email address on signup
    if (emailLower === 'raja.sundirect@gmail.com') {
      setErrorMsg('This specific administrator email is reserved. Please register with a different email address or login directly.');
      setLoading(false);
      return;
    }

    // Proactively check if email is already in use in Firestore users collection
    try {
      const q = query(collection(db, 'users'), where('email', '==', emailLower));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setErrorMsg('This email address is already registered. Please go to Sign In tab instead.');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Could not preview existing registrations, continuing with fallback verification:", e);
    }

    const subId = 'SUB-' + Math.floor(100000 + Math.random() * 900000);
    const smartCardNumber = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProfile = {
      role: 'customer' as const,
      name: signUpName.trim(),
      identifier: subId,
      phone: '+91 98495 00936', // Default to customer support/sales hub contact
      email: signUpEmail.trim(),
      address: 'No static installation address logged yet. Please schedule an installation.',
      smartCardNumber,
      planName: 'Ultimate Sports & Premium Cinema HD Pack',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      activeStatus: 'Active' as const,
      password: signUpPassword.trim() // store for fallback login authorization
    };

    // Construct the professional welcoming email matching customer template exactly
    const welcomeSubject = 'Welcome to Raja Communications! 📺 Your DTH Journey Starts Here';
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #FF5500; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #FF5500; margin: 0;">Raja Communications</h2>
          <p style="font-size: 12px; color: #666; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Premium DTH & Satellite Connection Center</p>
        </div>

        <p>Hi <strong>${signUpName.trim()}</strong>,</p>

        <p>Welcome to the Raja Communications family! We are thrilled to have you on board.</p>

        <p>Your account has been successfully created. You now have full access to explore the best DTH connections, browse custom channel packs, and manage your home entertainment seamlessly.</p>

        <p style="font-weight: bold; color: #FF5500; font-size: 15px; border-left: 3px solid #FF5500; padding-left: 10px; margin: 25px 0 10px 0;">Here’s what you can do next:</p>
        
        <ul style="padding-left: 20px; margin-top: 0;">
          <li style="margin-bottom: 8px;"><strong>Explore Connections:</strong> Find the perfect DTH setup for your home directly on our platform.</li>
          <li style="margin-bottom: 8px;"><strong>Manage Subscriptions:</strong> Easily track your active plans, channel add-ons, and upcoming recharges.</li>
          <li style="margin-bottom: 8px;"><strong>Exclusive Offers:</strong> Keep an eye out for special pricing on new connections and upgrades available only to registered members.</li>
        </ul>

        <p style="font-weight: bold; color: #FF5500; font-size: 15px; border-left: 3px solid #FF5500; padding-left: 10px; margin: 25px 0 10px 0;">Need Assistance?</p>
        <p>If you have any questions, need help picking the right channel pack, or require installation support, our WhatsApp helpline is ready. Just drop us a message, and our support team will assist you right away.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}/#dashboard" style="background-color: #FF5500; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; box-shadow: 0 4px 6px rgba(255,85,0,0.2);">Log In to Your Account</a>
        </div>

        <p>Thank you for choosing us for your home entertainment!</p>

        <p style="margin-bottom: 0;">Warm regards,</p>
        <p style="margin-top: 5px; font-weight: bold; color: #FF5500;">The Raja Communications Team</p>

        <div style="border-t: 1px solid #eee; padding-top: 15px; margin-top: 25px; font-size: 12px; color: #777; border-top: 1px solid #eee;">
          <p style="margin: 3px 0;">🌐 Website: <a href="${window.location.origin}" style="color: #FF5500; text-decoration: none;">Launch Comms Hub</a></p>
          <p style="margin: 3px 0;">💬 WhatsApp Support Helpline: <a href="https://wa.me/919849500936" style="color: #25D366; text-decoration: none; font-weight: bold;">+91 98495 00936</a></p>
        </div>
      </div>
    `;

    try {
      const credentials = await createUserWithEmailAndPassword(auth, signUpEmail.trim(), signUpPassword);
      const uid = credentials.user.uid;

      // Save user profile object in Firestore database
      await setDoc(doc(db, 'users', uid), newProfile);

      // Create an initial C-Bill clearance dossier on Firestore
      await setDoc(doc(db, 'clearances', subId), {
        customerId: subId,
        customerName: signUpName.trim(),
        outstandingBalance: 590, // Activations & connection code set
        packRental: 320,
        equipmentFee: 150,
        installFee: 120,
        status: 'Pending',
        smartCardNumber,
        phone: '+91 98495 00936',
        userId: uid,
        lastUpdated: new Date().toISOString()
      });

      // Dispatch real welcoming email via the back-end Resend SMTP relay
      let deliveryStatus: 'Delivered' | 'Failed' | 'Pending' = 'Pending';
      let deliveryError: string = '';
      try {
        const mailResponse = await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: signUpEmail.trim(),
            subject: welcomeSubject,
            htmlBody: welcomeHtml,
            customerName: signUpName.trim()
          })
        });
        const resData = await mailResponse.json();
        if (mailResponse.ok && resData.success !== false) {
          deliveryStatus = 'Delivered';
        } else {
          deliveryStatus = 'Failed';
          deliveryError = resData.error || resData.message || 'Verification restricted by Resend sandbox limits.';
        }
      } catch (triggerErr: any) {
        console.warn("Real email service call failed, proceeding safely:", triggerErr);
        deliveryStatus = 'Failed';
        deliveryError = triggerErr.message || 'Connection handshake timeout to email service.';
      }

      // Crucial: Store simulated but genuine welcome email record in Firebase sent_emails collection
      await setDoc(doc(db, 'sent_emails', uid), {
        to: signUpEmail.trim(),
        subject: welcomeSubject,
        htmlBody: welcomeHtml,
        customerName: signUpName.trim(),
        sentAt: new Date().toISOString(),
        status: deliveryStatus,
        errorDetails: deliveryError,
        smsFallback: 'Queued'
      });

      const sessionObj = {
        isLoggedIn: true,
        ...newProfile,
        emailDeliveryStatus: deliveryStatus,
        emailDeliveryError: deliveryError
      };

      localStorage.setItem('sun_direct_fallback_session', JSON.stringify(sessionObj));

      onLogin(sessionObj);
    } catch (err: any) {
      const isOpNotAllowed = err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed');
      if (isOpNotAllowed) {
        // Local fallback if Firebase Auth methods are yet disabled in console
        let deliveryStatus: 'Delivered' | 'Failed' | 'Pending' = 'Pending';
        let deliveryError: string = '';
        try {
          await setDoc(doc(db, 'users', 'local-user-' + subId), newProfile);
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
            userId: 'local-user-' + subId,
            lastUpdated: new Date().toISOString()
          });

          // Dispatch real welcoming email via the back-end Resend SMTP relay
          try {
            const mailResponse = await fetch('/api/send-welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: signUpEmail.trim(),
                subject: welcomeSubject,
                htmlBody: welcomeHtml,
                customerName: signUpName.trim()
              })
            });
            const resData = await mailResponse.json();
            if (mailResponse.ok && resData.success !== false) {
              deliveryStatus = 'Delivered';
            } else {
              deliveryStatus = 'Failed';
              deliveryError = resData.error || resData.message || 'Verification restricted by Resend sandbox limits.';
            }
          } catch (triggerErr: any) {
            console.warn("Real email service call fallback failed, proceeding safely:", triggerErr);
            deliveryStatus = 'Failed';
            deliveryError = triggerErr.message || 'Connection handshake timeout to email service.';
          }

          // Store simulated email in offline fallback Db as well
          await setDoc(doc(db, 'sent_emails', 'local-user-' + subId), {
            to: signUpEmail.trim(),
            subject: welcomeSubject,
            htmlBody: welcomeHtml,
            customerName: signUpName.trim(),
            sentAt: new Date().toISOString(),
            status: deliveryStatus,
            errorDetails: deliveryError,
            smsFallback: 'Queued'
          });
        } catch(dbErr) {}

        const fallback = {
          isLoggedIn: true,
          ...newProfile,
          emailDeliveryStatus: deliveryStatus as 'Delivered' | 'Failed' | 'Pending',
          emailDeliveryError: deliveryError
        };
        localStorage.setItem('sun_direct_fallback_session', JSON.stringify(fallback));
        onLogin(fallback);
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email code already registered. Please sign in instead.');
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 entrance-fade">
      <div className="text-center space-y-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500] mx-auto border border-[#FF5500]/25">
          <Tv size={24} />
        </div>
        <h2 className="font-display text-2xl md:text-3xl text-white font-bold tracking-tight">
          Sun Direct Hub Gate
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          Secure subscriber portal. Registers fresh user smartcards, manages telemetry listings, and zero-fee UPI settle plans.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-6">
        {/* Toggle between Register/Sign In */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
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
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-[#FF5500] text-white font-bold shadow-md'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2">
            <Lock className="shrink-0 mt-0.5" size={14} />
            <p>{errorMsg}</p>
          </div>
        )}

        {mode === 'signin' ? (
          /* Real Firebase login interface */
          <form onSubmit={handleSignInSubmit} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                Secure Password PIN
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-[#FF5500] hover:text-white disabled:bg-white/15 text-black py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Account Node</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Simplified Create Account interface (Only Name, Email, Password) */
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Full legal name
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
                Create Account Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-on-surface-variant">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
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
                  <span>Create Account & Join Raja Comms</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Google Authentication Gateway */}
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
        </div>

        {/* Elegant Info Section describing secure admin password and client registration */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex gap-2.5 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-zinc-400">
            <Info size={14} className="text-[#FF5500] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Security & Roles Protocol</p>
              {mode === 'signin' ? (
                <p className="leading-relaxed">
                  Administrator is restricted to a single protected address. Direct admin passphrase access is reserved for <code className="text-slate-300 font-mono">raja.sundirect@gmail.com</code>.
                </p>
              ) : (
                <p className="leading-relaxed">
                  Registering opens a high-fidelity subscriber profile, generates a DTH Smartcard ID, and dispatches a verified <strong>Welcome Email</strong> to your inbox!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-1 text-center">
          <p className="text-[10px] text-on-surface-variant font-mono flex items-center justify-center gap-1">
            <HelpCircle size={10} />
            <span>Real Cloud Database Handshake · Google Firebase</span>
          </p>
        </div>
      </div>
    </div>
  );
}
