# 🌌 GOH NEURAL — Enterprise AI API Gateway

<div align="center">
  <img src="https://picsum.photos/seed/neural/1200/400" alt="GOH NEURAL Banner" width="100%" style="border-radius: 24px; margin-bottom: 20px;" />
  <p><i>Neural Might. Instant Access. Infinite Potential.</i></p>
</div>

---

## 📖 Обзор / Overview

**GOH NEURAL** — это высокопроизводительный шлюз для доступа к передовым языковым моделям (LLM). Мы предоставляем разработчикам и энтузиастам безопасный, быстрый и удобный способ интеграции AI в любые приложения: от простых скриптов до сложных Telegram-ботов.

**GOH NEURAL** is a high-performance gateway for accessing advanced Large Language Models (LLMs). We provide developers and enthusiasts with a secure, fast, and convenient way to integrate AI into any application: from simple scripts to complex Telegram bots.

---

## ✨ Основные возможности / Key Features

- 🧠 **Neural Terminal**: Интерактивный веб-терминал в стиле Glassmorphism для быстрого тестирования запросов.
- 🔑 **API Key Management**: Безопасная генерация и управление ключами доступа в личном кабинете.
- 📉 **Quota Tracking**: Встроенная система мониторинга суточных лимитов и визуальный дашборд использования.
- 🛡️ **Security First**: Интеграция с Firebase Auth (Google Login) и защищенные правила доступа Firestore.
- ⚡ **Developer Friendly**: Простой REST API, поддерживающий любые языки программирования.

---

## 🛠️ Техническая спецификация / Specs

- **Base URL**: `https://ais-dev-a4ewc3zratg3rdufsx7klc-6560868183.us-west2.run.app`
- **Daily Limit**: 5 запросов в сутки / requests per day.
- **Character Limit**: 5,000 символов на запрос / characters per prompt.
- **Model**: Qwen 3.6 Plus (High-performance reasoning).

---

## 🚀 Быстрый старт / Quick Start

### 1. Получение доступа / Access
Войдите через Google на главной странице, перейдите в раздел **"Profile"** и создайте свой **API Key**.

### 2. Интеграция (Python Example)
```python
import requests

# Ваш персональный ключ из профиля
API_KEY = "goh_your_unique_key_here"
API_URL = "https://your-deployment-url.run.app/api/chat"

payload = {
    "prompt": "Привет, GOH AI! Расскажи о квантовых компьютерах за 100 слов."
}

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

response = requests.post(API_URL, json=payload, headers=headers)
print(response.json()['response'])
```

### 3. Telegram Bot (telebot)
```python
import telebot
import requests

bot = telebot.TeleBot("YOUR_TELEGRAM_TOKEN")
GOH_API = "https://your-deployment-url.run.app/api/chat"
GOH_KEY = "goh_your_key"

@bot.message_handler(func=lambda m: True)
def handle_message(message):
    res = requests.post(
        GOH_API, 
        json={"prompt": message.text}, 
        headers={"X-API-Key": GOH_KEY}
    ).json()
    
    bot.reply_to(message, res.get("response", res.get("error")))

bot.infinity_polling()
```

---

## 🛡️ Безопасность / Security

Ваши данные защищены с помощью:
1. **Firebase Authentication**: Вход только через подтвержденные Google-аккаунты.
2. **Firestore Rules (8 Pillars)**: Строгая валидация схем данных и невозможность подделки UID.
3. **Backend Validation**: Тройная проверка лимитов, авторизации и длины текста на стороне сервера.

---

## 📦 Стек технологий / Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Motion (framer-motion).
- **Backend**: Next.js API Routes, Firebase SDK.
- **Database/Auth**: Firebase Firestore & Firebase Auth.
- **Icons**: Lucide React.
- **Typography**: Inter & JetBrains Mono.

---

<div align="center">
  <p>Создано для тех, кто строит будущее. / Built for those who build the future.</p>
  <p><b>GOH NEURAL &copy; 2026</b></p>
</div>
