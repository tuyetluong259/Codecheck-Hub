import React, { useState, useEffect } from "react";
import api from "../../api/axios";

export default function StudentExtensionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/courses/student/extensions');
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch extension requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <div className="p-8">Đang tải lịch sử...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800">My Requests</h1>
        <p className="mt-1 text-lg text-slate-500">History of your extension requests</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-slate-500 font-medium">Bạn chưa có yêu cầu gia hạn nào.</div>
        ) : requests.map((req) => (
          <div key={req.id} className="rounded-2xl border border-[#7db5ff] bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xl font-bold text-slate-800">Bài tập: {req.problemName}</div>
              <span className={`text-sm font-black px-3 py-1 rounded-full border ${
                req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                req.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-300' :
                'bg-amber-100 text-amber-700 border-amber-300'
              }`}>
                {req.status}
              </span>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              <span className="font-semibold">Lý do:</span> {req.reason}
            </div>
            <div className="text-sm text-slate-600 mb-2">
              <span className="font-semibold">Gia hạn đến:</span> {new Date(req.requestedDeadline).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-4">
              Đã gửi lúc: {new Date(req.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
