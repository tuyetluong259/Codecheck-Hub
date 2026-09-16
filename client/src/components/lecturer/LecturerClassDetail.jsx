import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Eye, Edit, Trash2, Calendar, FileText, Upload, Download, Settings, Users, FileSpreadsheet, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import * as XLSX from "xlsx";

export default function LecturerClassDetail() {
  const { id } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [classProblems, setClassProblems] = useState([]);
  const [classMembers, setClassMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    name: "",
    description: "",
    syllabus: "",
    passingCriteria: "",
    passingCriteriaFile: "",
    allowJoinByCode: false
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Form state for member import
  const [importing, setImporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resInfo, resProbs, resMembers] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/problems?courseId=${id}`),
        api.get(`/courses/${id}/members`).catch(() => ({ data: [] }))
      ]);
      setClassInfo(resInfo.data);
      setSettings({
        name: resInfo.data.name || "",
        description: resInfo.data.description || "",
        syllabus: resInfo.data.syllabus || "",
        passingCriteria: resInfo.data.passingCriteria || "",
        passingCriteriaFile: resInfo.data.passingCriteriaFile || "",
        allowJoinByCode: resInfo.data.allowJoinByCode || false
      });
      setClassProblems(resProbs.data);
      setClassMembers(resMembers.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, passingCriteriaFile: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await api.put(`/courses/${id}`, settings);
      alert("Đã lưu thông tin lớp học!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lưu.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImportMembers = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImporting(true);
      const res = await api.post(`/courses/${id}/import-members`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(res.data.message || `Đã import ${res.data.data} sinh viên.`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi import sinh viên.");
    } finally {
      setImporting(false);
      e.target.value = null; // reset file input
    }
  };

  const handleExportGradebook = async () => {
    try {
      // For each member and each problem, fetch the grade
      // (This should ideally be an optimized backend endpoint, but here's the logic)
      let matrix = [];
      
      // We will try to fetch submission for each problem
      // A better way is to fetch gradebook endpoint if it returned data for all problems.
      // Assuming GET /api/submissions/courses/{id}/gradebook exists (it's actually per problem in the backend)
      // So let's build columns based on members, and rows based on problems or vice versa
      const dataRows = [];
      for (const member of classMembers) {
        let totalScore = 0;
        const row = {
          "MSSV": member.studentId,
          "Họ tên": member.fullName,
          "Lớp": member.className || "",
        };
        // In a real app we'd fetch grades here or backend returns a complete matrix
        // We will leave the problem scores empty as placeholder if backend doesn't provide them
        for (const prob of classProblems) {
            row[prob.title] = 0; // Placeholder
        }
        row["Tổng điểm"] = totalScore;
        dataRows.push(row);
      }

      const ws = XLSX.utils.json_to_sheet(dataRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Gradebook");
      
      const dateStr = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `Bang_Diem_Lop_${classInfo.code}_${dateStr}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Lỗi xuất ma trận điểm.");
    }
  };

  if (loading) return <div className="p-8">Đang tải thông tin...</div>;
  if (!classInfo) return <div className="p-8">Lớp học không tồn tại!</div>;

  return (
    <div className="p-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-bold text-sm">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800">{classInfo.name} ({classInfo.code})</h1>
        <p className="mt-1 text-lg text-slate-500">{classInfo.description}</p>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition mr-2" title="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="rounded-md bg-[#edf5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#1d4ed8]">{classInfo.code}</span>
            <span className="text-xs font-bold text-slate-500">Giảng viên: <span className="text-slate-800">{classInfo.teacherName}</span></span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">{classInfo.name}</h1>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{classInfo.description}</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab("overview")} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'overview' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Tổng quan</button>
        <button onClick={() => setActiveTab("members")} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'members' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Thành viên</button>
        <button onClick={() => setActiveTab("assignments")} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'assignments' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Bài tập</button>
        <button onClick={() => setActiveTab("gradebook")} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'gradebook' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Ma trận điểm</button>
        <button onClick={() => setActiveTab("settings")} className={`px-4 py-3 text-sm font-bold border-b-2 ${activeTab === 'settings' ? 'border-[#1d4ed8] text-[#1d4ed8]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Cài đặt</button>
      </div>

      {activeTab === "overview" && (
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
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800">Cài đặt lớp học</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tên lớp</label>
                <input type="text" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#1d4ed8] focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Mô tả ngắn gọn</label>
                <input type="text" value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#1d4ed8] focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giới thiệu môn học (Syllabus)</label>
                <textarea rows="5" value={settings.syllabus} onChange={e => setSettings({...settings, syllabus: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#1d4ed8] focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Yêu cầu qua môn</label>
                <textarea rows="3" value={settings.passingCriteria} onChange={e => setSettings({...settings, passingCriteria: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#1d4ed8] focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">File đính kèm (Yêu cầu qua môn)</label>
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {settings.passingCriteriaFile && <span className="text-xs text-emerald-600 font-semibold mt-2 inline-block">Đã đính kèm 1 file PDF.</span>}
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="allowJoin" checked={settings.allowJoinByCode} onChange={e => setSettings({...settings, allowJoinByCode: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-[#1d4ed8] focus:ring-[#1d4ed8]" />
                <label htmlFor="allowJoin" className="text-sm font-semibold text-slate-700">Cho phép sinh viên tham gia bằng mã lớp học ({classInfo.code})</label>
              </div>
              <button onClick={handleSaveSettings} disabled={savingSettings} className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#1e40af] disabled:opacity-50">
                {savingSettings ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800">Danh sách sinh viên ({classMembers.length})</h3>
            <div className="flex items-center gap-3">
              <input type="file" id="importFile" accept=".csv, .xlsx" className="hidden" onChange={handleImportMembers} />
              <label htmlFor="importFile" className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700">
                <Upload className="h-4 w-4" />
                <span>{importing ? "Đang import..." : "Import từ Excel/CSV"}</span>
              </label>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-black">
                <tr>
                  <th className="px-6 py-4">STT</th>
                  <th className="px-6 py-4">MSSV</th>
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Lớp SH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold">
                {classMembers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Chưa có thành viên nào. Hãy import danh sách.</td>
                  </tr>
                ) : (
                  classMembers.map((member, idx) => (
                    <tr key={member.studentId || idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4">{idx + 1}</td>
                      <td className="px-6 py-4">{member.studentId}</td>
                      <td className="px-6 py-4">{member.fullName}</td>
                      <td className="px-6 py-4">{member.className || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800">Bài tập</h3>
            <Link to={`/lecturer/problems/create?courseId=${id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#1e40af]">
              <PlusCircle className="h-4 w-4" />
              <span>Tạo bài tập</span>
            </Link>
          </div>
          <div className="space-y-4">
            {classProblems.map((prob) => (
              <div key={prob.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-800">{prob.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700"><FileText className="h-3.5 w-3.5" /> Mức độ: {prob.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/lecturer/problems/edit/${prob.id}`} className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600" title="Edit">
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "gradebook" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800">Ma trận điểm</h3>
            <button onClick={handleExportGradebook} className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-[#1e40af]">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-2">Tính năng đang trong quá trình tích hợp dữ liệu</h3>
            <p className="text-sm font-semibold text-slate-500">Nhấn nút Xuất Excel để tải template ma trận điểm cho lớp.</p>
          </div>
        </div>
      )}

    </div>
  );
}