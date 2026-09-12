import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ClipboardList,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  Download,
} from "lucide-react";
import api from "../../api/axios";

export default function StudentClassDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [classProblems, setClassProblems] = useState([]);
  const [classMembers, setClassMembers] = useState([]);

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const [resInfo, resProbs, resMembers] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/problems/student/course/${id}`),
          api.get(`/courses/${id}/members`)
        ]);
        setClassInfo(resInfo.data?.data ?? resInfo.data);
        setClassProblems(resProbs.data?.data ?? resProbs.data ?? []);
        setClassMembers(resMembers.data?.data ?? resMembers.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetail();
  }, [id]);

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!classInfo) return <div className="p-8 text-rose-500 font-bold">Không tìm thấy thông tin lớp học</div>;


  return (
    <div className="p-8 space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-black px-2.5 py-1 bg-[#edf5ff] text-[#1d4ed8] rounded-md tracking-[0.12em] uppercase">{classInfo.code}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{classInfo.name}</h1>
        <p className="text-slate-500 text-sm max-w-4xl">{classInfo.description || "Lớp học CodeCheck Hub"}</p>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">
          Giảng viên phụ trách: <span className="text-slate-700">{classInfo?.teacherName ?? classInfo?.instructorName ?? 'Giảng viên'}</span>
        </p>
      </div>

      <div className="flex border-b border-slate-200 bg-[#f8fbff] rounded-t-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "overview" ? "border-[#1d4ed8] text-[#1d4ed8] bg-white" : "border-transparent text-slate-400"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Tổng quan</span>
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-6 py-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "assignments" ? "border-[#1d4ed8] text-[#1d4ed8] bg-white" : "border-transparent text-slate-400"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Assignments</span>
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "members" ? "border-[#1d4ed8] text-[#1d4ed8] bg-white" : "border-transparent text-slate-400"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Members</span>
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-800">Giới thiệu môn học</h3>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 whitespace-pre-wrap">
              {classInfo.syllabus || "Chưa có thông tin giới thiệu môn học."}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-800">Yêu cầu để qua môn</h3>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 whitespace-pre-wrap">
              {classInfo.passingCriteria || "Chưa có yêu cầu qua môn."}
            </div>
            {classInfo.passingCriteriaFile && (
              <div className="mt-4">
                <a href={classInfo.passingCriteriaFile} download="Yeu_cau_qua_mon.pdf" className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100">
                  <Download className="h-4 w-4" /> Tải file đính kèm (PDF)
                </a>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "assignments" ? (
        <div className="space-y-4">
          {classProblems.length === 0 ? (
             <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Không có bài tập nào</div>
          ) : classProblems.map((asm) => (
            <div key={asm.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${asm.difficulty === "EASY" || asm.difficulty === "Dễ" ? "bg-emerald-50 text-emerald-600" : asm.difficulty === "MEDIUM" || asm.difficulty === "Trung bình" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
                    {asm.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Hạn nộp: {asm.deadline || "Không có"}</span>
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">{asm.title}</h3>
              </div>

              <div className="flex items-center space-x-4">
                {asm.status === "ACCEPTED" ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-[0.12em]">Điểm</span>
                      <span className="text-sm font-black text-emerald-600">{asm.score ?? 100} / 100</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg uppercase">Đã nộp</span>
                  </div>
                ) : asm.status === "FAILED" ? (
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg uppercase">Làm sai</span>
                ) : asm.status === "PENDING" ? (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase">Đang chấm</span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg uppercase">Chưa làm</span>
                )}
                <Link
                  to={`/student/workspace/${asm.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs rounded-lg transition shadow-md shadow-blue-600/15"
                >
                  <span>{asm.status === "ACCEPTED" || asm.status === "FAILED" ? "Làm lại" : "Làm bài"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fbff] border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Họ và tên</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Vai trò</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">Địa chỉ Email</th>
              </tr>
            </thead>
            <tbody>
              {classMembers.length === 0 ? (
                 <tr><td colSpan="3" className="p-4 text-center text-slate-500">Chưa có thành viên nào</td></tr>
              ) : classMembers.map((member, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                  <td className="p-4 text-slate-800 font-extrabold">{member.fullName ?? member.name ?? member.username}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${member.role === "Trưởng nhóm" ? "bg-[#eaf3ff] text-[#1d4ed8]" : "bg-slate-100 text-slate-600"}`}>
                      {member.role ?? member.position ?? 'Thành viên'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{member.email ?? member.emailAddress ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}