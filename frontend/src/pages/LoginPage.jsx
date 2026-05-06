import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('ACCESS GRANTED');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AUTHENTICATION FAILED');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-10 border-r border-forge-border relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-acid flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#000"/>
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="#CCFF00"/>
            </svg>
          </div>
          <span className="font-display text-2xl tracking-wider">TASK<span className="text-acid">FORGE</span></span>
        </div>

        {/* Center content */}
        <div>
          <p className="font-mono text-xs text-forge-text tracking-[0.2em] mb-6">/ TACTICAL PROJECT OPERATIONS</p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-7xl leading-none mb-8 tracking-wide"
          >
            SHIP WORK,{' '}
            <span className="text-acid">NOT STATUS<br />UPDATES.</span>
          </motion.h1>
          <p className="text-forge-text text-base leading-relaxed max-w-sm">
            High-velocity task management for teams that move fast. Assign, track, and close out work without the bloat.
          </p>
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center gap-4 font-mono text-xs text-forge-text tracking-widest">
          <span>V1.0</span>
          <span className="w-1 h-1 bg-forge-text rounded-full" />
          <span>OPERATIONAL</span>
          <span className="w-1 h-1 bg-forge-text rounded-full" />
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-acid rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* RIGHT PANEL — FORM */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <p className="font-mono text-xs text-forge-text tracking-[0.2em] mb-3">/ SIGN IN</p>
          <h2 className="font-display text-6xl tracking-wider mb-2">WELCOME BACK.</h2>
          <p className="text-forge-text text-sm mb-10">Enter your credentials to access the command center.</p>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="forge-label block mb-2">EMAIL</label>
              <input
                type="email" required placeholder="you@team.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="forge-input px-4 py-3"
              />
            </div>

            <div>
              <label className="forge-label block mb-2">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required placeholder="••••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="forge-input px-4 py-3 pr-12"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-forge-text hover:text-white transition-colors">
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-acid w-full py-4 text-sm tracking-[0.15em] flex items-center justify-center gap-3">
              {loading
                ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> AUTHENTICATING...</>
                : 'SIGN IN →'
              }
            </button>
          </form>

          <p className="mt-6 font-mono text-xs text-forge-text text-center">
            No account?{' '}
            <Link to="/register" className="text-acid hover:underline">Create one</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 border border-forge-border">
            <p className="font-mono text-xs text-acid tracking-widest mb-2">DEMO CREDENTIALS</p>
            <p className="font-mono text-xs text-forge-text">admin@taskforge.com / Admin@12345</p>
            <p className="font-mono text-xs text-forge-text">demo@taskforge.com / Demo@12345</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
