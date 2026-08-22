import React, { useState } from "react";
import { Check, X } from "lucide-react";

export default function LecturerNotifications() {
  const [notifs, setNotifs] = useState([
    { id: 1, type: "Plagiarism Alert", text: "Phát hiện 2 bài làm có độ tương đồng 94% ở bài 'Valid Parentheses' sinh viên: Nguyễn Văn A (#1032) vs Trần Văn B (#1045)", action: "Review & Compare Code", status: "PENDING" },
    { id: 2, type: "Extension Request", text: "Sinh viên: Nguyễn Văn A (MSSV: 06732301) lý do: 'Em bị sự cố máy tính, xin gia hạn nộp bài Two Sum thêm 24h.'", action: "Approve / Reject", status: "PENDING" },
    { id: 3, type: "Assignment Closed", text: "Bài tập 'Two Sum (#1002)' đã kết thúc thời gian nộp bài. Tổng kết: 185/200 sinh viên đã hoàn thành (Tỷ lệ: 92.5%).", action: "View Gradebook", status: "PENDING" },
  ]);

  const handleAction = (id, accept) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, status: accept ? "ACCEPTED" : "REJECTED" } : n));
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800">Notifications</h1>
        <p className="mt-1 text-lg text-slate-500">All alerts and requests requiring action</p>
      </div>

      <div className="space-y-4">
        {notifs.map((notif) => (
          <div key={notif.id} className="rounded-2xl border border-[#7db5ff] bg-[#eef7ff] p-6 shadow-sm">
            <div className="mb-3 text-2xl font-black text-slate-800">{notif.type}</div>
            <div className="text-base text-slate-700">{notif.text}</div>

            {notif.type === "Extension Request" ? (
              <div className="mt-5 flex gap-3">
                <button onClick={() => handleAction(notif.id, true)} className="rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-200">Approve</button>
                <button onClick={() => handleAction(notif.id, false)} className="rounded-xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-200">Reject</button>
              </div>
            ) : (
              <div className="mt-5 flex items-center justify-between gap-4">
                <button className="rounded-xl border border-[#7db5ff] bg-white px-4 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">{notif.action}</button>
                {notif.status === "PENDING" && notif.type !== "Assignment Closed" && (
                  <button className="rounded-xl border border-[#7db5ff] bg-white px-4 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Review &amp; Compare Code</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}