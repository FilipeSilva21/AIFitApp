using AIFitApp.DTOs;
using AIFitApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace AIFitApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.Register(request);
        if (result == null)
            return BadRequest(new { message = "Email já cadastrado." });
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.Login(request);
        if (result == null)
            return Unauthorized(new { message = "Email ou senha inválidos." });
        return Ok(result);
    }
}
