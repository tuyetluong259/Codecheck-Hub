import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, LogOut, Menu, Code2 } from 'lucide-react';
import api from '../../api/axios';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      let data = response.data?.data ?? response.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[#d5ebff] bg-[#1d9df2] px-4 text-white shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition hover:bg-blue-700 hover:border-blue-700">
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

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-blue-700 hover:border-blue-700"
          >
            <Bell className="h-5 w-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-[#1d9df2] text-[0.6rem] font-bold">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                <span onClick={handleMarkAllAsRead} className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Mark all as read</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <div className="flex flex-col">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${notif.read ? 'border-b border-slate-50' : 'bg-blue-50/50'}`}
                      >
                        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${notif.type === 'SUBMISSION_RESULT' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {notif.type === 'SUBMISSION_RESULT' ? <Code2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className={`text-sm text-slate-800 ${!notif.read ? 'font-semibold' : ''}`}>{notif.title}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 px-4 py-2 bg-slate-50 text-center text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer">
                View all notifications
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-blue-700 hover:border-blue-700"
            title="Profile"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 font-bold text-[#1d9df2]">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{user?.fullName || 'User Name'}</p>
                <p className="truncate text-sm text-slate-500">{user?.email || 'email@example.com'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {user?.role || 'STUDENT'}
                  </span>
                  {user?.studentId && (
                    <span className="text-xs font-semibold text-slate-500">ID: {user.studentId}</span>
                  )}
                </div>
              </div>
              <div className="px-2 py-2">
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Settings
                </Link>
              </div>
            </div>
          )}
        </div>

        <button onClick={logout} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-blue-700 hover:border-blue-700" title="Logout">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}