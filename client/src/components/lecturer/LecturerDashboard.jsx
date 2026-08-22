import React from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, FolderGit, ShieldAlert } from "lucide-react";

export default function LecturerDashboard() {
  const stats = [
    { title: "Tổng học viên quản lý", value: "185 sinh viên", icon: Users, color: "text-indigo-600 bg-indigo-50 border border-indigo-100" },
    { title: "Số lớp học phần", value: "4 lớp", icon: GraduationCap, color: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
    { title: "Bài tập trong kho riêng", value: "32 bài", icon: FolderGit, color: "text-amber-600 bg-amber-50 border border-amber-100" },
    { title: "Cảnh báo đạo văn mới nhất", value: "2 sự kiện", icon: ShieldAlert, color: "text-rose-600 bg-rose-50 border border-rose-100" }
  ];

  const recentActivities = [
    { name: "Nguyễn Văn Hùng", cls: "Cấu trúc dữ liệu - Nhóm 2", msg: "vừa đạt điểm tuyệt đối 100/100", time: "5 phút trước" },
    { name: "Phạm Minh Đức & Lê Anh Tuấn", cls: "OOP Java - Nhóm 1", msg: "bị phát hiện trùng lặp mã nguồn 91%", time: "30 phút trước" },
    { name: "Lương Thị Ánh Tuyết", cls: "Cấu trúc dữ liệu - Nhóm 2", msg: "gửi đơn xin gia hạn hạn nộp bài AVL Tree", time: "1 giờ trước" }
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">BẢNG ĐIỀU KHIỂN GIẢNG VIÊN</h1>
        <p className="text-slate-500 text-sm mt-1">Trực quan hóa thống kê kết quả học tập và giám sát chất lượng làm bài của sinh viên</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className={`p-3.5 rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">{stat.title}</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.08em]">Nhật ký hoạt động nộp bài mới nhất</h3>
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act, i) => (
              <div key={i} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm">
                <div>
                  <span className="font-extrabold text-slate-800">{act.name}</span>
                  <span className="text-slate-500 font-medium"> ({act.cls}) </span>
                  <span className="text-slate-600 font-semibold">{act.msg}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#f4f8ff] text-slate-700 p-6 rounded-2xl border border-[#dfeeff] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Tóm tắt tiến độ chấm bài</h3>
            <div className="space-y-3.5 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Cấu trúc dữ liệu & Giải thuật (Bài 3)</span>
                <span>80% (36/45 SV)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#1d4ed8] h-full rounded-full" style={{ width: "80%" }}></div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>OOP Java - Nhóm 1 (Bài tập mẫu)</span>
                <span>42% (21/50 SV)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "42%" }}></div>
              </div>
            </div>
          </div>
          <Link to="/lecturer/grades" className="block text-center w-full py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs rounded-xl shadow-lg mt-8 uppercase tracking-[0.12em] transition">
            Vào Sổ điểm & Quét đạo văn
          </Link>
        </div>
      </div>
    </div>
  );
}