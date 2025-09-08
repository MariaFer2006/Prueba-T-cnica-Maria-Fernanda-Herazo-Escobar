using Microsoft.EntityFrameworkCore;
using RouletteApi.Data;
using RouletteApi.Models;

namespace RouletteApi.Services
{
    public class UserService : IUserService
    {
        private readonly RouletteContext _context;

        public UserService(RouletteContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByNameAsync(string name)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Name.ToLower() == name.ToLower());
        }

        public async Task<User> SaveOrUpdateUserBalanceAsync(string name, decimal amount)
        {
            var existingUser = await GetUserByNameAsync(name);

            if (existingUser != null)
            {
                // Usuario existe, actualizar saldo
                existingUser.Balance += amount;
                existingUser.UpdatedAt = DateTime.UtcNow;
                _context.Users.Update(existingUser);
            }
            else
            {
                // Usuario nuevo, crear registro
                existingUser = new User
                {
                    Name = name,
                    Balance = amount,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Users.Add(existingUser);
            }

            await _context.SaveChangesAsync();
            return existingUser;
        }
    }
}