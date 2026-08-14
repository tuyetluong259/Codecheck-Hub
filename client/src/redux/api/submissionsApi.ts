import { apiSlice } from './apiSlice'
import type { Submission, SubmitRequest } from '../../types'

export const submissionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitCode: builder.mutation<Submission, SubmitRequest>({
      query: (data) => ({
        url: '/submissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Submission'],
    }),
    getSubmission: builder.query<Submission, string>({
      query: (id) => `/submissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Submission', id }],
    }),
    getMySubmissions: builder.query<Submission[], { problemId: string; studentId: string }>({
      query: ({ problemId, studentId }) =>
        `/submissions/problem/${problemId}/student/${studentId}`,
      providesTags: ['Submission'],
    }),
  }),
})

export const {
  useSubmitCodeMutation,
  useGetSubmissionQuery,
  useGetMySubmissionsQuery,
} = submissionsApi
