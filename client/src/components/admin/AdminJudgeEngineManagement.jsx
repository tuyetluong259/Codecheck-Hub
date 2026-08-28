import React, { useState, useEffect } from "react";
import { Settings, Save, Plus, AlertTriangle } from "lucide-react";
import api from "../../api/axios";

export default function AdminJudgeEngineManagement() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxCpu, setMaxCpu] = useState(1);
  const [maxRam, setRam] = useState(512);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/system/metrics');
      setMetrics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const usedMemPercent = metrics ? Math.round((metrics["jvm.memory.used"] / metrics["jvm.memory.max"]) * 100) : 0;
  const isHealthy = usedMemPercent < 85;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Judge Engine &amp; Docker Sandbox Management</h1>
          <p className="mt-2 text-lg text-slate-500">Cấu hình môi trường biên dịch, giới hạn bộ nhớ, giám sát cụm Node chấm điểm</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMetrics} className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff] transition">Làm mới Metrics</button>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af] transition">Add Worker Node</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {loading && !metrics ? (
            <div className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-black text-slate-500">Đang kiểm tra trạng thái...</div>
          ) : (
            <div className={`rounded-full border px-4 py-2 text-sm font-black ${isHealthy ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-amber-300 bg-amber-100 text-amber-700'}`}>
              Trạng thái: {isHealthy ? 'Healthy (Nodes Ready)' : 'High Load (Cảnh báo tài nguyên)'} - RAM {usedMemPercent}%
            </div>
          )}
          <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff] transition">Lưu Chính Sách Sandbox</button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-[#f8fbff] p-6">
          <h3 className="text-xl font-black tracking-tight text-slate-800 uppercase">CHÍNH SÁCH CHẠY CODE GLOBAL</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 border border-slate-100 shadow-sm">Default CPU Limit: <span className="font-bold">1 Core</span></div>
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 border border-slate-100 shadow-sm">Execution Timeout: <span className="font-bold">2.0 seconds</span></div>
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 border border-slate-100 shadow-sm">Max Memory (RAM): <span className="font-bold">512 MB</span></div>
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 border border-slate-100 shadow-sm">Max Output Size: <span className="font-bold">4 MB</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-800"><Settings className="h-5 w-5 text-[#1d4ed8]" /> Runtime Environments &amp; Compilers</h3>
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#f8fbff]">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Language / Runtime</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Base Docker Image</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Compiler Flag</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Java 17 & 21 (JDK)", "eclipse-temurin:21-jdk", "-Xmx512M -Xms128M", "Active"],
                ["Python 3.11 / 3.12", "python:3.12-alpine", "python -u", "Active"],
                ["C / C++ (GCC 13)", "gcc:13-bookworm", "-O2 -Wall -std=c++20", "Active"],
                ["Node.js 20 (LTS)", "node:20-alpine", "--max-old-space-size=512", "Active"],
              ].map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/80">
                  <td className="p-4 text-sm font-bold text-slate-700">{row[0]}</td>
                  <td className="p-4 text-sm text-slate-600">{row[1]}</td>
                  <td className="p-4 text-sm font-mono text-slate-700">{row[2]}</td>
                  <td className="p-4"><span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">{row[3]}</span></td>
                  <td className="p-4"><button className="rounded-lg border border-[#7db5ff] bg-white px-3 py-2 text-xs font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Cấu hình</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-black tracking-tight text-slate-800">Runner Nodes Live Metrics</h3>
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#f8fbff]">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Node Name</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Host OS</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total Threads</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">RAM Load</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200 hover:bg-slate-50/80">
                <td className="p-4 text-sm font-bold text-slate-700">judge-node-primary</td>
                <td className="p-4 text-sm text-slate-700">{metrics?.["os.name"] || 'Loading...'}</td>
                <td className="p-4 text-sm text-slate-700">{metrics?.["jvm.threads.count"] || 0}</td>
                <td className="p-4 text-sm text-slate-700">{usedMemPercent}%</td>
                <td className="p-4">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isHealthy ? 'Healthy' : 'High Load'}
                  </span>
                </td>
                <td className="p-4"><button className="rounded-lg border border-[#7db5ff] bg-white px-3 py-2 text-xs font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Logs</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}