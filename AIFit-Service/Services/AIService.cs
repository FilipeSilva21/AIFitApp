using System.Text;
using System.Text.Json;
using AIFitApp.DTOs;
using AIFitApp.Models.Entities;
using AIFitApp.Models.Enums;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AIFitApp.Services;

public class AIService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AIService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IDataProtector _protector;

    public AIService(IHttpClientFactory httpClientFactory, ILogger<AIService> logger, IConfiguration configuration, IDataProtectionProvider protectionProvider)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _configuration = configuration;
        _protector = protectionProvider.CreateProtector("AIFitApp.ApiKeys");
    }

    public async Task<Workout> GenerateWorkout(GenerateWorkoutRequest request, User user)
    {
        var prompt = BuildWorkoutPrompt(request);
        var aiResponse = await CallAI(user, prompt);
        return ParseWorkoutResponse(aiResponse, request, user.Id);
    }

    public async Task<Diet> GenerateDiet(GenerateDietRequest request, User user)
    {
        var prompt = BuildDietPrompt(request);
        var aiResponse = await CallAI(user, prompt);
        return ParseDietResponse(aiResponse, request, user.Id);
    }

    public async Task<bool> TestConnection(AIProvider provider, string apiKey)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            if (apiKey == "TEST") return true;

            if (provider == AIProvider.Ollama)
            {
                var response = await client.GetAsync("http://localhost:11434/");
                return response.IsSuccessStatusCode;
            }
            else if (provider == AIProvider.OpenAI)
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                var response = await client.GetAsync("https://api.openai.com/v1/models");
                return response.IsSuccessStatusCode;
            }
            else
            {
                var response = await client.GetAsync($"https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}");
                return response.IsSuccessStatusCode;
            }
        }
        catch
        {
            return false;
        }
    }

    private string BuildWorkoutPrompt(GenerateWorkoutRequest request)
    {
        var daysStr = string.Join(", ", request.AvailableDays.Select(d => d.ToString()));
        var durationStr = request.Duration switch
        {
            SessionDuration.Minutes40 => "40 minutos",
            SessionDuration.Hour1 => "1 hora",
            SessionDuration.Hour1_30 => "1 hora e 30 minutos",
            SessionDuration.Unlimited => "sem limite de tempo",
            _ => "1 hora"
        };
        var goalStr = request.Goal switch
        {
            UserGoal.Hypertrophy => "Hipertrofia (ganho de massa muscular)",
            UserGoal.WeightLoss => "Perda de peso/gordura",
            UserGoal.Strength => "Ganho de força",
            UserGoal.Endurance => "Resistência/endurance",
            UserGoal.GeneralFitness => "Condicionamento físico geral",
            _ => "Condicionamento físico geral"
        };

        var langInstruction = request.Language == "en" ? 
            "CRITICAL: The entire generated workout plan MUST be written heavily in ENGLISH (en-US). Translate all names, days, notes, and exercises to English." : 
            "CRÍTICO: O plano de treino gerado DEVE ser escrito obrigatoriamente em PORTUGUÊS (pt-BR). Traduza todos os nomes, notas, dicas e exercícios para o Português.";

        return $@"{langInstruction}

Você é um personal trainer profissional e certificado. Crie um plano de treino de musculação personalizado baseado nas informações do aluno abaixo.

INFORMAÇÕES DO ALUNO:
- Objetivo: {goalStr}
- Experiência com treino: {request.TrainingExperience ?? "Não informada"}
- Lesões prévias: {request.Injuries ?? "Nenhuma informada"}
- Dias disponíveis para treinar: {daysStr}
- Duração de cada sessão: {durationStr}
{(string.IsNullOrEmpty(request.AdditionalNotes) ? "" : $"- Observações adicionais: {request.AdditionalNotes}")}

INSTRUÇÕES:
Responda EXCLUSIVAMENTE em formato JSON válido, sem nenhum texto antes ou depois. Use exatamente esta estrutura:
{{
  ""name"": ""Nome do plano de treino"",
  ""notes"": ""Observações gerais sobre o treino"",
  ""days"": [
    {{
      ""dayOfWeek"": 1,
      ""muscleGroup"": ""Grupo muscular do dia"",
      ""exercises"": [
        {{
          ""name"": ""Nome do exercício"",
          ""sets"": 3,
          ""reps"": ""10-12"",
          ""restSeconds"": 60,
          ""notes"": ""Dicas de execução""
        }}
      ]
    }}
  ]
}}

REGRAS:
- dayOfWeek usa: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo
- Use apenas os dias informados pelo aluno
- Inclua de 5 a 8 exercícios por dia
- Adapte volume e intensidade ao nível de experiência
- Se houver lesões, evite exercícios que possam agravar
- Inclua aquecimento e dicas de execução nas notas";
    }

    private string BuildDietPrompt(GenerateDietRequest request)
    {
        var goalStr = request.Goal switch
        {
            UserGoal.Hypertrophy => "Hipertrofia (ganho de massa muscular)",
            UserGoal.WeightLoss => "Perda de peso/gordura",
            UserGoal.Strength => "Ganho de força",
            UserGoal.Endurance => "Resistência/endurance",
            UserGoal.GeneralFitness => "Condicionamento físico geral",
            _ => "Condicionamento físico geral"
        };

        var langInstruction = request.Language == "en" ? 
            "CRITICAL: The entire generated diet plan MUST be written carefully in ENGLISH (en-US). Translate all meals, names, foods, and notes to English." : 
            "CRÍTICO: O plano de dieta gerado DEVE ser escrito obrigatoriamente em PORTUGUÊS (pt-BR). Traduza todos os nomes, refeições, alimentos e dicas para o Português.";

        return $@"{langInstruction}

Você é um nutricionista esportivo profissional e certificado. Crie um plano alimentar personalizado baseado nas informações abaixo.

INFORMAÇÕES:
- Objetivo: {goalStr}
- Peso: {(request.Weight.HasValue ? $"{request.Weight}kg" : "Não informado")}
- Altura: {(request.Height.HasValue ? $"{request.Height}cm" : "Não informada")}
- Idade: {(request.Age.HasValue ? $"{request.Age} anos" : "Não informada")}
- Meta de calorias: {(request.TargetCalories.HasValue ? $"{request.TargetCalories} kcal" : "Calcule baseado no objetivo")}
- Restrições alimentares: {request.Restrictions ?? "Nenhuma"}
{(string.IsNullOrEmpty(request.AdditionalNotes) ? "" : $"- Observações adicionais: {request.AdditionalNotes}")}

INSTRUÇÕES:
Responda EXCLUSIVAMENTE em formato JSON válido, sem nenhum texto antes ou depois. Use exatamente esta estrutura:
{{
  ""name"": ""Nome do plano alimentar"",
  ""totalCalories"": 2500,
  ""notes"": ""Observações gerais"",
  ""meals"": [
    {{
      ""name"": ""Nome da refeição"",
      ""time"": ""08:00"",
      ""foods"": [
        {{
          ""name"": ""Nome do alimento"",
          ""quantity"": ""100g"",
          ""calories"": 150,
          ""protein"": 25.0,
          ""carbs"": 10.0,
          ""fat"": 3.0
        }}
      ]
    }}
  ]
}}

REGRAS:
- Inclua de 5 a 6 refeições por dia
- Calcule os macronutrientes de cada alimento
- Adapte ao objetivo do aluno
- Se houver restrições, substitua por alternativas equivalentes
- totalCalories deve ser o total diário estimado";
    }

    private async Task<HttpResponseMessage> SendWithRetry(Func<Task<HttpResponseMessage>> sendRequest, string providerName)
    {
        const int maxRetries = 3;
        var delay = TimeSpan.FromSeconds(1);

        for (var attempt = 1; attempt <= maxRetries; attempt++)
        {
            var response = await sendRequest();
            if (response.IsSuccessStatusCode)
                return response;

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                _logger.LogWarning("{ProviderName} returned 429 TooManyRequests (attempt {Attempt}/{MaxRetries})", providerName, attempt, maxRetries);
                if (attempt == maxRetries) return response;

                await Task.Delay(delay);
                delay = delay * 2;
                continue;
            }

            return response;
        }

        throw new InvalidOperationException("SendWithRetry should not reach this point.");
    }

    private async Task<string> CallAI(User user, string prompt)
    {
        var apiKey = DecryptApiKey(user.AIApiKey);
        var providerStr = user.AIProviderType?.ToString();

        // Se o usuário não tem uma configuração visual no perfil (DB), usamos o fallback padrão (.env)
        if (string.IsNullOrEmpty(providerStr))
        {
            providerStr = _configuration["AI_PROVIDER_TYPE"];
            apiKey = _configuration["AI_API_KEY"];
        }

        var provider = Enum.TryParse<AIProvider>(providerStr, true, out var p) ? p : AIProvider.Gemini;

        if (string.IsNullOrEmpty(apiKey) && provider != AIProvider.Ollama)
            throw new InvalidOperationException("AI Key not configured in .env or user profile.");

        if (apiKey == "TEST" && prompt.Contains("treino"))
        {
            return @"{
                ""name"": ""Treino de Adaptação (MOCK)"",
                ""notes"": ""Este é um treino de teste gerado localmente porque você usou a chave TEST."",
                ""days"": [
                    { ""dayOfWeek"": 1, ""muscleGroup"": ""Peito e Tríceps"", ""exercises"": [ { ""name"": ""Supino Reto"", ""sets"": 3, ""reps"": ""10-12"", ""restSeconds"": 60, ""notes"": ""Foque na contração"" } ] },
                    { ""dayOfWeek"": 3, ""muscleGroup"": ""Costas e Bíceps"", ""exercises"": [ { ""name"": ""Puxada Alta"", ""sets"": 3, ""reps"": ""10-12"", ""restSeconds"": 60, ""notes"": ""Puxe com os cotovelos"" } ] }
                ]
            }";
        }
        if (apiKey == "TEST" && prompt.Contains("nutricionista"))
        {
            return @"{
                ""name"": ""Dieta de Teste (MOCK)"",
                ""totalCalories"": 2000,
                ""notes"": ""Dieta gerada com a chave TEST."",
                ""meals"": [
                    { ""name"": ""Café da Manhã"", ""time"": ""08:00"", ""foods"": [ { ""name"": ""Ovos mexidos"", ""quantity"": ""2 unidades"", ""calories"": 140, ""protein"": 12, ""carbs"": 1, ""fat"": 10 } ] },
                    { ""name"": ""Almoço"", ""time"": ""12:30"", ""foods"": [ { ""name"": ""Arroz e Frango"", ""quantity"": ""250g"", ""calories"": 350, ""protein"": 35, ""carbs"": 45, ""fat"": 5 } ] }
                ]
            }";
        }
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromMinutes(10); // Aumento significativo do timeout padrão para o Ollama local que pode ser lento

        if (provider == AIProvider.OpenAI)
        {
            return await CallOpenAI(client, apiKey, prompt);
        }
        else if (provider == AIProvider.Ollama)
        {
            return await CallOllama(client, prompt);
        }
        else
        {
            return await CallGemini(client, apiKey, prompt);
        }
    }

    private async Task<string> CallOpenAI(HttpClient client, string apiKey, string prompt)
    {
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        var requestBody = new
        {
            model = "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "system", content = "You are a professional fitness and nutrition expert. Always respond in valid JSON format." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7,
            max_tokens = 4000
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await SendWithRetry(
            () => client.PostAsync("https://api.openai.com/v1/chat/completions", content),
            "OpenAI");

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                throw new Exception("Você excedeu o limite de requisições ou a cota gratuita da sua API key (Erro 429). Por favor, verifique o painel da OpenAI ou tente novamente mais tarde.");

            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                throw new Exception("Sua chave da API (API Key) é inválida. Por favor, atualize em Configurações de IA no seu perfil.");

            throw new Exception($"OpenAI API error: {error}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? throw new Exception("Empty response from OpenAI");
    }

    private async Task<string> CallOllama(HttpClient client, string prompt)
    {
        var model = _configuration["OLLAMA_MODEL"] ?? "phi3";

        var requestBody = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "You are a professional fitness and nutrition expert. Always respond in valid JSON format." },
                new { role = "user", content = prompt }
            },
            stream = false,
            options = new
            {
                temperature = 0.7,
                num_predict = 4096,
                num_ctx = 8192
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await SendWithRetry(
            () => client.PostAsync("http://localhost:11434/api/chat", content),
            "Ollama");

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Ollama API error: {error}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;
        
        var messageContent = root.GetProperty("message").GetProperty("content").GetString() ?? "";

        var done = root.TryGetProperty("done", out var d) ? d.GetBoolean() : false;
        var evalCount = root.TryGetProperty("eval_count", out var ec) ? ec.GetInt32() : 0;
        
        _logger.LogInformation("Ollama Model Inference => Done: {done} | Eval Tokens: {evalCount} | Text Length: {len}", done, evalCount, messageContent.Length);

        return messageContent;
    }

    private async Task<string> CallGemini(HttpClient client, string apiKey, string prompt)
    {
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 4000
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

        var response = await SendWithRetry(
            () => client.PostAsync(url, content),
            "Gemini");

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                throw new Exception("Você excedeu o limite de requisições ou a cota gratuita da sua API key (Erro 429). Por favor, aguarde alguns minutos ou verifique o painel do Google AI Studio.");

            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest && responseBody.Contains("API key not valid", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Sua chave da API (API Key) é inválida. Por favor, atualize em Configurações de IA no seu perfil.");

            throw new Exception($"Gemini API error: {responseBody}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        return doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? throw new Exception("Empty response from Gemini");
    }

    private Workout ParseWorkoutResponse(string aiResponse, GenerateWorkoutRequest request, int userId)
    {
        try
        {
            var cleanJson = aiResponse.Trim();
            if (cleanJson.StartsWith("```"))
            {
                var firstNewLine = cleanJson.IndexOf('\n');
                if (firstNewLine >= 0)
                    cleanJson = cleanJson.Substring(firstNewLine + 1);
                
                var lastTicks = cleanJson.LastIndexOf("```");
                if (lastTicks >= 0)
                    cleanJson = cleanJson.Substring(0, lastTicks);
            }

            using var doc = JsonDocument.Parse(cleanJson.Trim());
            var root = doc.RootElement;

            var workout = new Workout
            {
                UserId = userId,
                Name = root.GetProperty("name").GetString() ?? "Treino Gerado por IA",
                Notes = root.TryGetProperty("notes", out var notes) ? notes.GetString() : null
            };

            if (root.TryGetProperty("days", out var daysArr))
            {
                foreach (var dayJson in daysArr.EnumerateArray())
                {
                    var dayOfWeek = (WeekDay)dayJson.GetProperty("dayOfWeek").GetInt32();
                    var workoutDay = new WorkoutDay
                    {
                        DayOfWeek = dayOfWeek,
                        Duration = request.Duration,
                        MuscleGroup = dayJson.TryGetProperty("muscleGroup", out var mg) ? mg.GetString() : null
                    };

                    if (dayJson.TryGetProperty("exercises", out var exercisesArr))
                    {
                        int order = 0;
                        foreach (var exJson in exercisesArr.EnumerateArray())
                        {
                            workoutDay.Exercises.Add(new WorkoutExercise
                            {
                                Name = exJson.GetProperty("name").GetString() ?? "Exercício",
                                Sets = exJson.TryGetProperty("sets", out var sets) ? sets.GetInt32() : 3,
                                Reps = exJson.TryGetProperty("reps", out var reps) ? reps.GetString() ?? "10" : "10",
                                RestSeconds = exJson.TryGetProperty("restSeconds", out var rest) ? rest.GetInt32() : 60,
                                Notes = exJson.TryGetProperty("notes", out var exNotes) ? exNotes.GetString() : null,
                                Order = order++
                            });
                        }
                    }

                    workout.Days.Add(workoutDay);
                }
            }

            return workout;
        }
        catch (Exception)
        {
            // Fallback: create a basic workout with the AI response as notes
            return new Workout
            {
                UserId = userId,
                Name = "Treino Gerado por IA",
                Notes = $"Resposta da IA (formato inesperado): {aiResponse}"
            };
        }
    }

    private Diet ParseDietResponse(string aiResponse, GenerateDietRequest request, int userId)
    {
        try
        {
            var cleanJson = aiResponse.Trim();
            if (cleanJson.StartsWith("```"))
            {
                var firstNewLine = cleanJson.IndexOf('\n');
                if (firstNewLine >= 0)
                    cleanJson = cleanJson.Substring(firstNewLine + 1);
                
                var lastTicks = cleanJson.LastIndexOf("```");
                if (lastTicks >= 0)
                    cleanJson = cleanJson.Substring(0, lastTicks);
            }

            using var doc = JsonDocument.Parse(cleanJson.Trim());
            var root = doc.RootElement;

            var diet = new Diet
            {
                UserId = userId,
                Name = root.GetProperty("name").GetString() ?? "Dieta Gerada por IA",
                TotalCalories = root.TryGetProperty("totalCalories", out var cal) ? cal.GetInt32() : null,
                Notes = root.TryGetProperty("notes", out var notes) ? notes.GetString() : null
            };

            if (root.TryGetProperty("meals", out var mealsArr))
            {
                int mealOrder = 0;
                foreach (var mealJson in mealsArr.EnumerateArray())
                {
                    var meal = new DietMeal
                    {
                        Name = mealJson.GetProperty("name").GetString() ?? "Refeição",
                        Time = mealJson.TryGetProperty("time", out var time) ? time.GetString() : null,
                        Order = mealOrder++
                    };

                    if (mealJson.TryGetProperty("foods", out var foodsArr))
                    {
                        int foodOrder = 0;
                        foreach (var foodJson in foodsArr.EnumerateArray())
                        {
                            meal.Foods.Add(new DietFood
                            {
                                Name = foodJson.GetProperty("name").GetString() ?? "Alimento",
                                Quantity = foodJson.TryGetProperty("quantity", out var qty) ? qty.GetString() : null,
                                Calories = foodJson.TryGetProperty("calories", out var kcal) ? kcal.GetInt32() : null,
                                Protein = foodJson.TryGetProperty("protein", out var prot) ? prot.GetDouble() : null,
                                Carbs = foodJson.TryGetProperty("carbs", out var carbs) ? carbs.GetDouble() : null,
                                Fat = foodJson.TryGetProperty("fat", out var fat) ? fat.GetDouble() : null,
                                Order = foodOrder++
                            });
                        }
                    }

                    diet.Meals.Add(meal);
                }
            }

            return diet;
        }
        catch (Exception)
        {
            return new Diet
            {
                UserId = userId,
                Name = "Dieta Gerada por IA",
                Notes = $"Resposta da IA (formato inesperado): {aiResponse}"
            };
        }
    }

    /// <summary>
    /// Decrypts an API key stored in the database. If decryption fails
    /// (e.g. legacy plaintext key), returns the raw value as-is for backward compatibility.
    /// </summary>
    private string? DecryptApiKey(string? encryptedKey)
    {
        if (string.IsNullOrEmpty(encryptedKey)) return encryptedKey;
        // Sentinel values that are never encrypted
        if (encryptedKey is "TEST" or "local") return encryptedKey;

        try
        {
            return _protector.Unprotect(encryptedKey);
        }
        catch
        {
            // Graceful fallback: key is likely a legacy plaintext value
            _logger.LogWarning("Failed to decrypt API key — treating as legacy plaintext.");
            return encryptedKey;
        }
    }
}
