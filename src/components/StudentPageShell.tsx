import { PropsWithChildren } from 'react';
import StudentSidebar from './StudentSidebar';

export default function StudentPageShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell student-app-shell">
      <StudentSidebar />
      <div className="student-app-content">
        <main>{children}</main>
        <footer className="footer">
          <div>
            <strong>Mezzo Maths Reality Builder</strong>
            <p>Students do not just learn mathematics. They use mathematics to build the world.</p>
          </div>
          <span>© {new Date().getFullYear()} Mezzo House Limited</span>
        </footer>
      </div>
    </div>
  );
}
