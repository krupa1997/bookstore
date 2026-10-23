import React from 'react';
import { ShoppingCart, User, Menu, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onLoginClick, onCartClick, onNavClick, onLogout, activePage }) {
  const { user, cartCount, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#18191d] border-b border-[#2a2c33] h-14 flex items-center px-4 gap-4">
      {/* Hamburger */}
      <button
        onClick={() => onNavClick?.('home')}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <span
        onClick={() => onNavClick?.('home')}
        className="font-bold text-white text-lg tracking-tight mr-6 select-none cursor-pointer"
      >
        Book Worm
      </span>

      {/* Divider */}
      <div className="h-6 w-px bg-[#2a2c33]" />

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6 ml-2">
        {['My Orders', 'My Wishlist', 'My Writers'].map((link) => {
          const key = link.toLowerCase().replace(/\s+/g, '-');
          const isActive = activePage === key;
          return (
            <button
              key={link}
              onClick={() => onNavClick?.(key)}
              className={`text-sm transition-colors ${isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
            >
              {link}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Wallet — only shown when logged in */}
      {user && (
        <button
          onClick={() => onNavClick?.('my-wallet')}
          className={`transition-colors ${activePage === 'my-wallet' ? 'text-purple-400' : 'text-gray-300 hover:text-white'}`}
          aria-label="My wallet"
          title="My Wallet"
        >
          <Wallet size={18} />
        </button>
      )}

      {/* Cart */}
      <button
        onClick={onCartClick}
        className="relative text-gray-300 hover:text-white transition-colors"
        aria-label="Shopping cart"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {cartCount}
          </span>
        )}
      </button>

      {/* User / logout */}
      {user ? (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-300 hidden sm:inline">
            {user.firstName}
          </span>
          <button
            onClick={() => { logout(); onLogout?.(); }}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          className="text-gray-300 hover:text-white transition-colors ml-2"
          aria-label="Sign in"
        >
          <User size={20} />
        </button>
      )}
    </header>
  );
}
