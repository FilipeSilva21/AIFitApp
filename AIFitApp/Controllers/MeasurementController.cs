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
public class MeasurementController : ControllerBase
{
    private readonly AppDbContext _db;

    public MeasurementController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var measurements = await _db.Measurements
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.Date)
            .Select(m => new MeasurementResponse(
                m.Id, m.Date, m.Weight, m.BodyFatPercentage,
                m.Chest, m.Waist, m.Hips,
                m.LeftArm, m.RightArm, m.LeftThigh, m.RightThigh,
                m.Notes
            )).ToListAsync();

        return Ok(measurements);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MeasurementRequest request)
    {
        var userId = GetUserId();
        var measurement = new Measurement
        {
            UserId = userId,
            Date = request.Date,
            Weight = request.Weight,
            BodyFatPercentage = request.BodyFatPercentage,
            Chest = request.Chest,
            Waist = request.Waist,
            Hips = request.Hips,
            LeftArm = request.LeftArm,
            RightArm = request.RightArm,
            LeftThigh = request.LeftThigh,
            RightThigh = request.RightThigh,
            Notes = request.Notes
        };

        _db.Measurements.Add(measurement);
        await _db.SaveChangesAsync();

        return Ok(new MeasurementResponse(
            measurement.Id, measurement.Date, measurement.Weight, measurement.BodyFatPercentage,
            measurement.Chest, measurement.Waist, measurement.Hips,
            measurement.LeftArm, measurement.RightArm, measurement.LeftThigh, measurement.RightThigh,
            measurement.Notes
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] MeasurementRequest request)
    {
        var userId = GetUserId();
        var measurement = await _db.Measurements.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
        if (measurement == null) return NotFound();

        measurement.Date = request.Date;
        measurement.Weight = request.Weight;
        measurement.BodyFatPercentage = request.BodyFatPercentage;
        measurement.Chest = request.Chest;
        measurement.Waist = request.Waist;
        measurement.Hips = request.Hips;
        measurement.LeftArm = request.LeftArm;
        measurement.RightArm = request.RightArm;
        measurement.LeftThigh = request.LeftThigh;
        measurement.RightThigh = request.RightThigh;
        measurement.Notes = request.Notes;

        await _db.SaveChangesAsync();

        return Ok(new MeasurementResponse(
            measurement.Id, measurement.Date, measurement.Weight, measurement.BodyFatPercentage,
            measurement.Chest, measurement.Waist, measurement.Hips,
            measurement.LeftArm, measurement.RightArm, measurement.LeftThigh, measurement.RightThigh,
            measurement.Notes
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var measurement = await _db.Measurements.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
        if (measurement == null) return NotFound();

        _db.Measurements.Remove(measurement);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
