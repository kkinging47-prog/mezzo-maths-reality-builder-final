import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

export default function PageShell({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div className={`app-shell${isLanding ? ' landing-shell' : ''}`}>
      <Header />
      <main>{children}</main>
      <footer className="footer">
        <div>
          <strong>Mezzo Maths Reality Builder</strong>
          <p>{isLanding ? 'Where Mathematics Becomes Reality' : 'Students do not just learn mathematics. They use mathematics to build the world.'}</p>
        </div>
        {isLanding ? (
          <nav className="footer-links" aria-label="Footer navigation">
            <LinkShim label="About" />
            <LinkShim label="Pricing" />
            <LinkShim label="Demo" />
            <LinkShim label="Contact" />
          </nav>
        ) : null}
        <span>© {new Date().getFullYear()} Mezzo Maths. All rights reserved.</span>
      </footer>
    </div>
  );
}

function LinkShim({ label }: { label: string }) {
  return <a href={`#${label.toLowerCase()}`}>{label}</a>;
}
