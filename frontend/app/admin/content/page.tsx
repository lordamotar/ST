"use client";

import { useState, useEffect } from "react";
import { getSlides, createSlide, updateSlide, deleteSlide, uploadProductImage, BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSlider() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    start_date: "",
    end_date: "",
    show_timer: false,
    is_active: true,
    order: 0
  });
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchSlides();
  }, [router]);

  const fetchSlides = async () => {
    const data = await getSlides();
    setSlides(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const url = await uploadProductImage(e.target.files[0]);
    if (url) {
      setForm({ ...form, image_url: url });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    // Format dates for API
    const slideData = {
      ...form,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    };

    if (modal === "add") {
      await createSlide(slideData);
    } else {
      await updateSlide(currentSlide.id, slideData);
    }
    setModal(null);
    fetchSlides();
  };

  const openEdit = (slide: any) => {
    setCurrentSlide(slide);
    setForm({
      title: slide.title || "",
      description: slide.description || "",
      image_url: slide.image_url || "",
      start_date: slide.start_date ? slide.start_date.split(".")[0] : "",
      end_date: slide.end_date ? slide.end_date.split(".")[0] : "",
      show_timer: slide.show_timer,
      is_active: slide.is_active,
      order: slide.order || 0
    });
    setModal("edit");
  };

  const openAdd = () => {
    setForm({
      title: "",
      description: "",
      image_url: "",
      start_date: new Date().toISOString().slice(0, 16),
      end_date: "",
      show_timer: false,
      is_active: true,
      order: slides.length
    });
    setModal("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить этот слайд?")) {
      await deleteSlide(id);
      fetchSlides();
    }
  };

  if (loading) return <div className="p-8 font-bold">Загрузка...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Управление слайдером</h1>
        <button 
          onClick={openAdd}
          className="bg-[var(--accent)] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
        >
          Добавить слайд
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {slides.map((slide) => (
          <div key={slide.id} className="glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col group">
            <div className="relative aspect-video bg-white/5">
              {slide.image_url ? (
                <img 
                  src={slide.image_url.startsWith('http') ? slide.image_url : `${BASE_URL}${slide.image_url}`} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">Нет фото</div>
              )}
              {!slide.is_active && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase">Отключен</span>
                </div>
              )}
            </div>
            <div className="p-6 flex-1">
              <h3 className="font-bold text-lg mb-2 line-clamp-1">{slide.title || "Без заголовка"}</h3>
              <p className="text-xs opacity-40 mb-4 line-clamp-2">{slide.description || "Без описания"}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="opacity-30">Старт:</span>
                  <span className="opacity-60">{slide.start_date ? new Date(slide.start_date).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                  <span className="opacity-30">Конец:</span>
                  <span className="opacity-60">{slide.end_date ? new Date(slide.end_date).toLocaleDateString() : "—"}</span>
                </div>
                {slide.show_timer && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Таймер включен
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                <button 
                  onClick={() => openEdit(slide)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(slide.id)}
                  className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setModal(null)}></div>
          <div className="relative glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 sm:p-12 border border-white/10 animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">
              {modal === "add" ? "Новый слайд" : "Редактировать слайд"}
            </h2>

            <div className="space-y-8">
              {/* Фото */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">Фото слайда</label>
                <div className="flex gap-6 items-start">
                  <div className="w-40 aspect-video bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                    {form.image_url && (
                      <img 
                        src={form.image_url.startsWith('http') ? form.image_url : `${BASE_URL}${form.image_url}`} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      onChange={handleImageUpload}
                      className="hidden" 
                      id="slide-image"
                    />
                    <label 
                      htmlFor="slide-image"
                      className="inline-block bg-white/5 hover:bg-white/10 px-6 py-4 rounded-xl cursor-pointer text-xs font-bold uppercase transition-all"
                    >
                      {uploading ? "Загрузка..." : "Выбрать фото"}
                    </label>
                    <input 
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm({...form, image_url: e.target.value})}
                      placeholder="Или вставьте URL"
                      className="w-full mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Заголовок и описание */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Заголовок</label>
                  <input 
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Описание</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] font-medium resize-none"
                  />
                </div>
              </div>

              {/* Даты */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Начало публикации</label>
                  <input 
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => setForm({...form, start_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Конец публикации</label>
                  <input 
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm({...form, end_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[var(--accent)] text-sm"
                  />
                </div>
              </div>

              {/* Опции */}
              <div className="grid grid-cols-2 gap-6">
                <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                  <input 
                    type="checkbox"
                    checked={form.show_timer}
                    onChange={(e) => setForm({...form, show_timer: e.target.checked})}
                    className="w-5 h-5 accent-[var(--accent)]"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest">Таймер</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                  <input 
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({...form, is_active: e.target.checked})}
                    className="w-5 h-5 accent-[var(--accent)]"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest">Активен</span>
                </label>
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[var(--accent)] text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  {modal === "add" ? "Создать" : "Сохранить"}
                </button>
                <button 
                  onClick={() => setModal(null)}
                  className="px-10 bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
