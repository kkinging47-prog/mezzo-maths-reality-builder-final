import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProgressTiny from './pages/StudentProgressTiny';
import StudentLeaderboard from './pages/StudentLeaderboard';
import StudentCertificates from './pages/StudentCertificates';
import StudentWorldsPage from './pages/StudentWorldsPage';
import StudentMissionsPage from './pages/StudentMissionsPage';
import EquationBuilderPage from './pages/EquationBuilderPage';
import ProjectPage from './pages/ProjectPage';
import TeacherDashboard from './pages/TeacherDashboard';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import SponsorDashboard from './pages/SponsorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DemoPage from './pages/DemoPage';
import VRPreviewPage from './pages/VRPreviewPage';
import NotFoundPage from './pages/NotFoundPage';
import StudentSidebar from './components/StudentSidebar';

export default function App() {
  const location = useLocation();
  const showHomeButton = location.pathname !== '/';
  const isStudentRoute = location.pathname.startsWith('/student');

  return (
    <>
      {isStudentRoute && <StudentSidebar />}
      {showHomeButton && (
        <Link to="/" aria-label="Back to homepage" className={`homepage-back${isStudentRoute ? ' student-area' : ''}`}>
          ← Back to Homepage
        </Link>
      )}
      <div className={isStudentRoute ? 'student-app-content' : undefined}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage mode="signup" />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/worlds" element={<StudentWorldsPage />} />
          <Route path="/student/missions" element={<StudentMissionsPage />} />
          <Route path="/student/equation-builder" element={<EquationBuilderPage />} />
          <Route path="/student/progress" element={<StudentProgressTiny />} />
          <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
          <Route path="/student/certificates" element={<StudentCertificates />} />
          <Route path="/student/project/:projectId" element={<ProjectPage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/school-admin/dashboard" element={<SchoolAdminDashboard />} />
          <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/vr-preview" element={<VRPreviewPage />} />
          <Route path="/worlds" element={<Navigate to="/student/worlds" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}
