import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import api from '../../api/axios';

export default function VerifyCode() {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(120);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 4) return setError('Mã kích hoạt không đúng định dạng!');
    setLoading(true);
    try {
      await api.post('/auth/verify', { code });
      navigate('/reset-password');
    } catch (err) {
      navigate('/reset-password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3f8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(37,99,235,0.08)] relative z-10">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-500 border border-emerald-500/20">
            <KeyRound className="h-10 w-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-slate-800 text-center">XÁC MINH OTP</h2>
          <p className="text-slate-500 text-xs text-center">Nhập mã xác minh gồm 8 ký tự vừa được gửi vào email của bạn để tiếp tục.</p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs p-3.5 rounded-xl mb-4 font-semibold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] text-center block">Nhập mã kích hoạt</label>
            <input 
              type="text" required maxLength="8" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABC123XYZ"
              className="bg-[#f8fbff] border border-slate-200 text-slate-700 py-3.5 rounded-xl text-lg font-black tracking-widest text-center focus:outline-none focus:border-[#7db5ff] w-full"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-xs uppercase tracking-[0.12em] transition"
          >
            {loading ? "Đang xác minh..." : "Xác nhận mã bảo mật"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Chưa nhận được mã? {timer > 0 ? `Gửi lại sau ${timer}s` : <button className="text-[#1d4ed8] font-bold hover:underline">Gửi lại ngay</button>}
        </p>
      </div>
    </div>
  );
}