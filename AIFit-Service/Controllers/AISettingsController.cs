using System.Security.Claims;
using AIFitApp.Data;
using AIFitApp.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
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
    private readonly IDataProtector _protector;

    public AISettingsController(AppDbContext db, Services.AIService aiService, IDataProtectionProvider protectionProvider)
    {
        _db = db;
        _aiService = aiService;
        _protector = protectionProvider.CreateProtector("AIFitApp.ApiKeys");
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

        // Test the connection with the plaintext key first
        var isValid = await _aiService.TestConnection(request.Provider, request.ApiKey);
        if (!isValid)
            return BadRequest(new { message = "API key inválida ou sem permissão. Verifique sua chave." });

        user.AIProviderType = request.Provider;
        // Encrypt the API key before storing (skip encryption for local/test keys)
        user.AIApiKey = request.ApiKey == "TEST" || request.ApiKey == "local"
            ? request.ApiKey
            : _protector.Protect(request.ApiKey);
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
