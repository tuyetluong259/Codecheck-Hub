import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle2, ChevronRight } from "lucide-react";
import api from "../../api/axios";

function DonutChart({ accepted, failed, pending, other }) {
  const total = accepted + failed + pending + other;
  const acceptedAngle = (accepted / total) * 360;
  const failedAngle = (failed / total) * 360;
  const pendingAngle = (pending / total) * 360;

  const segments = [
    { start: 0, end: acceptedAngle, color: "#4ade80" },
    { start: acceptedAngle, end: acceptedAngle + failedAngle, color: "#f87171" },
    { start: acceptedAngle + failedAngle, end: acceptedAngle + failedAngle + pendingAngle, color: "#facc15" },
    { start: acceptedAngle + failedAngle + pendingAngle, end: 360, color: "#cbd5e1" },
  ];

  return (
    <svg viewBox="0 0 120 120" className="w-48 h-48">
      <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="18" />
      {segments.map((seg, idx) => {
        const start = (seg.start - 90) * (Math.PI / 180);
        const end = (seg.end - 90) * (Math.PI / 180);
        const x1 = 60 + 42 * Math.cos(start);
        const y1 = 60 + 42 * Math.sin(start);
        const x2 = 60 + 42 * Math.cos(end);
        const y2 = 60 + 42 * Math.sin(end);
        const largeArc = seg.end - seg.start > 180 ? 1 : 0;

        return (
          <path
            key={idx}
            d={`M 60 60 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={seg.color}
            opacity={0.95}
          />
        );
      })}
      <circle cx="60" cy="60" r="24" fill="#f5f7fb" />
    </svg>
  );
}

export default function StudentProblems() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems/student');
        setProblems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Problems Overview</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fbff] border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Problem Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Class</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Difficulty</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-4 text-center">Đang tải...</td></tr> : problems.map((prob) => (
              <tr key={prob.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                <td className="p-4">
                  <span className="inline-block w-3 h-3 rounded-full bg-slate-300" />
                </td>
                <td className="p-4 text-slate-800 font-extrabold hover:text-[#1d4ed8] transition">
                  <Link to={`/student/workspace/${prob.id}`}>{prob.title}</Link>
                </td>
                <td className="p-4 text-slate-600 font-medium">Lớp học</td>
                <td className="p-4 text-slate-600 font-medium">
                  <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${prob.difficulty === 'HARD' ? 'bg-rose-100 text-rose-700' : prob.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {prob.difficulty}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link to={`/student/workspace/${prob.id}`} className="inline-flex items-center rounded-xl bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/15 hover:bg-[#1e40af]">
                      Solve
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">My Submission Status</h2>
          <ul className="space-y-2 text-xl text-slate-700">
            <li className="flex items-center justify-between w-48"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Accepted</span><span>52.1%</span></li>
            <li className="flex items-center justify-between w-48"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /> Failed</span><span>22.8%</span></li>
            <li className="flex items-center justify-between w-48"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Pending</span><span>13.9%</span></li>
            <li className="flex items-center justify-between w-48"><span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-300" /> Other</span><span>11.2%</span></li>
          </ul>
          <div className="pt-4 text-lg text-emerald-700 font-black">
            Total Solved: <span className="text-slate-800">12 / 50</span>
            <div className="text-slate-700">Clean Code Score: A (92/100)</div>
          </div>
        </div>

        <div className="flex justify-center">
          <DonutChart accepted={52.1} failed={22.8} pending={13.9} other={11.2} />
        </div>
      </div>
    </div>
  );
}