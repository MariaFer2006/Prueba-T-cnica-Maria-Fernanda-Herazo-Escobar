using RouletteApi.Models;
using RouletteApi.Services;

namespace RouletteApi.Services
{
    public class RouletteService : IRouletteService
    {
        private readonly Random _random;

        public RouletteService()
        {
            _random = new Random();
        }

        public RouletteResult SpinRoulette()
        {
            var number = _random.Next(0, 37); // 0-36
            var color = _random.Next(0, 2) == 0 ? "red" : "black";

            return new RouletteResult
            {
                Number = number,
                Color = color
            };
        }

        public decimal CalculatePrize(BetRequest betRequest)
        {
            decimal prize = 0;

            switch (betRequest.BetType.ToLower())
            {
                case "color":
                    if (string.Equals(betRequest.ResultColor, betRequest.Color, StringComparison.OrdinalIgnoreCase))
                    {
                        prize = betRequest.BetAmount * 0.5m; // Gana la mitad del monto apostado
                    }
                    break;

                case "parity":
                    var isResultEven = betRequest.ResultNumber % 2 == 0;
                    var betIsEven = string.Equals(betRequest.Parity, "even", StringComparison.OrdinalIgnoreCase);
                    
                    if (string.Equals(betRequest.ResultColor, betRequest.Color, StringComparison.OrdinalIgnoreCase) 
                        && isResultEven == betIsEven)
                    {
                        prize = betRequest.BetAmount; // Gana el mismo monto apostado
                    }
                    break;

                case "specific":
                    if (betRequest.ResultNumber == betRequest.Number 
                        && string.Equals(betRequest.ResultColor, betRequest.Color, StringComparison.OrdinalIgnoreCase))
                    {
                        prize = betRequest.BetAmount * 3; // Gana el triple del monto apostado
                    }
                    break;
            }

            return prize;
        }
    }
}