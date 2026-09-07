import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import api from "../../api/axios";

export default function LecturerNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifs(res.data?.data ?? res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleAction = async (id, accept) => {
    try {
      // If backend supports action endpoints, call them. Otherwise just optimistically update.
      // e.g., POST /notifications/{id}/action { action: 'accept' }
      // We'll optimistically update UI.
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: accept ? 'ACCEPTED' : 'REJECTED' } : n));
      // Try to notify backend (best-effort)
      await api.post(`/notifications/${id}/action`, { action: accept ? 'accept' : 'reject' }).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Đang tải thông báo...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-800">Notifications</h1>
        <p className="mt-1 text-lg text-slate-500">All alerts and requests requiring action</p>
      </div>

      <div className="space-y-4">
        {notifs.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No notifications.</div>
        ) : (
          notifs.map((notif) => (
            <div key={notif.id} className="rounded-2xl border border-[#7db5ff] bg-[#eef7ff] p-6 shadow-sm">
              <div className="mb-3 text-2xl font-black text-slate-800">{notif.type ?? notif.title}</div>
              <div className="text-base text-slate-700">{notif.message ?? notif.text}</div>

              {notif.type === "Extension Request" ? (
                <div className="mt-5 flex gap-3">
                  <button onClick={() => handleAction(notif.id, true)} className="rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-200">Approve</button>
                  <button onClick={() => handleAction(notif.id, false)} className="rounded-xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-200">Reject</button>
                </div>
              ) : (
                <div className="mt-5 flex items-center justify-between gap-4">
                  <button className="rounded-xl border border-[#7db5ff] bg-white px-4 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">{notif.action ?? 'View'}</button>
                  {notif.status === "PENDING" && notif.type !== "Assignment Closed" && (
                    <button className="rounded-xl border border-[#7db5ff] bg-white px-4 py-2 text-sm font-bold text-[#1d4ed8] hover:bg-[#eef5ff]">Review &amp; Compare Code</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}