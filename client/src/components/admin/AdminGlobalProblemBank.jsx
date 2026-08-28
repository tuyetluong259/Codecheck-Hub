import React, { useState, useEffect } from "react";
import { Check, X, Search, ChevronDown, FileText, ShieldCheck } from "lucide-react";
import api from "../../api/axios";

export default function AdminGlobalProblemBank() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/problems/all');
      setProblems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, approved) => {
    // Note: To actually approve, we need a PUT endpoint. Since we don't have it yet, this is simulated on frontend for now.
    setProblems(problems.map(p => p.id === id ? { ...p, published: approved } : p));
    alert(approved ? "Đã duyệt bài tập!" : "Đã từ chối bài tập!");
  };

  const filteredProblems = problems.filter(p => {
    const matchSearch = (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || 
      (statusFilter === "PUBLIC" && p.published) || 
      (statusFilter === "PRIVATE" && !p.published);
    const matchDifficulty = difficultyFilter === "ALL" || p.difficulty === difficultyFilter;
    return matchSearch && matchStatus && matchDifficulty;
  });

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Kho Bài Tập Chung (Global Problem Bank)</h1>
          <p className="mt-2 text-lg text-slate-500">Quản lý toàn bộ bài tập trong hệ thống, xét duyệt bài đóng góp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button onClick={() => setStatusFilter("ALL")} className={`rounded-2xl border ${statusFilter==="ALL" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Tất cả ({problems.length})
        </button>
        <button onClick={() => setStatusFilter("PUBLIC")} className={`rounded-2xl border ${statusFilter==="PUBLIC" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Đã Publish ({problems.filter(p => p.published).length})
        </button>
        <button onClick={() => setStatusFilter("PRIVATE")} className={`rounded-2xl border ${statusFilter==="PRIVATE" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Private / Pending ({problems.filter(p => !p.published).length})
        </button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
          Archive
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Import (ZIP)</button>
        <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Export Selected</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tiêu đề..." 
              className="w-full rounded-xl border border-[#7db5ff] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" 
            />
          </div>
          <select 
            value={difficultyFilter} 
            onChange={(e) => setDifficultyFilter(e.target.value)} 
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            <option value="ALL">Độ khó: All</option>
            <option value="EASY">Dễ (Easy)</option>
            <option value="MEDIUM">Trung bình (Medium)</option>
            <option value="HARD">Khó (Hard)</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            <option value="ALL">Trạng thái: All</option>
            <option value="PUBLIC">Đã Publish</option>
            <option value="PRIVATE">Private / Pending</option>
          </select>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#f8fbff] shadow-sm">
              <tr className="border-b border-slate-200">
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Bài tập</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Độ khó</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Điểm tối đa</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Trạng thái</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : filteredProblems.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Không tìm thấy bài tập nào.</td></tr>
              ) : (
                filteredProblems.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                    <td className="p-4 text-sm font-bold text-slate-700">
                      <div>{p.title}</div>
                      <div className="mt-1 text-xs font-medium text-slate-500">Course ID: {p.courseId}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{p.difficulty}</td>
                    <td className="p-4 text-sm font-medium text-slate-600">{p.maxScore} pts</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${p.published ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                        {p.published ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="p-4">
                      {!p.published ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(p.id, true)} className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 hover:bg-emerald-200" title="Duyệt"><Check className="h-4 w-4" /></button>
                          <button onClick={() => handleApprove(p.id, false)} className="rounded-lg border border-red-200 bg-red-100 p-2 text-red-600 hover:bg-red-200" title="Từ chối"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Đã duyệt</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}