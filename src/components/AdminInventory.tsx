import React, { useState } from 'react';
import { 
  PlusCircle, 
  Layers, 
  Trash2, 
  Check, 
  Edit3, 
  TrendingUp, 
  AlertTriangle, 
  Database,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { InventoryStat } from '../types';

interface AdminInventoryProps {
  stats: InventoryStat[];
  onUpdateStats: (newStats: InventoryStat[]) => void;
}

export default function AdminInventory({ stats, onUpdateStats }: AdminInventoryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // New stock form state
  const [newName, setNewName] = useState('');
  const [newCount, setNewCount] = useState(50);
  const [newTrend, setNewTrend] = useState('+10 in transit');
  const [newLowStock, setNewLowStock] = useState(false);
  const [newPrice, setNewPrice] = useState(999);

  // Editing form state
  const [editCount, setEditCount] = useState(0);
  const [editTrend, setEditTrend] = useState('');
  const [editPrice, setEditPrice] = useState(0);

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: InventoryStat = {
      name: newName,
      count: Number(newCount),
      trend: newTrend || 'Stable reserves',
      lowStock: Number(newCount) < 20 || newLowStock,
      price: Number(newPrice)
    };

    onUpdateStats([...stats, newItem]);
    setNewName('');
    setNewCount(50);
    setNewTrend('');
    setNewPrice(999);
    setShowAddForm(false);
  };

  const handleSaveChanges = (index: number) => {
    const updated = [...stats];
    updated[index] = {
      ...updated[index],
      count: Number(editCount),
      trend: editTrend,
      lowStock: Number(editCount) < 20,
      price: editPrice
    };
    onUpdateStats(updated);
    setEditingIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    onUpdateStats(stats.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-8 entrance-fade">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase text-[#b7c8de]/70 tracking-widest font-mono">
            ADMIN OPERATIONS
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mt-1">
            Supplies & Inventory Management
          </h2>
          <p className="text-sm font-sans text-on-surface-variant mt-1.5">
            Log raw intake materials, adjust field staff stock counts, or update prices on commercial hardware caches.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white hover:bg-[#FF5500] hover:text-white text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <PlusCircle size={14} />
          <span>{showAddForm ? 'Cancel Form' : 'Register New Item'}</span>
        </button>
      </div>

      {/* Add Stock Form */}
      {showAddForm && (
        <form onSubmit={handleAddNewItem} className="glass-panel p-6 rounded-2xl border-[#FF5500]/20 bg-white/[0.02] space-y-4 max-w-2xl">
          <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
            <Package size={16} className="text-[#FF5500]" />
            <span>Add Brand New Supply Category Log</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">Item/Supply Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. RG-6 Tri-Shield Coaxial Reel"
                className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">Commercial Retail Price (₹)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF5500] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">Starting Unit Count</label>
              <input
                type="number"
                required
                value={newCount}
                onChange={(e) => setNewCount(Number(e.target.value))}
                className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF5500] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">Transit / Trend Log</label>
              <input
                type="text"
                value={newTrend}
                onChange={(e) => setNewTrend(e.target.value)}
                placeholder="e.g. +14 in transit"
                className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newLowStock}
                  onChange={(e) => setNewLowStock(e.target.checked)}
                  className="rounded bg-black border-white/15 text-[#FF5500] focus:ring-[#FF5500]"
                />
                <span>Force Low Stock alarm</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#FF5500] text-white hover:brightness-110 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF5500]/10"
          >
            Settle Supply Registry
          </button>
        </form>
      )}

      {/* Grid of Supply list items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item, index) => {
          const isEditing = editingIndex === index;
          
          return (
            <div 
              key={index}
              className={`glass-panel p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                item.lowStock 
                  ? 'border-red-500/20 shadow-lg shadow-red-500/[0.02]' 
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              {/* Highlight background lines for low stock */}
              {item.lowStock && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.03] rounded-full filter blur-xl pointer-events-none" />
              )}

              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 select-none">
                    <span className="text-[9px] uppercase tracking-wider text-on-surface-variant/80 font-mono">Inventory Category</span>
                    <h4 className="text-white text-base font-bold leading-tight">{item.name}</h4>
                  </div>
                  
                  {item.lowStock && (
                    <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
                      <AlertTriangle size={10} />
                      <span>LOW</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {isEditing ? (
                    <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                      <div>
                        <label className="text-[10px] text-on-surface-variant font-medium block mb-1 font-mono">Count Value</label>
                        <input
                          type="number"
                          value={editCount}
                          onChange={(e) => setEditCount(Number(e.target.value))}
                          className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant font-medium block mb-1 font-mono">Trend String</label>
                        <input
                          type="text"
                          value={editTrend}
                          onChange={(e) => setEditTrend(e.target.value)}
                          className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant font-medium block mb-1 font-mono">Price (₹)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full bg-[#0E0E0F] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-mono uppercase">In Stock</span>
                        <p className={`text-3xl font-serif font-black tracking-tight mt-1 ${item.lowStock ? 'text-red-500' : 'text-white'}`}>
                          {item.count}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-mono uppercase">Avg. Cost</span>
                        <p className="text-xl font-mono font-bold text-[#FF5500] mt-1.5">
                          ₹{item.price || 999}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center gap-3">
                <span className="text-[10px] text-on-surface-variant font-sans flex items-center gap-1.5">
                  {!isEditing && (
                    <>
                      <TrendingUp size={11} className={item.lowStock ? 'text-red-500' : 'text-green-500'} />
                      <span>{item.trend}</span>
                    </>
                  )}
                </span>

                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="p-1 px-2.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-white font-semibold flex items-center gap-1 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveChanges(index)}
                        className="p-1 px-2.5 rounded bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Check size={12} />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(index);
                          setEditCount(item.count);
                          setEditTrend(item.trend);
                          setEditPrice(item.price || 999);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-on-surface-variant hover:text-white hover:bg-white/10 transition-all"
                        title="Edit quantities"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(index)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        title="Delete product category"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
