import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/helpers';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      {/* TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-6 border-b border-forge-border bg-forge-bg/95 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-10">
          <div className="w-8 h-8 bg-acid flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#000"/>
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="#CCFF00"/>
            </svg>
          </div>
          <span className="font-display text-xl tracking-wider">
            TASK<span className="text-acid">FORGE</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {[
            { to: '/dashboard', label: 'DASHBOARD', icon: '▦' },
            { to: '/projects', label: 'PROJECTS', icon: '⊡' }
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-widest transition-all duration-150 border ${
                  isActive
                    ? 'bg-acid text-black border-acid'
                    : 'text-forge-text border-transparent hover:text-white hover:border-forge-border'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right — user */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5 border border-forge-border">
            <div className="w-7 h-7 bg-acid flex items-center justify-center">
              <span className="font-mono font-bold text-xs text-black">{initials(user?.name)}</span>
            </div>
            <div>
              <div className="font-mono text-xs text-white leading-tight">{user?.name}</div>
              <div className="font-mono text-xs text-forge-text uppercase tracking-widest">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="px-3 py-1.5 font-mono text-xs tracking-widest text-forge-text border border-forge-border hover:border-red-800 hover:text-red-400 transition-all">
            EXIT
          </button>
        </div>
      </nav>

      {/* PAGE */}
      <main className="flex-1 pt-14">
        <motion.div key="outlet" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
