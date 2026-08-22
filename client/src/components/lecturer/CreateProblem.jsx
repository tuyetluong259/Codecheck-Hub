import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Clipboard, Settings2, ShieldCheck, ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";

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

  const [title, setTitle] = useState(isEdit ? "Valid Parentheses" : "");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [cpuLimit, setCpuLimit] = useState(1000);
  const [ramLimit, setRamLimit] = useState(256);
  const [complexity, setComplexity] = useState(15);
  const [varNaming, setVarNaming] = useState("camelCase");

  const [namingEnabled, setNamingEnabled] = useState(true);
  const [complexityEnabled, setComplexityEnabled] = useState(true);
  const [duplicationEnabled, setDuplicationEnabled] = useState(true);
  const [qualityGateEnabled, setQualityGateEnabled] = useState(true);
  const [duplicationPercent, setDuplicationPercent] = useState("10%");

  const handleSave = () => navigate("/lecturer/problems");

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-800">{isEdit ? "Edit Problem: Valid Parentheses" : "Create New Problem"}</h1>
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-[#7db5ff] bg-white px-5 py-2.5 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Cancel</button>
          <button className="rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-[#1e40af]">Publish</button>
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
                  <label className="text-sm font-bold text-slate-700">Problem Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter problem title" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Algorithm</label>
                <input placeholder="e.g. Stack, HashMap" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea rows={8} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the problem statement, constraints, and examples..." className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Input Format</label>
                  <input placeholder="Example: array of integers" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Output Format</label>
                  <input placeholder="Example: array of indices" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Constraints</label>
                <input placeholder="Example: 1 <= n <= 10^5" className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 focus:outline-none" />
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
                  <button className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">
                    <Plus className="h-4 w-4" /> Add Sample Case
                  </button>
                </div>

                {[
                  { label: "Sample Case #1", input: "Enter sample input data...", output: "Enter expected output..." },
                  { label: "Sample Case #2", input: "Enter sample input data...", output: "Enter expected output..." },
                ].map((caseItem, idx) => (
                  <div key={idx} className="space-y-3 rounded-xl border border-slate-200 bg-[#f8fbff] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-slate-700">{caseItem.label}</div>
                      <button className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="w-20 text-sm font-bold text-slate-700">Input:</label>
                        <input defaultValue={caseItem.input} className="flex-1 rounded-xl border border-[#7db5ff] bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="w-20 text-sm font-bold text-slate-700">Output:</label>
                        <input defaultValue={caseItem.output} className="flex-1 rounded-xl border border-[#7db5ff] bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-xl border border-dashed border-[#7db5ff] bg-[#f8fbff] p-6 text-center">
                <div className="text-xl font-bold text-slate-700">Hidden Test Cases</div>
                <button className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">
                  <Plus className="h-4 w-4" /> Add Test Case
                </button>
                <div className="mt-4 rounded-xl border border-dashed border-[#7db5ff] bg-white p-10 text-slate-500">
                  <div className="text-2xl font-bold">Drop Your Files Here</div>
                  <div className="mt-2 text-sm">Only files with extensions such as .in, .out, or .txt are accepted.</div>
                </div>
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