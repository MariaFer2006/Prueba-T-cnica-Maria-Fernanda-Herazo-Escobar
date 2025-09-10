using System.ComponentModel.DataAnnotations;

namespace RouletteApi.Models
{
    public class BetRequest
    {
        [Required]
        public string BetType { get; set; } = string.Empty; // "color", "parity", "specific"
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal BetAmount { get; set; }
        
        public string? Color { get; set; } // "red" or "black"
        public string? Parity { get; set; } // "even" or "odd"
        public int? Number { get; set; } // 0-36
        
        [Required]
        [Range(0, 36, ErrorMessage = "El número debe estar entre 0 y 36")]
        public int ResultNumber { get; set; } // Número obtenido de la ruleta
        
        [Required]
        public string ResultColor { get; set; } = string.Empty; // Color obtenido de la ruleta
    }
}