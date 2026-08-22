import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  ShieldAlert,
  FileSpreadsheet,
  Search,
  ChevronDown,
  Eye,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import api from "../../api/axios";

export default function GradingAndAnalytics() {
  const [tab, setTab] = useState("gradebook");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [gradebook, setGradebook] = useState([]);
  const [plagiarismList, setPlagiarismList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses/lecturer');
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchCourseData = async () => {
      try {
        // Fetch problems for this course
        const probRes = await api.get(`/problems?courseId=${selectedCourseId}`);
        setProblems(probRes.data);
        if (probRes.data.length > 0) {
          setSelectedProblemId(probRes.data[0].id);
        } else {
          setSelectedProblemId("");
        }

        // Fetch course analytics
        const anaRes = await api.get(`/courses/${selectedCourseId}/analytics`);
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourseData();
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedProblemId) {
      setGradebook([]);
      setPlagiarismList([]);
      return;
    }
    const fetchProblemData = async () => {
      try {
        const [gradeRes, plagRes] = await Promise.all([
          api.get(`/submissions/problem/${selectedProblemId}/gradebook`),
          api.get(`/submissions/problem/${selectedProblemId}/suspicious`)
        ]);
        setGradebook(gradeRes.data);
        setPlagiarismList(plagRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblemData();
  }, [selectedProblemId]);

  const handlePenalize = async (id, action) => {
    try {
      await api.put(`/submissions/${id}/penalty?action=${action}`);
      alert(`Đã ${action === 'PENALIZE' ? 'phạt' : 'bỏ qua'} bài nộp thành công!`);
      // Refresh
      const plagRes = await api.get(`/submissions/problem/${selectedProblemId}/suspicious`);
      setPlagiarismList(plagRes.data);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const statusStyles = {
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    PENALIZED: "bg-rose-100 text-rose-700",
    COMPILE_ERROR: "bg-red-100 text-red-700",
    WRONG_ANSWER: "bg-orange-100 text-orange-700"
  };

  if (loading) return <div className="p-8 font-bold">Đang tải dữ liệu hệ thống...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Grading &amp; Analytics</h1>
          <div className="mt-4 flex gap-4">
            <select 
              value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
              className="rounded-xl border border-[#7db5ff] bg-white px-4 py-2 font-bold text-slate-700 focus:outline-none"
            >
              <option value="" disabled>-- Chọn Lớp Học --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
            </select>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Avg Subs / Problem</div>
          <div className="mt-2 text-3xl font-black text-slate-800">{analytics?.averageSubmissionsPerProblem || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Pass Rate</div>
          <div className="mt-2 text-3xl font-black text-slate-800">{analytics?.acceptanceRate || 0}%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Code Smells</div>
          <div className="mt-2 text-3xl font-black text-rose-600">{analytics?.totalCodeSmells || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Bugs</div>
          <div className="mt-2 text-3xl font-black text-red-600">{analytics?.totalBugs || 0}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 bg-[#f8fbff] pr-4">
          <div className="flex">
            <button onClick={() => setTab("gradebook")} className={`px-6 py-3 text-sm font-bold ${tab === "gradebook" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-slate-400"}`}>
              <span className="inline-flex items-center gap-2"><Table className="h-4 w-4" /> Gradebook</span>
            </button>
            <button onClick={() => setTab("plagiarism")} className={`px-6 py-3 text-sm font-bold ${tab === "plagiarism" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-slate-400"}`}>
              <span className="inline-flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Plagiarism Checker</span>
            </button>
            <button onClick={() => setTab("sonarqube")} className={`px-6 py-3 text-sm font-bold ${tab === "sonarqube" ? "border-b-2 border-[#1d4ed8] text-[#1d4ed8]" : "text-slate-400"}`}>
              <span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> SonarQube Analytics</span>
            </button>
          </div>
          <div className="py-2">
            <select 
              value={selectedProblemId} onChange={e => setSelectedProblemId(e.target.value)}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-800 focus:outline-none"
            >
              <option value="" disabled>-- Chọn Bài Tập --</option>
              {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        {tab === "gradebook" && (
          <div className="p-6">
            <table className="w-full border-collapse overflow-hidden rounded-xl border border-slate-200">
              <thead>
                <tr className="bg-[#f8fbff]">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Student ID</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Test Cases</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Score</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Plagiarism</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {gradebook.length === 0 ? <tr><td colSpan="6" className="p-4 text-center font-bold text-slate-400">Chưa có bài nộp nào cho bài tập này.</td></tr> : gradebook.map((sub, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/60">
                    <td className="p-4 text-sm font-bold text-[#1d4ed8]">{sub.studentId.substring(0, 8)}...</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] uppercase font-black ${statusStyles[sub.status] || "bg-slate-100 text-slate-700"}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{sub.passedTestCases || 0} / {sub.totalTestCases || 0}</td>
                    <td className="p-4 text-sm font-black text-emerald-600">{sub.score || 0}</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{sub.plagiarismScore || 0}%</td>
                    <td className="p-4 text-sm font-medium text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "plagiarism" && (
          <div className="p-6">
            <table className="w-full border-collapse overflow-hidden rounded-xl border border-slate-200">
              <thead>
                <tr className="bg-[#f8fbff]">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Suspect Student</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Matched Target</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Similarity</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {plagiarismList.length === 0 ? <tr><td colSpan="5" className="p-4 text-center font-bold text-slate-400">Mã nguồn trong sạch. Không phát hiện đạo văn!</td></tr> : plagiarismList.map((pair, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50/60">
                    <td className="p-4 text-sm font-bold text-slate-700">{pair.studentId.substring(0,8)}...</td>
                    <td className="p-4 text-sm font-bold text-slate-700">{pair.plagiarismMatchedSubmissionId || 'N/A'}</td>
                    <td className="p-4 text-sm font-black text-rose-600">{pair.plagiarismScore}%</td>
                    <td className="p-4">
                       <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${pair.status === 'PENALIZED' ? 'bg-rose-100 text-rose-700' : pair.status === 'EXCUSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                         {pair.status}
                       </span>
                    </td>
                    <td className="p-4 flex gap-2">
                       {pair.status !== 'PENALIZED' && pair.status !== 'EXCUSED' && (
                         <>
                           <button onClick={() => handlePenalize(pair.id, 'PENALIZE')} className="rounded bg-rose-500 px-3 py-1 text-xs font-bold text-white hover:bg-rose-600">Phạt (0đ)</button>
                           <button onClick={() => handlePenalize(pair.id, 'EXCUSE')} className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50">Bỏ qua</button>
                         </>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "sonarqube" && (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-[#f8fbff] p-5">
                <div className="text-xl font-black text-slate-800">Course Code Health</div>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between font-bold"><span>Total Smells:</span><span className="text-rose-600">{analytics?.totalCodeSmells || 0} issues</span></div>
                  <div className="flex justify-between font-bold"><span>Critical Bugs:</span><span className="text-red-600">{analytics?.totalBugs || 0} issues</span></div>
                  <div className="flex justify-between font-bold"><span>Vulnerabilities:</span><span className="text-orange-600">{analytics?.totalVulnerabilities || 0} issues</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}