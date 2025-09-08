using Microsoft.EntityFrameworkCore;
using RouletteApi.Models;

namespace RouletteApi.Data
{
    public class RouletteContext : DbContext
    {
        public RouletteContext(DbContextOptions<RouletteContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configurar el índice único para el nombre (case-insensitive)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Name)
                .IsUnique();

            // Configurar precision para decimal
            modelBuilder.Entity<User>()
                .Property(u => u.Balance)
                .HasPrecision(18, 2);
        }
    }
}