using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.Children;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChildrenController : ControllerBase
    {
        private readonly ChildService _childService;
        public ChildrenController(ChildService childService)
        {
            _childService = childService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ChildResponseDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? groupId,
            [FromQuery] bool? isActive)
        {
            int currentUserId = GetCurrentUserId();
            string currentUserRole = GetCurrentUserRole();

            List<ChildResponseDto> children = await _childService.GetAllAsync(
                currentUserId,
                currentUserRole,
                search,
                groupId,
                isActive);

            return Ok(children);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChildResponseDto>> GetById(int id)
        {
            int currentUserId = GetCurrentUserId();
            string currentUserRole = GetCurrentUserRole();

            ChildResponseDto? child = await _childService.GetByIdAsync(
                id,
                currentUserId,
                currentUserRole);

            if (child == null)
                return NotFound("Dete nije pronađeno ili nemate pravo pristupa.");

            return Ok(child);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ChildResponseDto>> Create(CreateChildRequestDto request)
        {
            var result = await _childService.CreateAsync(request);

            if (!result.Success)
                return BadRequest(result.Error);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Child!.Id },
                result.Child
            );
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<ChildResponseDto>> Update(int id, UpdateChildRequestDto request)
        {
            var result = await _childService.UpdateAsync(id, request);

            if (!result.Success)
            {
                if (result.Error == "Dete nije pronađeno.")
                    return NotFound(result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Child);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Deactivate(int id)
        {
            bool success = await _childService.DeactivateAsync(id);

            if (!success)
                return NotFound("Dete nije pronađeno.");

            return NoContent();
        }

        [HttpPost("{childId}/parents/{parentId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> AssignParentToChild(int childId, int parentId)
        {
            var result = await _childService.AssignParentToChildAsync(childId, parentId);

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpDelete("{childId}/parents/{parentId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> RemoveParentFromChild(int childId, int parentId)
        {
            var result = await _childService.RemoveParentFromChildAsync(childId, parentId);

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }
        private int GetCurrentUserId()
        {
            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                throw new InvalidOperationException("User ID nije pronađen u tokenu.");

            return int.Parse(userId);
        }

        private string GetCurrentUserRole()
        {
            string? role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrWhiteSpace(role))
                throw new InvalidOperationException("Korisnička uloga nije pronađena u tokenu.");

            return role;
        }
    }
}