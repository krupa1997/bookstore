import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Wallet, Gift, RefreshCw, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { paymentApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-[#1e2026] border border-[#2a2c33] rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-gray-500 text-xs mb-0.5">{label}</p>
        <p className="text-white font-bold text-xl leading-none">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Redeem section ───────────────────────────────────────────────────────────
function RedeemSection({ wallet, onRedeemed }) {
  const [points, setPoints]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);  // { discount, newCartTotal }
  const [error, setError]     = useState('');

  const maxRedeemable = wallet?.giftPoints ?? 0;
  const pointsNum     = Math.min(parseInt(points, 10) || 0, maxRedeemable);
  const discountPreview = (pointsNum / 100).toFixed(2); // 100 pts = ₹1

  async function handleRedeem(e) {
    e.preventDefault();
    if (pointsNum <= 0) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await paymentApi.redeemPoints(pointsNum);
      setResult(data);
      onRedeemed?.(data);
    } catch (err) {
      setError(err.message ?? 'Redemption failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#1e2026] border border-[#2a2c33] rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
        <Gift size={15} className="text-purple-400" /> Redeem Gift Points
      </h3>
      <p className="text-gray-500 text-xs mb-4">
        100 points = ₹1 discount on your active cart. You have <span className="text-purple-300 font-semibold">{wallet?.giftPoints ?? 0} pts</span> available.
      </p>

      {result ? (
        <div className="flex items-start gap-3 bg-green-900/20 border border-green-700/40 rounded-lg p-3">
          <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 text-sm font-semibold">Points redeemed!</p>
            <p className="text-gray-400 text-xs mt-0.5">
              ₹{Number(result.discountAmount ?? 0).toFixed(2)} discount applied to your cart.
              New cart total: <strong className="text-white">₹{Number(result.newCartTotal ?? 0).toFixed(2)}</strong>
            </p>
            <button
              onClick={() => { setResult(null); setPoints(''); }}
              className="text-xs text-blue-400 hover:underline mt-1"
            >
              Redeem more
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRedeem} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                min="1"
                max={maxRedeemable}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Enter points to redeem"
                className="w-full bg-[#2a2c33] border border-[#3a3d46] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors pr-20"
              />
              {pointsNum > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-300 font-medium">
                  = ₹{discountPreview}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPoints(String(maxRedeemable))}
              className="text-xs text-purple-400 hover:text-purple-300 border border-[#3a3d46] px-3 rounded transition-colors whitespace-nowrap"
            >
              Use all
            </button>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-red-400 text-xs">
              <XCircle size={12} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || pointsNum <= 0}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold py-2.5 rounded"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Applying…</>
              : `Apply ${pointsNum > 0 ? pointsNum + ' pts' : 'Points'}`}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Transaction history placeholder ─────────────────────────────────────────
function PointsHistory({ giftPoints }) {
  // The backend doesn't expose a transaction log endpoint yet —
  // show a helpful info card instead.
  return (
    <div className="bg-[#1e2026] border border-[#2a2c33] rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <Info size={15} className="text-blue-400" /> How to earn points
      </h3>
      <ul className="flex flex-col gap-2 text-xs text-gray-400">
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-0.5">✓</span>
          <span>Every ₹10 spent on a confirmed order earns <strong className="text-white">10 gift points</strong>.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-400 mt-0.5">✓</span>
          <span>New account sign-up bonus: <strong className="text-white">100 points</strong> (₹1 value).</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-purple-400 mt-0.5">★</span>
          <span>Redeem anytime before checkout — <strong className="text-white">100 pts = ₹1</strong> off your cart.</span>
        </li>
      </ul>
      <div className="mt-4 pt-4 border-t border-[#2a2c33] flex items-center justify-between">
        <span className="text-gray-500 text-xs">Current balance</span>
        <span className="text-purple-300 font-bold text-base">{giftPoints} pts</span>
      </div>
    </div>
  );
}

// ─── WalletPage ───────────────────────────────────────────────────────────────
export default function WalletPage({ onBack }) {
  const { user } = useAuth();

  const [wallet, setWallet]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentApi.getWallet();
      setWallet(data);
    } catch (err) {
      setError(err.status === 401
        ? 'Please sign in to view your wallet.'
        : (err.message ?? 'Failed to load wallet.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // After a successful redemption refresh wallet balance
  async function handleRedeemed() {
    try {
      const data = await paymentApi.getWallet();
      setWallet(data);
    } catch { /* swallow */ }
  }

  return (
    <div className="max-w-xl mx-auto py-4 pb-16">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={14} /> Back to catalog
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <Wallet size={20} className="text-purple-400" /> My Wallet
        </h2>
        <button
          onClick={load}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Refresh wallet"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 py-12 justify-center">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading wallet…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <XCircle size={36} className="text-red-500/60" />
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      )}

      {/* Wallet content */}
      {!loading && !error && wallet && (
        <div className="flex flex-col gap-4">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={Wallet}
              label="Store Balance"
              value={`₹${Number(wallet.walletAmount ?? 0).toFixed(2)}`}
              sub="Available for checkout"
              accent="bg-blue-500/15 text-blue-400"
            />
            <StatCard
              icon={Gift}
              label="Gift Points"
              value={`${wallet.giftPoints ?? 0} pts`}
              sub={`≈ ₹${Number(wallet.pointsValueCurrency ?? (wallet.giftPoints ?? 0) / 100).toFixed(2)} value`}
              accent="bg-purple-500/15 text-purple-400"
            />
          </div>

          {/* Redeem section — only if user has points */}
          {(wallet.giftPoints ?? 0) > 0 && (
            <RedeemSection wallet={wallet} onRedeemed={handleRedeemed} />
          )}

          {/* Points info */}
          <PointsHistory giftPoints={wallet.giftPoints ?? 0} />
        </div>
      )}
    </div>
  );
}
