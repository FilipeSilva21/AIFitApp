using AIFitApp.Models.Enums;

namespace AIFitApp.DTOs;

// ======= Auth =======
public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string Name, string Email, bool HasAIProvider);

// ======= AI Settings =======
public record AISettingsRequest(AIProvider Provider, string ApiKey);
public record AISettingsResponse(AIProvider? Provider, bool IsConfigured);

// ======= Profile =======
public record ProfileRequest(int? Age, double? Weight, double? Height, UserGoal Goal, string? TrainingExperience, string? Injuries);
public record ProfileResponse(int? Age, double? Weight, double? Height, UserGoal Goal, string? TrainingExperience, string? Injuries);

// ======= Workout Generation =======
public record GenerateWorkoutRequest(
    UserGoal Goal,
    string? TrainingExperience,
    string? Injuries,
    List<WeekDay> AvailableDays,
    SessionDuration Duration,
    string? AdditionalNotes,
    string? Language = "pt"
);

// ======= Workout Response =======
public record WorkoutResponse(
    int Id,
    string Name,
    string? Notes,
    DateTime CreatedAt,
    List<WorkoutDayResponse> Days
);
public record WorkoutDayResponse(
    int Id,
    WeekDay DayOfWeek,
    SessionDuration Duration,
    string? MuscleGroup,
    List<WorkoutExerciseResponse> Exercises
);
public record WorkoutExerciseResponse(
    int Id,
    string Name,
    int Sets,
    string Reps,
    int? RestSeconds,
    string? Notes
);

// ======= Diet Generation =======
public record GenerateDietRequest(
    UserGoal Goal,
    double? Weight,
    double? Height,
    int? Age,
    int? TargetCalories,
    string? Restrictions,
    string? AdditionalNotes,
    string? Language = "pt"
);

// ======= Diet Response =======
public record DietResponse(
    int Id,
    string Name,
    int? TotalCalories,
    string? Notes,
    DateTime CreatedAt,
    List<DietMealResponse> Meals
);
public record DietMealResponse(
    int Id,
    string Name,
    string? Time,
    List<DietFoodResponse> Foods
);
public record DietFoodResponse(
    int Id,
    string Name,
    string? Quantity,
    int? Calories,
    double? Protein,
    double? Carbs,
    double? Fat
);

// ======= Measurement =======
public record MeasurementRequest(
    DateTime Date,
    double? Weight,
    double? BodyFatPercentage,
    double? Chest,
    double? Waist,
    double? Hips,
    double? LeftArm,
    double? RightArm,
    double? LeftThigh,
    double? RightThigh,
    string? Notes
);
public record MeasurementResponse(
    int Id,
    DateTime Date,
    double? Weight,
    double? BodyFatPercentage,
    double? Chest,
    double? Waist,
    double? Hips,
    double? LeftArm,
    double? RightArm,
    double? LeftThigh,
    double? RightThigh,
    string? Notes
);
