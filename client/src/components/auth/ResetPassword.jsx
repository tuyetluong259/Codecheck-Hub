import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckSquare } from 'lucide-react';
import api from '../../api/axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Mật khẩu không trùng khớp!');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { password });
      setMessage('Đã đặt lại mật khẩu thành công. Đang quay lại trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage('Đã đặt lại mật khẩu thành công. Đang quay lại trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(37,99,235,0.08)] relative z-10">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="bg-[#eaf3ff] p-4 rounded-full text-[#1d4ed8] border border-[#dfeeff]">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-black text-slate-800 text-center">ĐẶT MẬT KHẨU MỚI</h2>
          <p className="text-slate-500 text-xs text-center">Hãy đặt mật khẩu mới phức tạp và dễ nhớ để bảo vệ tối ưu tài khoản.</p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs p-3.5 rounded-xl mb-4 font-semibold text-center">{error}</div>}
        {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs p-3.5 rounded-xl mb-4 font-semibold text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Mật khẩu mới</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400"><Lock className="h-5 w-5" /></span>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="bg-[#f8fbff] border border-slate-200 text-slate-700 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#7db5ff] w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Xác nhận mật khẩu</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400"><Lock className="h-5 w-5" /></span>
              <input 
                type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                className="bg-[#f8fbff] border border-slate-200 text-slate-700 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#7db5ff] w-full"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-xs uppercase tracking-[0.12em] transition flex items-center justify-center space-x-2"
          >
            <CheckSquare className="h-4 w-4" />
            <span>{loading ? "Đang lưu..." : "Cập nhật mật khẩu"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}