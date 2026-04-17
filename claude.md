# LLM & AI Assistant Instructions (claude.md)

If you are an AI/LLM (like Claude, ChatGPT, or Gemini) reading this repository to help the developer to maintain or expand the AIFit App, **you must strictly adhere to the architecture and rules defined below:**

## 1. Project Architecture
This is a Full-Stack application split into two distinct projects:
- **`AiFit-Web/`**: Angular 17 Frontend using **Standalone Components** (No `app.module.ts`).
- **`AIFit-Service/`**: .NET 8 Web API Backend.

## 2. Artificial Intelligence Integration (BYOK)
- Do **NOT** hardcode API keys into the backend repository.
- **BYOK/Rerouting:** Users can configure their own AI (OpenAI, Gemini, or Ollama) in the Profile page. The `AIService.cs` dynamically routes requests based on the user's saved preference in the database.
- **Ollama Support:** Local AI generation is supported at `http://localhost:11434`.
- **MOCK Bypassing:** If the API key is `"TEST"`, the system returns mock JSON to bypass costs.
- **API Key Security:** User API keys are encrypted at rest using ASP.NET Core `IDataProtector` before being stored in the database. The `AIService` decrypts them in-memory only when making requests.

> **⚠️ Ollama Architecture Note:** The Ollama integration (`localhost:11434`) assumes a **self-hosted** deployment where the frontend, backend, and Ollama all run on the same machine. If the backend is deployed to the cloud (AWS, Azure, etc.), `localhost` on the server will NOT reach the user's local Ollama instance. In that scenario, Ollama communication would need to be rerouted through the frontend or the user would need to expose their local port via a tunnel (e.g., Ngrok).

## 3. Internationalization (i18n)
- **Baseline Language:** The system is coded with **Portuguese (pt-BR)** strings as the primary keys.
- **Translation System:** We use a custom `LanguageService` and `TranslatePipe` (`| trans`).
- **Adding Keys:** When adding UI text, use Portuguese in the template (e.g., `{{ 'Treinos' | trans }}`) and add the English translation to the `dictionary` in `language.service.ts`.
- **AI Localized:** Prompts are sent to the AI in the user's selected language (`en` or `pt`) via the `Language` property in DTOs.

## 4. Angular Frontend Rules
- **Standalone Components:** All new components must have `standalone: true`.
- **Lucide Icons:** explicitly import and register icons in `app.config.ts` or the component's `icons` object.
- **Signals:** Use `signal()` for reactive state (like `currentLang`).
- **Layout:** The `DashboardLayoutComponent` uses a **sticky sidebar** (`lg:sticky`). Ensure main content handles its own scrolling.

## 5. .NET Backend Rules
- **EF Core:** Use SQLite. Always run `dotnet ef migrations add` after model changes.
- **JSON Enums:** `Program.cs` uses `JsonStringEnumConverter()`. Enums are strings in JSON.
- **Controllers:** Always use DTOs for request/response. Protected endpoints MUST have `[Authorize]`.
- **User Context:** Extract `userId` from `User.FindFirst(ClaimTypes.NameIdentifier)`.
