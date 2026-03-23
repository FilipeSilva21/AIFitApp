# AIFit App 🏋️‍♂️🤖

A full-stack, AI-powered platform that generates hyper-personalized workout routines and diet plans using the user's own Artificial Intelligence keys (BYOK - Bring Your Own Key).

## 🚀 Tech Stack

- **Frontend:** Angular 17 (Standalone Components)
- **Styling:** TailwindCSS + Custom Glassmorphism UI
- **Icons:** Lucide-Angular
- **Backend:** .NET 8 Web API (C#)
- **Database:** SQLite via Entity Framework Core (EF Core)
- **Authentication:** JWT Bearer tokens & BCrypt password hashing
- **AI Integrations:** Google Gemini 2.0 Flash & OpenAI (ChatGPT)

## 📁 Project Structure

The repository is divided into two main applications:
- `/AiFit-Web` - The Angular Frontend application.
- `/AIFit-Service` - The .NET 8 Backend service and SQLite Database.

## ✨ Key Features

- **BYOK AI Brain:** Connect your own OpenAI or Google Gemini API key securely.
- **Workout Generator:** Creates detailed day-by-day workout splits tailored to your experience, injuries, and goals.
- **Diet Generator:** Creates personalized meal plans with precise macronutrient tracking based on calorie targets and dietary restrictions.
- **Measurements Dashboard:** Track your body progression, weight, and fitness goals over time.
- **Mock Mode:** Don't have paid AI credits? Use the mock development mode to test UI rendering!

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

### 3. Connect your AI (Or Test for Free!)
1. Create a local account in the app.
2. Go to **Profile -> Configure AI**.
3. Select an AI Provider (OpenAI or Gemini).
4. **Important:** If you do not have an API key with active billing credits, simply type **`TEST`** in the API Key field!
5. The `TEST` key activates the local Mock Mode, instantly generating offline mock data so you can test the application UI without incurring AI costs or dealing with 429 Quota errors.
