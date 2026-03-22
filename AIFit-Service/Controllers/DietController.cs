using System.Security.Claims;
using AIFitApp.Data;
using AIFitApp.DTOs;
using AIFitApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AIFitApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DietController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AIService _aiService;

    public DietController(AppDbContext db, AIService aiService)
    {
        _db = db;
        _aiService = aiService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var diets = await _db.Diets
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DietResponse(
                d.Id, d.Name, d.TotalCalories, d.Notes, d.CreatedAt,
                d.Meals.OrderBy(m => m.Order).Select(m => new DietMealResponse(
                    m.Id, m.Name, m.Time,
                    m.Foods.OrderBy(f => f.Order).Select(f => new DietFoodResponse(
                        f.Id, f.Name, f.Quantity, f.Calories, f.Protein, f.Carbs, f.Fat
                    )).ToList()
                )).ToList()
            )).ToListAsync();

        return Ok(diets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var diet = await _db.Diets
            .Where(d => d.Id == id && d.UserId == userId)
            .Select(d => new DietResponse(
                d.Id, d.Name, d.TotalCalories, d.Notes, d.CreatedAt,
                d.Meals.OrderBy(m => m.Order).Select(m => new DietMealResponse(
                    m.Id, m.Name, m.Time,
                    m.Foods.OrderBy(f => f.Order).Select(f => new DietFoodResponse(
                        f.Id, f.Name, f.Quantity, f.Calories, f.Protein, f.Carbs, f.Fat
                    )).ToList()
                )).ToList()
            )).FirstOrDefaultAsync();

        if (diet == null) return NotFound();
        return Ok(diet);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateDietRequest request)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!user.AIProviderType.HasValue || string.IsNullOrEmpty(user.AIApiKey))
            return BadRequest(new { message = "Configure sua conta de IA antes de gerar dietas." });

        try
        {
            var diet = await _aiService.GenerateDiet(request, user);
            _db.Diets.Add(diet);
            await _db.SaveChangesAsync();

            var result = await _db.Diets
                .Where(d => d.Id == diet.Id)
                .Select(d => new DietResponse(
                    d.Id, d.Name, d.TotalCalories, d.Notes, d.CreatedAt,
                    d.Meals.OrderBy(m => m.Order).Select(m => new DietMealResponse(
                        m.Id, m.Name, m.Time,
                        m.Foods.OrderBy(f => f.Order).Select(f => new DietFoodResponse(
                            f.Id, f.Name, f.Quantity, f.Calories, f.Protein, f.Carbs, f.Fat
                        )).ToList()
                    )).ToList()
                )).FirstAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Erro ao gerar dieta: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var diet = await _db.Diets
            .Include(d => d.Meals).ThenInclude(m => m.Foods)
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

        if (diet == null) return NotFound();

        _db.Diets.Remove(diet);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
