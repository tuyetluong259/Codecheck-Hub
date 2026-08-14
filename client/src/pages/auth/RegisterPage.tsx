import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../redux/hooks'
import { setCredentials } from '../../redux/slices/authSlice'
import { useRegisterMutation } from '../../redux/api/authApi'
import { toast } from 'react-toastify'
import { Terminal, UserPlus } from 'lucide-react'
import type { RegisterRequest } from '../../types'

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>({
    fullName: '', email: '', password: '',
    role: 'STUDENT', studentId: ''
  })
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await register(form).unwrap()
      dispatch(setCredentials({
        user: result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      }))
      toast.success('Đăng ký thành công!')
      navigate(form.role === 'LECTURER' ? '/lecturer' : '/dashboard')
    } catch (err: any) {
      toast.error(err?.data?.message || 'Đăng ký thất bại')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">CodeCheckHub</h1>
          <p className="text-slate-400 mt-2">Tạo tài khoản mới</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Đăng ký</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Họ tên đầy đủ</label>
              <input name="fullName" value={form.fullName} onChange={handleChange}
                placeholder="Nguyễn Văn A" required className="input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="your@email.com" required className="input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Mật khẩu</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự" required minLength={8} className="input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Vai trò</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="input bg-slate-900">
                <option value="STUDENT">Sinh viên</option>
                <option value="LECTURER">Giảng viên</option>
              </select>
            </div>
            {form.role === 'STUDENT' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Mã số sinh viên</label>
                <input name="studentId" value={form.studentId} onChange={handleChange}
                  placeholder="22110XXX" className="input" />
              </div>
            )}
            <button id="register-btn" type="submit" disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlus className="w-4 h-4" />}
              {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-5">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
