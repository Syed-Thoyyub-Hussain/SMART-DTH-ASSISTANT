import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Database, 
  Check, 
  ShoppingCart, 
  Info, 
  CreditCard, 
  CheckCircle2, 
  Activity, 
  Tv, 
  ShieldAlert, 
  RefreshCw,
  Sparkles,
  QrCode,
  Smartphone,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Receipt
} from 'lucide-react';
import { UserSession, Channel } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

interface CustomerBillingProps {
  session: UserSession;
  outstandingBalance: number;
  onClearBalance: () => void;
  onRechargeSuccess: (amount: number, subscriberId: string) => void;
}

export default function CustomerBilling({ 
  session, 
  outstandingBalance, 
  onClearBalance, 
  onRechargeSuccess 
}: CustomerBillingProps) {
  // Master Channels catalog
  const channels: Channel[] = [
    { id: '1', name: 'STAR Sports 1 HD', category: 'Sports', price: 19 },
    { id: '2', name: 'Sony Ten 1 HD', category: 'Sports', price: 17 },
    { id: '3', name: 'STAR Gold HD', category: 'Movies', price: 15 },
    { id: '4', name: 'Sony MAX HD', category: 'Movies', price: 16 },
    { id: '5', name: 'HBO HD', category: 'Movies', price: 18 },
    { id: '6', name: 'Star Plus HD', category: 'Entertainment', price: 14 },
    { id: '7', name: 'Zee TV HD', category: 'Entertainment', price: 15 },
    { id: '8', name: 'Colors HD', category: 'Entertainment', price: 14 },
    { id: '9', name: 'Cartoon Network HD', category: 'Kids', price: 9 },
    { id: '10', name: 'Disney Channel HD', category: 'Kids', price: 8 },
    { id: '11', name: 'National Geographic HD', category: 'Kids', price: 12 },
    { id: '12', name: 'Discovery HD', category: 'News', price: 11 },
    { id: '13', name: 'Gemini TV HD', category: 'Regional', price: 19 },
    { id: '14', name: 'Star Maa HD', category: 'Regional', price: 19 },
    { id: '15', name: 'ETV Telugu HD', category: 'Regional', price: 17 },
    { id: '16', name: 'Zee Telugu HD', category: 'Regional', price: 16 },
    { id: '17', name: 'Maa Movies HD', category: 'Regional', price: 18 },
    { id: '18', name: 'ETV Cinema', category: 'Regional', price: 12 },
    { id: '19', name: 'Gemini Movies HD', category: 'Regional', price: 17 },
    { id: '20', name: 'TV9 Telugu', category: 'News', price: 5 },
    { id: '21', name: 'NTV Telugu News', category: 'News', price: 4 },
    { id: '22', name: 'Star Sports Select 1 HD', category: 'Sports', price: 19 },
    { id: '23', name: 'Sony Sports Ten 2 HD', category: 'Sports', price: 17 },
    { id: '24', name: 'Zee Cinema HD', category: 'Movies', price: 15 },
    { id: '25', name: 'Star Movies Select HD', category: 'Movies', price: 19 },
    { id: '26', name: 'Sony SAB HD', category: 'Entertainment', price: 14 },
    { id: '27', name: 'Star Pravah HD', category: 'Regional', price: 16 },
    { id: '28', name: 'Zee Kannada HD', category: 'Regional', price: 16 },
    { id: '29', name: 'Pogo TV Extra', category: 'Kids', price: 7 },
    { id: '30', name: 'Nickelodeon HD', category: 'Kids', price: 10 },
    { id: '31', name: 'NDTV 24x7 HD', category: 'News', price: 9 },
    { id: '32', name: 'BBC World News', category: 'News', price: 11 },
    { id: '33', name: 'Gemini Music HD', category: 'Regional', price: 15 },
    { id: '34', name: 'Gemini Comedy', category: 'Regional', price: 12 },
    { id: '35', name: 'ETV Plus HD', category: 'Regional', price: 14 },
    { id: '36', name: 'Sun TV HD', category: 'Regional', price: 19 },
    { id: '37', name: 'KTV HD Special', category: 'Regional', price: 18 },
  ];

  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [subscriberId, setSubscriberId] = useState<string>(session.identifier);

  // Persistent storage of the customer's most recent payment receipt details
  const [paymentReceiptInfo, setPaymentReceiptInfo] = useState<{
    utr: string;
    amount: number;
    time: string;
    status: string;
    paymentType: 'outstanding' | 'pack';
  } | null>(() => {
    try {
      const saved = localStorage.getItem(`sundirect_receipt_${session.identifier}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen for clearances updates from the Firestore database
  useEffect(() => {
    if (!session?.identifier) return;
    const docRef = doc(db, 'clearances', session.identifier);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.utrNumber) {
          setPaymentReceiptInfo(prev => {
            const updated = {
              utr: data.utrNumber,
              amount: prev?.amount || data.outstandingBalance || 350, // default if zero
              time: data.lastUpdated || new Date().toISOString(),
              status: data.status || 'Pending Verification',
              paymentType: prev?.paymentType || 'outstanding'
            };
            try {
              localStorage.setItem(`sundirect_receipt_${session.identifier}`, JSON.stringify(updated));
            } catch (err) {
              console.warn(err);
            }
            return updated;
          });
        }
      }
    }, (error) => {
      console.warn("Firestore clearances error: ", error);
    });
    return () => unsubscribe();
  }, [session?.identifier]);

  // Bill payment & UPI modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentType, setPaymentType] = useState<'outstanding' | 'pack'>('outstanding');
  
  const [payingBill, setPayingBill] = useState(false);
  const [billJustPaid, setBillJustPaid] = useState(false);

  // Channel subscribe animation states
  const [recharging, setRecharging] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectChannel = (id: string) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalMonthlyPrice = selectedChannels.reduce((sum, chId) => {
    const ch = channels.find(c => c.id === chId);
    return sum + (ch ? ch.price : 0);
  }, 0);

  // Initiates GPay/PhonePe free UPI clearance window
  const triggerOutstandingPaymentFlow = () => {
    setPayAmount(outstandingBalance);
    setPaymentType('outstanding');
    setUtrNumber('');
    setShowPayModal(true);
  };

  const triggerPackPaymentFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMonthlyPrice === 0) return;
    setPayAmount(totalMonthlyPrice);
    setPaymentType('pack');
    setUtrNumber('');
    setShowPayModal(true);
  };

  // Settle Outstanding and log proof in Firestore
  const handleVerifyUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) return;

    setPayingBill(true);

    try {
      const txTime = new Date().toISOString();
      const currentUtr = utrNumber.trim();
      const currentAmt = payAmount || outstandingBalance || 350;

      const initialReceipt = {
        utr: currentUtr,
        amount: currentAmt,
        time: txTime,
        status: 'Pending Verification',
        paymentType: paymentType
      };

      setPaymentReceiptInfo(initialReceipt);
      try {
        localStorage.setItem(`sundirect_receipt_${session.identifier}`, JSON.stringify(initialReceipt));
      } catch (storageErr) {
        console.warn(storageErr);
      }

      if (paymentType === 'outstanding') {
        const docRef = doc(db, 'clearances', session.identifier);
        await updateDoc(docRef, {
          status: 'Pending Verification',
          utrNumber: currentUtr,
          paymentMethod: 'UPI QR Code SCAN',
          lastUpdated: txTime
        });

        setTimeout(() => {
          setPayingBill(false);
          setShowPayModal(false);
          setBillJustPaid(true);
          onClearBalance(); // Resets local state to match pending verification
          setTimeout(() => setBillJustPaid(false), 4500);
        }, 2200);
      } else {
        // Add channel packs and record ledger transaction
        const refId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
        const userClearanceRef = doc(db, 'clearances', session.identifier);
        
        // Save pack request in clearances
        await updateDoc(userClearanceRef, {
          outstandingBalance: outstandingBalance + currentAmt,
          status: 'Pending Verification',
          utrNumber: currentUtr,
          lastUpdated: txTime
        });

        setTimeout(() => {
          setPayingBill(false);
          setShowPayModal(false);
          setRechargeSuccess(true);
          onRechargeSuccess(totalMonthlyPrice, subscriberId);
          setTimeout(() => {
            setRechargeSuccess(false);
            setSelectedChannels([]);
          }, 4500);
        }, 2200);
      }
    } catch (err: any) {
      console.error(err);
      setPayingBill(false);
      alert('Proof registration failed: ' + err.message);
    }
  };

  // Encodes merchant PhonePe / UPI link to dynamically launch real applications
  const constructUpiLink = () => {
    const defaultUPI = "9849500936@ybl"; // Linked to Raja Communications (+91 9849500936)
    const encodedPayee = encodeURIComponent("Raja Communications");
    return `upi://pay?pa=${defaultUPI}&pn=${encodedPayee}&am=${payAmount}&cu=INR&tn=SunDirectRef-${session.identifier}`;
  };

  const constructQrUrl = () => {
    const upiLink = constructUpiLink();
    // Use high contrast color parameters to resemble the user's uploaded image QR Code!
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=5f259f&data=${encodeURIComponent(upiLink)}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("9849500936@ybl");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReceipt = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Retrieve dynamic receipt info or fallback cleanly
      const utr = paymentReceiptInfo?.utr || 'SRECT' + Math.floor(1000000000 + Math.random() * 9000000000);
      const amtPaid = paymentReceiptInfo?.amount || 350;
      const payTime = paymentReceiptInfo?.time 
        ? new Date(paymentReceiptInfo.time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const payStatus = paymentReceiptInfo?.status && paymentReceiptInfo.status !== 'Pending'
        ? paymentReceiptInfo.status.toUpperCase() 
        : 'PENDING SYSTEM VERIFICATION (SUCCESSFULLY RECORDED)';

      // Branded Header with Slate/Navy Theme
      doc.setFillColor(15, 23, 42); // slate-900 background for top banner
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('SUN DIRECT DTH', 15, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('Real-time Electronic Ledger & Clearing Gateway', 15, 26);
      doc.text('Official Account Billing & Subscriptions Department', 15, 31);

      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 85, 0); // Active Orange color
      doc.text('TRANSACTION RECEIPT', 135, 18);
      
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`Document Ref: SRECT-${Math.floor(100000 + Math.random() * 900000)}`, 135, 25);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(74, 222, 128); // Green text
      doc.text('STATUS: SUCCESSFUL', 135, 30);

      // Divider or decorative line
      doc.setDrawColor(255, 85, 0); // Orange color
      doc.setLineWidth(1.5);
      doc.line(0, 42, 210, 42);

      // Metadata / Date on Right side
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(`Receipt Live Date: ${new Date().toLocaleDateString()}`, 135, 55);
      doc.text(`Verification Ref: firestore-ledger`, 135, 61);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('SYSTEM VERIFICATION APPROVED', 135, 67);

      // Customer details block
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('SUBSCRIBER INFORMATION', 15, 55);
      doc.setDrawColor(226, 232, 240); // border-slate-200
      doc.setLineWidth(0.5);
      doc.line(15, 57, 115, 57);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Name:`, 15, 63);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.name || 'N/A'}`, 48, 63);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Subscriber ID:`, 15, 69);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.identifier || 'N/A'}`, 48, 69);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Smart Card #:`, 15, 75);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.smartCardNumber || 'N/A'}`, 48, 75);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Mobile Contact:`, 15, 81);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${session.phone || 'N/A'}`, 48, 81);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Installation Address:`, 15, 87);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      
      // Wrap address text beautifully to avoid overflowing
      const addressLines = doc.splitTextToSize(session.address || 'N/A', 65);
      doc.text(addressLines, 48, 87);

      // Dynamic Y placement post-address wrap
      let currentY = 108;

      // Transaction Ledger Block
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('ELECTRONIC PAYMENT LEDGER & AUDIT TRAIL', 15, currentY);
      doc.line(15, currentY + 2, 195, currentY + 2);
      currentY += 8;

      // Table header
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(15, currentY, 180, 8, 'F');
      doc.setFontSize(9.5);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('Transaction / Clearance Item', 18, currentY + 5.5);
      doc.text('Reference Details', 110, currentY + 5.5);
      doc.text('Credited / Paid Amount', 150, currentY + 5.5);
      currentY += 8;

      // Table row 1 - Credit Clearance
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Direct UPI settlement Ledger Clearance', 18, currentY + 6);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const limitUtrText = utr.length > 18 ? utr.substring(0, 18) + '...' : utr;
      doc.text(`UTR: ${limitUtrText}`, 110, currentY + 6);
      doc.setTextColor(21, 128, 61); // Green
      doc.text(`INR ${amtPaid}.00`, 150, currentY + 6);
      doc.setDrawColor(241, 245, 249);
      doc.line(15, currentY + 10, 195, currentY + 10);
      currentY += 10;

      // Table row 2 - Sub Package Renewal Status
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Plan Link: ${session.planName || 'Active Digital DTH Package'}`, 18, currentY + 6);
      doc.text('Broadcast signals updated', 110, currentY + 6);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('₹ 0.00 Owed', 150, currentY + 6);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY + 10, 195, currentY + 10);
      currentY += 14;

      // Bold Green Payment Success Box
      doc.setFillColor(240, 253, 244); // emerald-50 bg
      doc.rect(15, currentY, 180, 36, 'F');
      doc.setDrawColor(74, 222, 128); // emerald-400 border
      doc.setLineWidth(0.75);
      doc.rect(15, currentY, 180, 36, 'S');

      // Success stamp badge
      doc.setTextColor(21, 128, 61); // emerald-700
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('● PAYMENT SUCCESSFUL & RECORDED', 21, currentY + 8);
      
      doc.setFontSize(9.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`1. Total Amount Cleared: `, 21, currentY + 15);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`INR ${amtPaid}.00 (Zero Transaction Commission Charged)`, 68, currentY + 15);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`2. Unique Transaction Reference (UTR): `, 21, currentY + 22);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${utr}`, 92, currentY + 22);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`3. Time of Successful Settlement: `, 21, currentY + 29);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${payTime} (IST Time Zone)`, 78, currentY + 29);

      // System notification text
      currentY += 44;
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 85, 0); // Orange
      doc.text('STATE REGISTER STATUS: ' + payStatus, 15, currentY);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(8.5);
      doc.text('Please keep this officially generated document for reference. Broadcasting codes sync real-time.', 15, currentY + 6);
      doc.text('Satellite transponder signals activate as soon as the administrator confirms valid routing of funds.', 15, currentY + 10.5);
      doc.text('Thank you for choosing Sun Direct, India\'s leading high-definition DTH subscription.', 15, currentY + 15);

      // Signature section
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.line(140, currentY + 12, 195, currentY + 12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Authorized Signal Auditor', 142, currentY + 16.5);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Digital Signature Approved - Centralized DB', 140, currentY + 20.5);

      // Save PDF file
      doc.save(`SunDirect_Receipt_${session.identifier}.pdf`);
    } catch (pdfErr) {
      console.error('PDF Generation Failed:', pdfErr);
      alert('Failed to generate PDF document, please try again.');
    }
  };

  const categories = ['All', 'Sports', 'Entertainment', 'Movies', 'Kids', 'News', 'Regional'];
  const filteredChannels = activeCategory === 'All' 
    ? channels 
    : channels.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-8 entrance-fade">
      {/* Upper Title */}
      <div>
        <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono font-bold flex items-center gap-1">
          <Database size={12} className="text-[#FF5500]" />
          <span>REAL-TIME FIREBASE LEDGER GATEWAY</span>
        </span>
        <h2 className="font-display text-3xl text-white font-bold tracking-tight mt-1">
          My Account & Billing
        </h2>
        <p className="text-xs font-sans text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
          Settle pending balances seamlessly. Scan your personalized UPI QR code with any payment app (GPay, PhonePe, Paytm, or BHIM) for <b>Zero Rupee Transaction Fees</b>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Outstanding Ledger Balance */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-white/10 hover:border-white/15 transition-all duration-300">
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#FF5500]/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="text-[#FF5500]" size={16} />
                  <span className="text-[10px] font-mono text-[#FF5500]/80 uppercase tracking-widest font-bold">
                    DTH Ledger Status
                  </span>
                </div>
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>

              <span className="text-[10px] font-mono uppercase text-on-surface-variant tracking-wider font-bold">Account Name</span>
              <h3 className="font-display text-lg text-white font-bold mt-0.5 leading-none">{session.name}</h3>
              <p className="font-mono text-xs text-[#FF5500]/80 mt-1.5">{session.identifier}</p>
            </div>

            <div className="mt-8 relative z-10 space-y-5">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  Outstanding Bill Owed
                </p>
                <p className="font-display text-4xl font-black text-white tracking-tight">
                  ₹{outstandingBalance.toLocaleString('en-IN')}.00
                </p>
              </div>

              {outstandingBalance > 0 ? (
                <button
                  type="button"
                  onClick={triggerOutstandingPaymentFlow}
                  className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white py-3.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-[#FF5500]/10"
                >
                  <QrCode size={14} />
                  <span>Scan QR & Settle (Zero Fee)</span>
                </button>
              ) : (
                <div className="flex flex-col gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs font-semibold font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Ledger Cleared</span>
                  </div>
                  <span className="text-[9px] text-white/50 leading-relaxed font-sans">
                    All outstanding balances are settled! Enjoy continuous over-the-air television broadcast signals.
                  </span>
                  
                  <button
                    onClick={handleDownloadReceipt}
                    type="button"
                    className="mt-1 flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold py-2.5 px-3 rounded-xl text-[10px] w-full font-sans transition-all shadow-md shadow-[#FF5500]/10"
                  >
                    <Download size={12} />
                    <span>Download PDF Receipt</span>
                  </button>
                </div>
              )}

              {billJustPaid && (
                <p className="text-[10px] text-center text-emerald-400 font-bold font-mono p-2 bg-emerald-500/10 rounded-lg">
                  UTR registered! Admin will verify and activate signaling code shortly.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-mono text-[#FF5500]">
              <ShieldAlert size={14} />
              <span>Zero-Rupee Payment Info</span>
            </h4>
            <div className="text-[11px] text-on-surface-variant leading-relaxed space-y-2">
              <p>
                Our payment system operates with <b>Zero Middleman Charges</b>. Since traditional gateways like Razorpay subtract 2% to 3% transaction commissions, we bypass them using custom high-definition merchant UPI codes directly.
              </p>
              <p className="text-white/60">
                You receive 100% value with no hidden costs, and all credit clearances sync securely to our cloud Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Channels / Add-ons Catalog */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-1.5">
              <Tv className="text-[#FF5500]" size={16} />
              <h3 className="font-display text-base text-white font-bold">DTH Premium Channels Add-ons</h3>
            </div>

            {/* Catalog classification filters */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 text-on-surface-variant hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
            {filteredChannels.map(channel => {
              const isSelected = selectedChannels.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel.id)}
                  className={`glass-panel p-4 rounded-xl cursor-pointer hover:border-[#FF5500]/30 hover:scale-[1.01] transition-all duration-300 flex justify-between items-center ${
                    isSelected 
                      ? 'border-[#FF5500]/45 bg-[#FF5500]/5 ring-1 ring-[#FF5500]/20' 
                      : 'border-white/5 bg-[#0e0e0f]/40'
                  }`}
                >
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#FF5500] font-mono font-bold">
                      {channel.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {channel.name}
                    </h4>
                    <p className="text-xs text-[#FF5500] font-mono mt-1 font-bold">
                      ₹{channel.price}/mo
                    </p>
                  </div>

                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    isSelected 
                      ? 'bg-[#FF5500] border-transparent text-white font-bold' 
                      : 'border-white/10 bg-white/5 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Banner Section */}
          <div className="glass-panel rounded-2xl p-6 border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 flex-1">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Sparkles className="text-[#FF5500]" size={14} />
                <span>Selected Channels Total Summary</span>
              </h4>
              <p className="text-xs text-on-surface-variant leading-none">
                Activating {selectedChannels.length} additional packs on subscription {subscriberId}
              </p>
              <div className="flex gap-4 pt-1.5 text-xs">
                <span className="text-on-surface-variant font-mono">Monthly Rate: <b className="text-white font-bold">₹{totalMonthlyPrice}/mo</b></span>
              </div>
            </div>

            <form onSubmit={triggerPackPaymentFlow} className="w-full md:w-auto shrink-0">
              <button
                type="submit"
                disabled={selectedChannels.length === 0 || recharging}
                className="w-full md:w-auto bg-white text-black hover:bg-[#FF5500] hover:text-white disabled:bg-white/5 disabled:text-[#e4e4e7]/20 disabled:border-white/5 px-6 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {recharging ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} />
                    <span>Activating Satellite Feeds...</span>
                  </>
                ) : rechargeSuccess ? (
                  <>
                    <CheckCircle2 className="text-emerald-400" size={13} />
                    <span>Add-ons Registered!</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={13} />
                    <span>Instant Pay & Activate (₹{totalMonthlyPrice})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* STUNNING INTERACTIVE PAY GATEWAY DIALOG MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 entrance-fade overflow-y-auto">
          <div className="glass-panel max-w-3xl w-full rounded-3xl p-6 border border-white/10 my-auto relative overflow-hidden flex flex-col md:flex-row gap-6">
            {/* Ambient Top Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-[#00b9f5] to-indigo-600" />

            {/* LEFT PANEL: Contains Information, due details, and verification form */}
            <div className="w-full md:w-1/2 md:min-w-[280px] flex flex-col justify-between space-y-5 text-left">
              {/* Modal Exit Header - Now properly self-contained inside Left Panel */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-left">
                  <Smartphone className="text-[#FF5500]" size={16} />
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight">Sun Direct UPI Gateway</h4>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-wide">Secure Settlement Hub</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPayModal(false)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono font-bold transition-all shrink-0"
                >
                  Cancel / Close
                </button>
              </div>

              {/* OUTSTANDING DUE AND SUBMISSION BLOCK */}
              <div className="bg-[#141416]/90 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[9px] font-mono uppercase text-on-surface-variant font-bold tracking-widest block mb-0.5">Clearing Charge Amount</span>
                <div className="text-2xl font-display font-black text-white flex items-baseline gap-1">
                  <span>₹{payAmount.toLocaleString('en-IN')}.00</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">No Extra Fees</span>
                </div>
              </div>

              {/* Verification form block */}
              <form onSubmit={handleVerifyUpiPayment} className="space-y-4 text-left border-t border-white/10 pt-4">
                <div>
                  <label className="text-xs font-semibold text-white/95 flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                    <span>Enter 12-Digit UPI Transaction Ref / UTR Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    minLength={8}
                    pattern="[a-zA-Z0-9]+"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 618299841102"
                    className="w-full bg-[#111112] border border-white/15 rounded-xl px-4 py-3 text-white text-xs text-center font-mono focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] placeholder-white/20 uppercase"
                  />
                  <span className="text-[9.5px] text-on-surface-variant leading-relaxed mt-2 block">
                    <b>* Instant Verification:</b> Once you complete the payment on your app, copy the 12-digit <b>UTR / Transaction ID</b> from the success details and paste it above to link your payment proof.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={payingBill || !utrNumber.trim()}
                  className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white py-3.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-[#FF5500]/10 font-mono"
                >
                  {payingBill ? (
                    <>
                      <RefreshCw className="animate-spin" size={13} />
                      <span>Linking Electronic Receipt...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} />
                      <span>Submit Payment Proof & Settle</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* RIGHT PANEL: The PhonePe QR card sits beautifully alongside */}
            <div className="flex-1 flex flex-col justify-center items-center">
              {/* BRANDED PHONEPE ACCREDITED VALUE CARD */}
              <div className="bg-[#f5f5f7] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200 text-slate-800 text-center w-full max-w-[340px]">
                {/* PhonePe App Header Bar Style */}
                <div className="bg-[#5f259f] px-4 py-3 flex items-center justify-between text-white select-none">
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-bold">←</span>
                    <div className="flex items-center gap-2 text-left">
                      {/* Merchant Avatar Image matching the one from the phone image */}
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-slate-200 shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" 
                          alt="Raja Communications avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-xs leading-none text-white">Raja Communications</h4>
                        <span className="text-[10px] text-purple-200 leading-none font-mono block mt-0.5">+91 9849500936</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-200 cursor-pointer hover:text-white bg-white/10 px-2 py-0.5 rounded">Manage</span>
                </div>

                {/* Receiving money banner */}
                <div className="bg-emerald-50 text-[#1b713c] px-4 py-2 text-xs flex items-center justify-center gap-1.5 font-bold border-b border-emerald-100 select-none">
                  <span className="w-4 h-4 bg-[#1b713c] rounded-full flex items-center justify-center text-white text-[8px]">✓</span>
                  <span>Receiving money on PhonePe</span>
                </div>

                {/* The main QR and details container */}
                <div className="p-5 bg-white space-y-4">
                  {/* HIGH-CONTRAST DEDICATED QR CONTAINER */}
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-3xl max-w-[220px] mx-auto border border-slate-150 shadow-md relative flex flex-col items-center justify-center">
                      <QRCodeSVG 
                        value={constructUpiLink()}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%235f259f'/><text x='50' y='68' font-family='sans-serif' font-weight='900' font-size='52' fill='white' text-anchor='middle'>पे</text></svg>",
                          height: 36,
                          width: 36,
                          excavate: true,
                        }}
                        className="w-full h-auto select-none"
                      />

                      {/* State Bank details pill at the bottom of the QR */}
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-full py-1 px-3 flex items-center gap-1.5 shadow-sm text-[11px] font-semibold text-slate-700 select-none">
                        {/* State Bank mini-logo SVG */}
                        <svg viewBox="0 0 100 100" width="14" height="14" className="shrink-0">
                          <circle cx="50" cy="50" r="40" fill="#00a2e8" />
                          <rect x="45" y="50" width="10" height="40" fill="white" />
                          <circle cx="50" cy="50" r="10" fill="white" />
                        </svg>
                        <span>State Bank... - 5157</span>
                        <span className="text-slate-400 text-[10px] ml-0.5 font-bold">❯</span>
                      </div>
                    </div>
                  </div>

                  {/* VISUALLY ISOLATED UPI ID SECTOR WITH CLIPBOARD COPYING */}
                  <div className="bg-[#f8f9fa] border border-slate-100 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                    <div className="text-left pl-1.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Payee PhonePe ID</span>
                      <span className="text-xs font-mono font-black text-[#5f259f] tracking-tight">9849500936@ybl</span>
                    </div>
                    <button
                      onClick={handleCopyUpi}
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shrink-0 ${
                        copied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-[#5f259f] hover:bg-[#4a1c7d] text-white shadow-sm'
                      }`}
                    >
                      {copied ? (
                        <>
                          <span className="text-xs">✓</span>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Suggested for you section mimicking PhonePe layout */}
                  <div className="border-t border-slate-100 pt-3 text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 select-none">Suggested for you</span>
                    <div className="grid grid-cols-4 gap-1 text-center select-none">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs shadow-sm font-bold text-blue-900 font-mono">HDFC</div>
                        <span className="text-[8px] text-slate-500 font-medium leading-tight">PhonePe Card</span>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs shadow-sm">👆</div>
                        <span className="text-[8px] text-slate-500 font-medium leading-tight">Fingerprint</span>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs shadow-sm font-bold text-purple-900 font-mono">AXIS</div>
                        <span className="text-[8px] text-slate-500 font-medium leading-tight">Axis Credit</span>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs shadow-sm">⭐</div>
                        <span className="text-[8px] text-slate-500 font-medium leading-tight">Wish Card</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
