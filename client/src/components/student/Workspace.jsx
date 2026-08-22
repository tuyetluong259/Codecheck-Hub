import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { Play, Send, Terminal } from "lucide-react";
import api from "../../api/axios";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function Workspace() {
  const { id } = useParams();
  const [language, setLanguage] = useState("JAVA");
  const [code, setCode] = useState("// Viết mã nguồn của bạn ở đây...\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}");
  const [consoleOutput, setConsoleOutput] = useState("Chưa có kết quả biên dịch. Hãy bấm nút Chạy thử hoặc Nộp bài.");
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        console.error("Failed to fetch problem", err);
      }
    };
    if (id) fetchProblem();
  }, [id]);

  const { sendMessage } = useWebSocket("/submission-results", (message) => {
    setLoading(false);
    if (message.status === "COMPLETED") {
      setConsoleOutput(`[SUCCESS] Pass ${message.passedCases}/${message.totalCases} Test cases!\nRAM tiêu thụ: ${message.memoryConsumed}MB | Thời gian thực thi: ${message.executionTime}ms\nĐiểm đánh giá Clean Code SonarQube: ${message.sonarScore}/100.`);
    } else {
      setConsoleOutput(`[COMPILE ERROR] Lỗi biên dịch: ${message.errorDetails}`);
    }
  });

  const handleSubmit = async (isSubmit) => {
    setLoading(true);
    setConsoleOutput("Đang gửi code lên hàng đợi RabbitMQ... Chờ Docker Sandbox thực thi...");
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const payload = {
        problemId: id,
        studentId: user?.id,
        code,
        language,
        timeLimitMs: problem?.timeLimitMs || 2000,
        memoryLimitMb: problem?.memoryLimitMb || 256,
        testCases: []
      };
      // In a real scenario test cases would be fetched securely from backend
      await api.post("/submissions", payload);
      setConsoleOutput("Đã đưa vào hàng đợi. Vui lòng chờ kết quả Real-time từ WebSocket...");
    } catch (err) {
      setLoading(false);
      setConsoleOutput("Gửi bài làm lỗi. Thử lại sau!");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#f5f7fb] text-slate-700 overflow-hidden">
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-black tracking-[0.12em] uppercase text-[#1d4ed8]">Không gian lập trình</span>
          <select 
            value={language} onChange={e => setLanguage(e.target.value)}
            className="bg-[#f8fbff] border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="JAVA">Java 17</option>
            <option value="PYTHON">Python 3.12</option>
            <option value="CPP">C++ 17</option>
          </select>
        </div>
        <div className="flex space-x-3">
          <button 
            disabled={loading} onClick={() => handleSubmit(false)}
            className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded transition flex items-center space-x-1.5 text-slate-700"
          >
            <Play className="h-3.5 w-3.5 text-slate-500" />
            <span>Chạy thử</span>
          </button>
          <button 
            disabled={loading} onClick={() => handleSubmit(true)}
            className="px-4 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs rounded transition flex items-center space-x-1.5 shadow"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{loading ? "Đang chấm..." : "Nộp bài làm"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-4 bg-white p-6 overflow-y-auto border-r border-slate-200 space-y-4">
          <h2 className="text-lg font-black text-slate-800">{problem ? problem.title : "Đang tải..."}</h2>
          {problem && (
            <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded uppercase ${problem.difficulty === 'HARD' ? 'bg-rose-100 text-rose-700' : problem.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {problem.difficulty}
            </span>
          )}
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
            {problem ? problem.description : ""}
          </p>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          <div className="flex-1 relative border-b border-slate-200">
            <MonacoEditor 
              height="100%" language={language.toLowerCase()} theme="vs-dark" value={code} onChange={setCode}
              options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
            />
          </div>
          <div className="h-44 bg-slate-950 flex flex-col overflow-hidden">
            <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
              <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center space-x-1.5">
                <Terminal className="h-3.5 w-3.5" />
                <span>Console kết quả chạy</span>
              </span>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap">
              {consoleOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}