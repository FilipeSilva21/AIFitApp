using AIFitApp.Models.Enums;

namespace AIFitApp.Models.Entities;

public class WorkoutDay
{
    public int Id { get; set; }
    public int WorkoutId { get; set; }
    public WeekDay DayOfWeek { get; set; }
    public SessionDuration Duration { get; set; }
    public string? MuscleGroup { get; set; }

    // Navigation
    public Workout Workout { get; set; } = null!;
    public List<WorkoutExercise> Exercises { get; set; } = new();
}
