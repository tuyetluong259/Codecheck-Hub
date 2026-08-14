import React from 'react'
import type { Submission, SubmissionStatus } from '../types'
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, Zap, MemoryStick } from 'lucide-react'

interface JudgeResultProps {
  submission: Submission | null
  isJudging?: boolean
}

const STATUS_CONFIG: Record<SubmissionStatus, {
  label: string
  color: string
  bg: string
  icon: React.ReactNode
}> = {
  PENDING: {
    label: 'Đang chờ...',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-800',
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
  },
  JUDGING: {
    label: 'Đang chấm...',
    color: 'text-blue-400',
    bg: 'bg-blue-900/20 border-blue-800',
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
  },
  ACCEPTED: {
    label: 'Chấp nhận ✓',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20 border-emerald-800',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  WRONG_ANSWER: {
    label: 'Sai đáp án',
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-800',
    icon: <XCircle className="w-5 h-5" />,
  },
  TIME_LIMIT: {
    label: 'Quá thời gian',
    color: 'text-orange-400',
    bg: 'bg-orange-900/20 border-orange-800',
    icon: <Clock className="w-5 h-5" />,
  },
  MEMORY_LIMIT: {
    label: 'Quá bộ nhớ',
    color: 'text-purple-400',
    bg: 'bg-purple-900/20 border-purple-800',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  RUNTIME_ERROR: {
    label: 'Lỗi runtime',
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-800',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  COMPILE_ERROR: {
    label: 'Lỗi biên dịch',
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-800',
    icon: <XCircle className="w-5 h-5" />,
  },
}

export const JudgeResult: React.FC<JudgeResultProps> = ({ submission, isJudging }) => {
  if (!submission && !isJudging) return null

  const status = isJudging ? 'JUDGING' : (submission?.status || 'PENDING')
  const config = STATUS_CONFIG[status]

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`p-4 rounded-xl border ${config.bg} flex items-center gap-3`}>
        <span className={config.color}>{config.icon}</span>
        <div className="flex-1">
          <p className={`font-semibold text-lg ${config.color}`}>{config.label}</p>
          {submission && !isJudging && (
            <p className="text-slate-400 text-sm mt-0.5">
              {submission.passedTestCases}/{submission.totalTestCases} test case đúng
              {submission.score !== undefined && ` · ${submission.score} điểm`}
            </p>
          )}
        </div>
        {submission && !isJudging && (
          <div className="text-right text-sm text-slate-400">
            <p className="flex items-center gap-1 justify-end">
              <Zap className="w-3.5 h-3.5" />
              {submission.results[0]?.timeMs ?? '—'} ms
            </p>
            <p className="flex items-center gap-1 justify-end">
              <MemoryStick className="w-3.5 h-3.5" />
              {submission.results[0]?.memoryMb ?? '—'} MB
            </p>
          </div>
        )}
      </div>

      {/* Compile Error */}
      {submission?.compileError && (
        <div className="p-4 bg-red-950/50 border border-red-900 rounded-xl">
          <p className="text-red-400 text-sm font-medium mb-2">Lỗi biên dịch:</p>
          <pre className="text-red-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {submission.compileError}
          </pre>
        </div>
      )}

      {/* Test Cases Grid */}
      {submission?.results && submission.results.length > 0 && (
        <div>
          <h3 className="text-slate-300 font-medium mb-3">Kết quả test case</h3>
          <div className="space-y-2">
            {submission.results
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((result, index) => {
                const tc = STATUS_CONFIG[result.status]
                return (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <span className={tc.color}>{tc.icon}</span>
                    <div className="flex-1">
                      <span className="text-slate-300 text-sm">
                        Test #{index + 1}
                        {!result.isPublic && (
                          <span className="ml-2 text-xs text-slate-500">(ẩn)</span>
                        )}
                      </span>
                      {result.errorMessage && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {result.errorMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {result.timeMs ?? '—'}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <MemoryStick className="w-3 h-3" />
                        {result.memoryMb ?? '—'}MB
                      </span>
                      <span className={`font-medium ${tc.color}`}>{tc.label}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* SonarQube Code Review */}
      {submission?.sonarIssues && (() => {
        try {
          const issues = JSON.parse(submission.sonarIssues)
          if (issues.length === 0) return null
          return (
            <div>
              <h3 className="text-slate-300 font-medium mb-3">
                Gợi ý cải thiện code
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  (từ Code Review)
                </span>
              </h3>
              <div className="space-y-2">
                {issues.map((issue: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0">⚠</span>
                      <div>
                        <span className="text-amber-400 font-medium">
                          {issue.type === 'BUG' ? '🐛 Bug' :
                           issue.type === 'VULNERABILITY' ? '🔒 Bảo mật' : '💡 Code smell'}
                        </span>
                        {issue.line && (
                          <span className="text-slate-500 ml-2 text-xs">Dòng {issue.line}</span>
                        )}
                        <p className="text-slate-300 mt-0.5">{issue.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        } catch {
          return null
        }
      })()}
    </div>
  )
}
