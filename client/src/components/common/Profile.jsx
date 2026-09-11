import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">HỒ SƠ CỦA BẠN</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1d9df2] text-3xl font-black text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.fullName || 'Người dùng'}</h2>
            <p className="text-slate-500 font-medium">{user?.role === 'STUDENT' ? 'Học viên' : user?.role === 'TEACHER' ? 'Giảng viên' : 'Quản trị viên'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Tên đăng nhập</label>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium">{user?.username || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Email liên hệ</label>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium">{user?.email || 'N/A'}</div>
          </div>
          {user?.studentId && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Mã số (MSSV)</label>
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium">{user.studentId}</div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
          <button className="rounded-xl bg-[#1d4ed8] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-[#1e40af] transition">
            Cập nhật thông tin
          </button>
          <button className="rounded-xl bg-white border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}
