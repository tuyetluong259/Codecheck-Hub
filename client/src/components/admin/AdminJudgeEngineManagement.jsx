import React, { useState } from "react";
import { Settings, Save, Plus, AlertTriangle } from "lucide-react";

export default function AdminJudgeEngineManagement() {
  const [maxCpu, setMaxCpu] = useState(1);
  const [maxRam, setRam] = useState(512);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Judge Engine &amp; Docker Sandbox Management</h1>
          <p className="mt-2 text-lg text-slate-500">Configure compilation environments, runner limits, and monitor live container clusters</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Restart Engine</button>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">Add Worker Node</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">Status: Healthy (8/8 Nodes Ready)</div>
          <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Save Sandbox Policy</button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-[#f8fbff] p-6">
          <h3 className="text-2xl font-black tracking-tight text-slate-800">GLOBAL SANDBOX EXECUTION POLICIES</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">Default CPU Limit: <span className="font-bold">1 Core</span></div>
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">Execution Timeout: <span className="font-bold">2.0 seconds</span></div>
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">Max Memory (RAM): <span className="font-bold">512 MB</span></div>
            <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">Max Output Size: <span className="font-bold">4 MB</span></div>
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
                  <td className="p-4"><button className="rounded-lg border border-[#7db5ff] bg-white px-3 py-2 text-xs font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Settings</button></td>
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
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Host IP</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Active Containers</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">CPU Usage</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">RAM Usage</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["judge-node-01", "192.168.10.11", "4 / 10 running", "32%", "1.8GB / 4GB"],
                ["judge-node-02", "192.168.10.12", "6 / 10 running", "68%", "2.7GB / 4GB"],
                ["judge-node-03", "192.168.10.13", "0 / 10 (Idle)", "2%", "0.5GB / 4GB"],
              ].map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/80">
                  <td className="p-4 text-sm font-bold text-slate-700">{row[0]}</td>
                  <td className="p-4 text-sm text-slate-700">{row[1]}</td>
                  <td className="p-4 text-sm text-slate-700">{row[2]}</td>
                  <td className="p-4 text-sm text-slate-700">{row[3]}</td>
                  <td className="p-4 text-sm text-slate-700">{row[4]}</td>
                  <td className="p-4"><button className="rounded-lg border border-[#7db5ff] bg-white px-3 py-2 text-xs font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Logs</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}