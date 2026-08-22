import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Một mã OTP 8 chữ số đã được gửi tới hòm thư của bạn.');
      setTimeout(() => navigate('/verify-code'), 2000);
    } catch (err) {
      setMessage('Một mã OTP 8 chữ số đã được gửi tới hòm thư của bạn.');
      setTimeout(() => navigate('/verify-code'), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(37,99,235,0.08)] relative z-10">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="bg-amber-500/10 p-4 rounded-full text-amber-500 border border-amber-500/20">
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-slate-800 text-center">QUÊN MẬT KHẨU?</h2>
          <p className="text-slate-500 text-xs text-center">Điền email của tài khoản, chúng tôi sẽ gửi mã OTP bảo mật để khôi phục mật khẩu của bạn.</p>
        </div>

        {message && <div className="bg-[#eaf3ff] border border-[#cfe1ff] text-[#1d4ed8] text-xs p-4 rounded-xl mb-6 font-semibold text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Địa chỉ Email</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400"><Mail className="h-5 w-5" /></span>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@school.edu.vn"
                className="bg-[#f8fbff] border border-slate-200 text-slate-700 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#7db5ff] w-full"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-xs uppercase tracking-[0.12em] transition"
          >
            {loading ? "Đang gửi mã..." : "Gửi Mã Xác Minh (OTP)"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link to="/login" className="flex items-center space-x-2 text-slate-500 hover:text-[#1d4ed8] text-xs font-semibold transition">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}