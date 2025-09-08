using Microsoft.AspNetCore.Mvc;
using RouletteApi.Models;
using RouletteApi.Services;

namespace RouletteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Obtiene el saldo de un usuario por su nombre
        /// </summary>
        [HttpGet("{name}")]
        public async Task<ActionResult<User>> GetUser(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { message = "El nombre es requerido" });
            }

            try
            {
                var user = await _userService.GetUserByNameAsync(name);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Guarda o actualiza el saldo de un usuario
        /// </summary>
        [HttpPost("save-balance")]
        public async Task<ActionResult<User>> SaveUserBalance([FromBody] UserBalanceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userService.SaveOrUpdateUserBalanceAsync(request.Name, request.Amount);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error guardando el usuario", error = ex.Message });
            }
        }
    }
}