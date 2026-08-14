import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { logout } from '../redux/slices/authSlice'
import { useLogoutMutation } from '../redux/api/authApi'
import {
  LayoutDashboard, BookOpen, Code2, Users, LogOut,
  ChevronRight, Terminal
} from 'lucide-react'

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
]

const lecturerLinks = [
  { to: '/lecturer', icon: LayoutDashboard, label: 'Quản lý' },
  { to: '/lecturer/problems/create', icon: BookOpen, label: 'Tạo bài tập' },
]

export const Sidebar: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [logoutApi] = useLogoutMutation()

  const links = user?.role === 'LECTURER' || user?.role === 'ADMIN'
    ? lecturerLinks : studentLinks

  const handleLogout = async () => {
    try { await logoutApi().unwrap() } catch {}
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none">CodeCheck</p>
            <p className="text-indigo-400 text-xs">Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/lecturer'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
