using System.ComponentModel.DataAnnotations;

namespace RouletteApi.Models
{
    public class PlaceBetRequest
    {
        [Required]
        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public BetRequest BetRequest { get; set; } = new BetRequest();
    }
}