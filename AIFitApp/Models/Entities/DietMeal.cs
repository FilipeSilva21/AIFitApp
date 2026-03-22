namespace AIFitApp.Models.Entities;

public class DietMeal
{
    public int Id { get; set; }
    public int DietId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Time { get; set; }
    public int Order { get; set; }

    // Navigation
    public Diet Diet { get; set; } = null!;
    public List<DietFood> Foods { get; set; } = new();
}
