# 🌌 GOH API AI — Keyless Neural Power

---

### 🔥 **Добро пожаловать в эру свободного ИИ.**

**GOH API AI** (v1.0-beta) — это ваш персональный шлюз в мир нейротехнологий. Мы убрали всё лишнее: сложные конфигурации, бесконечные API-ключи и бюрократию. 

Мы предоставляем **единый канал доступа** к лучшим моделям на архитектуре Puter, оптимизированный для мгновенной интеграции в ваши проекты.

---

### ✨ **Почему это круто?**

⚡️ **Квантовая скорость** — Оптимизированный REST-шлюз под управлением Vercel.
🛡 **Keyless-принцип** — Мы уже позаботились об авторизации, вы концентрируетесь на созидании.
🛠 **Zero Config** — Работает сразу после копирования примера кода.
🤖 **Готовность к ботам** — Создайте своего Telegram-оракула за 5 минут.

---

### 🚀 **Магия интеграции (Python)**

Используйте этот API как «мозговой центр» для любого вашего софта.

```python
import requests

# Ваш портал в нейросеть
API_ENDPOINT = "https://goh-api-ai-v5yn.vercel.app/api/chat"

def ask_ai(question):
    try:
        # Простой POST-запрос — и никакой боли с токенами
        res = requests.post(API_ENDPOINT, json={"prompt": question})
        return res.json().get("response", "Пустота...")
    except Exception as e:
        return f"🚨 Ошибка шлюза: {e}"

# Ваш первый вопрос:
print(ask_ai("Привет! Ты готов к работе?"))
```

---

### 🤖 **Ваш Telegram-Бот (Beta)**

Хотите своего ИИ-ассистента в кармане? Запускайте его за 3 шага.

1. Установите базу: `pip install telebot requests`
2. Вставьте токен от [@BotFather](https://t.me/botfather).
3. Запустите этот скрипт:

```python
import telebot # pip install pyTelegramBotAPI
import requests

bot = telebot.TeleBot("ВАШ_TOKEN_ОТ_BOTFATHER")
API = "https://goh-api-ai-v5yn.vercel.app/api/chat"

@bot.message_handler(commands=['start'])
def start(m): bot.reply_to(m, "Привет! Я GOH AI. Слушаю тебя.")

@bot.message_handler(func=lambda _: True)
def chat(m):
    # Магия происходит здесь
    ans = requests.post(API, json={"prompt": m.text}).json().get("response")
    bot.reply_to(m, ans)

if __name__ == "__main__":
    bot.infinity_polling()
```

---

### ⚠️ **Правила "ИИ-этикета"**

*   **Будьте вежливы к серверу:** Не устраивайте DDoS-атаки своему же API.
*   **Безопасность:** Не передавайте через наши API паспортные данные, пароли или секретные ключи.
*   **Beta-статус:** `1.0-beta` означает, что мы постоянно учимся. Если API "задумался" — просто повторите запрос.

---

### 🌐 **Где мы есть?**
*   **URL:** [https://goh-api-ai-v5yn.vercel.app](https://goh-api-ai-v5yn.vercel.app)
*   **Технологии:** Vercel, Puter Core, Neural Drivers.

---
*Создано для тех, кто строит будущее. GOH API AI.* 🌌
