import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/student/worlds', label: 'Maths Worlds', icon: '🌍' },
  { to: '/student/missions', label: 'My Missions', icon: '🧩' },
  { to: '/student/equation-builder', label: 'Equation Builder', icon: '🧮' },
  { to: '/student/progress', label: 'My Progress', icon: '📈' },
  { to: '/student/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/student/certificates', label: 'Certificates', icon: '🎓' },
];

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('mezzoStudentSidebar') === 'collapsed');

  useEffect(() => {
    document.body.classList.toggle('student-sidebar-collapsed', collapsed);
    localStorage.setItem('mezzoStudentSidebar', collapsed ? 'collapsed' : 'expanded');
    return () => document.body.classList.remove('student-sidebar-collapsed');
  }, [collapsed]);

  return (
    <>
      <style>{`
        .student-app-content{margin-left:280px;min-height:100vh;transition:margin-left .24s ease, max-width .24s ease}.student-app-content .site-header{display:none}.homepage-back.student-area{left:300px;transition:left .24s ease}.student-sidebar{position:fixed;top:0;left:0;width:280px;min-height:100vh;background:linear-gradient(180deg,#241069,#4c1d95,#111827);color:white;padding:1rem;z-index:900;transition:width .24s ease,padding .24s ease;box-shadow:18px 0 45px rgba(15,23,42,.22)}.student-sidebar.is-collapsed{width:86px;padding:1rem .72rem}.student-sidebar-brand{display:flex;align-items:center;gap:.75rem;padding:.75rem;border-radius:1rem;background:rgba(255,255,255,.1);margin-bottom:1rem;min-height:64px}.student-logo-mark{width:2.8rem;height:2.8rem;display:grid;place-items:center;flex:0 0 2.8rem;border-radius:1rem;background:#38bdf8;color:white;font-weight:900}.student-sidebar-brand strong,.student-sidebar-brand small{display:block;white-space:nowrap}.student-sidebar.is-collapsed .student-sidebar-brand span:last-child,.student-sidebar.is-collapsed .student-sidebar-link-label{opacity:0;width:0;overflow:hidden}.student-sidebar-toggle{width:100%;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.11);color:white;border-radius:1rem;padding:.72rem .85rem;margin-bottom:1rem;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem}.student-sidebar-toggle:hover{background:rgba(255,255,255,.18)}.student-sidebar-link{display:flex;align-items:center;gap:.8rem;color:white;padding:.82rem;border-radius:1rem;font-weight:800;text-decoration:none;white-space:nowrap}.student-sidebar-link-icon{width:1.35rem;text-align:center;flex:0 0 1.35rem}.student-sidebar-link.active,.student-sidebar-link:hover{background:white;color:#4c1d95}.student-sidebar.is-collapsed .student-sidebar-link{justify-content:center;padding:.82rem .4rem}.student-sidebar-collapsed .student-app-content{margin-left:86px}.student-sidebar-collapsed .homepage-back.student-area{left:106px}@media(max-width:920px){.student-app-content,.student-sidebar-collapsed .student-app-content{margin-left:0}.student-sidebar,.student-sidebar.is-collapsed{position:sticky;width:auto;min-height:auto;border-radius:0 0 24px 24px;padding:.85rem;box-shadow:0 16px 38px rgba(15,23,42,.24)}.student-sidebar-brand{margin-bottom:.65rem}.student-sidebar-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}.student-sidebar.is-collapsed .student-sidebar-nav{display:none}.homepage-back.student-area,.student-sidebar-collapsed .homepage-back.student-area{left:16px;top:12px}.student-sidebar-link{padding:.75rem}.student-sidebar.is-collapsed .student-sidebar-brand span:last-child{opacity:1;width:auto;overflow:visible}}@media(max-width:560px){.student-sidebar-nav{grid-template-columns:1fr}.student-sidebar-toggle{font-size:.92rem}}
      `}</style>
      <aside className={`student-sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="Student navigation">
        <div className="student-sidebar-brand">
          <span className="student-logo-mark">M</span>
          <span><strong>Mezzo Maths</strong><small>Reality Builder</small></span>
        </div>
        <button
          type="button"
          className="student-sidebar-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand student sidebar' : 'Collapse student sidebar'}
        >
          <span>{collapsed ? '☰' : '⟵'}</span>
          {!collapsed && <span>Collapse Menu</span>}
        </button>
        <nav className="student-sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `student-sidebar-link${isActive ? ' active' : ''}`} title={item.label}>
              <span className="student-sidebar-link-icon" aria-hidden="true">{item.icon}</span>
              <span className="student-sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
