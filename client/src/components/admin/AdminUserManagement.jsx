import React, { useState } from "react";
import { PlusCircle, Edit2, Search, ArrowDown, Upload } from "lucide-react";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: "TS. Nguyễn Văn Nam", email: "namnv@ut.edu.vn", role: "Instructor", status: "Active" },
    { id: 2, name: "Lương Thị Ánh Tuyết", email: "06735001563@ut.edu.vn", role: "Super Admin", status: "Active" },
    { id: 3, name: "Trần Hoàng Nam", email: "06735001890@ut.edu.vn", role: "Student (K22)", status: "Banned" },
    { id: 4, name: "Lê Thị Mỹ Duyên", email: "duyenlmt@ut.edu.vn", role: "Teaching Assistant", status: "Active" },
  ]);

  const handleToggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Banned" : "Active" } : u));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">User &amp; Role Management</h1>
          <p className="mt-2 text-lg text-slate-500">Manage accounts, role assignments, and batch enrollment permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">All Users (1,248)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Instructors (32)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Students (1,216)</button>
        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm">Roles</button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button className="rounded-xl border border-[#7db5ff] bg-white px-6 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Import CSV / Excel</button>
        <button className="rounded-xl border border-[#7db5ff] bg-white px-6 py-3 text-base font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Export User List</button>
        <button className="ml-auto rounded-xl bg-[#1d4ed8] px-6 py-3 text-base font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">Create New User</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input placeholder="Enter Student ID or Student Name" className="w-full rounded-xl border border-[#7db5ff] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none" />
          </div>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">Search</button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>All Roles</span><ArrowDown className="h-4 w-4" /></button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><span>Status: All</span><ArrowDown className="h-4 w-4" /></button>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f8fbff]">
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">User Information</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Role</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Department / Cohort</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                <td className="p-4 text-sm font-bold text-slate-700">{u.name}<div className="mt-1 text-xs font-medium text-slate-500">{u.email}</div></td>
                <td className="p-4 text-sm font-bold text-slate-700">{u.role}</td>
                <td className="p-4 text-sm font-bold text-slate-700">{u.role === "Instructor" ? "Khoa CNTT" : u.role === "Super Admin" ? "System" : u.role === "Student (K22)" ? "CNTT - KHMT" : "Khoa CNTT"}</td>
                <td className="p-4"><span className={`rounded-lg px-2.5 py-1 text-xs font-black ${u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{u.status}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleStatus(u.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">{u.status === "Active" ? "Suspend" : "Restore"}</button>
                    <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><Edit2 className="h-4 w-4" /></button>
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