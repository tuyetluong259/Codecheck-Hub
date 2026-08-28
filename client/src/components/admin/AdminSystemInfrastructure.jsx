import React, { useState, useEffect } from "react";
import { Activity, Gauge, Server, CircleDot } from "lucide-react";
import api from "../../api/axios";
import { Link } from "react-router-dom";

export default function AdminSystemInfrastructure() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // refresh every 10s
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

  if (loading && !metrics) {
    return <div className="p-8 text-slate-500">Đang tải thông số Server...</div>;
  }

  const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  const maxMem = metrics ? formatMB(metrics["jvm.memory.max"]) : 0;
  const totalMem = metrics ? formatMB(metrics["jvm.memory.total"]) : 0;
  const usedMem = metrics ? formatMB(metrics["jvm.memory.used"]) : 0;
  const uptimeHours = metrics ? (metrics["jvm.uptime"] / 1000 / 60 / 60).toFixed(2) : 0;

  const cards = [
    { 
      title: "JVM MEMORY USAGE", 
      value: `${usedMem} MB / ${maxMem} MB`, 
      meta: `Total allocated: ${totalMem} MB`, 
      icon: Gauge, 
      accent: "bg-emerald-100 text-emerald-700" 
    },
    { 
      title: "SERVER THREADS", 
      value: `${metrics?.["jvm.threads.count"] || 0} active`, 
      meta: `Peak threads: ${metrics?.["jvm.threads.peak"] || 0}`, 
      icon: Activity, 
      accent: "bg-amber-100 text-amber-700" 
    },
    { 
      title: "SYSTEM UPTIME", 
      value: `${uptimeHours} giờ`, 
      meta: `OS: ${metrics?.["os.name"]} ${metrics?.["os.arch"]} (${metrics?.["os.processors"]} cores)`, 
      icon: Server, 
      accent: "bg-sky-100 text-sky-700" 
    },
  ];

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">System Infrastructure</h1>
          <p className="mt-2 text-lg text-slate-500">Giám sát tài nguyên máy chủ theo thời gian thực (Live Metrics)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMetrics} className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] transition hover:bg-[#eef5ff]">Làm mới</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black uppercase tracking-[0.12em] text-slate-700">{card.title}</div>
                <div className={`rounded-full p-2 ${card.accent}`}><Icon className="h-4 w-4" /></div>
              </div>
              <div className="mt-4 text-2xl font-black text-slate-800">{card.value}</div>
              <div className="mt-1 text-sm text-slate-500">{card.meta}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-800">Thông tin OS & Server</h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hệ điều hành</div>
            <div className="mt-1 text-lg font-bold text-slate-700">{metrics?.["os.name"]} ({metrics?.["os.version"]})</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kiến trúc CPU</div>
            <div className="mt-1 text-lg font-bold text-slate-700">{metrics?.["os.arch"]} với {metrics?.["os.processors"]} nhân xử lý</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#0f172a] p-6 text-white shadow-sm">
        <div className="mb-3 text-2xl font-black tracking-tight">Logs hệ thống gần đây</div>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-200 opacity-70 italic">
          Tính năng xem Log chi tiết đã được chuyển sang module System Audit Logs.
        </div>
        <div className="mt-4 flex justify-end">
          <Link to="/admin/audit-logs">
            <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e40af]">Xem Full Audit Logs</button>
          </Link>
        </div>
      </div>
    </div>
  );
}