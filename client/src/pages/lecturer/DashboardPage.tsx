import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../redux/hooks'
import { useGetCoursesQuery } from '../../redux/api/coursesApi'
import { BookOpen, Plus, Users, ChevronRight, Code2 } from 'lucide-react'

const LecturerDashboard: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const { data: courses = [], isLoading } = useGetCoursesQuery()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý lớp học</h1>
          <p className="text-slate-400 mt-1">Xin chào, {user?.fullName}</p>
        </div>
        <button
          onClick={() => navigate('/lecturer/problems/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tạo bài tập mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <BookOpen className="w-6 h-6 text-indigo-400 mb-2" />
          <p className="text-2xl font-bold text-white">{courses.length}</p>
          <p className="text-slate-400 text-sm">Lớp học</p>
        </div>
        <div className="card">
          <Users className="w-6 h-6 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {courses.reduce((acc, c) => acc + (c.studentIds?.length || 0), 0)}
          </p>
          <p className="text-slate-400 text-sm">Sinh viên</p>
        </div>
        <div className="card">
          <Code2 className="w-6 h-6 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-slate-400 text-sm">Bài tập</p>
        </div>
      </div>

      {/* Course list */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Lớp học của bạn</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="card h-20 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Chưa có lớp học nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(course => (
              <div key={course.id} className="card flex items-center gap-4 hover:border-slate-600 transition-colors cursor-pointer group">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-200 group-hover:text-white">{course.name}</h3>
                  <p className="text-sm text-slate-500">{course.code} · {course.studentIds?.length || 0} sinh viên</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LecturerDashboard
