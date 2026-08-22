import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  Home, BookOpen, Layers, History, ClipboardList,
  Settings, Users, ShieldAlert, CheckSquare, Bell, FolderGit
} from "lucide-react";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const getMenuItems = () => {
    if (user?.role === "ADMIN") {
      return [
        { path: "/admin/users", label: "User Management", icon: Users },
        { path: "/admin/infrastructure", label: "Judge Engine (Docker)", icon: Layers },
        { path: "/admin/problems", label: "Global Problem Bank", icon: FolderGit },
        { path: "/admin/audit-logs", label: "System & Audit Logs", icon: ShieldAlert },
        { path: "/admin/settings", label: "System Settings", icon: Settings },
      ];
    }

    if (user?.role === "LECTURER") {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/lecturer/classes", label: "Class Management", icon: BookOpen },
        { path: "/lecturer/problems", label: "Problem Bank", icon: FolderGit },
        { path: "/lecturer/grades", label: "Grading & Analytics", icon: CheckSquare },
        { path: "/lecturer/notifications", label: "Notifications", icon: Bell },
      ];
    }

    return [
      { path: "/", label: "Home", icon: Home },
      { path: "/student/classes", label: "My Classes", icon: BookOpen },
      { path: "/student/problems", label: "Problems", icon: ClipboardList },
      { path: "/student/submissions", label: "Submissions", icon: History },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="flex min-h-[calc(100vh-5rem)] w-72 flex-col border-r border-[#d5ebff] bg-[#dfeef7] text-slate-700">
      <nav className="flex-1 space-y-2 p-4 pt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[1.02rem] font-medium transition ${
                isActive ? "bg-[#eaf3ff] text-[#1d4ed8] shadow-sm ring-1 ring-[#cfe1ff]" : "text-slate-700 hover:bg-white/40"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#cfe1ff] bg-[#dfeef7] p-4">
        <div className="flex items-center gap-3 rounded-xl border border-[#bfe0ff] bg-white/40 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d9df2] text-sm font-black text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="text-lg font-bold text-slate-800">{user?.fullName || 'Nguyen Van'}</div>
        </div>
        <Link
          to="/login"
          className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#7db5ff] bg-white/70 px-4 py-3 text-xl font-black text-[#1d4ed8] hover:bg-white"
        >
          Logout
        </Link>
      </div>
    </aside>
  );
}