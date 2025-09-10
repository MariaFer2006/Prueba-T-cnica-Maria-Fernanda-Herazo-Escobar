using RouletteApi.Models;

namespace RouletteApi.Services
{
    public class RouletteService : IRouletteService
    {
        private readonly Random _random;
        
        // Números rojos en la ruleta europea
        private readonly int[] _redNumbers = { 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36 };

        public RouletteService()
        {
            _random = new Random();
        }

        public RouletteResult SpinRoulette()
        {
            var number = _random.Next(0, 37); // 0-36
            var color = GetColorForNumber(number);

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
                    // El 0 no cuenta como par o impar en la ruleta
                    if (betRequest.ResultNumber != 0)
                    {
                        var isResultEven = betRequest.ResultNumber % 2 == 0;
                        var betIsEven = string.Equals(betRequest.Parity, "even", StringComparison.OrdinalIgnoreCase);
                        
                        if (isResultEven == betIsEven)
                        {
                            prize = betRequest.BetAmount; // Gana el mismo monto apostado
                        }
                    }
                    break;

                case "specific":
                    if (betRequest.ResultNumber == betRequest.Number)
                    {
                        prize = betRequest.BetAmount * 35; // Pago 35:1 para números específicos
                    }
                    break;
            }

            return prize;
        }

        private string GetColorForNumber(int number)
        {
            if (number == 0)
                return "green";
            
            return _redNumbers.Contains(number) ? "red" : "black";
        }
    }
}