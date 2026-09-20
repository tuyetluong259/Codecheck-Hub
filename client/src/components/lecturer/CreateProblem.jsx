import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Clipboard, Settings2, ShieldCheck, ChevronRight, ChevronLeft, Plus, Trash2, ArrowLeft } from "lucide-react";
import api from "../../api/axios";

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
        enabled ? "border-[#1d4ed8] bg-[#1d4ed8]" : "border-slate-300 bg-slate-200"
      }`}
      aria-label="Toggle"
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function CreateProblem({ isEdit = false }) {
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState(isEdit ? "Loading..." : "");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [algorithmTag, setAlgorithmTag] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  
  const [cpuLimit, setCpuLimit] = useState(1000);
  const [ramLimit, setRamLimit] = useState(256);
  const [complexity, setComplexity] = useState(15);
  const [varNaming, setVarNaming] = useState("camelCase");

  const [namingEnabled, setNamingEnabled] = useState(true);
  const [complexityEnabled, setComplexityEnabled] = useState(true);
  const [duplicationEnabled, setDuplicationEnabled] = useState(true);
  const [qualityGateEnabled, setQualityGateEnabled] = useState(true);
  const [duplicationPercent, setDuplicationPercent] = useState("10%");
  
  const [isPractice, setIsPractice] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Test Cases State
  const [testCases, setTestCases] = useState([
    { id: 1, label: "Sample Case #1", input: "", expectedOutput: "", isHidden: false, points: 10, orderIndex: 0 }
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await api.get('/courses/lecturer');
        setCourses(res.data);
        if (res.data.length > 0 && !isEdit) setCourseId(res.data[0].id);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit && id) {
      const fetchProblemDetails = async () => {
        try {
          const res = await api.get(`/problems/${id}`);
          const problem = res.data;
          
          setTitle(problem.title);
          setDescription(problem.description || "");
          setInputFormat(problem.inputFormat || "");
          setOutputFormat(problem.outputFormat || "");
          setConstraints(problem.constraints || "");
          setDifficulty(problem.difficulty);
          setCourseId(problem.courseId);
          setCpuLimit(problem.timeLimitMs);
          setRamLimit(problem.memoryLimitMb);
          setIsPractice(problem.isPractice);
          
          if (problem.maxCyclomaticComplexity != null) {
            setComplexityEnabled(true);
            setComplexity(problem.maxCyclomaticComplexity);
          } else {
            setComplexityEnabled(false);
          }

          if (problem.namingConvention != null) {
            setNamingEnabled(true);
            setVarNaming(problem.namingConvention);
          } else {
            setNamingEnabled(false);
          }

          // Fetch test cases
          const tcRes = await api.get(`/test-cases?problemId=${id}&isPublic=false`);
          const allCases = tcRes.data || [];
          
          const publicCases = allCases.filter(tc => !tc.isHidden).map((tc, index) => ({
            id: tc.id || Date.now() + Math.random(),
            label: `Sample Case #${index + 1}`,
            input: tc.input || "",
            expectedOutput: tc.expectedOutput || "",
            isHidden: false,
            points: tc.points || 10,
            orderIndex: tc.orderIndex || index
          }));
          
          const privateCases = allCases.filter(tc => tc.isHidden).map((tc, index) => ({
            id: tc.id || Date.now() + Math.random(),
            label: `Hidden Case #${index + 1}`,
            input: tc.input || "",
            expectedOutput: tc.expectedOutput || "",
            isHidden: true,
            points: tc.points || 10,
            orderIndex: tc.orderIndex || index
          }));

          if (publicCases.length > 0) setTestCases(publicCases);
          if (privateCases.length > 0) setHiddenTestCases(privateCases);
          
        } catch (err) {
          console.error("Failed to fetch problem details", err);
        }
      };
      fetchProblemDetails();
    }
  }, [isEdit, id]);

  const handleAddSampleCase = () => {
    const newId = Date.now();
    setTestCases([
      ...testCases,
      { id: newId, label: `Sample Case #${testCases.length + 1}`, input: "", expectedOutput: "", isHidden: false, points: 10, orderIndex: testCases.length }
    ]);
  };

  const handleAddHiddenCase = () => {
    const newId = Date.now();
    setHiddenTestCases([
      ...hiddenTestCases,
      { id: newId, label: `Hidden Case #${hiddenTestCases.length + 1}`, input: "", expectedOutput: "", isHidden: true, points: 10, orderIndex: hiddenTestCases.length }
    ]);
  };

  const updateTestCase = (id, field, value, isHidden) => {
    if (isHidden) {
      setHiddenTestCases(hiddenTestCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
    } else {
      setTestCases(testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
    }
  };

  const removeTestCase = (id, isHidden) => {
    if (isHidden) {
      setHiddenTestCases(hiddenTestCases.filter(tc => tc.id !== id));
    } else {
      setTestCases(testCases.filter(tc => tc.id !== id));
    }
  };

  const handleSave = async () => {
    if (!title || !courseId) return alert("Vui lòng nhập tiêu đề và chọn lớp học");
    try {
      const payload = {
        title,
        description,
        inputFormat,
        outputFormat,
        constraints,
        difficulty,
        courseId,
        timeLimitMs: parseInt(cpuLimit),
        memoryLimitMb: parseInt(ramLimit),
        maxCyclomaticComplexity: complexityEnabled ? parseInt(complexity) : null,
        namingConvention: namingEnabled ? varNaming : null,
        published: true,
        isPractice: isPractice,
        testCases: [
          ...testCases.map(t => ({ input: t.input, expectedOutput: t.expectedOutput, isHidden: false, points: t.points, orderIndex: t.orderIndex })),
          ...hiddenTestCases.map(t => ({ input: t.input, expectedOutput: t.expectedOutput, isHidden: true, points: t.points, orderIndex: t.orderIndex }))
        ].filter(t => t.input.trim() !== "" || t.expectedOutput.trim() !== "")
      };
      if (isEdit) {
        await api.put(`/problems/${id}`, payload);
      } else {
        await api.post('/problems', payload);
      }
      navigate("/lecturer/problems");
    } catch (err) {
      console.error(err);
      alert(isEdit ? "Cập nhật bài tập thất bại!" : "Tạo bài tập thất bại!");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition" title="Quay lại">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">{isEdit ? `Edit Problem: ${title !== "Loading..." ? title : ""}` : "Create New Problem"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/lecturer/problems")} className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">Publish</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-200 bg-[#f8fbff]">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-6 py-3 text-sm font-bold transition ${activeTab === 1 ? "border-b-2 border-[#1d4ed8] bg-white text-[#1d4ed8]" : "border-b-2 border-transparent text-slate-400"}`}
          >
            <span className="inline-flex items-center gap-2"><Clipboard className="h-4 w-4" /> Problem Statement</span>
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-6 py-3 text-sm font-bold transition ${activeTab === 2 ? "border-b-2 border-[#1d4ed8] bg-white text-[#1d4ed8]" : "border-b-2 border-transparent text-slate-400"}`}
          >
            <span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4" /> Test Cases &amp; Constraints</span>
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`px-6 py-3 text-sm font-bold transition ${activeTab === 3 ? "border-b-2 border-[#1d4ed8] bg-white text-[#1d4ed8]" : "border-b-2 border-transparent text-slate-400"}`}
          >
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Clean Code Rules</span>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Class (Lớp học)</label>
                  <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none">
                    {loadingCourses ? <option>Đang tải...</option> : courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Problem Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter problem title" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Algorithm (Tag)</label>
                  <input value={algorithmTag} onChange={e => setAlgorithmTag(e.target.value)} placeholder="e.g. Stack, HashMap" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea rows={8} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the problem statement, constraints, and examples..." className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Input Format</label>
                  <input value={inputFormat} onChange={e => setInputFormat(e.target.value)} placeholder="Example: array of integers" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Output Format</label>
                  <input value={outputFormat} onChange={e => setOutputFormat(e.target.value)} placeholder="Example: array of indices" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Constraints</label>
                <input value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="Example: 1 <= n <= 10^5" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Time Limit (ms)</label>
                  <input type="number" value={cpuLimit} onChange={e => setCpuLimit(e.target.value)} className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Memory Limit (MB)</label>
                  <input type="number" value={ramLimit} onChange={e => setRamLimit(e.target.value)} className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tight text-slate-800">Sample Test Cases</h3>
                  <button onClick={handleAddSampleCase} className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">
                    <Plus className="h-4 w-4" /> Add Sample Case
                  </button>
                </div>

                {testCases.map((caseItem, idx) => (
                  <div key={caseItem.id} className="space-y-3 rounded-xl border border-slate-200 bg-[#f8fbff] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-slate-700">{caseItem.label}</div>
                      <button onClick={() => removeTestCase(caseItem.id, false)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="w-20 text-sm font-bold text-slate-700">Input:</label>
                        <input value={caseItem.input} onChange={e => updateTestCase(caseItem.id, 'input', e.target.value, false)} placeholder="Enter sample input data..." className="flex-1 rounded-xl border border-[#7db5ff] bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="w-20 text-sm font-bold text-slate-700">Output:</label>
                        <input value={caseItem.expectedOutput} onChange={e => updateTestCase(caseItem.id, 'expectedOutput', e.target.value, false)} placeholder="Enter expected output..." className="flex-1 rounded-xl border border-[#7db5ff] bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tight text-slate-800">Hidden Test Cases</h3>
                  <button onClick={handleAddHiddenCase} className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">
                    <Plus className="h-4 w-4" /> Add Hidden Case
                  </button>
                </div>

                {hiddenTestCases.map((caseItem, idx) => (
                  <div key={caseItem.id} className="space-y-3 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-slate-700">{caseItem.label}</div>
                      <button onClick={() => removeTestCase(caseItem.id, true)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="w-20 text-sm font-bold text-slate-700">Input:</label>
                        <input value={caseItem.input} onChange={e => updateTestCase(caseItem.id, 'input', e.target.value, true)} placeholder="Hidden input..." className="flex-1 rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="w-20 text-sm font-bold text-slate-700">Output:</label>
                        <input value={caseItem.expectedOutput} onChange={e => updateTestCase(caseItem.id, 'expectedOutput', e.target.value, true)} placeholder="Expected hidden output..." className="flex-1 rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {hiddenTestCases.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#7db5ff] bg-white p-10 text-center text-slate-500">
                    <div className="text-lg font-bold">No hidden test cases yet</div>
                    <div className="mt-1 text-sm">Click "Add Hidden Case" to create one.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-slate-800">Rules &amp; Thresholds:</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-xl font-bold text-slate-700">Naming Conventions</div>
                    <div className="text-sm text-slate-500">Enforce naming styles (camelCase, PascalCase, snake_case)</div>
                  </div>
                  <Toggle enabled={namingEnabled} onChange={() => setNamingEnabled(!namingEnabled)} />
                </div>

                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-xl font-bold text-slate-700">Cognitive Complexity</div>
                    <div className="text-sm text-slate-500">Max allowed complexity score per function (max 10):</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Toggle enabled={complexityEnabled} onChange={() => setComplexityEnabled(!complexityEnabled)} />
                    <div className="w-32 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-2 w-2/3 bg-[#1d4ed8]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-xl font-bold text-slate-700">Code Duplication</div>
                    <div className="text-sm text-slate-500">Maximum allowed code duplication rate:</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Toggle enabled={duplicationEnabled} onChange={() => setDuplicationEnabled(!duplicationEnabled)} />
                    <select value={duplicationPercent} onChange={e => setDuplicationPercent(e.target.value)} className="w-24 rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none">
                      <option value="10%">10%</option>
                      <option value="15%">15%</option>
                      <option value="20%">20%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-xl font-bold text-slate-700">Practice Mode (Luyện tập)</div>
                    <div className="text-sm text-slate-500">Cho phép sinh viên làm lại bài nhiều lần sau khi đã nộp.</div>
                  </div>
                  <Toggle enabled={isPractice} onChange={() => setIsPractice(!isPractice)} />
                </div>

                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-xl font-bold text-slate-700">Quality Gate Thresholds (Bugs &amp; Code Smells)</div>
                    <div className="text-sm text-slate-500">Maximum allowed code duplication rate:</div>
                  </div>
                  <Toggle enabled={qualityGateEnabled} onChange={() => setQualityGateEnabled(!qualityGateEnabled)} />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#f7fbff] px-4 py-3 text-base font-medium text-slate-700">
                    <input type="checkbox" className="h-4 w-4 accent-[#1d4ed8]" defaultChecked />
                    <span>Block Critical / Blocker Bugs</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#f7fbff] px-4 py-3 text-base font-medium text-slate-700">
                    <input type="checkbox" className="h-4 w-4 accent-[#1d4ed8]" defaultChecked />
                    <span>Flag Unused Variables &amp; Dead Code</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button disabled={activeTab === 1} onClick={() => setActiveTab(prev => prev - 1)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {activeTab < 3 ? (
          <button onClick={() => setActiveTab(prev => prev + 1)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1e40af]">
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 rounded-xl bg-[#28a745] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1f8f3b]">
            <Save className="h-4 w-4" /> {isEdit ? "Update Problem" : "Publish"}
          </button>
        )}
      </div>
    </div>
  );
}