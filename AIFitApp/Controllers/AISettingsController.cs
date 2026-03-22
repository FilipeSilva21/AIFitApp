using System.Security.Claims;
using AIFitApp.Data;
using AIFitApp.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AIFitApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AISettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly Services.AIService _aiService;

    public AISettingsController(AppDbContext db, Services.AIService aiService)
    {
        _db = db;
        _aiService = aiService;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new AISettingsResponse(user.AIProviderType, user.AIProviderType.HasValue && !string.IsNullOrEmpty(user.AIApiKey)));
    }

    [HttpPost("connect")]
    public async Task<IActionResult> Connect([FromBody] AISettingsRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        // Test the connection first
        var isValid = await _aiService.TestConnection(request.Provider, request.ApiKey);
        if (!isValid)
            return BadRequest(new { message = "API key inválida ou sem permissão. Verifique sua chave." });

        user.AIProviderType = request.Provider;
        user.AIApiKey = request.ApiKey;
        await _db.SaveChangesAsync();

        return Ok(new AISettingsResponse(user.AIProviderType, true));
    }

    [HttpDelete("disconnect")]
    public async Task<IActionResult> Disconnect()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.AIProviderType = null;
        user.AIApiKey = null;
        await _db.SaveChangesAsync();

        return Ok(new AISettingsResponse(null, false));
    }
}
