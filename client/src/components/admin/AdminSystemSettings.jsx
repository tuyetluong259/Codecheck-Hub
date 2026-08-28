import React, { useState, useEffect } from "react";
import { Save, ShieldCheck, Database, Server } from "lucide-react";
import api from "../../api/axios";

export default function AdminSystemSettings() {
  const [ssoClient, setSsoClient] = useState("");
  const [s3Bucket, setS3Bucket] = useState("");
  const [maxUploadSize, setMaxUploadSize] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      const configs = res.data.data || [];
      const ssoConfig = configs.find(c => c.configKey === 'SSO_CLIENT_ID');
      const s3Config = configs.find(c => c.configKey === 'S3_BUCKET_NAME');
      const maxUploadConfig = configs.find(c => c.configKey === 'MAX_UPLOAD_SIZE_MB');
      
      if (ssoConfig) setSsoClient(ssoConfig.configValue);
      if (s3Config) setS3Bucket(s3Config.configValue);
      if (maxUploadConfig) setMaxUploadSize(maxUploadConfig.configValue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', {
        SSO_CLIENT_ID: ssoClient,
        S3_BUCKET_NAME: s3Bucket,
        MAX_UPLOAD_SIZE_MB: maxUploadSize
      });
      alert("Đã lưu cài đặt thành công!");
    } catch (err) {
      alert("Lỗi khi lưu cài đặt!");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Đang tải cấu hình...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-800">CÀI ĐẶT HỆ THỐNG TOÀN CỤC</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý cấu hình Single Sign-On (SSO) Google, lưu trữ đám mây S3 và giới hạn hệ thống</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6 relative">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            <span>Tích hợp Single Sign-On (SSO) Google Workspace</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OAuth Client ID</label>
            <input type="text" value={ssoClient} onChange={e => setSsoClient(e.target.value)} placeholder="VD: 12345-abcde.apps.googleusercontent.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none" />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-500" />
            <span>Sao lưu tự động đám mây (Cloud S3 Bucket)</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tên AWS S3 Bucket Name</label>
            <input type="text" value={s3Bucket} onChange={e => setS3Bucket(e.target.value)} placeholder="VD: codecheckhub-backups" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none" />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
            <Server className="h-5 w-5 text-indigo-500" />
            <span>Giới hạn tài nguyên hệ thống</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dung lượng upload tối đa (MB)</label>
            <input type="number" value={maxUploadSize} onChange={e => setMaxUploadSize(e.target.value)} placeholder="VD: 50" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none" />
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition">
            <Save className="h-5 w-5" />
            <span>LƯU CÀI ĐẶT</span>
          </button>
        </div>
      </div>
    </div>
  );
}