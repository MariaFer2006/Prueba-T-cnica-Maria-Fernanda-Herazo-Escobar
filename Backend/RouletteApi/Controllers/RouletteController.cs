using Microsoft.AspNetCore.Mvc;
using RouletteApi.Models;
using RouletteApi.Services;

namespace RouletteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouletteController : ControllerBase
    {
        private readonly IRouletteService _rouletteService;
        private readonly IUserService _userService;

        public RouletteController(IRouletteService rouletteService, IUserService userService)
        {
            _rouletteService = rouletteService;
            _userService = userService;
        }

        /// <summary>
        /// Gira la ruleta y devuelve un número al azar entre 0 y 36 además de un color
        /// </summary>
        [HttpGet("spin")]
        public ActionResult<RouletteResult> SpinRoulette()
        {
            try
            {
                var result = _rouletteService.SpinRoulette();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Calcula el premio basado en la apuesta realizada
        /// </summary>
        [HttpPost("calculate-prize")]
        public ActionResult<decimal> CalculatePrize([FromBody] BetRequest betRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var prize = _rouletteService.CalculatePrize(betRequest);
                return Ok(new { prize = prize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error calculando el premio", error = ex.Message });
            }
        }
    }
}