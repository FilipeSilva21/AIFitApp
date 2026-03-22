namespace AIFitApp.Models.Entities;

public class DietFood
{
    public int Id { get; set; }
    public int DietMealId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Quantity { get; set; }
    public int? Calories { get; set; }
    public double? Protein { get; set; }
    public double? Carbs { get; set; }
    public double? Fat { get; set; }
    public int Order { get; set; }

    // Navigation
    public DietMeal DietMeal { get; set; } = null!;
}
