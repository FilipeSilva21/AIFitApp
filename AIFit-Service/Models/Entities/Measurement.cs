namespace AIFitApp.Models.Entities;

public class Measurement
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public double? Weight { get; set; }
    public double? BodyFatPercentage { get; set; }
    public double? Chest { get; set; }
    public double? Waist { get; set; }
    public double? Hips { get; set; }
    public double? LeftArm { get; set; }
    public double? RightArm { get; set; }
    public double? LeftThigh { get; set; }
    public double? RightThigh { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
