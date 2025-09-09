public async Task<User> SaveOrUpdateUserBalanceAsync(string name, decimal finalBalance)
{
    var existingUser = await GetUserByNameAsync(name);

    if (existingUser != null)
    {
        // Sobrescribimos con el saldo final que manda el frontend
        existingUser.Balance = finalBalance;
        existingUser.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(existingUser);
    }
    else
    {
        // Usuario nuevo → creamos con el saldo inicial
        existingUser = new User
        {
            Name = name,
            Balance = finalBalance,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Users.Add(existingUser);
    }

    await _context.SaveChangesAsync();
    return existingUser;
}
