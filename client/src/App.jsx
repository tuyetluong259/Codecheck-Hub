import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyCode from './components/auth/VerifyCode';
import ResetPassword from './components/auth/ResetPassword';

import StudentDashboard from './components/student/StudentDashboard';
import StudentClasses from './components/student/StudentClasses';
import StudentClassDetail from './components/student/StudentClassDetail';
import StudentProblems from './components/student/StudentProblems';
import Workspace from './components/student/Workspace';
import SubmissionHistory from './components/student/SubmissionHistory';

import LecturerDashboard from './components/lecturer/LecturerDashboard';
import LecturerClassManagement from './components/lecturer/LecturerClassManagement';
import LecturerClassDetail from './components/lecturer/LecturerClassDetail';
import LecturerProblemBank from './components/lecturer/LecturerProblemBank';
import CreateProblem from './components/lecturer/CreateProblem';
import GradingAndAnalytics from './components/lecturer/GradingAndAnalytics';
import CodeComparison from './components/lecturer/CodeComparison';
import LecturerNotifications from './components/lecturer/LecturerNotifications';

import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminSystemInfrastructure from './components/admin/AdminSystemInfrastructure';
import AdminJudgeEngineManagement from './components/admin/AdminJudgeEngineManagement';
import AdminGlobalProblemBank from './components/admin/AdminGlobalProblemBank';
import AdminSystemAuditLogs from './components/admin/AdminSystemAuditLogs';
import AdminSystemSettings from './components/admin/AdminSystemSettings';

const Layout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-[#dfeef7] text-slate-700">
    <Navbar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#dfeef7]">{children}</main>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

const DashboardRedirect = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'ADMIN') return <Navigate to="/admin/users" replace />;
  return user?.role === 'LECTURER' ? <LecturerDashboard /> : <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/student/classes" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentClasses /></ProtectedRoute>} />
          <Route path="/student/classes/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentClassDetail /></ProtectedRoute>} />
          <Route path="/student/problems" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProblems /></ProtectedRoute>} />
          <Route path="/student/workspace/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><Workspace /></ProtectedRoute>} />
          <Route path="/student/submissions" element={<ProtectedRoute allowedRoles={['STUDENT']}><SubmissionHistory /></ProtectedRoute>} />

          <Route path="/lecturer/classes" element={<ProtectedRoute allowedRoles={['LECTURER']}><LecturerClassManagement /></ProtectedRoute>} />
          <Route path="/lecturer/classes/:id" element={<ProtectedRoute allowedRoles={['LECTURER']}><LecturerClassDetail /></ProtectedRoute>} />
          <Route path="/lecturer/problems" element={<ProtectedRoute allowedRoles={['LECTURER']}><LecturerProblemBank /></ProtectedRoute>} />
          <Route path="/lecturer/problems/create" element={<ProtectedRoute allowedRoles={['LECTURER']}><CreateProblem /></ProtectedRoute>} />
          <Route path="/lecturer/problems/edit/:id" element={<ProtectedRoute allowedRoles={['LECTURER']}><CreateProblem isEdit={true} /></ProtectedRoute>} />
          <Route path="/lecturer/grades" element={<ProtectedRoute allowedRoles={['LECTURER']}><GradingAndAnalytics /></ProtectedRoute>} />
          <Route path="/lecturer/plagiarism/compare" element={<ProtectedRoute allowedRoles={['LECTURER']}><CodeComparison /></ProtectedRoute>} />
          <Route path="/lecturer/notifications" element={<ProtectedRoute allowedRoles={['LECTURER']}><LecturerNotifications /></ProtectedRoute>} />

          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUserManagement /></ProtectedRoute>} />
          <Route path="/admin/infrastructure" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSystemInfrastructure /></ProtectedRoute>} />
          <Route path="/admin/judge-engine" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminJudgeEngineManagement /></ProtectedRoute>} />
          <Route path="/admin/problems" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminGlobalProblemBank /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSystemAuditLogs /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSystemSettings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;