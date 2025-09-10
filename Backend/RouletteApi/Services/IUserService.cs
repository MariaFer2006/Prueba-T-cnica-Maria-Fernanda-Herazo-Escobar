using RouletteApi.Models;

namespace RouletteApi.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByNameAsync(string name);
        Task<User> SaveOrUpdateUserBalanceAsync(string name, decimal amount);
        Task<User> UpdateUserBalanceAfterBetAsync(string name, decimal betAmount, decimal prizeAmount);
    }
}