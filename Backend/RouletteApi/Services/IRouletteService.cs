using RouletteApi.Models;

namespace RouletteApi.Services
{
    public interface IRouletteService
    {
        RouletteResult SpinRoulette();
        decimal CalculatePrize(BetRequest betRequest);
    }
}