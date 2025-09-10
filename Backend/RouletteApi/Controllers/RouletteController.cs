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

        /// <summary>
        /// Procesa una apuesta completa: calcula premio y actualiza saldo del usuario
        /// </summary>
        [HttpPost("place-bet")]
        public async Task<ActionResult> PlaceBet([FromBody] PlaceBetRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Verificar que el usuario existe y tiene saldo suficiente
                var user = await _userService.GetUserByNameAsync(request.UserName);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                if (user.Balance < request.BetRequest.BetAmount)
                {
                    return BadRequest(new { message = "Saldo insuficiente" });
                }

                // Calcular premio
                var prize = _rouletteService.CalculatePrize(request.BetRequest);

                // Actualizar saldo del usuario
                var updatedUser = await _userService.UpdateUserBalanceAfterBetAsync(
                    request.UserName, 
                    request.BetRequest.BetAmount, 
                    prize);

                return Ok(new { 
                    prize = prize, 
                    newBalance = updatedUser.Balance,
                    won = prize > 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error procesando la apuesta", error = ex.Message });
            }
        }
    }
}