"use client";
import { useEffect, useState } from "react";
import { getUsers, updateUser, resetPassword, createUser, deleteUser } from "@/lib/api";

const EMPTY_FORM = {
  username: "",
  phone: "",
  email: "",
  full_name: "",
  role: "manager",
  password: "",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      phone: user.phone || "",
      email: user.email || "",
      full_name: user.full_name || "",
      role: user.role,
      password: "", // Пароль не предзаполняем
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        // Редактирование
        const updateData: any = {
            full_name: form.full_name,
            email: form.email,
            role: form.role,
        };
        // Телефон обновляем только если он есть (нормализованный)
        if (form.phone) updateData.phone = form.phone;
        // Пароль только если введен
        if (form.password) updateData.password = form.password;

        await updateUser(editingUser.id, updateData);
      } else {
        // Создание
        await createUser(form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert("Ошибка при смене роли: " + err.message);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPass = prompt("Введите новый пароль для пользователя:");
    if (!newPass) return;
    try {
      await resetPassword(userId, newPass);
      alert("Пароль успешно изменен!");
    } catch (err: any) {
      alert("Ошибка при сбросе пароля: " + err.message);
    }
  };

  const toggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await updateUser(userId, { is_active: !currentStatus });
      fetchUsers();
    } catch (err: any) {
      alert("Ошибка при смене статуса: " + err.message);
    }
  };

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${name}?`)) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert("Ошибка при удалении: " + err.message);
    }
  };

  const formatPhoneMask = (val: string) => {
    if (!val) return "";
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.substring(1);
    
    if (digits === "7") return "+7 ";
    
    let mainPart = digits.startsWith("7") ? digits.substring(1) : digits;
    mainPart = mainPart.substring(0, 10);
    
    let formatted = "+7";
    if (mainPart.length > 0) formatted += " " + mainPart.substring(0, 3);
    if (mainPart.length > 3) formatted += " " + mainPart.substring(3, 6);
    if (mainPart.length > 6) formatted += " " + mainPart.substring(6, 8);
    if (mainPart.length > 8) formatted += " " + mainPart.substring(8, 10);
    return formatted;
  }

  if (loading) return (
    <div className="p-12 min-h-screen flex items-center justify-center">
      <div className="opacity-40 uppercase tracking-[0.3em] text-xs font-black animate-pulse text-white">Загрузка персонала...</div>
    </div>
  );

  return (
    <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-6xl font-outfit font-black uppercase tracking-tighter mb-4 text-white">Персонал</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-black">Управление правами доступа и учетными записями</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[var(--accent)] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0"
        >
          + Создать аккаунт
        </button>
      </div>

      {error ? (
        <div className="glass p-12 rounded-[3rem] text-center">
          <div className="text-red-500 font-bold mb-4">Ошибка доступа</div>
          <div className="text-white/40 text-sm uppercase tracking-widest font-black">{error}</div>
        </div>
      ) : (
        <div className="glass rounded-[3rem] overflow-hidden border-white/5 border shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 uppercase tracking-widest text-[10px] font-black text-white/40">
                  <th className="px-10 py-8">Пользователь</th>
                  <th className="px-10 py-8">Контакты</th>
                  <th className="px-10 py-8">Роль</th>
                  <th className="px-10 py-8">Статус</th>
                  <th className="px-10 py-8 text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-[var(--accent)] border border-white/10 group-hover:border-[var(--accent)]/30 transition-all">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm leading-tight mb-1">{user.username || "—"}</div>
                          <div className="text-[10px] opacity-40 uppercase font-black truncate max-w-[150px]">{user.full_name || "Без имени"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-sm font-mono text-white/60 mb-1">{formatPhoneMask(user.phone) || "—"}</div>
                      <div className="text-[10px] opacity-30">{user.email || "—"}</div>
                    </td>
                    <td className="px-10 py-8">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[var(--accent)] cursor-pointer text-white hover:bg-white/10 transition-all"
                      >
                        <option value="client" className="bg-[#111]">Клиент</option>
                        <option value="manager" className="bg-[#111]">Менеджер</option>
                        <option value="admin" className="bg-[#111]">Админ</option>
                      </select>
                    </td>
                    <td className="px-10 py-8">
                      <button 
                        onClick={() => toggleStatus(user.id, user.is_active)}
                        className={`text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${
                          user.is_active 
                            ? "border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10" 
                            : "border-red-500/40 text-red-500 hover:bg-red-500/10"
                        }`}
                      >
                        {user.is_active ? "Активен" : "Отключен"}
                      </button>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[var(--accent)] transition-all title='Редактировать'"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[var(--accent)] transition-all title='Сброс пароля'"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.username)}
                          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-white/40"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass rounded-[3rem] p-12 w-full max-w-xl relative border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 text-white/40 hover:text-white transition-all text-2xl"
            >×</button>
            
            <h2 className="text-4xl font-outfit font-black uppercase tracking-tighter mb-8 text-white">
                {editingUser ? "Редактирование" : "Новый аккаунт"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 px-1">Логин</label>
                  <input 
                    required
                    disabled={!!editingUser}
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[var(--accent)] transition-all disabled:opacity-50"
                    placeholder="ivan_admin"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 px-1">
                      {editingUser ? "Новый пароль (опционально)" : "Пароль"}
                  </label>
                  <input 
                    required={!editingUser}
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    type="password" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 px-1">Полное имя</label>
                <input 
                  value={form.full_name}
                  onChange={(e) => setForm({...form, full_name: e.target.value})}
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[var(--accent)] transition-all"
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 px-1">Email</label>
                  <input 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="ivan@mail.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 px-1">Телефон</label>
                  <input 
                    value={form.phone}
                    onChange={(e) => {
                      setForm({...form, phone: formatPhoneMask(e.target.value)});
                    }}
                    type="tel" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[var(--accent)] transition-all font-mono"
                    placeholder="+7 777 777 77 77"
                    maxLength={16}
                  />
                </div>
              </div>

              <div>
                  <label className="block text-[10px] uppercase tracking-widest font-black text-white/40 mb-2 px-1">Роль</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({...form, role: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[var(--accent)] transition-all appearance-none cursor-pointer"
                  >
                    <option value="manager">Менеджер</option>
                    <option value="admin">Админ</option>
                    <option value="client">Клиент</option>
                  </select>
                </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--accent)] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.4)] transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
              >
                {submitting ? "Сохранение..." : (editingUser ? "Обновить данные" : "Зарегистрировать")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
