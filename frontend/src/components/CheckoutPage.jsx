import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, MapPin, Truck, CheckCircle, Loader2,
  PlusCircle, Gift, CreditCard, Wallet as WalletIcon,
} from 'lucide-react';
import { addressApi, orderApi, paymentApi, shippingApi } from '../api/api';
import { useAuth } from '../context/AuthContext';


const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'UPI',         label: 'UPI',                 icon: WalletIcon  },
  { id: 'WALLET',      label: 'Store Wallet',        icon: WalletIcon  },
];

// ─── Step indicators ──────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Address', 'Shipping', 'Payment', 'Review'];
  return (
    <ol className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <li className="flex items-center gap-1.5">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${done   ? 'bg-green-500 text-white'  : ''}
                ${active ? 'bg-blue-500 text-white'   : ''}
                ${!done && !active ? 'bg-[#2a2c33] text-gray-500' : ''}`}>
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-xs ${active ? 'text-white font-semibold' : done ? 'text-green-400' : 'text-gray-500'}`}>
                {label}
              </span>
            </li>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-[#2a2c33] mx-2 min-w-[16px]" />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}

// ─── Step 0 — Address ─────────────────────────────────────────────────────────
function AddressStep({ selected, onSelect, onNext }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ street: '', city: '', state: '', postalCode: '', country: 'India' });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    addressApi.getAll()
      .then((data) => { setAddresses(data); if (data.length === 0) setShowForm(true); })
      .catch(() => setError('Could not load addresses.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAddAddress(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const newAddr = await addressApi.add(
        form.street, form.city, form.state, form.postalCode, form.country,
        addresses.length === 0
      );
      setAddresses((prev) => [...prev, newAddr]);
      onSelect(newAddr);
      setShowForm(false);
    } catch (err) {
      setError(err.message ?? 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-12">
        <Loader2 size={18} className="animate-spin" /> <span className="text-sm">Loading addresses…</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <MapPin size={16} className="text-blue-400" /> Delivery Address
      </h3>
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {addresses.length > 0 && (
        <ul className="flex flex-col gap-3 mb-4">
          {addresses.map((addr) => (
            <li key={addr.id}>
              <button
                type="button"
                onClick={() => onSelect(addr)}
                className={`w-full text-left px-4 py-3 rounded border transition-colors
                  ${selected?.id === addr.id
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-[#2a2c33] bg-[#2a2c33] text-gray-300 hover:border-gray-500'}`}
              >
                <p className="text-sm font-medium">{addr.street}</p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.city}, {addr.state} {addr.postalCode} · {addr.country}</p>
                {addr.isDefault && <span className="text-[10px] text-blue-400 font-medium mt-1 inline-block">Default</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mb-4">
          <PlusCircle size={14} /> Add new address
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAddAddress} className="bg-[#2a2c33] rounded p-4 flex flex-col gap-3 mb-4">
          <h4 className="text-white text-sm font-medium">New Address</h4>
          {[
            { name: 'street',     placeholder: 'Street / Flat, Building' },
            { name: 'city',       placeholder: 'City' },
            { name: 'state',      placeholder: 'State' },
            { name: 'postalCode', placeholder: 'PIN / Postal Code' },
            { name: 'country',    placeholder: 'Country' },
          ].map(({ name, placeholder }) => (
            <input key={name} required value={form[name]}
              onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
              placeholder={placeholder}
              className="bg-[#1e2026] border border-[#3a3d46] rounded px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
            />
          ))}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-white px-3 py-1.5">Cancel</button>
            <button type="submit" disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors">
              {saving ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      <button onClick={onNext} disabled={!selected}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold py-3 rounded mt-2">
        Continue to Shipping
      </button>
    </div>
  );
}

// ─── Step 1 — Shipping (with live rate calculation) ───────────────────────────
function ShippingStep({ selected, onSelect, onNext, onBack, address, cart }) {
  const [rates, setRates]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [rateError, setRateError] = useState('');

  useEffect(() => {
    if (!address?.postalCode) return;
    setLoading(true);
    setRateError('');
    shippingApi.calculateRate(address.postalCode, cart?.cartId)
      .then(setRates)
      .catch(() => setRateError('Could not fetch shipping rates.'))
      .finally(() => setLoading(false));
  }, [address?.postalCode, cart?.cartId]);

  const options = rates?.options ?? [];

  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
        <Truck size={16} className="text-blue-400" /> Shipping Method
      </h3>
      {address?.postalCode && (
        <p className="text-xs text-gray-500 mb-4">Rates for PIN: <span className="text-gray-300">{address.postalCode}</span></p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
          <Loader2 size={12} className="animate-spin" /> Calculating rates…
        </div>
      )}
      {rateError && <p className="text-yellow-400 text-xs mb-3">{rateError}</p>}

      <ul className="flex flex-col gap-3 mb-6">
        {options.map((opt) => (
          <li key={opt.shippingMethodId}>
            <button type="button" onClick={() => onSelect(opt)}
              className={`w-full text-left px-4 py-3 rounded border transition-colors
                ${selected?.shippingMethodId === opt.shippingMethodId
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#2a2c33] bg-[#2a2c33] hover:border-gray-500'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white text-sm font-medium">{opt.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Est. delivery {new Date(opt.tentativeDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-white text-sm font-semibold shrink-0 ml-4">
                  {opt.cost === 0 ? 'FREE' : `₹${opt.cost.toFixed(2)}`}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[#2a2c33] hover:border-gray-500 text-gray-300 text-sm font-medium py-3 rounded transition-colors">Back</button>
        <button onClick={onNext} disabled={!selected}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold py-3 rounded">
          Choose Payment
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 — Payment method ──────────────────────────────────────────────────
function PaymentStep({ selected, onSelect, onNext, onBack, wallet }) {
  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <CreditCard size={16} className="text-blue-400" /> Payment Method
      </h3>

      <ul className="flex flex-col gap-3 mb-6">
        {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button type="button" onClick={() => onSelect(id)}
              className={`w-full text-left px-4 py-3 rounded border transition-colors flex items-center gap-3
                ${selected === id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#2a2c33] bg-[#2a2c33] hover:border-gray-500'}`}>
              <Icon size={16} className={selected === id ? 'text-blue-400' : 'text-gray-400'} />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{label}</p>
                {id === 'WALLET' && wallet && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Balance: ₹{Number(wallet.walletAmount ?? 0).toFixed(2)} · {wallet.giftPoints ?? 0} pts
                  </p>
                )}
              </div>
              {selected === id && <CheckCircle size={14} className="text-blue-400 shrink-0" />}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[#2a2c33] hover:border-gray-500 text-gray-300 text-sm font-medium py-3 rounded transition-colors">Back</button>
        <button onClick={onNext} disabled={!selected}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold py-3 rounded">
          Review Order
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 — Review & Place Order ───────────────────────────────────────────
function ReviewStep({ address, shipping, paymentMethod, cart, onBack, onPlaceOrder, placing, orderError }) {
  const items       = cart?.items ?? [];
  const subtotal    = Number(cart?.subtotal ?? 0);
  const discount    = Number(cart?.discount  ?? 0);
  const shipCost    = shipping?.cost ?? 0;

  const [wallet, setWallet]             = useState(null);
  const [pointsInput, setPointsInput]   = useState('');
  const [redeeming, setRedeeming]       = useState(false);
  const [redeemMsg, setRedeemMsg]       = useState('');
  const [pointsApplied, setPointsApplied] = useState(0);

  useEffect(() => {
    paymentApi.getWallet().then(setWallet).catch(() => {});
  }, []);

  const giftPointsAvailable = wallet?.giftPoints ?? 0;
  const inputNum            = Math.min(parseInt(pointsInput, 10) || 0, giftPointsAvailable);
  const pointsDiscount      = pointsApplied / 100;
  const grandTotal          = Math.max(0, subtotal - discount - pointsDiscount + shipCost);

  async function handleRedeemPoints() {
    if (inputNum <= 0) return;
    setRedeeming(true);
    setRedeemMsg('');
    try {
      await paymentApi.redeemPoints(inputNum);
      setPointsApplied(inputNum);
      setRedeemMsg(`✓ ${inputNum} pts applied — ₹${(inputNum / 100).toFixed(2)} off`);
      const updated = await paymentApi.getWallet();
      setWallet(updated);
    } catch (err) {
      setRedeemMsg(`✗ ${err.message ?? 'Redemption failed.'}`);
    } finally {
      setRedeeming(false);
    }
  }

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? paymentMethod;

  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <CheckCircle size={16} className="text-blue-400" /> Review & Place Order
      </h3>

      {/* Address */}
      <div className="bg-[#2a2c33] rounded p-3 mb-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Delivering to</p>
        <p className="text-white text-sm">{address.street}</p>
        <p className="text-gray-400 text-xs">{address.city}, {address.state} {address.postalCode}</p>
      </div>

      {/* Shipping */}
      <div className="bg-[#2a2c33] rounded p-3 mb-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Shipping</p>
        <p className="text-white text-sm">{shipping.name} — {shipCost === 0 ? 'FREE' : `₹${shipCost.toFixed(2)}`}</p>
        <p className="text-gray-400 text-xs">Est. delivery {new Date(shipping.tentativeDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
      </div>

      {/* Payment method */}
      <div className="bg-[#2a2c33] rounded p-3 mb-4">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Payment</p>
        <p className="text-white text-sm">{methodLabel}</p>
      </div>

      {/* Items */}
      <ul className="flex flex-col gap-2 mb-4">
        {items.map((item) => {
          const book  = item.product ?? item;
          const price = item.unitPrice ?? book.price ?? 0;
          return (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-300 line-clamp-1 flex-1 mr-3">{book.title} <span className="text-gray-500">×{item.quantity}</span></span>
              <span className="text-white shrink-0">₹{(Number(price) * item.quantity).toFixed(0)}</span>
            </li>
          );
        })}
      </ul>

      {/* Gift-points panel */}
      {wallet && giftPointsAvailable > 0 && pointsApplied === 0 && (
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3 mb-4">
          <p className="text-purple-300 text-xs font-semibold flex items-center gap-1.5 mb-2">
            <Gift size={12} /> {giftPointsAvailable} gift points available (≈ ₹{(giftPointsAvailable / 100).toFixed(2)})
          </p>
          <div className="flex gap-2">
            <input type="number" min="1" max={giftPointsAvailable}
              value={pointsInput} onChange={(e) => setPointsInput(e.target.value)}
              placeholder="Points to apply"
              className="flex-1 bg-[#1e2026] border border-[#3a3d46] rounded px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors" />
            <button type="button" onClick={() => setPointsInput(String(giftPointsAvailable))}
              className="text-xs text-purple-400 border border-[#3a3d46] px-2 rounded hover:text-purple-300 transition-colors whitespace-nowrap">Use all</button>
            <button type="button" onClick={handleRedeemPoints} disabled={redeeming || inputNum <= 0}
              className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-3 rounded transition-colors">
              {redeeming ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
            </button>
          </div>
          {redeemMsg && (
            <p className={`text-xs mt-2 ${redeemMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{redeemMsg}</p>
          )}
        </div>
      )}

      {pointsApplied > 0 && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-700/30 rounded px-3 py-2 mb-4">
          <Gift size={12} /> {pointsApplied} gift points applied — ₹{pointsDiscount.toFixed(2)} off
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-[#2a2c33] pt-3 flex flex-col gap-1.5 mb-5">
        <div className="flex justify-between text-xs text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
        {discount > 0 && (
          <div className="flex justify-between text-xs text-green-400"><span>Cart Discount</span><span>−₹{discount.toFixed(0)}</span></div>
        )}
        {pointsApplied > 0 && (
          <div className="flex justify-between text-xs text-purple-400">
            <span>Gift Points ({pointsApplied} pts)</span><span>−₹{pointsDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-400"><span>Shipping</span><span>₹{shipCost}</span></div>
        <div className="flex justify-between text-white font-bold text-base mt-1"><span>Total</span><span>₹{grandTotal.toFixed(0)}</span></div>
      </div>

      {orderError && <p className="text-red-400 text-xs mb-3">{orderError}</p>}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[#2a2c33] hover:border-gray-500 text-gray-300 text-sm font-medium py-3 rounded transition-colors">Back</button>
        <button onClick={() => onPlaceOrder(pointsApplied)} disabled={placing}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 transition-colors text-white text-sm font-semibold py-3 rounded">
          {placing
            ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Processing…</span>
            : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

// ─── Payment Gateway Processing screen ────────────────────────────────────────
function PaymentProcessing({ order, paymentMethod, onConfirmed, onFailed }) {
  const [status, setStatus]   = useState('initiating'); // initiating | waiting | confirming | done | failed
  const [session, setSession] = useState(null);
  const [error, setError]     = useState('');

  // useRef persists across Strict Mode's mount→unmount→remount cycle, unlike a
  // local `let` variable which resets on each effect invocation. This ensures
  // initiatePayment is called exactly once even in development Strict Mode.
  const didRun = useRef(false);

  useEffect(() => {
    // didRun persists across Strict Mode's unmount/remount — blocks the duplicate
    // call without a cleanup flag that would cancel the first call's responses.
    if (didRun.current) return;
    didRun.current = true;

    async function run() {
      try {
        // 1. Initiate payment
        const sess = await paymentApi.initiatePayment(order.id, paymentMethod, 0);
        setSession(sess);
        setStatus('waiting');

        // 2. Simulate gateway redirect/return (2s for demo)
        await new Promise((r) => setTimeout(r, 2000));
        setStatus('confirming');

        // 3. Confirm
        const txnId = 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        const conf  = await paymentApi.confirmPayment(sess.paymentId, txnId, 'SUCCESS');
        setStatus('done');
        onConfirmed(conf);
      } catch (err) {
        setError(err.message ?? 'Payment failed.');
        setStatus('failed');
        onFailed();
      }
    }
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      {status === 'initiating' && (
        <><Loader2 size={40} className="animate-spin text-blue-400" /><p className="text-white font-semibold">Initiating payment…</p></>
      )}
      {status === 'waiting' && (
        <>
          <Loader2 size={40} className="animate-spin text-blue-400" />
          <p className="text-white font-semibold">Redirecting to payment gateway…</p>
          <p className="text-gray-500 text-xs max-w-xs">
            Gateway URL: <span className="text-blue-400 break-all">{session?.gatewayRedirectUrl ?? '…'}</span>
          </p>
          <p className="text-gray-400 text-xs">(Simulating gateway response…)</p>
        </>
      )}
      {status === 'confirming' && (
        <><Loader2 size={40} className="animate-spin text-green-400" /><p className="text-white font-semibold">Confirming payment…</p></>
      )}
      {status === 'failed' && (
        <>
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-2xl">✕</span>
          </div>
          <p className="text-red-400 font-semibold">Payment Failed</p>
          <p className="text-gray-400 text-xs">{error}</p>
          <button onClick={onFailed} className="mt-2 text-xs text-blue-400 hover:underline">Try again</button>
        </>
      )}
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function OrderSuccess({ order, onDone }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
      <CheckCircle size={48} className="text-green-400" />
      <h3 className="text-white font-bold text-lg">Order Confirmed!</h3>
      <p className="text-gray-400 text-sm max-w-xs">
        Your order <span className="text-white font-mono">#{order.id?.slice(0, 8).toUpperCase()}</span> has been placed successfully.
      </p>
      <p className="text-gray-500 text-xs">
        Delivering to: <strong className="text-gray-300">{order.deliveryAddress?.city ?? 'your address'}</strong>
      </p>
      <button onClick={onDone}
        className="mt-4 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-6 py-2.5 rounded">
        View My Orders
      </button>
    </div>
  );
}

// ─── Main CheckoutPage ────────────────────────────────────────────────────────
export default function CheckoutPage({ onBack, onOrderComplete }) {
  const { cart, refreshCart } = useAuth();

  const [step, setStep]                 = useState(0);
  const [address, setAddress]           = useState(null);
  const [shipping, setShipping]         = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [placing, setPlacing]           = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderError, setOrderError]     = useState('');
  const [placedOrder, setPlacedOrder]   = useState(null);
  const [wallet, setWallet]             = useState(null);

  useEffect(() => {
    paymentApi.getWallet().then(setWallet).catch(() => {});
  }, []);

  async function handlePlaceOrder(pointsApplied = 0) {
    if (!address) return;
    setPlacing(true);
    setOrderError('');
    try {
      const order = await orderApi.checkout(address.id, shipping.shippingMethodId, pointsApplied);
      setPlacedOrder(order);
      // Trigger payment gateway flow
      setProcessingPayment(true);
    } catch (err) {
      setOrderError(err.message ?? 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  async function handlePaymentConfirmed() {
    setProcessingPayment(false);
    await refreshCart();
    // placedOrder already set; show success
  }

  function handlePaymentFailed() {
    setProcessingPayment(false);
    setPlacedOrder(null); // let them retry from review step
    setStep(3);
    setOrderError('Payment failed — please try again.');
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (processingPayment && placedOrder) {
    return (
      <div className="max-w-lg mx-auto py-4">
        <h2 className="text-white font-bold text-xl mb-6">Processing Payment</h2>
        <PaymentProcessing
          order={placedOrder}
          paymentMethod={paymentMethod}
          onConfirmed={handlePaymentConfirmed}
          onFailed={handlePaymentFailed}
        />
      </div>
    );
  }

  if (placedOrder && !processingPayment) {
    return <OrderSuccess order={placedOrder} onDone={onOrderComplete} />;
  }

  return (
    <div className="max-w-lg mx-auto py-4">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-6">
        <ChevronLeft size={14} /> Back to cart
      </button>

      <h2 className="text-white font-bold text-xl mb-6">Checkout</h2>
      <Steps current={step} />

      {step === 0 && (
        <AddressStep selected={address} onSelect={setAddress} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <ShippingStep
          selected={shipping} onSelect={setShipping}
          onNext={() => setStep(2)} onBack={() => setStep(0)}
          address={address} cart={cart}
        />
      )}
      {step === 2 && (
        <PaymentStep
          selected={paymentMethod} onSelect={setPaymentMethod}
          onNext={() => setStep(3)} onBack={() => setStep(1)}
          wallet={wallet}
        />
      )}
      {step === 3 && (
        <ReviewStep
          address={address} shipping={shipping} paymentMethod={paymentMethod}
          cart={cart} onBack={() => setStep(2)}
          onPlaceOrder={handlePlaceOrder} placing={placing} orderError={orderError}
        />
      )}
    </div>
  );
}
