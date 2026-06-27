import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  Filter,
  Users
} from 'lucide-react';
import { ServiceRequest } from '../types';

interface AdminRequestsProps {
  requests: ServiceRequest[];
  onUpdateRequestStatus: (id: string, status: ServiceRequest['status'], technician?: string) => void;
}

export default function AdminRequests({ requests, onUpdateRequestStatus }: AdminRequestsProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Declined'>('All');
  
  // Assign Technician Modal State
  const [selectedReqForAssign, setSelectedReqForAssign] = useState<ServiceRequest | null>(null);
  const [assignedTechName, setAssignedTechName] = useState('Kishore Kumar (Field Specialist)');

  const regionalTechnicians = [
    'Kishore Kumar (Field Specialist)',
    'Srinivasa Rao (Dish Master)',
    'Murali Krishna (DTH Network Tech)',
    'Ramesh Babu (Regional Cable Supervisor)',
    'Balaji Swamy (Satellite Align Specialist)'
  ];

  const handleApprove = (id: string) => {
    onUpdateRequestStatus(id, 'Approved');
  };

  const handleDeny = (id: string) => {
    onUpdateRequestStatus(id, 'Declined');
  };

  const handleOpenAssignModal = (req: ServiceRequest) => {
    setSelectedReqForAssign(req);
    setAssignedTechName(regionalTechnicians[0]);
  };

  const handleExecAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForAssign) return;

    onUpdateRequestStatus(selectedReqForAssign.id, 'In Progress', assignedTechName);
    setSelectedReqForAssign(null);
  };

  const handleComplete = (id: string) => {
    onUpdateRequestStatus(id, 'Completed');
  };

  const filtered = activeFilter === 'All' 
    ? requests 
    : requests.filter(r => r.status === activeFilter);

  return (
    <div className="space-y-8 entrance-fade">
      {/* Title block */}
      <div>
        <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
          MASTER QUEUE
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white mt-1">
          Global Request Queue
        </h2>
        <p className="text-sm font-sans text-on-surface-variant mt-1.5 font-normal">
          Manage pending dish setups, HD installations, or cable alignment inquiries across Southern regional sectors.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-[#FF5500]" size={14} />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Filter Ledger Queues</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Pending', 'Approved', 'In Progress', 'Completed', 'Declined'] as const).map(f => {
            const count = f === 'All' ? requests.length : requests.filter(r => r.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-2 rounded-xl text-[10px] font-semibold transition-all flex items-center gap-2 ${
                  activeFilter === f
                    ? 'bg-[#FF5500] text-white shadow-sm'
                    : 'bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{f}</span>
                <span className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] ${
                  activeFilter === f ? 'bg-white/20 text-white' : 'bg-white/10 text-on-surface-variant'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests table list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
            <Clock size={40} className="text-on-surface-variant/40 border border-white/5 p-2 rounded-full bg-white/5" />
            <h4 className="text-white font-semibold font-display">No requests in filtered stream</h4>
            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
              Adjust filters above, or log new service/order workflows to view administrative approvals.
            </p>
          </div>
        ) : (
          filtered.map(req => (
            <div 
              key={req.id} 
              className={`glass-panel p-6 rounded-2xl border transition-all duration-300 ${
                req.status === 'Pending' ? 'border-[#FF5500]/25 bg-gradient-to-r from-[#FF5500]/5 to-transparent' :
                req.status === 'Declined' ? 'border-red-500/10' :
                'border-white/5'
              } flex flex-col lg:flex-row justify-between lg:items-center gap-6`}
            >
              <div className="space-y-4 flex-1">
                {/* Header metadata */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#FF5500] bg-[#FF5500]/10 px-2.5 py-1 rounded-full">
                    {req.id}
                  </span>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                    req.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                    req.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                    req.status === 'Declined' ? 'bg-red-500/15 text-red-500 border border-red-500/20' :
                    'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/20'
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/70 font-mono">
                    Logged: {req.createdAt || 'Standard Dispatch'}
                  </span>
                </div>

                {/* Main block */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <p className="text-[10px] font-mono uppercase text-on-surface-variant">Request Type</p>
                    <h3 className="text-base font-bold text-white mt-1 leading-tight">{req.type}</h3>
                    {req.cost && (
                      <p className="text-xs font-mono text-[#FF5500] font-bold mt-1">Value: ₹{req.cost}</p>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <p className="text-[10px] font-mono uppercase text-on-surface-variant">Applicant Sub Profile</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[#FF5500] border border-white/5 shrink-0">
                        <User size={12} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{req.customerName || 'Anonymous guest'}</h4>
                        <p className="text-[10px] text-on-surface-variant font-mono truncate">{req.customerId || 'ID Unspecified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4">
                    <p className="text-[10px] font-mono uppercase text-on-surface-variant">Location & Phone</p>
                    <p className="text-xs text-white flex items-center gap-1.5 mt-1 truncate">
                      <MapPin size={12} className="text-on-surface-variant shrink-0" />
                      <span>{req.address}</span>
                    </p>
                    {req.phone && (
                      <p className="text-[10px] text-on-surface-variant font-mono flex items-center gap-1.5 mt-1 truncate">
                        <Phone size={12} className="text-on-surface-variant shrink-0" />
                        <span>{req.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Appointment slot if any */}
                {req.appointmentSlot && (
                  <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-[10px] font-mono text-on-surface-variant flex items-center gap-2 max-w-sm">
                    <Calendar size={12} className="text-[#FF5500]" />
                    <span>Appointment Slot: <b className="text-white">{req.appointmentSlot}</b></span>
                  </div>
                )}

                {/* Tech Assigned indicator */}
                {req.status !== 'Pending' && req.status !== 'Declined' && (
                  <div className="border-t border-white/5 pt-3 mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
                    <Users size={14} className="text-[#FF5500]" />
                    <span>Assigned Personnel: <b className="text-white font-semibold">{req.technician || 'System Auto Match'}</b></span>
                  </div>
                )}
              </div>

              {/* Action Buttons Column */}
              <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 justify-end">
                {req.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all active:scale-[0.98]"
                    >
                      <Check size={13} />
                      <span>Approve Order</span>
                    </button>
                    <button
                      onClick={() => handleDeny(req.id)}
                      className="bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:text-white text-red-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <X size={13} />
                      <span>Decline</span>
                    </button>
                  </>
                )}

                {req.status === 'Approved' && (
                  <button
                    onClick={() => handleOpenAssignModal(req)}
                    className="bg-[#FF5500] hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#FF5500]/10 transition-all"
                  >
                    <Truck size={13} />
                    <span>Assign & Dispatch Staff</span>
                  </button>
                )}

                {req.status === 'In Progress' && (
                  <button
                    onClick={() => handleComplete(req.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 size={13} />
                    <span>Mark Complete</span>
                  </button>
                )}

                {req.status === 'Completed' && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase rounded-full px-3 py-1.5">
                    <CheckCircle2 size={12} />
                    <span>Settle complete</span>
                  </div>
                )}

                {req.status === 'Declined' && (
                  <div className="flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 text-red-500/70 font-mono text-[10px] font-bold uppercase rounded-full px-3 py-1.5">
                    <AlertCircle size={12} />
                    <span>Declined / Closed</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Technician Dispatch modal */}
      {selectedReqForAssign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <form onSubmit={handleExecAssign} className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-white/10 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-mono text-[#FF5500] bg-[#FF5500]/10 px-2.5 py-1 rounded-full">
                  Assign & Dispatch Team
                </span>
                <h4 className="text-white font-bold text-lg mt-2">Staff Dispatch Assignment</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-2">
                  Select Field Engineer Technician
                </label>
                <select
                  value={assignedTechName}
                  onChange={(e) => setAssignedTechName(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                >
                  {regionalTechnicians.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 text-[11px] text-on-surface-variant leading-relaxed">
                Assigning this staff coordinates dispatches instantly. The customer is emailed technician name, and their <b>Order Status</b> timeline progresses.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqForAssign(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FF0000] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Dispatch Staff</span>
                  <Truck size={12} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
