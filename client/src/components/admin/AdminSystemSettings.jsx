import React, { useState } from "react";
import { Save, ShieldCheck, Database } from "lucide-react";

export default function AdminSystemSettings() {
  const [ssoClient, setSsoClient] = useState("google-oauth-client-id-12345");
  const [s3Bucket, setS3Bucket] = useState("codecheck-backups-s3");

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-slate-800">CÀI ĐẶT HỆ THỐNG TOÀN CỤC</h1>
        <p className="text-slate-500 text-sm mt-1">Tích hợp Single Sign-On (SSO) Google, sao lưu cơ sở dữ liệu S3 và cấu hình thông báo SMTP email</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            <span>Tích hợp Single Sign-On (SSO) Google Workspace</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OAuth Client ID</label>
            <input type="text" value={ssoClient} onChange={e => setSsoClient(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
            <Database className="h-5 w-5 text-indigo-500" />
            <span>Sao lưu tự động đám mây (Cloud S3 Bucket Backups)</span>
          </h3>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên AWS S3 Bucket Name</label>
            <input type="text" value={s3Bucket} onChange={e => setS3Bucket(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition uppercase tracking-wider">
            <Save className="h-4 w-4" />
            <span>Lưu cài đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
}