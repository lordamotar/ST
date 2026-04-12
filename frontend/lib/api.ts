export const BASE_URL = "http://127.0.0.1:8000";
export const API_URL = `${BASE_URL}/api/v1`;

// --- Вспомогательная функция для безопасных запросов с тайм-аутом ---
export async function safeFetch(url: string, options?: RequestInit, fallback: any = []) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 сек тайм-аут

  try {
    const res = await fetch(url, { 
      ...options, 
      cache: "no-store",
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.error(`❌ Fetch ERROR (${res.status}): ${url}`);
      return fallback;
    }
    return await res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`⏱️ Fetch TIMEOUT: ${url}`);
    } else {
      console.error(`🔥 Fetch FAILED (${url}): ${error.message}`);
    }
    return fallback;
  }
}

// --- Вспомогательные функции для токенов и ошибок ---
const getAuthHeaders = () => {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

const handleError = async (res: Response, defaultMsg: string) => {
    const error = await res.json();
    let message = defaultMsg;
    
    if (typeof error.detail === "string") {
      message = error.detail;
    } else if (Array.isArray(error.detail)) {
      message = error.detail.map((err: any) => `${err.loc[err.loc.length-1]}: ${err.msg}`).join(", ");
    }
    
    throw new Error(message);
};

// --- AUTH ---
export async function login(loginData: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });
  if (!res.ok) await handleError(res, "Ошибка входа");
  return res.json();
}

// --- КАТАЛОГ ---
export async function getCategories() {
  return safeFetch(`${API_URL}/catalog/categories`, {}, []);
}

export async function getProducts(filters: any = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  return safeFetch(`${API_URL}/catalog/products?${params.toString()}`, {}, []);
}

export async function getProductBySlug(slug: string) {
  return safeFetch(`${API_URL}/catalog/products/${slug}`, {}, null);
}

export async function getCategoryBySlug(slug: string) {
  return safeFetch(`${API_URL}/catalog/categories/${slug}`, {}, null);
}

// --- УПРАВЛЕНИЕ КАТАЛОГОМ (АДМИН) ---
export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/catalog/upload-image`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url;
}

export async function bulkImportProducts(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/catalog/products/bulk-import`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  
  const data = await res.json();
  return { ok: res.ok, ...data };
}

export async function toggleProductStatus(id: number) {
  const res = await fetch(`${API_URL}/catalog/products/${id}/toggle`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

// --- ЗАКАЗЫ (ПУБЛИЧНЫЙ) ---
export async function createOrder(orderData: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) await handleError(res, "Ошибка оформления заказа");
  return res.json();
}

// --- ЗАКАЗЫ (АДМИН) ---
export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
  if (!res.ok) await handleError(res, "Ошибка загрузки заказов");
  return res.json();
}

export async function updateOrderStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await handleError(res, "Ошибка обновления статуса");
  return res.json();
}

// --- ПЕРСОНАЛ (АДМИН) ---
export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
  if (!res.ok) await handleError(res, "Ошибка загрузки пользователей");
  return res.json();
}

export async function updateUser(id: number, data: any) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleError(res, "Ошибка обновления пользователя");
  return res.json();
}

export async function resetPassword(id: number, newPassword: string) {
  const res = await fetch(`${API_URL}/users/${id}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!res.ok) await handleError(res, "Ошибка сброса пароля");
  return res.json();
}

export async function createUser(userData: any) {
  const normalizedData = { ...userData };
  if (normalizedData.email === "") delete normalizedData.email;
  if (normalizedData.full_name === "") delete normalizedData.full_name;

  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(normalizedData),
  });
  if (!res.ok) await handleError(res, "Ошибка создания пользователя");
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleError(res, "Ошибка удаления пользователя");
  return true;
}

// --- НАСТРОЙКИ САЙТА ---
export async function getAllSettings() {
  return safeFetch(`${API_URL}/settings`, {}, []);
}

export async function getSetting(key: string) {
  return safeFetch(`${API_URL}/settings/${key}?t=${Date.now()}`, {}, { key, value: "" });
}

export async function updateSetting(key: string, value: string) {
  const res = await fetch(`${API_URL}/settings/${key}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) await handleError(res, "Ошибка обновления настроек");
  return res.json();
}

// --- СЛАЙДЕР ---
export async function getSlides() {
  return safeFetch(`${API_URL}/slider`, {}, []);
}

export async function createSlide(slideData: any) {
  const res = await fetch(`${API_URL}/slider`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(slideData),
  });
  if (!res.ok) await handleError(res, "Ошибка создания слайда");
  return res.json();
}

export async function updateSlide(id: number, slideData: any) {
  const res = await fetch(`${API_URL}/slider/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(slideData),
  });
  if (!res.ok) await handleError(res, "Ошибка обновления слайда");
  return res.json();
}

export async function deleteSlide(id: number) {
  const res = await fetch(`${API_URL}/slider/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleError(res, "Ошибка удаления слайда");
  return true;
}

// --- ДАШБОРД ---
export async function getDashboardStats(params: any = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(k => {
    if (params[k]) query.append(k, params[k]);
  });
  
  const res = await fetch(`${API_URL}/admin/dashboard?${query.toString()}`, { 
    headers: getAuthHeaders(),
    cache: "no-store" 
  });
  if (!res.ok) await handleError(res, "Ошибка загрузки дашборда");
  return res.json();
}

// --- FAQ ---
export async function getFAQs() {
  return safeFetch(`${API_URL}/faq`, {}, []);
}

export async function createFAQ(faqData: any) {
  const res = await fetch(`${API_URL}/faq`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(faqData),
  });
  if (!res.ok) await handleError(res, "Ошибка создания FAQ");
  return res.json();
}

export async function updateFAQ(id: number, faqData: any) {
  const res = await fetch(`${API_URL}/faq/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(faqData),
  });
  if (!res.ok) await handleError(res, "Ошибка обновления FAQ");
  return res.json();
}

export async function deleteFAQ(id: number) {
  const res = await fetch(`${API_URL}/faq/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleError(res, "Ошибка удаления FAQ");
  return true;
}

// --- СТАТИЧЕСКИЕ СТРАНИЦЫ ---
export async function getPages() {
  return safeFetch(`${API_URL}/pages`, {}, []);
}

export async function getPage(slug: string) {
  return safeFetch(`${API_URL}/pages/${slug}`, {}, null);
}

export async function savePage(pageData: any) {
  const res = await fetch(`${API_URL}/pages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(pageData),
  });
  if (!res.ok) await handleError(res, "Ошибка сохранения страницы");
  return res.json();
}

export async function deletePage(slug: string) {
  const res = await fetch(`${API_URL}/pages/${slug}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleError(res, "Ошибка удаления страницы");
  return true;
}
