import React from "react";
import { Activity, Gauge, Server, CircleDot } from "lucide-react";

export default function AdminSystemInfrastructure() {
  const cards = [
    { title: "JUDGE WORKER CLUSTER", value: "CPU Usage: 38%", meta: "RAM Usage: 54%", icon: Gauge, accent: "bg-emerald-100 text-emerald-700" },
    { title: "GRADING QUEUE LOAD", value: "In-Queue Tasks: 4 jobs", meta: "Avg Judge Time: 1.2s", icon: Activity, accent: "bg-amber-100 text-amber-700" },
    { title: "ACTIVE USERS (LIVE)", value: "Instructors: 14 online", meta: "CPU Usage: 38%", icon: Server, accent: "bg-sky-100 text-sky-700" },
  ];

  const workers = [
    { name: "Worker-01", runtime: "Java 17/21", cpu: "42% / 4Core", ram: "2.1GB / 4GB", status: "Running" },
    { name: "Worker-02", runtime: "Python 3.11", cpu: "18% / 4Core", ram: "1.2GB / 4GB", status: "Running" },
    { name: "Worker-03", runtime: "C/C++ (GCC)", cpu: "65% / 4Core", ram: "3.0GB / 4GB", status: "High Load" },
    { name: "Worker-04", runtime: "Node.js 20", cpu: "0% / 4Core", ram: "0.4GB / 4GB", status: "Idle" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">System Infrastructure &amp; Sandbox Monitoring</h1>
          <p className="mt-2 text-lg text-slate-500">Cluster Status: Healthy (8/8 Workers Online)</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Restart Queue</button>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">Config</button>
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
              <div className="mt-4 text-xl font-black text-slate-800">{card.value}</div>
              <div className="mt-1 text-sm text-slate-500">{card.meta}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Docker Sandbox Worker Status</h2>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#f8fbff]">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Worker Node</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Runtime / Lang</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">CPU / Limit</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">RAM / Limit</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker, idx) => (
                <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/80">
                  <td className="p-4 text-sm font-bold text-slate-700">{worker.name}</td>
                  <td className="p-4 text-sm font-medium text-slate-700">{worker.runtime}</td>
                  <td className="p-4 text-sm font-medium text-slate-700">{worker.cpu}</td>
                  <td className="p-4 text-sm font-medium text-slate-700">{worker.ram}</td>
                  <td className="p-4">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${worker.status === "Running" ? "bg-emerald-100 text-emerald-700" : worker.status === "High Load" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>{worker.status}</span>
                  </td>
                  <td className="p-4">
                    <button className="rounded-lg border border-[#7db5ff] bg-white px-3 py-2 text-xs font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#0f172a] p-6 text-white shadow-sm">
        <div className="mb-3 text-2xl font-black tracking-tight">Recent System Audit &amp; Security Logs</div>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-200">
          [12:34:10] SECURITY: Container memory limit reached on Worker-03 (Student: #1089).<br />
          [12:30:22] USER: Instructor 'TS. Nguyễn' created class 'CS101 - Fall 2026'.<br />
          [12:15:00] SYSTEM: Automated daily database backup completed successfully.
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">View Full Logs</button>
        </div>
      </div>
    </div>
  );
}