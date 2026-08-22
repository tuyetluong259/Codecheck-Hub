import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PlusCircle, Eye, Edit, Trash2, Calendar, FileText, ArrowRight } from "lucide-react";
import api from "../../api/axios";

export default function LecturerClassDetail() {
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setClassInfo(res.data);
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

  const classProblems = [
    { id: 1, title: "Bài tập 1: Triển khai Danh sách liên kết đơn", submissions: "45 / 45", deadline: "23:59 - 25/08/2026", active: true },
    { id: 2, title: "Bài tập 2: Thuật toán sắp xếp nhanh (QuickSort)", submissions: "42 / 45", deadline: "23:59 - 30/08/2026", active: true },
    { id: 3, title: "Bài tập 3: Cây nhị phân tìm kiếm cân bằng (AVL)", submissions: "12 / 45", deadline: "23:59 - 15/09/2026", active: true },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-[#edf5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#1d4ed8]">{classInfo.code}</span>
            <span className="text-xs font-bold text-[#1d4ed8]">Mã tham gia: {classInfo.code}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">{classInfo.name}</h1>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{classInfo.description || "Lớp học CodeCheck Hub"}</p>
        </div>
        <Link to="/lecturer/problems/create" className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">
          <PlusCircle className="h-4 w-4" />
          <span>Create New Assignment</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-800">Assignments</h3>
        </div>

        <div className="space-y-4">
          {classProblems.map((prob) => (
            <div key={prob.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-800">{prob.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> Hạn: {prob.deadline}</span>
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700"><FileText className="h-3.5 w-3.5" /> {prob.submissions} students</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/lecturer/grades" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                  <Eye className="h-4 w-4" />
                  <span>View Grades</span>
                </Link>
                <Link to={`/lecturer/problems/edit/${prob.id}`} className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600" title="Edit">
                  <Edit className="h-4 w-4" />
                </Link>
                <button className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}