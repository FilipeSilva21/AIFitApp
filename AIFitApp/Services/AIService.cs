using System.Text;
using System.Text.Json;
using AIFitApp.DTOs;
using AIFitApp.Models.Entities;
using AIFitApp.Models.Enums;

namespace AIFitApp.Services;

public class AIService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public AIService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
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
            if (provider == AIProvider.OpenAI)
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

        return $@"Você é um personal trainer profissional e certificado. Crie um plano de treino de musculação personalizado baseado nas informações do aluno abaixo.

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

        return $@"Você é um nutricionista esportivo profissional e certificado. Crie um plano alimentar personalizado baseado nas informações abaixo.

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

    private async Task<string> CallAI(User user, string prompt)
    {
        if (!user.AIProviderType.HasValue || string.IsNullOrEmpty(user.AIApiKey))
            throw new InvalidOperationException("AI provider not configured. Please connect your AI account first.");

        var client = _httpClientFactory.CreateClient();

        if (user.AIProviderType == AIProvider.OpenAI)
        {
            return await CallOpenAI(client, user.AIApiKey, prompt);
        }
        else
        {
            return await CallGemini(client, user.AIApiKey, prompt);
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
        var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                throw new Exception("Você excedeu o limite de requisições ou a cota gratuita da sua API key (Erro 429). Por favor, verifique o painel da OpenAI ou tente novamente mais tarde.");
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                throw new Exception("Sua chave da API (API Key) é inválida. Por favor, atualize em Configurações de IA no seu perfil.");
                
            var error = await response.Content.ReadAsStringAsync();
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
        var response = await client.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                throw new Exception("Você excedeu o limite de requisições ou a cota gratuita da sua API key (Erro 429). Por favor, aguarde alguns minutos ou verifique o painel do Google AI Studio.");
            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                var tryParse = await response.Content.ReadAsStringAsync();
                if (tryParse.Contains("API key not valid"))
                    throw new Exception("Sua chave da API (API Key) é inválida. Por favor, atualize em Configurações de IA no seu perfil.");
            }
                
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {error}");
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
        // Clean up the response - remove markdown code blocks if present
        var cleanJson = aiResponse.Trim();
        if (cleanJson.StartsWith("```"))
        {
            cleanJson = cleanJson.Substring(cleanJson.IndexOf('\n') + 1);
            cleanJson = cleanJson.Substring(0, cleanJson.LastIndexOf("```"));
        }

        try
        {
            using var doc = JsonDocument.Parse(cleanJson);
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
        catch (JsonException ex)
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
        var cleanJson = aiResponse.Trim();
        if (cleanJson.StartsWith("```"))
        {
            cleanJson = cleanJson.Substring(cleanJson.IndexOf('\n') + 1);
            cleanJson = cleanJson.Substring(0, cleanJson.LastIndexOf("```"));
        }

        try
        {
            using var doc = JsonDocument.Parse(cleanJson);
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
        catch (JsonException)
        {
            return new Diet
            {
                UserId = userId,
                Name = "Dieta Gerada por IA",
                Notes = $"Resposta da IA (formato inesperado): {aiResponse}"
            };
        }
    }
}
