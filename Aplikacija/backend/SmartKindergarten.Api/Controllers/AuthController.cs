using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.Auth;
using SmartKindergarten.Api.Services;
using System.Security.Claims;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Korisničko ime i lozinka su obavezni.");
            }

            LoginResponseDto? response = await _authService.LoginAsync(request);
            if (response == null)
            {
                return Unauthorized("Neispravno korisničko ime ili lozinka.");
            }
            return Ok(response);
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            string? username = User.FindFirstValue(ClaimTypes.Name);
            string? email = User.FindFirstValue(ClaimTypes.Email);
            string? role = User.FindFirstValue(ClaimTypes.Role);
            string? fullName = User.FindFirstValue("fullName");

            return Ok(new
            {
                UserId = userId,
                Username = username,
                Email = email,
                Role = role,
                FullName = fullName
            });
        }
    }
}
