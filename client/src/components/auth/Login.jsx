import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Code2, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      // Backend bọc response trong ApiResponse nên data thực nằm ở response.data.data
      const authData = response.data.data;
      login(authData.user, authData.accessToken);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Email hoặc Mật khẩu không chính xác!');
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
          <div className="w-full max-w-lg rounded-[28px] bg-white/40 p-6 shadow-none ring-0 md:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-black tracking-tight text-slate-800">Đăng nhập</h1>
              <p className="mt-3 text-lg text-slate-500">Đăng nhập để truy cập tài khoản của bạn</p>
            </div>

            {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john.doe@gmail.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 accent-[#1d4ed8]" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-bold text-[#1d4ed8] hover:underline">Quên mật khẩu</Link>
              </div>

              <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-[#1d4ed8] py-3.5 text-lg font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#1e40af] disabled:opacity-60">
                {loading ? 'Đang xử lý...' : 'Login'}
              </button>
            </form>

            <p className="mt-8 text-center text-base text-slate-600">
              Bạn chưa có tài khoản? <Link to="/register" className="font-bold text-[#1d4ed8] hover:underline">Đăng ký</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}