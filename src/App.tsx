import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import StudentDashboard from './pages/StudentDashboard';
import WorldsPage from './pages/WorldsPage';
import ProjectPage from './pages/ProjectPage';
import TeacherDashboard from './pages/TeacherDashboard';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import SponsorDashboard from './pages/SponsorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DemoPage from './pages/DemoPage';
import VRPreviewPage from './pages/VRPreviewPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage mode="signup" />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/worlds" element={<WorldsPage />} />
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
  );
}
