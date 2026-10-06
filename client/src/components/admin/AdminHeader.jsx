import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-1 text-sm transition ${
    isActive ? 'bg-gold-500 font-semibold text-navy-950' : 'text-slate-200 hover:text-gold-300'
  }`;

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-5">
          <span className="font-display text-xl tracking-wide text-gold-400">THE BRITPATH</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/admin" end className={linkClass}>
              Pipeline
            </NavLink>
            <NavLink to="/admin/clients" className={linkClass}>
              Clients
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-slate-300 sm:inline">{user?.name}</span>
          <Link to="/" className="text-slate-300 hover:text-gold-300">
            View site
          </Link>
          <button
            onClick={logout}
            className="rounded-full border border-gold-400 px-4 py-1.5 text-gold-300 hover:bg-navy-700"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}