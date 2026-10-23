import React from 'react';
import { X, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cartApi } from '../api/api';

export default function CartDrawer({ onClose, onLoginClick, onCheckout }) {
  const { user, cart, setCart, removeFromCart } = useAuth();
  const items = cart?.items ?? [];

  async function handleQtyChange(itemId, newQty) {
    try {
      const updated = await cartApi.updateItem(itemId, newQty);
      // update cart in context via the exposed setter — fallback: just refresh
      if (typeof setCart === 'function') setCart(updated);
    } catch (err) {
      console.error('qty update failed:', err.message);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-[#1e2026] border-l border-[#2a2c33] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2c33]">
          <h2 className="text-white font-semibold text-base">
            Your Cart{items.length > 0 && <span className="ml-2 text-gray-400 text-sm font-normal">({items.length} item{items.length !== 1 ? 's' : ''})</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!user ? (
            /* Not logged in */
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} className="text-gray-600" />
              <p className="text-gray-400 text-sm">Sign in to see your cart.</p>
              <button
                onClick={() => { onClose(); onLoginClick(); }}
                className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded"
              >
                Sign In
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty cart */
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingBag size={40} className="text-gray-600" />
              <p className="text-gray-400 text-sm">Your cart is empty.</p>
              <p className="text-gray-600 text-xs">Add books from the catalog to get started.</p>
            </div>
          ) : (
            /* Cart items */
            <ul className="flex flex-col gap-5">
              {items.map((item) => {
                const book = item.product ?? item;
                const title  = book.title  ?? '—';
                const author = book.author ?? '';
                const price  = item.unitPrice ?? book.price ?? 0;
                const total  = item.totalPrice ?? price * item.quantity;

                return (
                  <li key={item.id} className="flex gap-3">
                    {/* Cover placeholder */}
                    <div className="w-12 h-16 shrink-0 bg-[#2a2c33] rounded flex items-center justify-center text-gray-600 text-[10px] text-center leading-tight p-1">
                      {title.slice(0, 20)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-snug line-clamp-2">{title}</p>
                      {author && <p className="text-gray-500 text-xs mt-0.5">{author}</p>}

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => item.quantity > 1
                            ? handleQtyChange(item.id, item.quantity - 1)
                            : removeFromCart(item.id)
                          }
                          className="w-6 h-6 rounded bg-[#2a2c33] hover:bg-[#32353e] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-[#2a2c33] hover:bg-[#32353e] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Price + remove */}
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                      <p className="text-white text-sm font-semibold">
                        ₹{Number(total).toFixed(0)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — only shown when there are items */}
        {user && items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#2a2c33] flex flex-col gap-3">
            {cart?.discount > 0 && (
              <div className="flex justify-between text-xs text-green-400">
                <span>Discount</span>
                <span>−₹{Number(cart.discount).toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Subtotal</span>
              <span className="text-white font-bold text-lg">
                ₹{Number(cart?.total ?? cart?.subtotal ?? 0).toFixed(0)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold py-3 rounded"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
