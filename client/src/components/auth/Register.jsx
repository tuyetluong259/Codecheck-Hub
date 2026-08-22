import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Code2 } from 'lucide-react';
import api from '../../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không trùng khớp!');
    }
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#dfeef7] overflow-hidden">
      <div className="absolute left-16 top-20 h-14 w-14 rotate-45 rounded-2xl bg-[#bfe5f8] opacity-70" />
      <div className="absolute right-20 top-28 h-12 w-12 rotate-45 rounded-2xl bg-[#bfe5f8] opacity-70" />
      <div className="absolute left-1/4 bottom-12 h-16 w-16 rounded-full bg-[#bfe5f8] opacity-70" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-between px-6 py-10 xl:px-10">
        <div className="hidden w-[38%] flex-col items-start justify-center xl:flex">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-[#1d9df2] bg-[#0ea5e9] shadow-lg shadow-[#3aaef4]/30">
              <Code2 className="h-12 w-12 text-white" />
            </div>
            <div className="text-5xl font-black leading-none tracking-tight text-[#1d9df2]">
              <div>odeCheck</div>
              <div className="mt-1">Hub</div>
            </div>
          </div>
          <div className="ml-10 h-[180px] w-[180px] rounded-full border-[12px] border-[#bfe5f8] bg-[#cfeef8] opacity-80" />
        </div>

        <div className="flex flex-1 items-center justify-center xl:justify-end">
          <div className="w-full max-w-xl rounded-[28px] bg-white/40 p-6 shadow-none md:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black tracking-tight text-slate-800">Đăng ký tài khoản</h1>
              <p className="mt-2 text-lg text-slate-500">Trở thành thành viên của CodeCheck Hub</p>
            </div>

            {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" required name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="text" required name="username" value={formData.username} onChange={handleChange} placeholder="nguyenvana123" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Mã Sinh Viên</label>
                  <div className="relative">
                    <Code2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="text" required name="studentId" value={formData.studentId} onChange={handleChange} placeholder="SV123456" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email trường</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="email@school.edu.vn" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input type="password" required name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Xác nhận</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                    <input type="password" required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-[#1d4ed8] py-3.5 text-lg font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#1e40af] disabled:opacity-60">
                {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
              </button>
            </form>

            <p className="mt-8 text-center text-base text-slate-600">
              Đã có tài khoản? <Link to="/login" className="font-bold text-[#1d4ed8] hover:underline">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}