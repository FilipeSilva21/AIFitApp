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
public class WorkoutController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AIService _aiService;

    public WorkoutController(AppDbContext db, AIService aiService)
    {
        _db = db;
        _aiService = aiService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var workouts = await _db.Workouts
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WorkoutResponse(
                w.Id, w.Name, w.Notes, w.CreatedAt,
                w.Days.Select(d => new WorkoutDayResponse(
                    d.Id, d.DayOfWeek, d.Duration, d.MuscleGroup,
                    d.Exercises.OrderBy(e => e.Order).Select(e => new WorkoutExerciseResponse(
                        e.Id, e.Name, e.Sets, e.Reps, e.RestSeconds, e.Notes
                    )).ToList()
                )).ToList()
            )).ToListAsync();

        return Ok(workouts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var workout = await _db.Workouts
            .Where(w => w.Id == id && w.UserId == userId)
            .Select(w => new WorkoutResponse(
                w.Id, w.Name, w.Notes, w.CreatedAt,
                w.Days.Select(d => new WorkoutDayResponse(
                    d.Id, d.DayOfWeek, d.Duration, d.MuscleGroup,
                    d.Exercises.OrderBy(e => e.Order).Select(e => new WorkoutExerciseResponse(
                        e.Id, e.Name, e.Sets, e.Reps, e.RestSeconds, e.Notes
                    )).ToList()
                )).ToList()
            )).FirstOrDefaultAsync();

        if (workout == null) return NotFound();
        return Ok(workout);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateWorkoutRequest request)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!user.AIProviderType.HasValue || string.IsNullOrEmpty(user.AIApiKey))
            return BadRequest(new { message = "Configure sua conta de IA antes de gerar treinos." });

        try
        {
            var workout = await _aiService.GenerateWorkout(request, user);
            _db.Workouts.Add(workout);
            await _db.SaveChangesAsync();

            // Reload with navigation properties
            var result = await _db.Workouts
                .Where(w => w.Id == workout.Id)
                .Select(w => new WorkoutResponse(
                    w.Id, w.Name, w.Notes, w.CreatedAt,
                    w.Days.Select(d => new WorkoutDayResponse(
                        d.Id, d.DayOfWeek, d.Duration, d.MuscleGroup,
                        d.Exercises.OrderBy(e => e.Order).Select(e => new WorkoutExerciseResponse(
                            e.Id, e.Name, e.Sets, e.Reps, e.RestSeconds, e.Notes
                        )).ToList()
                    )).ToList()
                )).FirstAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Erro ao gerar treino: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var workout = await _db.Workouts
            .Include(w => w.Days).ThenInclude(d => d.Exercises)
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (workout == null) return NotFound();

        _db.Workouts.Remove(workout);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
