namespace AIFitApp.Models.Entities;

public class WorkoutExercise
{
    public int Id { get; set; }
    public int WorkoutDayId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public string Reps { get; set; } = string.Empty;
    public int? RestSeconds { get; set; }
    public string? Notes { get; set; }
    public int Order { get; set; }

    // Navigation
    public WorkoutDay WorkoutDay { get; set; } = null!;
}
