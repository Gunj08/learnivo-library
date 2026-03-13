# Learnivo Library 📚

Learnivo Library ek modern book management aur reading platform hai jise Next.js se banaya gaya hai. Ye system books ko Google Drive par store karta hai aur offline accessible rehne ke liye local SQLite database ka use karta hai.

## ✨ Features

- 📂 **Book Management**: Books upload, edit aur delete karne ki suvidha.
- ☁️ **Google Drive Storage**: Saari books aur files secure tareeke se Google Drive par store hoti hain.
- 🔍 **OCR Support**: Tesseract.js ka use karke images se text extract karne ki capacity.
- 🛡️ **Admin Panel**: User aur books ko manage karne ke liye ek robust admin dashboard.
- ⚡ **Modern UI**: Tailwind CSS aur Framer Motion se bani smooth aur responsive design.
- 📖 **Approval Workflow**: Regular users ki books pehle admin approve karta hai, phir wo sabko dikhti hain.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm ya yarn
- Google Cloud Console account

### 2. Installation
Repo ko clone karein aur dependencies install karein:
```bash
npm install
```

### 3. Setup Environment Variables
Ek `.env.local` file banayein aur ye variables add karein:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

---

## ☁️ Google Drive Storage Setup (Step-by-Step)

Books ko Google Drive mein store karne ke liye niche diye gaye steps follow karein:

### Step 1: Google Cloud Project Setup
1. [Google Cloud Console](https://console.cloud.google.com/) par jayein.
2. Naya project create karein.
3. **APIs & Services > Library** mein jayein aur **"Google Drive API"** search karke enable karein.

### Step 2: OAuth Consent Screen
1. **APIs & Services > OAuth consent screen** par jayein.
2. User Type: **External** select karein.
3. App details fill karein aur **Test Users** mein apni email ID add karein.

### Step 3: Create Credentials
1. **APIs & Services > Credentials** par jayein.
2. **Create Credentials > OAuth client ID** select karein.
3. Application type: **Web application**.
4. Authorized redirect URIs mein add karein: `http://localhost:3000/oauth2callback`.
5. Create karne ke baad **Client ID** aur **Client Secret** ko `.env.local` mein save karein.

### Step 4: Get Refresh Token
1. Terminal mein ye command chalaein:
   ```bash
   node get-token.js
   ```
2. Terminal mein ek link dikhegi, use browser mein open karein.
3. Apne Google account se login karein aur permissions allow karein.
4. Terminal mein aapko ek **Refresh Token** milega, use `.env.local` mein `GOOGLE_REFRESH_TOKEN` ki jagah paste karein.

### Step 5: Drive Folder ID
1. Google Drive mein ek naya folder banayein jahan books store hongi.
2. Us folder ka URL dekhein (e.g., `drive.google.com/drive/folders/1wSsJDpDzJ...`).
3. URL ka aakhri part (ID) copy karein aur use `.env.local` mein `GOOGLE_DRIVE_FOLDER_ID` ki jagah paste karein.

---

## 🛠️ Development

Development server start karne ke liye:
```bash
npm run dev
```
Ab aap `http://localhost:3000` par apna project dekh sakte hain.

## 🗄️ Database
Ye project **SQLite** (better-sqlite3) ka use karta hai. Database file `data/library.db` mein store hoti hai.

## 📜 License
Private Project - Gunj08
