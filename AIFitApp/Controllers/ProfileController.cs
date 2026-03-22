using System.Security.Claims;
using AIFitApp.Data;
using AIFitApp.DTOs;
using AIFitApp.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AIFitApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProfileController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
            return Ok(new ProfileResponse(null, null, null, Models.Enums.UserGoal.GeneralFitness, null, null));

        return Ok(new ProfileResponse(
            profile.Age, profile.Weight, profile.Height,
            profile.Goal, profile.TrainingExperience, profile.Injuries
        ));
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProfileRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new UserProfile { UserId = userId };
            _db.UserProfiles.Add(profile);
        }

        profile.Age = request.Age;
        profile.Weight = request.Weight;
        profile.Height = request.Height;
        profile.Goal = request.Goal;
        profile.TrainingExperience = request.TrainingExperience;
        profile.Injuries = request.Injuries;

        await _db.SaveChangesAsync();
        return Ok(new ProfileResponse(
            profile.Age, profile.Weight, profile.Height,
            profile.Goal, profile.TrainingExperience, profile.Injuries
        ));
    }
}
