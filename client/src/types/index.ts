// ===== Auth Types =====
export interface User {
  id: string
  email: string
  fullName: string
  role: 'STUDENT' | 'LECTURER' | 'ADMIN'
  studentId?: string
  avatarUrl?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  role: 'STUDENT' | 'LECTURER'
  studentId?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    user: User
  }
}

// ===== Course Types =====
export interface Course {
  id: string
  name: string
  code: string
  lecturerId: string
  description?: string
  studentIds: string[]
  active: boolean
  createdAt: string
}

// ===== Problem Types =====
export interface Problem {
  id: string
  title: string
  description: string
  inputFormat?: string
  outputFormat?: string
  constraints?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  courseId: string
  deadline?: string
  timeLimitMs: number
  memoryLimitMb: number
  maxScore: number
  published: boolean
  createdAt: string
}

// ===== TestCase Types =====
export interface TestCase {
  id: string
  problemId: string
  input: string
  expectedOutput: string
  isPublic: boolean
  points: number
  orderIndex: number
}

// ===== Submission Types =====
export type SubmissionLanguage = 'CPP' | 'JAVA' | 'PYTHON'
export type SubmissionStatus =
  | 'PENDING'
  | 'JUDGING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT'
  | 'MEMORY_LIMIT'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'

export interface SubmissionResult {
  id: string
  testCaseId: string
  status: SubmissionStatus
  timeMs?: number
  memoryMb?: number
  actualOutput?: string
  errorMessage?: string
  isPublic: boolean
  orderIndex: number
}

export interface Submission {
  id: string
  problemId: string
  studentId: string
  code: string
  language: SubmissionLanguage
  status: SubmissionStatus
  score?: number
  passedTestCases?: number
  totalTestCases?: number
  compileError?: string
  sonarIssues?: string   // JSON string
  results: SubmissionResult[]
  submittedAt: string
  judgedAt?: string
}

export interface SubmitRequest {
  problemId: string
  studentId: string
  code: string
  language: SubmissionLanguage
  timeLimitMs?: number
  memoryLimitMb?: number
  testCases: Array<{
    id: string
    input: string
    expectedOutput: string
    isPublic: boolean
    points: number
  }>
}

// ===== WebSocket Types =====
export interface JudgeResultMessage {
  submissionId: string
  studentId: string
  overallStatus: SubmissionStatus
  score: number
  passedCount: number
  totalCount: number
  compileError?: string
  sonarIssues?: string
  results: SubmissionResult[]
}
