import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, LogOut, Menu, Code2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[#d5ebff] bg-[#1d9df2] px-4 text-white shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/15">
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-[#0ea5e9] text-white shadow-md">
            <Code2 className="h-5 w-5" />
          </div>
          <div className="text-[2rem] font-black leading-none tracking-tight">
            <span className="text-white">odeCheck</span>
            <span className="text-[#d9f2ff]">Hub</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-[300px] rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <button className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/15">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-slate-900 ring-2 ring-[#1d9df2]" />
        </button>

        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/15" title="Profile">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 font-bold text-[#1d9df2]">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </button>

        <button onClick={logout} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/15" title="Logout">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}