import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Copy, Edit, Trash2, Search, ChevronDown } from "lucide-react";
import api from "../../api/axios";

export default function LecturerProblemBank() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get('/problems/lecturer');
        setProblems(res.data);
      } catch (err) {
        console.error("Failed to fetch problems", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleDuplicate = (id) => {
    const prob = problems.find(p => p.id === id);
    if (prob) {
      setProblems([...problems, { ...prob, id: Date.now(), problemId: `T${Date.now().toString().slice(-3)}` }]);
    }
  };

  const difficultyColors = {
    Easy: "bg-emerald-100 text-emerald-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-800">Problem bank</h1>
        <Link to="/lecturer/problems/create" className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">
          <PlusCircle className="h-4 w-4" />
          <span>Create New Problem</span>
        </Link>
      </div>

      <div className="flex gap-4">
        <button className="inline-flex items-center gap-2 rounded-xl border border-[#1d4ed8] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] shadow-sm hover:bg-[#eef5ff]">
          <span>Difficulty level</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-[#1d4ed8] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] shadow-sm hover:bg-[#eef5ff]">
          <span>Algorithm</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f8fbff]">
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Problem ID</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Title</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Difficulty</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Test Cases</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tag</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((prob) => (
              <tr key={prob.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                <td className="p-4 text-base font-bold text-slate-800">{prob.id.substring(0, 8)}</td>
                <td className="p-4 text-base font-bold text-slate-800">
                  <div>{prob.title}</div>
                  <div className="text-xs font-medium text-slate-500">{prob.published ? "Published" : "Draft"}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-black ${prob.difficulty === "HARD" ? "bg-red-100 text-red-700" : prob.difficulty === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {prob.difficulty}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold text-slate-700">{prob.timeLimitMs}ms / {prob.memoryLimitMb}MB</td>
                <td className="p-4 text-sm font-medium text-slate-600">{prob.courseId ? "Assigned" : "Global"}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300">Delete</button>
                    <button onClick={() => handleDuplicate(prob.id)} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-200">Duplicate</button>
                    <Link to={`/lecturer/problems/edit/${prob.id}`} className="rounded-lg bg-[#1d4ed8] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1e40af]">Edit</Link>
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