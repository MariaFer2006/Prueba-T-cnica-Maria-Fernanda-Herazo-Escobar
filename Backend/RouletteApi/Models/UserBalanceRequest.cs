using System.ComponentModel.DataAnnotations;

namespace RouletteApi.Models
{
    public class UserBalanceRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public decimal Amount { get; set; }
    }
}