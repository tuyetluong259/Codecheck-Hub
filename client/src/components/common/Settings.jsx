import React from 'react';
import { Bell, Shield, Moon, Monitor, Key } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">CÀI ĐẶT HỆ THỐNG</h1>
        <p className="text-slate-500 text-sm mt-1">Tùy chỉnh các thiết lập cá nhân và giao diện</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#eaf3ff] text-[#1d4ed8] rounded-xl font-bold transition">
            <Monitor className="h-5 w-5" /> Giao diện & Hiển thị
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white/60 rounded-xl font-bold transition">
            <Bell className="h-5 w-5" /> Thông báo
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white/60 rounded-xl font-bold transition">
            <Shield className="h-5 w-5" /> Quyền riêng tư
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-white/60 rounded-xl font-bold transition">
            <Key className="h-5 w-5" /> Xác thực 2 bước
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-800 border-b border-slate-100 pb-4">
              Tùy chỉnh giao diện
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700">Chế độ tối (Dark Mode)</h4>
                  <p className="text-sm text-slate-500">Giảm độ chói và tiết kiệm pin</p>
                </div>
                <button className="w-12 h-6 bg-slate-200 rounded-full relative transition">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow"></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700">Ngôn ngữ</h4>
                  <p className="text-sm text-slate-500">Chọn ngôn ngữ hiển thị cho hệ thống</p>
                </div>
                <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-white">
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button className="rounded-xl bg-[#1d4ed8] px-5 py-2 text-sm font-bold text-white hover:bg-[#1e40af] transition">
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
