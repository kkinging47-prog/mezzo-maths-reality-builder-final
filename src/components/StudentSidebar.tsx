import { NavLink } from 'react-router-dom';

export default function StudentSidebar() {
  return (
    <>
      <style>{`.student-app-content{margin-left:280px}.student-app-content .site-header{display:none}.student-sidebar{position:fixed;top:0;left:0;width:280px;min-height:100vh;background:#4c1d95;color:white;padding:1rem;z-index:900}.student-sidebar-link{display:block;color:white;padding:.8rem}.student-sidebar-link.active{background:white;color:#4c1d95}.homepage-back.student-area{left:300px}`}</style>
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
