import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('PASSWORD MIN 6 CHARS');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('OPERATIVE REGISTERED');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'REGISTRATION FAILED');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-acid flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#000"/>
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="#CCFF00"/>
            </svg>
          </div>
          <span className="font-display text-xl tracking-wider">TASK<span className="text-acid">FORGE</span></span>
        </div>

        <p className="font-mono text-xs text-forge-text tracking-[0.2em] mb-3">/ ENLIST</p>
        <h2 className="font-display text-6xl tracking-wider mb-2">JOIN THE FORGE.</h2>
        <p className="text-forge-text text-sm mb-10">First operative becomes Command (Admin) automatically.</p>

        <form onSubmit={handle} className="space-y-5">
          {[
            { key: 'name', label: 'OPERATIVE NAME', type: 'text', ph: 'John Doe' },
            { key: 'email', label: 'EMAIL', type: 'email', ph: 'you@team.com' },
            { key: 'password', label: 'PASSWORD', type: 'password', ph: 'Min. 6 characters' }
          ].map(({ key, label, type, ph }) => (
            <div key={key}>
              <label className="forge-label block mb-2">{label}</label>
              <input type={type} required placeholder={ph} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="forge-input px-4 py-3" />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="btn-acid w-full py-4 text-sm tracking-[0.15em] flex items-center justify-center gap-3">
            {loading
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> ENLISTING...</>
              : 'CREATE ACCOUNT →'
            }
          </button>
        </form>

        <p className="mt-6 font-mono text-xs text-forge-text text-center">
          Already enlisted?{' '}
          <Link to="/login" className="text-acid hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
