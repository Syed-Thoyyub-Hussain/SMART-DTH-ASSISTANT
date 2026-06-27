import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  DollarSign, 
  User, 
  TrendingUp, 
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Mail,
  Server,
  Key,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Eye,
  FileText,
  Settings
} from 'lucide-react';
import { BillingClearance } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface AdminBillingProps {
  clearances: BillingClearance[];
  onClearCustomerBalance: (customerId: string) => void;
  onClearAllBalances: () => void;
}

export default function AdminBilling({ 
  clearances, 
  onClearCustomerBalance, 
  onClearAllBalances 
}: AdminBillingProps) {
  const [typedSubId, setTypedSubId] = useState('');
  const [matchingFeedback, setMatchingFeedback] = useState('');
  const [processingBatch, setProcessingBatch] = useState(false);
  const [batchSettleSuccess, setBatchSettleSuccess] = useState(false);
  const [activeBillingTab, setActiveBillingTab] = useState<'ledger' | 'emailGateway'>('ledger');
  
  // Real-time Firestore Email logs
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [selectedMailPreview, setSelectedMailPreview] = useState<any | null>(null);

  // Individual settle helper trigger
  const [processingIndividualId, setProcessingIndividualId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'sent_emails'), orderBy('sentAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setEmailLogs(list);
    }, (error) => {
      console.warn("Firestore snapshot error on sent_emails:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleSettleCustomer = (customerId: string) => {
    setProcessingIndividualId(customerId);
    setTimeout(() => {
      onClearCustomerBalance(customerId);
      setProcessingIndividualId(null);
    }, 1200);
  };

  const handleBatchPayment = () => {
    setProcessingBatch(true);
    setBatchSettleSuccess(false);

    setTimeout(() => {
      onClearAllBalances();
      setProcessingBatch(false);
      setBatchSettleSuccess(true);
      setTimeout(() => {
        setBatchSettleSuccess(false);
      }, 4000);
    }, 2200);
  };

  const handleSearchMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedSubId.trim()) return;

    const matched = clearances.find(c => c.customerId.toLowerCase() === typedSubId.trim().toLowerCase());
    if (matched) {
      setMatchingFeedback(`Found registry: ${matched.customerName} outstanding balance ₹${matched.outstandingBalance}`);
      setTimeout(() => setMatchingFeedback(''), 5000);
    } else {
      setMatchingFeedback('No outstanding clearances linked to subscriber registration ID.');
      setTimeout(() => setMatchingFeedback(''), 4000);
    }
  };

  const pendingCount = clearances.filter(c => c.status === 'Pending').length;
  const totalOutstandingVolume = clearances.reduce((sum, item) => sum + (item.status === 'Pending' ? item.outstandingBalance : 0), 0);

  return (
    <div className="space-y-8 entrance-fade">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
            ORACLE C-BILL CONTROL
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mt-1">
            Oracle C-Bill Master Ledger
          </h2>
          <p className="text-sm font-sans text-on-surface-variant mt-1.5 font-normal">
            Master clearance balances ledgers. Handle individual accounts clearing, view detailed charge breakdowns, or monitor real outbound subscriber emails.
          </p>
        </div>

        {/* Bulk Action Trigger (Only visible on ledger tab) */}
        {activeBillingTab === 'ledger' && pendingCount > 0 && (
          <button
            onClick={handleBatchPayment}
            disabled={processingBatch}
            className="bg-white hover:bg-[#FF5500] hover:text-white text-black px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
          >
            {processingBatch ? (
              <>
                <RefreshCw className="animate-spin text-[#FF5500]" size={14} />
                <span>Processing Oracle Clearing Batch...</span>
              </>
            ) : (
              <>
                <Sparkles className="text-[#FF5500]" size={14} />
                <span>Settle All Batch Clearances (₹{totalOutstandingVolume.toLocaleString('en-IN')})</span>
              </>
            )}
          </button>
        )}
      </div>

      {batchSettleSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold font-mono flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Oracle ledger aggregates processed successfully. All accounts settled.</span>
        </div>
      )}

      {/* Sub-NavigationBar Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveBillingTab('ledger')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 font-mono flex items-center gap-2 ${
            activeBillingTab === 'ledger'
              ? 'border-[#FF5500] text-white bg-white/[0.02]'
              : 'border-transparent text-on-surface-variant hover:text-white'
          }`}
        >
          <Database size={14} />
          <span>Financial Ledger</span>
        </button>

        <button
          onClick={() => setActiveBillingTab('emailGateway')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 font-mono flex items-center gap-2 ${
            activeBillingTab === 'emailGateway'
              ? 'border-[#FF5500] text-white bg-white/[0.02]'
              : 'border-transparent text-on-surface-variant hover:text-white'
          }`}
        >
          <Mail size={14} />
          <span>SMTP Real Email Gateway & logs</span>
          {emailLogs.filter(l => l.status === 'Failed').length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              !
            </span>
          )}
        </button>
      </div>

      {activeBillingTab === 'ledger' ? (
        <>
          {/* Overview Analytics Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-2">
              <span className="text-[10px] text-on-surface-variant font-mono uppercase">Outstanding Subscribers</span>
              <p className="text-3xl font-display font-black text-white">{pendingCount} Accounts</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-2">
              <span className="text-[10px] text-on-surface-variant font-mono uppercase">Uncleared Owed Ledger Balance</span>
              <p className="text-3xl font-display font-black text-[#FF5500]">₹{totalOutstandingVolume.toLocaleString('en-IN')}.00</p>
            </div>

            {/* Quick query lookup */}
            <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-3">
              <span className="text-[10px] text-on-surface-variant font-mono uppercase">Verify Subscriber Bill ID</span>
              <form onSubmit={handleSearchMatch} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. SUB-887492"
                  value={typedSubId}
                  onChange={(e) => setTypedSubId(e.target.value)}
                  className="flex-1 bg-[#0E0E0F] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#FF5500] font-mono"
                />
                <button
                  type="submit"
                  className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#FF5500] transition-all"
                >
                  Verify
                </button>
              </form>
              {matchingFeedback && (
                <p className="text-[10px] font-mono text-[#FF5500] truncate leading-none mt-1">{matchingFeedback}</p>
              )}
            </div>
          </div>

          {/* Clearance Registry ledger list */}
          <div className="glass-panel rounded-2xl overflow-hidden border-white/5 bg-black/20">
            <div className="p-5 border-b border-white/5 bg-white/[0.01]">
              <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                <Database size={15} className="text-[#FF5500]" />
                <span>Active Financial Clearance Registers</span>
              </h3>
            </div>

            <div className="divide-y divide-white/5">
              {clearances.map((sub, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 flex flex-col xl:flex-row justify-between xl:items-center gap-6 transition-all hover:bg-white/[0.01]`}
                >
                  {/* Profile Block */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-on-surface-variant/80 shrink-0 mt-0.5">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">{sub.customerName}</h4>
                      <p className="text-[11px] font-mono text-[#FF5500] uppercase mt-0.5">{sub.customerId}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sub.status === 'Cleared' ? 'bg-emerald-400' : 'bg-[#FF5500] animate-pulse'}`} />
                          <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
                            Oracle State: <b className={sub.status === 'Cleared' ? 'text-emerald-400' : 'text-[#FF5500]'}>{sub.status}</b>
                          </span>
                        </div>
                        {sub.utrNumber && (
                          <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded w-fit">
                            UPI UTR Reference: {sub.utrNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Breaking Pricing Ledger row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 max-w-xl">
                    <div className="space-y-1">
                      <span className="text-[9px] text-on-surface-variant font-mono uppercase block">Pack Rental</span>
                      <span className="text-xs font-mono text-white font-bold">₹{sub.packRental}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-on-surface-variant font-mono uppercase block">Equipment Fee</span>
                      <span className="text-xs font-mono text-white font-bold">₹{sub.equipmentFee}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-on-surface-variant font-mono uppercase block">Dispatch/Labor Fee</span>
                      <span className="text-xs font-mono text-white font-bold">₹{sub.installFee}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-on-surface-variant font-mono uppercase block">Aggregate Total</span>
                      <span className="text-xs font-mono text-[#FF5500] font-bold">₹{sub.outstandingBalance}</span>
                    </div>
                  </div>

                  {/* Actions columns */}
                  <div className="shrink-0 flex items-center justify-end">
                    {sub.status !== 'Cleared' ? (
                      <button
                        onClick={() => handleSettleCustomer(sub.customerId)}
                        disabled={processingIndividualId === sub.customerId}
                        className="bg-white/5 border border-white/10 hover:bg-[#FF5500] hover:border-transparent text-white hover:text-white py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {processingIndividualId === sub.customerId ? (
                          <>
                            <RefreshCw className="animate-spin" size={12} />
                            <span>Approving Settle...</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            <span>Settle & Approve</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
                        <CheckCircle2 size={11} />
                        <span>Cleared</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Real SMTP Email Gateway and Live Delivery Audit Trail */
        <div className="space-y-6">
          
          {/* SMTP Step-by-Step setup assistance widget */}
          <div className="bg-gradient-to-r from-teal-500/10 via-black/30 to-black/60 border border-teal-500/20 p-6 rounded-2xl">
            <div className="flex gap-4 flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Server className="text-teal-400" size={20} />
                  <h3 className="text-white font-bold text-base font-display">
                    Send Real Welcome Emails to Anyone Instantly (Unconstrained)
                  </h3>
                </div>
                <p className="text-xs text-[#b8c9de]/90 leading-relaxed max-w-3xl mt-1.5">
                  Our system currently checks your settings for direct Resend and SMTP settings. If your Resend key is a standard free trial sandbox, <strong>Resend restricts delivery strictly to your registered onboarding developer address</strong>.
                  <br />
                  <span className="text-teal-300 font-semibold">Solution:</span> You can bypass this instantly with zero additional fees by linking any standard SMTP provider or personal Gmail account in your AI Studio secrets menu!
                </p>
              </div>
            </div>

            {/* Quick Gmail SMTP Guide */}
            <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-black/20 p-4 rounded-xl">
              <div className="space-y-2.5">
                <h4 className="text-white font-bold flex items-center gap-1.5">
                  <Key size={14} className="text-teal-400" />
                  <span>How to set up Free Gmail SMTP in 1 minute:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-on-surface-variant leading-relaxed">
                  <li>Go to your Google Account Settings &rarr; <strong>Security</strong>.</li>
                  <li>Enable <strong>2-Step Verification</strong>.</li>
                  <li>In search bar, type <strong>"App passwords"</strong> and click on it.</li>
                  <li>Create a new App Password named e.g. <span className="font-mono text-white font-bold underline">"Raja DTH System"</span>.</li>
                  <li>Copy the generated 16-character code. No spaces needed!</li>
                </ol>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-white font-bold flex items-center gap-1.5">
                  <Settings size={14} className="text-[#FF5500]" />
                  <span>Secrets to paste in your Settings Console:</span>
                </h4>
                <div className="space-y-1.5 font-mono text-[10px] text-[#b8c9de]">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>SMTP_HOST:</span>
                    <strong className="text-white">smtp.gmail.com</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>SMTP_PORT:</span>
                    <strong className="text-white">587</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>SMTP_USER:</span>
                    <strong className="text-white">[YourGmailAddress]@gmail.com</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>SMTP_PASS:</span>
                    <strong className="text-teal-400">[The 16-char code copied above]</strong>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span>SMTP_FROM:</span>
                    <strong className="text-white">Raja Communications &lt;[YourGmailAddress]@gmail.com&gt;</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outbound Delivery Logs Audit Trail List */}
          <div className="glass-panel rounded-2xl overflow-hidden border-white/5 bg-black/20 flex-1">
            <div className="p-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider flex items-center gap-2">
                  <Mail size={15} className="text-[#FF5500]" />
                  <span>Real Outbound Email Dispatch ledger</span>
                </h3>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                  Realtime delivery statuses captured dynamically from SMTP / Resend relays
                </p>
              </div>
              <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#b8c9de] flex items-center gap-2">
                <span>Total logs collected: {emailLogs.length}</span>
              </div>
            </div>

            {emailLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Mail size={40} className="text-on-surface-variant/30 border border-white/5 p-2 rounded-full bg-white/5 mx-auto" />
                <h4 className="text-white font-semibold font-display">No outbound logs recorded yet</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                  When a new customer signs up or completes their profile registration, a real स्वागत (welcome) email is triggered immediately with credentials.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {emailLogs.map((log) => {
                  const isDelivered = log.status === 'Delivered';
                  return (
                    <div key={log.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.01]">
                      
                      {/* Left: Recipient identity and topic */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white tracking-tight truncate max-w-[150px]">
                            {log.customerName || 'Subscriber'}
                          </span>
                          <code className="text-[#FF5500] bg-black/40 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold tracking-tight">
                            {log.id}
                          </code>
                          <span className="text-[10px] text-on-surface-variant/70 font-mono">
                            {log.sentAt ? new Date(log.sentAt).toLocaleString('en-US') : 'N/A'}
                          </span>
                        </div>

                        <div className="text-xs text-on-surface-variant flex items-center gap-2 truncate max-w-xl">
                          <strong className="text-[#b7c8de]/90">To:</strong> 
                          <span className="text-white font-mono bg-white/5 px-1.5 py-0.2 rounded text-[11px] font-semibold">{log.to}</span>
                          <span className="text-white/30 truncate">| Sub: {log.subject}</span>
                        </div>

                        {/* Error info inline helper logic if dispatch rejected/restrained */}
                        {log.errorDetails && (
                          <div className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 max-w-2xl mt-2 leading-relaxed">
                            <AlertTriangle size={13} className="shrink-0 text-amber-500 mt-0.5" />
                            <div>
                              <strong className="text-amber-300">Relay Error:</strong> {log.errorDetails}
                              <br />
                              <span className="text-[#b8c9de]/80">This occurs because your free Resend key sandbox disables mailing third parties. Fix by setting your personal Gmail SMTP in Settings!</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions and visual statuses */}
                      <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end">
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold ${
                          isDelivered 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border border-amber-500/15 text-amber-400 animate-pulse'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-emerald-400' : 'bg-amber-400 urgent-glow'}`} />
                          <span>{isDelivered ? 'Delivered' : 'Sandbox Restricted'}</span>
                        </span>

                        <button
                          onClick={() => setSelectedMailPreview(log)}
                          className="bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View Body</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Body preview dialog modal */}
      {selectedMailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121214] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#FF5500]" />
                <h3 className="text-white font-bold text-sm font-display">
                  Outbound HTML content payload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMailPreview(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all text-xs"
              >
                ✕
              </button>
            </div>

            {/* Logs info */}
            <div className="px-6 py-3.5 bg-[#18181b] border-b border-white/5 text-xs text-on-surface-variant font-sans space-y-1">
              <div><strong>Recipient:</strong> <code className="text-[#FF5500]">{selectedMailPreview.to}</code> ({selectedMailPreview.customerName})</div>
              <div><strong>Subject:</strong> <span className="text-white">{selectedMailPreview.subject}</span></div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white scrollbar-thin">
              <div className="text-black" dangerouslySetInnerHTML={{ __html: selectedMailPreview.htmlBody }} />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#121214] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMailPreview(null)}
                className="bg-[#FF5500] hover:bg-[#FF5500]/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
