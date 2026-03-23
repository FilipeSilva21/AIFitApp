# LLM & AI Assistant Instructions (claude.md)

If you are an AI/LLM (like Claude, ChatGPT, or Gemini) reading this repository to help the developer to maintain or expand the AIFit App, **you must strictly adhere to the architecture and rules defined below:**

## 1. Project Architecture
This is a Full-Stack application split into two distinct projects:
- **`AiFit-Web/`**: Angular 17 Frontend using **Standalone Components** (No `app.module.ts`).
- **`AIFit-Service/`**: .NET 8 Web API Backend.

The frontend communicates with the backend via `http://localhost:5177/api`. The environment configurations are handled via `environment.ts` in Angular and `appsettings.json` in .NET. A root `.env` file exists purely for reference/Docker purposes but is not actively loaded into .NET by default.

## 2. Artificial Intelligence Integration (BYOK)
- Do **NOT** hardcode API keys into the backend repository.
- The system uses a **Bring Your Own Key (BYOK)** model. The user inputs their API key locally in the Angular frontend, which is sent to `AISettingsController` and saved in the SQLite user database.
- The `AIService.cs` reads the user's saved API key at runtime to call OpenAI or Gemini APIs directly via `HttpClient`.
- **MOCK Bypassing:** In `AIService.cs`, if the API key exactly matches the string `"TEST"`, it will bypass external API calls and return structured JSON mock data to prevent blocking UI development when the user runs out of free API tier limits.

## 3. Angular Frontend Rules
- **Standalone Components:** All new components must have `standalone: true`. Add imports directly in the component's `@Component({ imports: [...] })` metadata.
- **Lucide Icons:** We use `lucide-angular`. Icons MUST be explicitly imported and provided in `app.config.ts`. Do not use `.pick()` inside individual components.
- **Styling:** The design heavily relies on TailwindCSS. The `index.css` file contains global `@layer` components like `.glass-card`, `.btn-primary`, and `.text-gradient`. Use these utility classes instead of writing raw CSS!
- **Signals/Inject:** Prefer the modern Angular `inject()` function over constructor injection.

## 4. .NET Backend Rules
- **Entity Framework Core:** We use SQLite (`aifitapp.db`). If you change an entity in `Models/Entities`, you must generate a new EF Core migration (`dotnet ef migrations add <Name>`).
- **Enums & JSON:** The `Program.cs` uses `JsonStringEnumConverter()`. This means all Enums (`UserGoal`, `AIProvider`, `WeekDay`) are serialized and deserialized as literal **Strings** in JSON (e.g., `"Monday"` instead of `1`). The Angular frontend expects and sends strings to prevent enum integer binding failures.
- **Data Transfer Objects:** Never expose raw Database Entities to the frontend. Always map them to DTOs in `DTOs.cs`.
- **Authentication:** All protected endpoints must use the `[Authorize]` attribute. JWT tokens are passed via the `Authorization: Bearer` header. The user ID is extracted via `User.FindFirst(ClaimTypes.NameIdentifier)`.
