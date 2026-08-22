import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Copy, Edit, Trash2, Search, ChevronDown } from "lucide-react";

export default function LecturerProblemBank() {
  const [problems, setProblems] = useState([
    { id: 1, problemId: "T001", title: "Two Sum", difficulty: "Easy", tag: "Multiple", status: "GLOBAL" },
    { id: 2, problemId: "T031", title: "Valid Parentheses", difficulty: "Medium", tag: "Array", status: "PRIVATE" },
    { id: 3, problemId: "IT112", title: "Duplicate In-Use (1)", difficulty: "Easy", tag: "String", status: "PRIVATE" },
    { id: 4, problemId: "C501", title: "Two Sum 1 In-Use (2)", difficulty: "Hard", tag: "Tree", status: "GLOBAL" },
  ]);

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
                <td className="p-4 text-base font-bold text-slate-800">{prob.problemId}</td>
                <td className="p-4 text-base font-bold text-slate-800">
                  <div>{prob.title}</div>
                  <div className="text-xs font-medium text-slate-500">{prob.status === "GLOBAL" ? "Global Bank" : prob.status === "PRIVATE" ? "Private" : "Draft"}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-black ${difficultyColors[prob.difficulty]}`}>
                    {prob.difficulty}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold text-slate-700">{prob.status === "GLOBAL" ? 3 : prob.status === "PRIVATE" ? 2 : 5}</td>
                <td className="p-4 text-sm font-medium text-slate-600">{prob.tag}</td>
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