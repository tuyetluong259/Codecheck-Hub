import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Check, ChevronRight } from "lucide-react";

export default function CodeComparison() {
  const [decision, setDecision] = useState("FLAG");
  const [comment, setComment] = useState("Hai bài làm trùng khớp 94% cấu trúc thuật toán Stack, chỉ thay đổi tên biến 'st' thành 'stack'. 0 điểm.");
  const navigate = useNavigate();

  const handleSave = () => navigate("/lecturer/grades");

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/lecturer/grades" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800">Code Comparison (Plagiarism)</h1>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="text-2xl font-black text-slate-800">Problem Title: Valid Parentheses (#T031)</div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8fbff] px-4 py-3">
          <div className="inline-flex items-center gap-3 text-xl font-bold text-slate-700">
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-[#1d4ed8]">Sync Scroll <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1d4ed8] text-[10px] text-white">●</span></span>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-[#1d4ed8]">
              <ChevronLeft className="h-4 w-4" /> Prev Diff
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#7db5ff] bg-white px-3 py-2 text-[#1d4ed8]">
              Next Diff <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <div className="border-r border-slate-200">
            <div className="border-b border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm font-black text-slate-700">Student A: Nguyễn Văn A (#1032) <span className="text-slate-500">Submitted: 14:12, 10/8</span></div>
            <pre className="min-h-[360px] overflow-auto bg-white p-4 font-mono text-[13px] leading-6 text-slate-700 whitespace-pre-wrap">{`public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if ((c == ')' && top != '(') || ... ) return false;
        }
    }
    return stack.isEmpty();
}`}</pre>
          </div>
          <div>
            <div className="border-b border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm font-black text-slate-700">Student B: Trần Văn B (#1045) <span className="text-slate-500">Submitted: 14:22, 10/8</span></div>
            <pre className="min-h-[360px] overflow-auto bg-white p-4 font-mono text-[13px] leading-6 text-slate-700 whitespace-pre-wrap">{`public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if ((c == ')' && top != '(') || ... ) return false;
        }
    }
    return stack.isEmpty();
}`}</pre>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-xl font-black uppercase tracking-[0.12em] text-red-600">Instructor Decision Panel</div>

        <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-lg font-bold text-red-700">
          <input type="checkbox" className="h-4 w-4 accent-red-600" checked readOnly />
          <span>Flag as Plagiarism (Assign 0 points &amp; Record violation)</span>
        </label>

        <label className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-lg font-medium text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-[#1d4ed8]" />
          <span>Dismss Warning (Ignore warning, keep score unchanged)</span>
        </label>

        <label className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-lg font-medium text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-[#1d4ed8]" />
          <span>Request Clarification (Send a notification requiring students to provide an explanation)</span>
        </label>

        <div className="mt-6">
          <div className="mb-2 text-lg font-bold text-slate-700">Note / Message for students:</div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full rounded-xl border border-[#7db5ff] bg-[#f8fbff] px-4 py-3 text-lg text-slate-700 focus:outline-none" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-[#1d4ed8] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e40af]">Save Decision</button>
        </div>
      </div>
    </div>
  );
}