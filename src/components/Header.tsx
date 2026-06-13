import { Link, NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/student/worlds', label: 'Worlds' },
  { to: '/demo', label: 'Demo' },
  { to: '/vr-preview', label: 'VR Preview' },
  { to: '/teacher/dashboard', label: 'Teachers' },
];

export default function Header() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <header className={`site-header${isLanding ? ' landing-header' : ''}`}>
      <Link to="/" className="brand" aria-label="Mezzo Maths Reality Builder home">
        <span className="brand-mark" aria-hidden="true">M</span>
        <span className="brand-copy">
          <strong>Mezzo Maths</strong>
          {!isLanding && <small>Reality Builder</small>}
        </span>
      </Link>

      {isLanding ? (
        <nav className="landing-auth" aria-label="Account navigation">
          <Link to="/login" className="landing-login">Login</Link>
          <Link to="/signup" className="landing-signup">Sign Up</Link>
        </nav>
      ) : (
        <>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/login" className="btn btn-small btn-light">Login</Link>
        </>
      )}
    </header>
  );
}
