using AIFitApp.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIFitApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutDay> WorkoutDays => Set<WorkoutDay>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<Diet> Diets => Set<Diet>();
    public DbSet<DietMeal> DietMeals => Set<DietMeal>();
    public DbSet<DietFood> DietFoods => Set<DietFood>();
    public DbSet<Measurement> Measurements => Set<Measurement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasOne(u => u.Profile).WithOne(p => p.User).HasForeignKey<UserProfile>(p => p.UserId);
        });

        // Workout chain
        modelBuilder.Entity<Workout>(e =>
        {
            e.HasOne(w => w.User).WithMany(u => u.Workouts).HasForeignKey(w => w.UserId);
        });
        modelBuilder.Entity<WorkoutDay>(e =>
        {
            e.HasOne(d => d.Workout).WithMany(w => w.Days).HasForeignKey(d => d.WorkoutId);
        });
        modelBuilder.Entity<WorkoutExercise>(e =>
        {
            e.HasOne(ex => ex.WorkoutDay).WithMany(d => d.Exercises).HasForeignKey(ex => ex.WorkoutDayId);
        });

        // Diet chain
        modelBuilder.Entity<Diet>(e =>
        {
            e.HasOne(d => d.User).WithMany(u => u.Diets).HasForeignKey(d => d.UserId);
        });
        modelBuilder.Entity<DietMeal>(e =>
        {
            e.HasOne(m => m.Diet).WithMany(d => d.Meals).HasForeignKey(m => m.DietId);
        });
        modelBuilder.Entity<DietFood>(e =>
        {
            e.HasOne(f => f.DietMeal).WithMany(m => m.Foods).HasForeignKey(f => f.DietMealId);
        });

        // Measurement
        modelBuilder.Entity<Measurement>(e =>
        {
            e.HasOne(m => m.User).WithMany(u => u.Measurements).HasForeignKey(m => m.UserId);
        });
    }
}
