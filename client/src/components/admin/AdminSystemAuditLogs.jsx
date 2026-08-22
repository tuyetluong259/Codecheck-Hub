import React from "react";
import { Search, Terminal, ChevronDown, ShieldAlert } from "lucide-react";

export default function AdminSystemAuditLogs() {
  const logs = [
    { time: "11/08 15:30", level: "CRITICAL", event: "Sandbox Violation: Memory Limit Reached (Worker-02 / Java Container)", actor: "Student #1089", ip: "192.168.1.45" },
    { time: "11/08 15:30", level: "WARNING", event: "Manual Score Override: 'Two Sum' #1032 changed from 0pt to 10pts", actor: "TS. Nguyễn Nam", ip: "113.16.1.42" },
    { time: "11/08 15:30", level: "INFO", event: "User Role Modified: 'duyenlmt' to Teaching Assistant", actor: "Admin Root", ip: "10.0.0.1" },
    { time: "11/08 15:30", level: "CRITICAL", event: "Multiple Failed Logins (5 attempts) Account: 'namnv@ut.edu.vn'", actor: "Unknown User", ip: "203.113.15.8" },
    { time: "11/08 15:30", level: "OK", event: "Automated DB Backup Completed size: 1.2GB -> Cloud Storage", actor: "System Cron", ip: "127.0.0.1" },
  ];

  const levelStyles = {
    CRITICAL: "bg-red-100 text-red-700",
    WARNING: "bg-amber-100 text-amber-700",
    INFO: "bg-sky-100 text-sky-700",
    OK: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">System &amp; Audit Logs Monitoring</h1>
          <p className="mt-2 text-lg text-slate-500">Track administrative actions, user authentications, and sandbox security incidents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">All Logs (8,412)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Security &amp; Sandbox (42)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">User Audits</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">System Ops</button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>Last 24 Hours</span><ChevronDown className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>Severity: All Levels</span><ChevronDown className="h-4 w-4" /></button>
        </div>
        <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Export Logs (CSV)</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input placeholder="Enter keywords, IP, user..." className="w-full rounded-xl border border-[#7db5ff] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none" />
          </div>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">Search</button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>Service: All Services</span><ChevronDown className="h-4 w-4" /></button>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f8fbff]">
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Timestamp</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Level</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Event / Action Details</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Actor / IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                <td className="p-4 text-sm font-bold text-slate-700">{log.time}</td>
                <td className="p-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${levelStyles[log.level]}`}>{log.level}</span></td>
                <td className="p-4 text-sm text-slate-700">{log.event}</td>
                <td className="p-4 text-sm text-slate-700">{log.actor}<div className="mt-1 text-xs text-slate-500">{log.ip}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}