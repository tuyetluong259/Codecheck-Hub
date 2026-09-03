import React, { useState, useEffect } from "react";
import { Calendar, Cpu, CheckCircle2, AlertCircle, CircleDashed } from "lucide-react";
import api from "../../api/axios";

export default function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/submissions/student/history');
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Submission History</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Status</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Class</div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Language</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fbff] border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">ID</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Problem Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Language</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Time/RAM</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Submission Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">Đang tải...</td></tr>
            ) : submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                <td className="p-4 text-slate-600 font-bold">{sub.id.substring(0, 8)}...</td>
                <td className="p-4 text-slate-800 font-extrabold">{sub.problemId ? "Problem " + sub.problemId.substring(0,8) : "N/A"}</td>
                <td className="p-4">
                  {sub.status === "ACCEPTED" ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Accepted</span>
                    </span>
                  ) : sub.status === "WRONG_ANSWER" ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Wrong Answer</span>
                    </span>
                  ) : sub.status === "TIME_LIMIT" ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                      <CircleDashed className="h-3.5 w-3.5" />
                      <span>TLE</span>
                    </span>
                  ) : sub.status === "COMPILE_ERROR" ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Compile Error</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-700">
                      <CircleDashed className="h-3.5 w-3.5" />
                      <span>{sub.status}</span>
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{sub.language}</span>
                </td>
                <td className="p-4 text-slate-600 font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-slate-400" />
                  <span>{sub.executionTime || 0}ms / {sub.memoryUsed || 0}MB</span>
                </td>
                <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}