import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCreateProblemMutation, useCreateTestCaseMutation } from '../../redux/api/coursesApi'
import { Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react'
import type { TestCase } from '../../types'

interface TestCaseForm {
  input: string
  expectedOutput: string
  isPublic: boolean
  points: number
}

const CreateProblemPage: React.FC = () => {
  const navigate = useNavigate()
  const [createProblem] = useCreateProblemMutation()
  const [createTestCase] = useCreateTestCaseMutation()

  const [form, setForm] = useState({
    title: '', description: '', inputFormat: '',
    outputFormat: '', constraints: '',
    difficulty: 'EASY', courseId: '',
    timeLimitMs: 2000, memoryLimitMb: 256, maxScore: 100,
  })
  const [testCases, setTestCases] = useState<TestCaseForm[]>([
    { input: '', expectedOutput: '', isPublic: true, points: 10 }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const addTestCase = () => {
    setTestCases(prev => [...prev, { input: '', expectedOutput: '', isPublic: false, points: 10 }])
  }

  const removeTestCase = (i: number) => {
    setTestCases(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateTestCase = (i: number, field: keyof TestCaseForm, value: any) => {
    setTestCases(prev => prev.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const problem = await createProblem(form).unwrap()
      for (const tc of testCases) {
        await createTestCase({ ...tc, problemId: problem.id }).unwrap()
      }
      toast.success('Tạo bài tập thành công!')
      navigate('/lecturer')
    } catch (err: any) {
      toast.error(err?.data?.message || 'Tạo bài thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Tạo bài tập mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-200">Thông tin cơ bản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1.5">Tiêu đề *</label>
              <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                placeholder="VD: Tính tổng hai số" required className="input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Độ khó</label>
              <select value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty: e.target.value}))}
                className="input bg-slate-900">
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Mã lớp học</label>
              <input value={form.courseId} onChange={e => setForm(p => ({...p, courseId: e.target.value}))}
                placeholder="ID lớp học" required className="input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Giới hạn thời gian (ms)</label>
              <input type="number" value={form.timeLimitMs}
                onChange={e => setForm(p => ({...p, timeLimitMs: +e.target.value}))}
                min={100} max={10000} className="input" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Giới hạn bộ nhớ (MB)</label>
              <input type="number" value={form.memoryLimitMb}
                onChange={e => setForm(p => ({...p, memoryLimitMb: +e.target.value}))}
                min={32} max={1024} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Đề bài (Markdown) *</label>
            <textarea value={form.description}
              onChange={e => setForm(p => ({...p, description: e.target.value}))}
              rows={8} required placeholder="Viết đề bài bằng Markdown..."
              className="input resize-none font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Định dạng input</label>
              <textarea value={form.inputFormat}
                onChange={e => setForm(p => ({...p, inputFormat: e.target.value}))}
                rows={3} className="input resize-none text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Định dạng output</label>
              <textarea value={form.outputFormat}
                onChange={e => setForm(p => ({...p, outputFormat: e.target.value}))}
                rows={3} className="input resize-none text-sm" />
            </div>
          </div>
        </div>

        {/* Test cases */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-200">Test Cases ({testCases.length})</h2>
            <button type="button" onClick={addTestCase} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Thêm test case
            </button>
          </div>

          {testCases.map((tc, i) => (
            <div key={i} className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  Test #{i + 1}
                  {tc.isPublic
                    ? <span className="ml-2 text-emerald-400 text-xs">(Công khai)</span>
                    : <span className="ml-2 text-slate-500 text-xs">(Ẩn)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateTestCase(i, 'isPublic', !tc.isPublic)}
                    className="btn-ghost p-1.5" title={tc.isPublic ? 'Ẩn test case' : 'Công khai'}>
                    {tc.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  {testCases.length > 1 && (
                    <button type="button" onClick={() => removeTestCase(i)}
                      className="btn-ghost p-1.5 text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Input</label>
                  <textarea value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)}
                    rows={3} className="input resize-none font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Expected Output</label>
                  <textarea value={tc.expectedOutput}
                    onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)}
                    rows={3} className="input resize-none font-mono text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400">Điểm:</label>
                <input type="number" value={tc.points} min={0} max={100}
                  onChange={e => updateTestCase(i, 'points', +e.target.value)}
                  className="w-20 input text-sm py-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/lecturer')} className="btn-secondary">
            Huỷ
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            {isLoading ? 'Đang tạo...' : 'Tạo bài tập'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProblemPage
