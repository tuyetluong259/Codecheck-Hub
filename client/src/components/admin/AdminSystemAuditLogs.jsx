import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import api from "../../api/axios";

export default function AdminSystemAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const levelStyles = {
    CRITICAL: "bg-red-100 text-red-700",
    WARNING: "bg-amber-100 text-amber-700",
    INFO: "bg-sky-100 text-sky-700",
    OK: "bg-emerald-100 text-emerald-700",
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = (log.event?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                        (log.actor?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                        (log.ip?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchLevel = levelFilter === "ALL" || log.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">System &amp; Audit Logs</h1>
          <p className="mt-2 text-lg text-slate-500">Giám sát các thao tác quản trị và bảo mật hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button onClick={() => setLevelFilter("ALL")} className={`rounded-2xl border ${levelFilter==="ALL" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Tất cả Logs ({logs.length})
        </button>
        <button onClick={() => setLevelFilter("WARNING")} className={`rounded-2xl border ${levelFilter==="WARNING" ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Cảnh báo ({logs.filter(l => l.level === "WARNING").length})
        </button>
        <button onClick={() => setLevelFilter("CRITICAL")} className={`rounded-2xl border ${levelFilter==="CRITICAL" ? "border-red-500 bg-red-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Nghiêm trọng ({logs.filter(l => l.level === "CRITICAL").length})
        </button>
        <button onClick={() => setLevelFilter("INFO")} className={`rounded-2xl border ${levelFilter==="INFO" ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>
          Thông tin ({logs.filter(l => l.level === "INFO").length})
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button onClick={fetchLogs} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Làm mới dữ liệu</button>
        </div>
        <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Export Logs (CSV)</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Event, Actor, IP..." 
              className="w-full rounded-xl border border-[#7db5ff] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" 
            />
          </div>
          
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none">
            <option value="ALL">Tất cả Mức độ</option>
            <option value="INFO">Thông tin (INFO)</option>
            <option value="WARNING">Cảnh báo (WARNING)</option>
            <option value="CRITICAL">Nghiêm trọng (CRITICAL)</option>
          </select>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#f8fbff] shadow-sm">
              <tr className="border-b border-slate-200">
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thời gian</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Mức độ</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Sự kiện / Chi tiết</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Người thực hiện / IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Không tìm thấy log nào.</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                    <td className="p-4 text-sm font-bold text-slate-700 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${levelStyles[log.level] || levelStyles.INFO}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{log.event}</td>
                    <td className="p-4 text-sm text-slate-700">
                      <div className="font-medium text-slate-800">{log.actor}</div>
                      <div className="mt-1 text-xs text-slate-500">{log.ip}</div>
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