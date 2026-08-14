import React from 'react'
import { Bell, Search } from 'lucide-react'
import { useAppSelector } from '../redux/hooks'

export const Header: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-slate-300">{user?.fullName?.split(' ').pop()}</span>
        </div>
      </div>
    </header>
  )
}
