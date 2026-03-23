# AIFit App 🏋️‍♂️🤖

A full-stack, AI-powered platform that generates hyper-personalized workout routines and diet plans using the user's own Artificial Intelligence keys (BYOK - Bring Your Own Key).

## 🚀 Tech Stack

- **Frontend:** Angular 17 (Standalone Components)
- **Styling:** TailwindCSS + Custom Glassmorphism UI
- **i18n:** Custom `LanguageService` + `TranslatePipe` (PT-BR Baseline / EN-US Dictionary)
- **Icons:** Lucide-Angular
- **Backend:** .NET 8 Web API (C#)
- **Database:** SQLite via Entity Framework Core (EF Core)
- **Authentication:** JWT Bearer tokens & BCrypt password hashing
- **AI Integrations:** Google Gemini 2.0 Flash, OpenAI (ChatGPT) & **Ollama (Local AI)**

## 📁 Project Structure

The repository is divided into two main applications:
- `/AiFit-Web` - The Angular Frontend application.
- `/AIFit-Service` - The .NET 8 Backend service and SQLite Database.

## ✨ Key Features

- **BYOK AI Brain:** Connect your own OpenAI, Google Gemini, or run **Ollama locally** for free unlimited generation.
- **Multilingual Support:** Fully translated UI in **English** and **Portuguese**, with prompts automatically adjusting to the user's language.
- **Workout Generator:** Creates detailed day-by-day workout splits tailored to your experience, injuries, and goals.
- **Diet Generator:** Creates personalized meal plans with precise macronutrient tracking based on calorie targets and dietary restrictions.
- **Measurements & Progress:** Track body weight, chest, waist, and limb measurements with automatic historical tracking.
- **Modern UI:** Responsive glassmorphism dashboard with sticky sidebar and real-time AI status monitoring.

## 🛠️ How to Run Locally

### 1. Start the Backend (.NET)
Open a terminal in the root folder and navigate to the backend service:
```bash
cd AIFit-Service
dotnet restore
dotnet run
```
*The API will start running on `http://localhost:5177`.*

### 2. Start the Frontend (Angular)
Open a new terminal window and navigate to the frontend portal:
```bash
cd AiFit-Web
npm install
npm run start
# or npx ng serve
```
*The web app will automatically open at `http://localhost:4200`.*

### 3. Setup & Configuration
1. Create a local account in the app.
2. Go to **Profile** (gear icon in sidebar).
3. **App Preferences:** Change your system language to English or Portuguese.
4. **AI Configuration:** 
    - Select **OpenAI** or **Gemini** and enter your key (use `TEST` for mock offline data).
    - Select **Ollama** to use a local LLM (requires Ollama installed and running on `localhost:11434`).
