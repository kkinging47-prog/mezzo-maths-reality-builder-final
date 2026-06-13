import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/student/worlds', label: 'Worlds' },
  { to: '/demo', label: 'Demo' },
  { to: '/vr-preview', label: 'VR Preview' },
  { to: '/teacher/dashboard', label: 'Teachers' },
];

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Mezzo Maths Reality Builder home">
        <span className="brand-mark">M</span>
        <span>
          <strong>Mezzo Maths</strong>
          <small>Reality Builder</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Link to="/login" className="btn btn-small btn-light">Login</Link>
    </header>
  );
}
