import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  ShieldAlert,
  FileSpreadsheet,
  Search,
  ChevronDown,
  Eye,
  AlertTriangle,
} from "lucide-react";

export default function GradingAndAnalytics() {
  const [tab, setTab] = useState("gradebook");

  const students = [
    { id: "06732301", name: "Nguyễn Văn A", status: "Submitted", tc: "10/10", clean: "92", plagiarism: "0", time: "11/08/2026 15:30" },
    { id: "06732302", name: "Nguyễn Văn B", status: "Unsubmitted", tc: "0/10", clean: "0", plagiarism: "0", time: "11/08/2026 15:30" },
    { id: "06732303", name: "Nguyễn Văn C", status: "Unsubmitted", tc: "0/10", clean: "0", plagiarism: "0", time: "11/08/2026 15:30" },
    { id: "06732304", name: "Nguyễn Văn D", status: "Suspicious", tc: "10/10", clean: "98", plagiarism: "98%", time: "11/08/2026 15:30" },
    { id: "06732305", name: "Nguyễn Văn E", status: "Submitted", tc: "9/10", clean: "90", plagiarism: "0", time: "11/08/2026 15:30" },
  ];

  const statusStyles = {
    Submitted: "bg-emerald-100 text-emerald-700",
    Unsubmitted: "bg-red-100 text-red-700",
    Suspicious: "bg-amber-100 text-amber-700",
  };

  const plagPairs = [
    { a: "Trần Văn B", b: "Nguyễn Văn A", similarity: "94%", status: "Pending Review", statusColor: "bg-amber-100 text-amber-700" },
    { a: "Trần Văn A", b: "Nguyễn Văn B", similarity: "90%", status: "Confirmed Flagged", statusColor: "bg-red-100 text-red-700" },
    { a: "Trần Văn C", b: "Nguyễn Văn C", similarity: "85%", status: "Dismissed", statusColor: "bg-emerald-100 text-emerald-700" },
    { a: "Trần Văn D", b: "Nguyễn Văn D", similarity: "78%", status: "Pending Review", statusColor: "bg-amber-100 text-amber-700" },
    { a: "Trần Văn E", b: "Nguyễn Văn E", similarity: "71%", status: "Pending Review", statusColor: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Grading &amp; Analytics</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Avg Score</div>
          <div className="mt-2 text-3xl font-black text-slate-800">8.2 / 10</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Pass Rate</div>
          <div className="mt-2 text-3xl font-black text-slate-800">88.5%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Clean Code</div>
          <div className="mt-2 text-3xl font-black text-slate-800">78.0% Pas</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Plagiarism</div>
          <div className="mt-2 text-3xl font-black text-slate-800">3</div>
          <div className="text-xs text-slate-500">Cases Flagged</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-200 bg-[#f8fbff]">
          <button onClick={() => setTab("gradebook")} className={`px-6 py-3 text-sm font-bold ${tab === "gradebook" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-slate-400"}`}>
            <span className="inline-flex items-center gap-2"><Table className="h-4 w-4" /> Gradebook</span>
          </button>
          <button onClick={() => setTab("plagiarism")} className={`px-6 py-3 text-sm font-bold ${tab === "plagiarism" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-slate-400"}`}>
            <span className="inline-flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Plagiarism Checker</span>
          </button>
          <button onClick={() => setTab("sonarqube")} className={`px-6 py-3 text-sm font-bold ${tab === "sonarqube" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-slate-400"}`}>
            <span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> SonarQube Code Quality</span>
          </button>
        </div>

        {tab === "gradebook" && (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input placeholder="Enter Student ID or Student Name" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] py-3 pl-10 pr-4 text-sm text-slate-700 focus:outline-none" />
              </div>
              <button className="rounded-xl bg-[#1d4ed8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e40af]">Search</button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-4 py-3 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">
                <span>All Grades</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <table className="w-full border-collapse overflow-hidden rounded-xl border border-slate-200">
              <thead>
                <tr className="bg-[#f8fbff]">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Student ID</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Student</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">TC Score</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Clean Code</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Plagiarism</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Time</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/60">
                    <td className="p-4 text-sm font-bold text-slate-700">{student.id}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{student.name}</td>
                    <td className="p-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${statusStyles[student.status]}`}>{student.status}</span></td>
                    <td className="p-4 text-sm font-bold text-slate-700">{student.tc}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{student.clean}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{student.plagiarism}</td>
                    <td className="p-4 text-sm font-medium text-slate-500">{student.time}</td>
                    <td className="p-4">
                      {student.status === "Submitted" ? <button className="rounded-xl bg-[#1d4ed8] px-3 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">View</button> : <button className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200">Remind</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "plagiarism" && (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input placeholder="Enter Student ID or Student Name" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] py-3 pl-10 pr-4 text-sm text-slate-700 focus:outline-none" />
              </div>
              <button className="rounded-xl bg-[#1d4ed8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e40af]">Search</button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-4 py-3 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">
                <span>Suspicion &gt;= 75%</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <table className="w-full border-collapse overflow-hidden rounded-xl border border-slate-200">
              <thead>
                <tr className="bg-[#f8fbff]">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Student A</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Student B</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Similarity</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Detection Status</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {plagPairs.map((pair, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/60">
                    <td className="p-4 text-sm font-bold text-slate-700">{pair.a}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{pair.b}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{pair.similarity}</td>
                    <td className="p-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${pair.statusColor}`}>{pair.status}</span></td>
                    <td className="p-4"><Link to="/lecturer/plagiarism/compare" className="rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-xs font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Compare Code</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sonarqube" && (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-[#f8fbff] p-5">
                <div className="text-xl font-black text-slate-800">Grade Distribution</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Grade A (85-100)</span><span>65%</span></div>
                  <div className="flex justify-between"><span>Grade B (70-84)</span><span>22%</span></div>
                  <div className="flex justify-between"><span>Grade C (60-69)</span><span>10%</span></div>
                  <div className="flex justify-between"><span>Grade D (&lt; 60)</span><span>3%</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f8fbff] p-5">
                <div className="text-xl font-black text-slate-800">Code Health Metrics</div>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <div>Avg Cognitive Complexity: 6.4 / 15 (Passed)</div>
                  <div>Total Code Smells: 142 issues</div>
                  <div>Critical Bugs: 3 issues</div>
                  <div>Duplication Rate: 4.2% (Healthy)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}