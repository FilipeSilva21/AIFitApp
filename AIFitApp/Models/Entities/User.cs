using AIFitApp.Models.Enums;

namespace AIFitApp.Models.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public AIProvider? AIProviderType { get; set; }
    public string? AIApiKey { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public UserProfile? Profile { get; set; }
    public List<Workout> Workouts { get; set; } = new();
    public List<Diet> Diets { get; set; } = new();
    public List<Measurement> Measurements { get; set; } = new();
}
