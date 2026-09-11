import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, FolderGit, ShieldAlert } from "lucide-react";
import api from "../../api/axios";

export default function LecturerDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalProblems: 0,
    recentPlagiarismAlerts: 0
  });

  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/courses/lecturer/dashboard-stats');
        setDashboardStats(res.data);
        // attempt to fetch recent activities from likely endpoints
        try {
          const possible = ['/activities/lecturer/recent', '/courses/lecturer/recent-activities', '/courses/lecturer/activities'];
          for (const ep of possible) {
            try {
              const ares = await api.get(ep);
              const payload = ares.data?.data ?? ares.data ?? [];
              if (Array.isArray(payload) && payload.length > 0) {
                setRecentActivities(payload);
                break;
              }
            } catch (e) {
              // ignore and try next
            }
          }
        } catch (e) {
          console.warn('No recent activities endpoint available');
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: "Tổng học viên quản lý", value: `${dashboardStats.totalStudents} sinh viên`, icon: Users, color: "text-indigo-600 bg-indigo-50 border border-indigo-100" },
    { title: "Số lớp học phần", value: `${dashboardStats.totalCourses} lớp`, icon: GraduationCap, color: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
    { title: "Bài tập trong kho riêng", value: `${dashboardStats.totalProblems} bài`, icon: FolderGit, color: "text-amber-600 bg-amber-50 border border-amber-100" },
    { title: "Cảnh báo đạo văn mới nhất", value: `${dashboardStats.recentPlagiarismAlerts} sự kiện`, icon: ShieldAlert, color: "text-rose-600 bg-rose-50 border border-rose-100" }
  ];


  if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;

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
            {recentActivities.length === 0 ? (
               <div className="py-8 text-center text-slate-500 font-semibold text-sm">Chưa có hoạt động nộp bài nào gần đây</div>
            ) : recentActivities.map((act, i) => (
              <div key={i} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 text-sm">
                <div>
                  <span className="font-extrabold text-slate-800">{act.name}</span>
                  <span className="text-slate-500 font-medium"> ({act.cls}) </span>
                  <span className="text-slate-600 font-semibold">{act.msg ?? act.message}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{act.time ?? act.createdAt ? new Date(act.createdAt).toLocaleString() : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#f4f8ff] text-slate-700 p-6 rounded-2xl border border-[#dfeeff] shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Tóm tắt tiến độ chấm bài</h3>
            <div className="space-y-3.5 mt-2">
              <div className="py-4 text-center text-slate-500 font-semibold text-sm">Chưa có dữ liệu tiến độ chấm bài</div>
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