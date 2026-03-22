using AIFitApp.Models.Enums;

namespace AIFitApp.Models.Entities;

public class UserProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? Age { get; set; }
    public double? Weight { get; set; }
    public double? Height { get; set; }
    public UserGoal Goal { get; set; } = UserGoal.GeneralFitness;
    public string? TrainingExperience { get; set; }
    public string? Injuries { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
