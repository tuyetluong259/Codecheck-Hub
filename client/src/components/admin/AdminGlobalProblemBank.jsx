import React, { useState } from "react";
import { Check, X, Search, ChevronDown, FileText, ShieldCheck } from "lucide-react";

export default function AdminGlobalProblemBank() {
  const [requests, setRequests] = useState([
    { id: 1, title: "Two Sum (#1002)", category: "Array, Hash Table", author: "TS. Nguyễn Văn Nam", status: "Public" },
    { id: 2, title: "Graph Shortest Path (#3045)", category: "Graph, Dijkstra", author: "ThS. Trần Thị Hoa", status: "Pending Review" },
    { id: 3, title: "Binary Tree Traversal (#2011)", category: "Tree, Recursion", author: "Admin System", status: "Private" },
    { id: 4, title: "Matrix Multiplication (#1089)", category: "Array, Math", author: "TS. Lê Hoàng Cường", status: "Rejected" },
  ]);

  const handleApprove = (id, approved) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: approved ? "Public" : "Rejected" } : r));
  };

  const statusStyles = {
    Public: "bg-emerald-100 text-emerald-700",
    "Pending Review": "bg-amber-100 text-amber-700",
    Private: "bg-sky-100 text-sky-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Global Problem Bank Management</h1>
          <p className="mt-2 text-lg text-slate-500">Review contributed problems, manage shared repositories, and set global visibility</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">All Problems (420)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Pending Review (8)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Tags &amp; Categories</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Archive</button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Import Problem Package (ZIP)</button>
        <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Export Selected</button>
        <button className="ml-auto rounded-xl bg-[#1d4ed8] px-5 py-3 text-base font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">Create Global Problem</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input placeholder="Search for article title, ID" className="w-full rounded-xl border border-[#7db5ff] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none" />
          </div>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">Search</button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>Tag: All</span><ChevronDown className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>Status: All</span><ChevronDown className="h-4 w-4" /></button>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f8fbff]">
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Problem Title &amp; ID</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Category / Tags</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Author / Creator</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                <td className="p-4 text-sm font-bold text-slate-700">
                  <div>{r.title}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{r.category}</div>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">{r.category}</td>
                <td className="p-4 text-sm font-medium text-slate-600">{r.author}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${statusStyles[r.status]}`}>{r.status}</span>
                    {r.status === "Pending Review" && (
                      <>
                        <button onClick={() => handleApprove(r.id, false)} className="rounded-lg border border-red-200 bg-red-100 p-2 text-red-600 hover:bg-red-200"><X className="h-4 w-4" /></button>
                        <button onClick={() => handleApprove(r.id, true)} className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 hover:bg-emerald-200"><Check className="h-4 w-4" /></button>
                      </>
                    )}
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