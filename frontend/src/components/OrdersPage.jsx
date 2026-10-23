import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, Package, Clock, XCircle, Loader2,
  RefreshCw, RotateCcw, Undo2, CreditCard,
} from 'lucide-react';
import { orderApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING_PAYMENT: { label: 'Pending Payment', cls: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
  CONFIRMED:       { label: 'Confirmed',        cls: 'bg-blue-900/40  text-blue-300  border-blue-700/40'  },
  PROCESSING:      { label: 'Processing',       cls: 'bg-purple-900/40 text-purple-300 border-purple-700/40' },
  SHIPPED:         { label: 'Shipped',          cls: 'bg-cyan-900/40  text-cyan-300  border-cyan-700/40'  },
  DELIVERED:       { label: 'Delivered',        cls: 'bg-green-900/40 text-green-300 border-green-700/40' },
  CANCELLED:       { label: 'Cancelled',        cls: 'bg-red-900/40   text-red-300   border-red-700/40'   },
  RETURNED:        { label: 'Returned',         cls: 'bg-gray-800     text-gray-400  border-gray-700'     },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? { label: status, cls: 'bg-gray-800 text-gray-400 border-gray-700' };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Return Modal ─────────────────────────────────────────────────────────────
function ReturnModal({ order, onClose, onSuccess }) {
  const [reason, setReason]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  // Allow selecting which items to return (all by default)
  const [selectedItems, setSelectedItems] = useState(
    () => new Set((order.items ?? []).map((i) => i.id))
  );

  function toggleItem(id) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) { setError('Please provide a reason.'); return; }
    if (selectedItems.size === 0) { setError('Select at least one item.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const result = await orderApi.requestReturn(order.id, reason, [...selectedItems]);
      onSuccess(result);
    } catch (err) {
      setError(err.message ?? 'Return request failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1e2026] border border-[#2a2c33] rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2c33]">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Undo2 size={15} className="text-orange-400" /> Request Return
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Item selection */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Select items to return:</p>
            <ul className="flex flex-col gap-2">
              {(order.items ?? []).map((item) => {
                const book = item.product ?? item;
                return (
                  <li key={item.id}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="accent-blue-500 w-4 h-4 shrink-0"
                      />
                      <span className="text-sm text-gray-300 line-clamp-1">
                        {book.title ?? '—'} <span className="text-gray-500">×{item.quantity}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Reason for return</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wrong item received, damaged on delivery…"
              rows={3}
              className="w-full bg-[#2a2c33] border border-[#3a3d46] rounded px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#2a2c33] hover:border-gray-500 text-gray-300 text-sm py-2.5 rounded transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded transition-colors">
              {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={13} className="animate-spin" /> Submitting…</span> : 'Submit Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Single order card ────────────────────────────────────────────────────────
function OrderCard({ order, onBuyAgain, onCancel, onReturn, cancelling }) {
  const [expanded, setExpanded]     = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [returnResult, setReturnResult] = useState(null);

  const placedOn = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const canCancel = order.canCancelUntil
    ? new Date(order.canCancelUntil) > new Date()
    : false;

  const cancelCancellable = canCancel && !['CANCELLED', 'DELIVERED', 'RETURNED'].includes(order.status);
  const canReturn = order.status === 'DELIVERED';

  // Refund/payment info banner
  const isRefunded = order.status === 'CANCELLED' || order.status === 'RETURNED';

  return (
    <>
      <div className="bg-[#1e2026] border border-[#2a2c33] rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-[#2a2c33]">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">
              Order <span className="font-mono text-gray-300">#{order.id?.slice(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={11} /> {placedOn}
            </p>
          </div>
          <StatusBadge status={order.status} />
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-white font-bold">₹{Number(order.totalAmount ?? 0).toFixed(0)}</p>
          </div>
        </div>

        {/* Refund banner */}
        {isRefunded && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-orange-900/20 border-b border-orange-800/30 text-xs text-orange-300">
            <CreditCard size={12} />
            {order.status === 'CANCELLED'
              ? 'Refund initiated — amount will be credited within 5–7 business days.'
              : 'Return processed — refund will be issued after inspection.'}
          </div>
        )}

        {/* Return success banner */}
        {returnResult && (
          <div className="px-5 py-2.5 bg-green-900/20 border-b border-green-800/30 text-xs text-green-300">
            Return #{returnResult.returnId?.slice(0, 8).toUpperCase()} submitted.
            Tracking: <span className="font-mono">{returnResult.returnShipmentTrackingNumber}</span>
          </div>
        )}

        {/* Items preview */}
        <div className="px-5 py-3">
          <ul className="flex flex-col gap-2">
            {(order.items ?? []).slice(0, expanded ? undefined : 2).map((item) => {
              const book  = item.product ?? item;
              const price = item.unitPrice ?? book.price ?? 0;
              return (
                <li key={item.id} className="flex justify-between items-start text-sm gap-3">
                  <span className="text-gray-300 line-clamp-1 flex-1">
                    {book.title ?? '—'}<span className="text-gray-500 ml-1">×{item.quantity}</span>
                  </span>
                  <span className="text-white shrink-0">₹{(Number(price) * item.quantity).toFixed(0)}</span>
                </li>
              );
            })}
          </ul>
          {(order.items?.length ?? 0) > 2 && (
            <button onClick={() => setExpanded((e) => !e)}
              className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors">
              {expanded ? 'Show less' : `+${order.items.length - 2} more item${order.items.length - 2 !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Delivery address */}
        {order.deliveryAddress && (
          <div className="px-5 pb-3 text-xs text-gray-500">
            <Package size={11} className="inline mr-1" />
            {order.deliveryAddress.street}, {order.deliveryAddress.city}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-4 pt-1 flex-wrap">
          <button onClick={() => onBuyAgain(order.id)}
            className="flex items-center gap-1.5 text-xs bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold px-3 py-1.5 rounded">
            <RotateCcw size={12} /> Buy Again
          </button>

          {cancelCancellable && (
            <button onClick={() => onCancel(order.id)} disabled={cancelling === order.id}
              className="flex items-center gap-1.5 text-xs border border-red-700/50 text-red-400 hover:bg-red-900/20 disabled:opacity-50 transition-colors px-3 py-1.5 rounded">
              <XCircle size={12} />
              {cancelling === order.id ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}

          {canReturn && !returnResult && (
            <button onClick={() => setShowReturn(true)}
              className="flex items-center gap-1.5 text-xs border border-orange-700/50 text-orange-400 hover:bg-orange-900/20 transition-colors px-3 py-1.5 rounded">
              <Undo2 size={12} /> Return Order
            </button>
          )}

          {order.canCancelUntil && cancelCancellable && (
            <p className="text-[10px] text-gray-600 self-center">
              Cancel by {new Date(order.canCancelUntil).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Return modal */}
      {showReturn && (
        <ReturnModal
          order={order}
          onClose={() => setShowReturn(false)}
          onSuccess={(result) => { setReturnResult(result); setShowReturn(false); }}
        />
      )}
    </>
  );
}

// ─── OrdersPage ───────────────────────────────────────────────────────────────
export default function OrdersPage({ onBack, onBuyAgainSuccess }) {
  const { user, refreshCart } = useAuth();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await orderApi.getHistory(p, 10);
      setOrders(data.orders ?? []);
      setTotalPages(Math.ceil((data.total ?? 0) / 10) || 1);
      setPage(p);
    } catch (err) {
      setError(err.status === 401 || err.status === 403
        ? 'Please sign in to view your orders.'
        : (err.message ?? 'Failed to load orders.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return; // not logged in — don't make the request at all
    load(1);
  }, [load, user]);

  async function handleBuyAgain(orderId) {
    try {
      await orderApi.buyAgain(orderId);
      await refreshCart();
      onBuyAgainSuccess?.();
    } catch (err) {
      alert(err.message ?? 'Could not re-add items to cart.');
    }
  }

  async function handleCancel(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(orderId);
    try {
      const updated = await orderApi.cancel(orderId, 'Customer requested cancellation');
      setOrders((prev) => prev.map((o) => o.id === orderId ? updated : o));
    } catch (err) {
      alert(err.message ?? 'Could not cancel this order.');
    } finally {
      setCancelling(null);
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-4 pb-16">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-6">
          <ChevronLeft size={14} /> Back to catalog
        </button>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Package size={40} className="text-gray-600" />
          <p className="text-gray-400 text-sm">Please sign in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 pb-16">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-6">
        <ChevronLeft size={14} /> Back to catalog
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">My Orders</h2>
        <button onClick={() => load(page)} className="text-gray-400 hover:text-white transition-colors" title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
          <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading orders…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <XCircle size={36} className="text-red-500/60" />
          <p className="text-gray-400 text-sm">{error}</p>
          {!error.includes('sign in') && (
            <button onClick={() => load(1)} className="text-xs text-blue-400 hover:underline">Retry</button>
          )}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Package size={40} className="text-gray-600" />
          <p className="text-gray-400 text-sm">You haven't placed any orders yet.</p>
          <button onClick={onBack} className="text-xs text-blue-400 hover:underline mt-1">Browse catalog</button>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onBuyAgain={handleBuyAgain}
                onCancel={handleCancel}
                onReturn={() => {}}
                cancelling={cancelling}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => load(page - 1)} disabled={page === 1}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors px-3 py-1.5 rounded border border-[#2a2c33] hover:border-gray-500">
                ← Prev
              </button>
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => load(page + 1)} disabled={page === totalPages}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors px-3 py-1.5 rounded border border-[#2a2c33] hover:border-gray-500">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
