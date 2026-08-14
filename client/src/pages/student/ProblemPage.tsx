import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CodeEditor } from '../../components/CodeEditor'
import { JudgeResult } from '../../components/JudgeResult'
import { useAppSelector } from '../../redux/hooks'
import {
  useGetProblemByIdQuery,
  useGetPublicTestCasesQuery,
} from '../../redux/api/coursesApi'
import {
  useSubmitCodeMutation,
  useGetSubmissionQuery,
  useGetMySubmissionsQuery,
} from '../../redux/api/submissionsApi'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { JudgeResultMessage, SubmissionLanguage, Submission } from '../../types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Clock, Database, ChevronDown, History } from 'lucide-react'

const LANGUAGES: { value: SubmissionLanguage; label: string }[] = [
  { value: 'CPP', label: 'C++' },
  { value: 'JAVA', label: 'Java' },
  { value: 'PYTHON', label: 'Python 3' },
]

const ProblemPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>()
  const { user } = useAppSelector(state => state.auth)

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<SubmissionLanguage>('CPP')
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem')
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null)
  const [liveResult, setLiveResult] = useState<Submission | null>(null)
  const [isJudging, setIsJudging] = useState(false)

  const { data: problem } = useGetProblemByIdQuery(problemId!)
  const { data: publicTests } = useGetPublicTestCasesQuery(problemId!)
  const { data: submissions } = useGetMySubmissionsQuery({
    problemId: problemId!,
    studentId: user?.id || '',
  }, { skip: !user?.id })
  const { data: currentSubmission } = useGetSubmissionQuery(currentSubmissionId!, {
    skip: !currentSubmissionId,
    pollingInterval: isJudging ? 2000 : 0,
  })

  const [submitCode] = useSubmitCodeMutation()

  // WebSocket — nhận kết quả real-time
  const handleResult = useCallback((result: JudgeResultMessage) => {
    setIsJudging(false)
    setLiveResult({
      id: result.submissionId,
      problemId: problemId!,
      studentId: result.studentId,
      code,
      language,
      status: result.overallStatus,
      score: result.score,
      passedTestCases: result.passedCount,
      totalTestCases: result.totalCount,
      compileError: result.compileError,
      sonarIssues: result.sonarIssues,
      results: result.results || [],
      submittedAt: new Date().toISOString(),
    })
    toast.success(`Chấm xong! ${result.passedCount}/${result.totalCount} test case`)
  }, [problemId, code, language])

  useWebSocket({
    submissionId: currentSubmissionId || undefined,
    studentId: user?.id,
    onResult: handleResult,
  })

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng viết code trước khi nộp!')
      return
    }
    if (!user?.id || !problemId || !problem || !publicTests) return

    setIsJudging(true)
    setLiveResult(null)

    try {
      const allTests = publicTests.map(tc => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isPublic: tc.isPublic,
        points: tc.points,
      }))

      const submission = await submitCode({
        problemId,
        studentId: user.id,
        code,
        language,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
        testCases: allTests,
      }).unwrap()

      setCurrentSubmissionId(submission.id)
      toast.info('Bài đã nộp! Đang chấm...')
    } catch (err: any) {
      setIsJudging(false)
      toast.error(err?.data?.message || 'Nộp bài thất bại')
    }
  }

  const difficultyColor = {
    EASY: 'text-emerald-400 bg-emerald-900/20 border-emerald-800',
    MEDIUM: 'text-yellow-400 bg-yellow-900/20 border-yellow-800',
    HARD: 'text-red-400 bg-red-900/20 border-red-800',
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex gap-6 min-h-0">
      {/* Left panel — Problem description */}
      <div className="w-[45%] flex flex-col min-h-0 overflow-hidden">
        <div className="card flex-1 overflow-y-auto">
          {/* Problem header */}
          <div className="mb-4">
            <div className="flex items-start gap-3 mb-3">
              <h1 className="text-xl font-bold text-white flex-1">{problem.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                difficultyColor[problem.difficulty]
              }`}>
                {problem.difficulty === 'EASY' ? 'Dễ' :
                 problem.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {problem.timeLimitMs / 1000}s
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                {problem.memoryLimitMb}MB
              </span>
              {problem.deadline && (
                <span className="text-orange-400">
                  Hạn: {new Date(problem.deadline).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-slate-700 pb-2">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === 'problem'
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đề bài
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Lịch sử
              {submissions && submissions.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {submissions.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'problem' ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {problem.description}
              </ReactMarkdown>

              {/* Public test cases */}
              {publicTests && publicTests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-slate-300 font-medium mb-3">Ví dụ:</h3>
                  {publicTests.filter(tc => tc.isPublic).slice(0, 3).map((tc, i) => (
                    <div key={tc.id} className="mb-3 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                      <div className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs border-b border-slate-700">
                        Ví dụ {i + 1}
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-700">
                        <div className="p-3">
                          <p className="text-slate-500 text-xs mb-1">Input:</p>
                          <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        <div className="p-3">
                          <p className="text-slate-500 text-xs mb-1">Output:</p>
                          <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {submissions?.length === 0 && (
                <p className="text-slate-500 text-center py-8">Chưa có lần nộp nào</p>
              )}
              {submissions?.map(sub => (
                <div key={sub.id} className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      sub.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {sub.status}
                    </span>
                    <span className="text-slate-500">
                      {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {sub.passedTestCases !== undefined && (
                    <p className="text-slate-400 mt-0.5">
                      {sub.passedTestCases}/{sub.totalTestCases} test · {sub.score} điểm
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — Editor + Result */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
        {/* Language selector + Submit */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as SubmissionLanguage)}
              className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={isJudging}
            className="btn-primary flex items-center gap-2 ml-auto"
          >
            {isJudging ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isJudging ? 'Đang chấm...' : 'Nộp bài'}
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor
            code={code}
            language={language}
            onChange={setCode}
            height="100%"
          />
        </div>

        {/* Judge Result */}
        {(isJudging || liveResult) && (
          <div className="card max-h-64 overflow-y-auto">
            <JudgeResult
              submission={liveResult}
              isJudging={isJudging && !liveResult}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProblemPage
