import { apiSlice } from './apiSlice'
import type { Course, Problem, TestCase } from '../../types'

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => '/courses',
      providesTags: ['Course'],
    }),
    getCourseById: builder.query<Course, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),
    createCourse: builder.mutation<Course, Partial<Course>>({
      query: (data) => ({ url: '/courses', method: 'POST', body: data }),
      invalidatesTags: ['Course'],
    }),
    enrollCourse: builder.mutation<void, string>({
      query: (courseId) => ({ url: `/courses/${courseId}/enroll`, method: 'POST' }),
      invalidatesTags: ['Course'],
    }),
    getProblems: builder.query<Problem[], string>({
      query: (courseId) => `/problems?courseId=${courseId}`,
      providesTags: ['Problem'],
    }),
    getProblemById: builder.query<Problem, string>({
      query: (id) => `/problems/${id}`,
      providesTags: (result, error, id) => [{ type: 'Problem', id }],
    }),
    createProblem: builder.mutation<Problem, Partial<Problem>>({
      query: (data) => ({ url: '/problems', method: 'POST', body: data }),
      invalidatesTags: ['Problem'],
    }),
    getPublicTestCases: builder.query<TestCase[], string>({
      query: (problemId) => `/test-cases?problemId=${problemId}&isPublic=true`,
    }),
    createTestCase: builder.mutation<TestCase, Partial<TestCase>>({
      query: (data) => ({ url: '/test-cases', method: 'POST', body: data }),
    }),
  }),
})

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useEnrollCourseMutation,
  useGetProblemsQuery,
  useGetProblemByIdQuery,
  useCreateProblemMutation,
  useGetPublicTestCasesQuery,
  useCreateTestCaseMutation,
} = coursesApi
