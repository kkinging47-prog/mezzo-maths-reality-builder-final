import { NavLink } from 'react-router-dom';

export default function StudentSidebar() {
  return (
    <>
      <input id="student-sidebar-toggle" className="sidebar-check" type="checkbox" />
      <label className="sidebar-toggle" htmlFor="student-sidebar-toggle">Menu</label>
      <label className="student-sidebar-overlay" htmlFor="student-sidebar-toggle" />
      <aside className="student-sidebar" aria-label="Student navigation">
        <div className="student-sidebar-brand">
          <span className="student-logo-mark">M</span>
          <span><strong>Mezzo Maths</strong><small>Reality Builder</small></span>
        </div>
        <nav className="student-sidebar-nav">
          <NavLink to="/student/dashboard" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>Dashboard</NavLink>
          <NavLink to="/student/worlds" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>Maths Worlds</NavLink>
          <NavLink to="/student/missions" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>My Missions</NavLink>
          <NavLink to="/student/equation-builder" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>Equation Builder</NavLink>
          <NavLink to="/student/progress" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>My Progress</NavLink>
          <NavLink to="/student/leaderboard" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>Leaderboard</NavLink>
          <NavLink to="/student/certificates" className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`}>Certificates</NavLink>
        </nav>
        <div className="student-sidebar-card">
          <span>Builder Mode</span>
          <strong>Use maths to build real solutions.</strong>
        </div>
      </aside>
    </>
  );
}
