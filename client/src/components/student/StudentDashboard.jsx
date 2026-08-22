import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Award, Clock, BookOpen, ChevronRight } from "lucide-react";

export default function StudentDashboard() {
  const stats = [
    { title: "Bài tập hoàn thành", value: "24 / 35", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
    { title: "Tỷ lệ Accepted (AC)", value: "82.4%", icon: Award, color: "text-indigo-600 bg-indigo-50 border border-indigo-100" },
    { title: "Điểm Clean Code TB", value: "88 / 100", icon: BookOpen, color: "text-amber-600 bg-amber-50 border border-amber-100" },
    { title: "Thời gian luyện tập", value: "14.5 giờ", icon: Clock, color: "text-sky-600 bg-sky-50 border border-sky-100" }
  ];

  const recentClasses = [
    { id: 1, name: "Cấu trúc dữ liệu và Giải thuật - Nhóm 2", progress: 75, lastActive: "2 giờ trước" },
    { id: 2, name: "Lập trình hướng đối tượng (Java) - Nhóm 1", progress: 90, lastActive: "Hôm qua" }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">BẢNG ĐIỀU KHIỂN</h1>
          <p className="text-slate-500 text-sm mt-1">Chào mừng bạn trở lại, chúc bạn học tốt!</p>
        </div>
        <Link to="/student/problems" className="px-5 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/15 transition">
          Luyện tập ngay
        </Link>
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
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-bold text-slate-800 uppercase tracking-[0.08em]">Lớp học gần đây</h3>
            <Link to="/student/classes" className="text-xs font-bold text-[#1d4ed8] flex items-center hover:underline">
              <span>Tất cả lớp học</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentClasses.map((cls) => (
              <div key={cls.id} className="p-5 border border-slate-200 rounded-xl bg-[#f8fbff] hover:border-[#cfe1ff] transition space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 text-sm">{cls.name}</span>
                  <span className="text-xs text-slate-400 font-medium">Hoạt động: {cls.lastActive}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Tiến độ học tập</span>
                    <span>{cls.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#1d4ed8] h-full rounded-full" style={{ width: `${cls.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-sm text-white flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-400">Thử thách hàng tuần</h3>
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700/50">
              <span className="text-[10px] px-2.5 py-1 bg-amber-500/15 text-amber-300 font-extrabold rounded-md uppercase tracking-[0.12em]">Khó</span>
              <h4 className="font-black text-white mt-3 text-sm">Tìm kiếm chuỗi đối xứng dài nhất</h4>
              <p className="text-slate-400 text-xs mt-1">Sử dụng thuật toán quy hoạch động tối ưu hóa bộ nhớ O(1).</p>
            </div>
          </div>
          <button className="w-full py-3 bg-[#1d4ed8] hover:bg-[#1e40af] font-bold text-xs rounded-xl shadow-lg mt-6 uppercase tracking-[0.12em] transition">
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    </div>
  );
}