import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Key, Users, ArrowRight } from "lucide-react";
import api from "../../api/axios";

export default function LecturerClassManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("CS-" + Math.floor(1000 + Math.random() * 9000));
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/courses/lecturer');
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async () => {
    if (!className) return;
    try {
      await api.post('/courses', {
        name: className,
        code: classCode,
        description: "Lớp học mới"
      });
      setShowCreateModal(false);
      setClassName("");
      setClassCode("CS-" + Math.floor(1000 + Math.random() * 9000));
      fetchClasses();
    } catch (err) {
      console.error("Failed to create class", err);
      alert("Tạo lớp thất bại: Mã lớp có thể đã tồn tại");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Class Management</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="space-y-3">
              <span className="inline-flex rounded-md bg-[#edf5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#1d4ed8]">{cls.code}</span>
              <h3 className="text-base font-black text-slate-800 leading-tight">
                <Link to={`/lecturer/classes/${cls.id}`} className="hover:text-[#1d4ed8] transition">{cls.name}</Link>
              </h3>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4 text-slate-400" /> Students</span>
                <span className="inline-flex items-center gap-1 text-[#1d4ed8]"><Key className="h-4 w-4" /> {cls.code}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
              <Link to={`/lecturer/classes/${cls.id}`} className="flex-1 rounded-xl bg-[#edf5ff] px-3 py-2.5 text-center text-xs font-bold text-[#1d4ed8] transition hover:bg-[#dfeeff]">
                Manage Assignments
              </Link>
              <Link to="/lecturer/grades" className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                Grades
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide text-slate-800">Create Class</h3>
              <p className="mt-1 text-xs text-slate-500">Create a new class and generate a join code for students.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="Enter class name"
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-slate-700 focus:border-[#7db5ff] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Join Code</label>
                <input
                  type="text"
                  readOnly
                  value={classCode}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-black tracking-[0.2em] text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#1e40af]">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}