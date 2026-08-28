import React, { useState, useEffect, useRef } from "react";
import { Search, ArrowDown, Edit2, Trash2, X } from "lucide-react";
import api from "../../api/axios";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", fullName: "", role: "STUDENT", password: "" });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      // res.data is ApiResponse, res.data.data is the list
      setUsers(res.data.data || []);
    } catch (err) {
      setError("Không thể tải danh sách người dùng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/users/${id}/status`);
      fetchUsers(); // reload list
    } catch (err) {
      alert("Lỗi khi thay đổi trạng thái!");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(); // reload list
    } catch (err) {
      alert("Lỗi khi xóa người dùng!");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      setShowCreateModal(false);
      setNewUser({ username: "", email: "", fullName: "", role: "STUDENT", password: "" });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo người dùng!");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post('/users/import', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(`Đã import thành công ${res.data.data} người dùng!`);
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi import file!");
    } finally {
      e.target.value = null; // reset input
    }
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) return alert("Không có dữ liệu để export!");
    const csvHeader = "ID,Tên Đăng Nhập,Họ và Tên,Email,Role,Status\n";
    const csvContent = filteredUsers.map(u => 
      `${u.id},${u.username},"${u.fullName}",${u.email},${u.role},${u.active ? 'Active' : 'Banned'}`
    ).join("\n");
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "danh_sach_users.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                        (u.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                        (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u.active : !u.active);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="p-8 space-y-8 relative">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Quản lý Người Dùng</h1>
          <p className="mt-2 text-lg text-slate-500">Quản lý tài khoản, phân quyền, import/export dữ liệu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button onClick={() => {setRoleFilter("ALL"); setStatusFilter("ALL");}} className={`rounded-2xl border ${roleFilter==="ALL" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>Tổng số ({users.length})</button>
        <button onClick={() => setRoleFilter("LECTURER")} className={`rounded-2xl border ${roleFilter==="LECTURER" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>Giảng viên ({users.filter(u=>u.role==="LECTURER").length})</button>
        <button onClick={() => setRoleFilter("STUDENT")} className={`rounded-2xl border ${roleFilter==="STUDENT" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>Sinh viên ({users.filter(u=>u.role==="STUDENT").length})</button>
        <button onClick={() => setRoleFilter("ADMIN")} className={`rounded-2xl border ${roleFilter==="ADMIN" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"} px-4 py-4 text-left text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50`}>Quản trị viên ({users.filter(u=>u.role==="ADMIN").length})</button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input type="file" accept=".csv, .xlsx" className="hidden" ref={fileInputRef} onChange={handleImport} />
        <button onClick={() => fileInputRef.current.click()} className="rounded-xl border border-[#7db5ff] bg-white px-6 py-3 text-base font-bold text-[#1d4ed8] transition hover:bg-[#eef5ff]">Import CSV / Excel</button>
        <button onClick={handleExport} className="rounded-xl border border-[#7db5ff] bg-white px-6 py-3 text-base font-bold text-[#1d4ed8] transition hover:bg-[#eef5ff]">Export User List</button>
        <button onClick={() => setShowCreateModal(true)} className="ml-auto rounded-xl bg-[#1d4ed8] px-6 py-3 text-base font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-[#1e40af]">Tạo Mới User</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-[#f8fbff] p-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên, Username hoặc Email..." 
              className="w-full rounded-xl border border-[#7db5ff] bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#85c0ff]" 
            />
          </div>
          
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none">
            <option value="ALL">Tất cả Role</option>
            <option value="STUDENT">Sinh viên</option>
            <option value="LECTURER">Giảng viên</option>
            <option value="ADMIN">Admin</option>
          </select>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none">
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="BANNED">Đã khóa (Banned)</option>
          </select>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#f8fbff] shadow-sm">
              <tr className="border-b border-slate-200">
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Người dùng</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Vai trò</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Username</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Trạng thái</th>
                <th className="p-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Đang tải...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Không tìm thấy người dùng nào.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                    <td className="p-4 text-sm font-bold text-slate-700">
                      {u.fullName}
                      <div className="mt-1 text-xs font-medium text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">{u.role}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{u.username}</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${u.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {u.active ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleStatus(u.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                          {u.active ? "Khóa" : "Mở khóa"}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700" title="Xóa người dùng">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 mb-6">Tạo Người Dùng Mới</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên đăng nhập</label>
                <input required value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="nguyenvana" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
                <input required value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" required value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="email@ut.edu.vn" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Vai trò</label>
                <select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition">
                  <option value="STUDENT">Sinh viên</option>
                  <option value="LECTURER">Giảng viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input required type="password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full mt-6 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white transition hover:bg-blue-700">Xác nhận tạo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}