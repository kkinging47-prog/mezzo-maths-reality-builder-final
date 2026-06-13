import { PropsWithChildren } from 'react';
import Header from './Header';

export default function PageShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
      <footer className="footer">
        <div>
          <strong>Mezzo Maths Reality Builder</strong>
          <p>Students do not just learn mathematics. They use mathematics to build the world.</p>
        </div>
        <span>© {new Date().getFullYear()} Mezzo House Limited</span>
      </footer>
    </div>
  );
}
