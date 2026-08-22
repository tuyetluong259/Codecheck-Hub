import React from "react";
import { Calendar, Cpu, CheckCircle2, AlertCircle, CircleDashed } from "lucide-react";

export default function SubmissionHistory() {
  const submissions = [
    { id: 1001, problem: "two sum 1", lang: "Java", time: "11/08/2026 15:30", status: "ACCEPTED", runtime: "120ms", memory: "15MB", cleanCode: "92%" },
    { id: 1032, problem: "agent", lang: "Python", time: "11/08/2026 15:30", status: "WRONG_ANSWER", runtime: "120ms", memory: "20MB", cleanCode: "82%" },
    { id: 1014, problem: "two sum 2", lang: "Java", time: "11/08/2026 15:30", status: "TLE", runtime: "120ms", memory: "17MB", cleanCode: "72%" },
    { id: 1016, problem: "two sum 3", lang: "C++", time: "11/08/2026 15:30", status: "COMPILE_ERROR", runtime: "120ms", memory: "18MB", cleanCode: "58%" },
    { id: 1015, problem: "two sum 3", lang: "C++", time: "11/08/2026 15:30", status: "PENDING", runtime: "120ms", memory: "18MB", cleanCode: "70%" },
  ];

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
            {submissions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                <td className="p-4 text-slate-600 font-bold">{sub.id}</td>
                <td className="p-4 text-slate-800 font-extrabold">{sub.problem}</td>
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
                  ) : sub.status === "TLE" ? (
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
                      <span>Pending</span>
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{sub.lang}</span>
                </td>
                <td className="p-4 text-slate-600 font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-slate-400" />
                  <span>{sub.runtime}/{sub.memory}</span>
                </td>
                <td className="p-4 text-slate-600 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{sub.time}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}