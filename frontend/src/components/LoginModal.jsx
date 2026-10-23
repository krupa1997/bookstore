import React, { useState } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ onClose }) {
  const { login, register, authError, authLoading } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
  });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let ok;
    if (mode === 'login') {
      ok = await login(form.email, form.password);
    } else {
      ok = await register(form.firstName, form.lastName, form.email, form.password);
    }
    if (ok) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#1e2026] border border-[#2a2c33] rounded-xl shadow-2xl flex overflow-hidden w-full max-w-[740px]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Form side */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 min-w-0">
          <h2 className="text-white text-xl font-semibold mb-1">
            Welcome to <strong>Book Worm</strong>
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>

          {/* Register-only name fields */}
          {mode === 'register' && (
            <div className="flex gap-3 mb-4">
              <label className="flex-1">
                <span className="text-xs text-gray-400 mb-1.5 block">First Name</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  className="w-full bg-[#2a2c33] border border-[#3a3d46] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                />
              </label>
              <label className="flex-1">
                <span className="text-xs text-gray-400 mb-1.5 block">Last Name</span>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                  className="w-full bg-[#2a2c33] border border-[#3a3d46] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                />
              </label>
            </div>
          )}

          {/* Email */}
          <label className="block mb-4">
            <span className="text-xs text-gray-400 mb-1.5 block">Phone Number / e-mail</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Enter"
              className="w-full bg-[#2a2c33] border border-[#3a3d46] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
            />
          </label>

          {/* Password */}
          <label className="block mb-2">
            <span className="text-xs text-gray-400 mb-1.5 block">Password</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full bg-[#2a2c33] border border-[#3a3d46] rounded px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {/* API error */}
          {authError && (
            <p className="text-red-400 text-xs mt-2 mb-1">{authError}</p>
          )}

          {/* Submit row */}
          <div className="flex items-center justify-between mt-4 mb-6">
            {mode === 'login' && (
              <button type="button" className="text-xs text-blue-400 hover:underline">
                Forgot Password?
              </button>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="ml-auto flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded"
            >
              {authLoading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
              <LogIn size={15} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#2a2c33] mb-4" />

          {/* Toggle mode / Guest */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {mode === 'login' ? (
              <p className="text-xs text-gray-400">
                New to Book Worm?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Sign Up Here
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 bg-[#2a2c33] hover:bg-[#32353e] border border-[#3a3d46] transition-colors text-gray-300 text-sm px-4 py-2 rounded"
            >
              Continue as Guest <UserPlus size={15} />
            </button>
          </div>
        </form>

        {/* Illustration side */}
        <div className="hidden sm:flex w-64 shrink-0 bg-[#1a3a5c] items-center justify-center p-6">
          <svg viewBox="0 0 200 220" className="w-full max-w-[180px]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="110" rx="90" ry="85" fill="#1e5080" opacity="0.6" />
            <ellipse cx="60" cy="70" rx="30" ry="22" fill="#fbbf24" opacity="0.25" />
            <ellipse cx="150" cy="150" rx="28" ry="20" fill="#f97316" opacity="0.2" />
            <g transform="translate(30,55) rotate(-15)">
              <rect width="44" height="60" rx="3" fill="#f97316" />
              <rect x="4" y="4" width="36" height="52" rx="2" fill="#ea6910" />
              <rect x="6" y="10" width="32" height="3" rx="1" fill="#fff" opacity="0.6" />
              <rect x="6" y="16" width="24" height="3" rx="1" fill="#fff" opacity="0.4" />
              <rect x="6" y="22" width="28" height="3" rx="1" fill="#fff" opacity="0.4" />
            </g>
            <g transform="translate(110,40)">
              <rect width="40" height="58" rx="3" fill="#2563eb" />
              <rect x="3" y="3" width="34" height="52" rx="2" fill="#1d4ed8" />
              <rect x="5" y="8" width="30" height="3" rx="1" fill="#fff" opacity="0.7" />
              <rect x="5" y="14" width="22" height="3" rx="1" fill="#fff" opacity="0.5" />
              <rect x="5" y="20" width="26" height="3" rx="1" fill="#fff" opacity="0.5" />
            </g>
            <g transform="translate(55,130)">
              <path d="M0 0 Q45-12 90 0 L90 50 Q45 40 0 50 Z" fill="#f9fafb" opacity="0.9" />
              <path d="M45 0 L45 50" stroke="#d1d5db" strokeWidth="1" />
              <line x1="8" y1="15" x2="40" y2="12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="22" x2="38" y2="19" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="52" y1="12" x2="82" y2="15" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="52" y1="19" x2="82" y2="22" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <circle cx="25" cy="130" r="3" fill="#fbbf24" opacity="0.8" />
            <circle cx="170" cy="80" r="4" fill="#f97316" opacity="0.7" />
            <circle cx="165" cy="170" r="3" fill="#fbbf24" opacity="0.6" />
            <circle cx="90" cy="30" r="2.5" fill="#fff" opacity="0.5" />
            <path d="M20 180 Q60 160 90 180" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M120 30 Q150 20 170 40" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
