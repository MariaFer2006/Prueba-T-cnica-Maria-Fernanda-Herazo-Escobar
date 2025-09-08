using RouletteApi.Models;

namespace RouletteApi.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByNameAsync(string name);
        Task<User> SaveOrUpdateUserBalanceAsync(string name, decimal amount);
    }
}