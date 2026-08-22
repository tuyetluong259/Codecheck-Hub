import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, User, PlusCircle } from "lucide-react";
import api from "../../api/axios";

export default function StudentClasses() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/courses/student');
      // Thêm data ảo cho lecturer và progress để giao diện đẹp (có thể làm backend sau)
      const formattedClasses = res.data.map(c => ({
        ...c,
        lecturer: "Giảng viên",
        progress: 0
      }));
      setClasses(formattedClasses);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoin = async () => {
    if (!classCode) return;
    try {
      await api.post('/courses/join', { code: classCode });
      setShowJoinModal(false);
      setClassCode("");
      fetchClasses();
    } catch (err) {
      console.error("Join failed", err);
      alert("Tham gia lớp thất bại. Mã không đúng hoặc bạn đã ở trong lớp.");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">LỚP HỌC CỦA TÔI</h1>
          <p className="text-slate-500 text-sm mt-1">Danh sách các lớp học phần bạn đang tham gia trên hệ thống</p>
        </div>
        <button 
          onClick={() => setShowJoinModal(true)}
          className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/15 flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Tham gia lớp học</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between bg-white hover:shadow-md transition">
            <div className="space-y-3">
              <span className="text-[10px] font-black px-2.5 py-1 bg-[#eef4ff] text-[#1d4ed8] rounded-md tracking-[0.12em] uppercase">{cls.code}</span>
              <h3 className="font-black text-slate-800 text-base leading-tight hover:text-[#1d4ed8] transition">
                <Link to={`/student/classes/${cls.id}`}>{cls.name}</Link>
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
                <User className="h-4 w-4 text-slate-400" />
                <span>Giảng viên: {cls.lecturer}</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Tiến độ hoàn thành</span>
                  <span>{cls.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#1d4ed8] h-full rounded-full" style={{ width: `${cls.progress}%` }}></div>
                </div>
              </div>
              <Link to={`/student/classes/${cls.id}`} className="block text-center py-2 bg-[#f3f7ff] hover:bg-[#eaf3ff] text-slate-700 hover:text-[#1d4ed8] font-bold text-xs rounded-xl transition">
                Vào lớp học
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Tham gia lớp học</h3>
              <p className="text-slate-500 text-xs mt-1">Nhập mã tham gia (Class Code) do giảng viên cung cấp để ghi danh vào lớp học phần.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">Mã tham gia lớp</label>
              <input 
                type="text" value={classCode} onChange={e => setClassCode(e.target.value)} placeholder="VD: CLASS-1234"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#7db5ff] font-bold tracking-widest text-center"
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <button onClick={() => setShowJoinModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-50">Hủy</button>
              <button onClick={handleJoin} className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs rounded-xl shadow">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}