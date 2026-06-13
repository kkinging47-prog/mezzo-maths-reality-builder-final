import { NavLink } from 'react-router-dom';

export default function StudentSidebar() {
  return (
    <>
      <style>{`.student-app-content{margin-left:280px;min-height:100vh}.student-app-content .site-header{display:none}.homepage-back.student-area{left:300px}.student-sidebar{position:fixed;top:0;left:0;width:280px;min-height:100vh;background:linear-gradient(180deg,#241069,#4c1d95,#111827);color:white;padding:1rem;z-index:900}.student-sidebar-brand{display:flex;gap:.75rem;padding:.75rem;border-radius:1rem;background:rgba(255,255,255,.1);margin-bottom:1rem}.student-logo-mark{width:2.8rem;height:2.8rem;display:grid;place-items:center;border-radius:1rem;background:#38bdf8;color:white;font-weight:900}.student-sidebar-brand strong,.student-sidebar-brand small{display:block}.student-sidebar-link{display:block;color:white;padding:.8rem;border-radius:1rem;font-weight:800}.student-sidebar-link.active,.student-sidebar-link:hover{background:white;color:#4c1d95}@media(max-width:920px){.student-app-content{margin-left:0}.student-sidebar{position:relative;width:auto;min-height:auto}.homepage-back.student-area{left:16px}}`}</style>
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
      </aside>
    </>
  );
}
