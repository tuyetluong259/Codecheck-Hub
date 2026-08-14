import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, RoleProtectedRoute } from '../components/ProtectedRoute'
import { MainLayout } from '../layouts/MainLayout'

// Lazy load pages
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'))
const StudentDashboard = React.lazy(() => import('../pages/student/DashboardPage'))
const ProblemPage = React.lazy(() => import('../pages/student/ProblemPage'))
const LecturerDashboard = React.lazy(() => import('../pages/lecturer/DashboardPage'))
const CreateProblemPage = React.lazy(() => import('../pages/lecturer/CreateProblemPage'))

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-900">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export const Routing: React.FC = () => {
  return (
    <React.Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — chỉ cần đăng nhập */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Student routes */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            <RoleProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="problems/:problemId" element={
            <RoleProtectedRoute allowedRoles={['STUDENT']}>
              <ProblemPage />
            </RoleProtectedRoute>
          } />

          {/* Lecturer routes */}
          <Route path="lecturer" element={
            <RoleProtectedRoute allowedRoles={['LECTURER', 'ADMIN']}>
              <LecturerDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="lecturer/problems/create" element={
            <RoleProtectedRoute allowedRoles={['LECTURER', 'ADMIN']}>
              <CreateProblemPage />
            </RoleProtectedRoute>
          } />
        </Route>

        {/* Unauthorized */}
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400">
            <div className="text-center">
              <p className="text-6xl mb-4">🚫</p>
              <h1 className="text-2xl font-bold text-slate-200 mb-2">Không có quyền truy cập</h1>
              <p>Bạn không có quyền xem trang này.</p>
            </div>
          </div>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400">
            <div className="text-center">
              <p className="text-6xl mb-4">404</p>
              <h1 className="text-2xl font-bold text-slate-200 mb-2">Không tìm thấy trang</h1>
              <a href="/" className="text-indigo-400 hover:underline">Về trang chủ</a>
            </div>
          </div>
        } />
      </Routes>
    </React.Suspense>
  )
}
