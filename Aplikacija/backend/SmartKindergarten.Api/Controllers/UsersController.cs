using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.Users;
using SmartKindergarten.Api.Services;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrator")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserResponseDto>>> GetAll(
            [FromQuery] string? role,
            [FromQuery] bool? isActive)
        {
            if (!string.IsNullOrWhiteSpace(role))
            {
                bool roleIsValid =
                    Enum.TryParse(role, ignoreCase: true, out UserRole parsedRole) &&
                    Enum.IsDefined(typeof(UserRole), parsedRole);

                if (!roleIsValid)
                {
                    return BadRequest("Neispravna korisnička uloga. Dozvoljene vrednosti su: Administrator, Teacher, Parent, AdministrativeStaff.");
                }
            }

            List<UserResponseDto> users = await _userService.GetAllAsync(role, isActive);

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetById(int id)
        {
            UserResponseDto? user = await _userService.GetByIdAsync(id);

            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> Create(CreateUserRequestDto request)
        {
            var result = await _userService.CreateAsync(request);
            if (!result.Success)
            {
                return BadRequest(result.Error);
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.User!.Id },
                result.User
            );
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> Update(int id, UpdateUserRequestDto request)
        {
            var result = await _userService.UpdateAsync(id, request);

            if (!result.Success)
            {
                if (result.Error == "Korisnik nije pronađen.")
                    return NotFound(result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.User);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(int id)
        {
            bool success = await _userService.DeactivateAsync(id);

            if (!success)
                return NotFound("Korisnik nije pronađen.");


            return NoContent();
        }
    }
}