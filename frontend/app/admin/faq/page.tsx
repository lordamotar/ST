"use client";
import { useState, useEffect } from "react";
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from "@/lib/api";
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";

export default function FAQAdmin() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
    is_active: true,
    order: 0
  });

  const [editFaq, setEditFaq] = useState({
    question: "",
    answer: "",
    is_active: true,
    order: 0
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const data = await getFAQs();
      setFaqs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    try {
      await createFAQ(newFaq);
      setNewFaq({ question: "", answer: "", is_active: true, order: faqs.length });
      fetchFaqs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateFAQ(id, editFaq);
      setEditingId(null);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот вопрос?")) return;
    try {
      await deleteFAQ(id);
      fetchFaqs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEditing = (faq: any) => {
    setEditingId(faq.id);
    setEditFaq({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      order: faq.order
    });
  };

  if (loading) return <div className="p-10 text-center opacity-50">Загрузка FAQ...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Управление FAQ</h1>
          <p className="text-white/40 text-sm font-medium">Редактирование вопросов и ответов для главной страницы</p>
        </div>
      </div>

      {/* Форма добавления */}
      <div className="glass rounded-[2.5rem] p-8 border border-white/5 mb-12">
        <h2 className="text-xs font-black uppercase tracking-widest mb-6 text-[var(--accent)]">Новый вопрос</h2>
        <div className="space-y-4">
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium focus:border-[var(--accent)] outline-none transition-all"
            placeholder="Вопрос..."
            value={newFaq.question}
            onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
          />
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium focus:border-[var(--accent)] outline-none transition-all min-h-[120px]"
            placeholder="Ответ..."
            value={newFaq.answer}
            onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
          />
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newFaq.is_active} onChange={(e)=>setNewFaq({...newFaq, is_active: e.target.checked})} className="accent-[var(--accent)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Активен</span>
               </label>
               <input 
                  type="number"
                  className="w-20 bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-center"
                  value={newFaq.order}
                  onChange={(e) => setNewFaq({...newFaq, order: parseInt(e.target.value)})}
               />
            </div>
            <button 
              onClick={handleCreate}
              className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Список вопросов */}
      <div className="space-y-4">
        {faqs.map((faq: any) => (
          <div key={faq.id} className={`glass rounded-3xl border transition-all ${editingId === faq.id ? 'border-[var(--accent)]/50 scale-[1.01]' : 'border-white/5'}`}>
            {editingId === faq.id ? (
              <div className="p-6 md:p-8 space-y-4">
                <input 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm font-bold"
                  value={editFaq.question}
                  onChange={(e) => setEditFaq({...editFaq, question: e.target.value})}
                />
                <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm min-h-[100px]"
                  value={editFaq.answer}
                  onChange={(e) => setEditFaq({...editFaq, answer: e.target.value})}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditingId(null)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"><X size={16}/></button>
                  <button onClick={() => handleUpdate(faq.id)} className="p-3 rounded-xl bg-[var(--accent)] text-black font-black uppercase text-[10px] tracking-widest px-6 flex items-center gap-2">
                    <Save size={14}/> Сохранить
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8 flex items-start justify-between gap-6 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-[var(--accent)] opacity-40">#{faq.order}</span>
                    <h3 className="text-sm font-black uppercase tracking-widest">{faq.question}</h3>
                    {!faq.is_active && <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Скрыт</span>}
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditing(faq)} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/50 hover:text-white"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all text-red-500/50 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
