using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.Groups;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly GroupService _groupService;
        public GroupsController(GroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet]
        public async Task<ActionResult<List<GroupResponseDto>>> GetAll([FromQuery] string? search)
        {
            int currentUserId = GetCurrentUserId();
            string currentUserRole = GetCurrentUserRole();

            List<GroupResponseDto> groups = await _groupService.GetAllAsync(currentUserId, currentUserRole, search);

            return Ok(groups);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GroupResponseDto>> GetById(int id)
        {
            int currentUserId = GetCurrentUserId();
            string currentUserRole = GetCurrentUserRole();

            GroupResponseDto? group = await _groupService.GetByIdAsync(id, currentUserId, currentUserRole);

            if (group == null)
                return NotFound("Grupa nije pronađena ili nemate pravo pristupa.");

            return Ok(group);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<GroupResponseDto>> Create(CreateGroupRequestDto request)
        {
            var result = await _groupService.CreateAsync(request);

            if (!result.Success)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(GetById), new { id = result.Group!.Id }, result.Group);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<GroupResponseDto>> Update(int id, UpdateGroupRequestDto request)
        {
            var result = await _groupService.UpdateAsync(id, request);

            if (!result.Success)
            {
                if (result.Error == "Grupa nije pronađena.")
                    return NotFound(result.Error);

                return BadRequest(result.Error);
            }

            return Ok(result.Group);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _groupService.DeleteAsync(id);

            if (!result.Success)
            {
                if (result.Error == "Grupa nije pronađena.")
                    return NotFound(result.Error);

                return BadRequest(result.Error);
            }

            return NoContent();
        }

        [HttpPost("{groupId}/children/{childId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> AssignChildToGroup(int groupId, int childId)
        {
            var result = await _groupService.AssignChildToGroupAsync(groupId, childId);

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpDelete("{groupId}/children/{childId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> RemoveChildFromGroup(int groupId, int childId)
        {
            var result = await _groupService.RemoveChildFromGroupAsync(groupId, childId);

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpPost("{groupId}/teachers/{teacherId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> AssignTeacherToGroup(int groupId, int teacherId)
        {
            var result = await _groupService.AssignTeacherToGroupAsync(groupId, teacherId);

            if (!result.Success)
                return BadRequest(result.Error);

            return NoContent();
        }

        [HttpDelete("{groupId}/teachers/{teacherId}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> RemoveTeacherFromGroup(int groupId, int teacherId)
        {
            var result = await _groupService.RemoveTeacherFromGroupAsync(groupId, teacherId);

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