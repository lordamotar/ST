# 🛋️ Stoly-Sklad (Furniture Store System)

Современная система управления мебельным магазином: FastAPI Backend + Next.js Frontend.

---

## 🚀 Быстрый запуск (Installation Guide)

### 1. Подготовка системы (Linux/Ubuntu)
```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Установка Python и Node.js (если нет)
sudo apt install python3-pip python3-venv nodejs npm -y
```

### 2. Клонирование и бэкенд
```bash
git clone https://github.com/lordamotar/ST.git
cd ST

# Установка зависимостей
pip install -r requirements.txt
pip install "pydantic[email]"  # Критично для валидации
```

### 3. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/st_db
JWT_SECRET=your_secret_key_here
```

### 4. Инициализация базы данных
Создание таблиц, наполнение товарами и создание админа (`admin/admin`):
```bash
# Находясь в корне /ST
PYTHONPATH=. python3 scripts/seed_data.py
```

### 5. Настройка и сборка фронтенда
**Важно:** Перед сборкой убедитесь, что в `frontend/lib/api.ts` указан правильный IP вашего сервера.

```bash
cd frontend
npm install

# Сборка проекта
npm run build
```

### 6. Настройка сети (Фаервол)
Чтобы сервер был доступен извне, откройте порты:
```bash
sudo ufw allow 8000/tcp  # Backend API
sudo ufw allow 3000/tcp  # Frontend Web
```

---

## 🛠 Запуск в продакшене (через Screen)

Используйте `screen`, чтобы процессы не завершались после закрытия терминала.

### Запуск Бэкенда (API)
```bash
screen -S backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Нажмите Ctrl+A, затем D, чтобы отсоединиться
```

### Запуск Фронтенда (Web)
```bash
cd frontend
screen -S frontend
npm run start
# Нажмите Ctrl+A, затем D, чтобы отсоединиться
```

---

## 📂 Полезные команды

*   **Сброс пароля админа на `admin`**:
    `PYTHONPATH=. python3 scripts/reset_admin.py`
*   **Очистка и повторное заполнение данных**:
    `PYTHONPATH=. python3 scripts/seed_data.py`
*   **Просмотр логов бэкенда**:
    `tail -f logs/app.log`

---

## 🔐 Доступы по умолчанию
*   **Админка**: `http://vash_ip:3000/admin`
*   **Логин**: `admin`
*   **Пароль**: `admin`
*   **API Docs**: `http://vash_ip:8000/docs`

---

© 2026 Stoly-Sklad. Все права защищены.
