using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.Attendance;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendanceService;

        public AttendanceController(AttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpGet("group/{groupId}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<GroupAttendanceResponseDto>> GetByGroupAndDate(
            int groupId,
            [FromQuery] DateTime date)
        {
            var result = await _attendanceService.GetByGroupAndDateAsync(
                groupId,
                date,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Attendance);
        }

        [HttpGet("child/{childId}")]
        public async Task<ActionResult<List<AttendanceResponseDto>>> GetByChild(
            int childId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var result = await _attendanceService.GetByChildAsync(
                childId,
                GetCurrentUserId(),
                GetCurrentUserRole(),
                fromDate,
                toDate);

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Attendances);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,Teacher")]
        public async Task<ActionResult<AttendanceResponseDto>> Create(CreateAttendanceRequestDto request)
        {
            var result = await _attendanceService.CreateAsync(
                request,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Attendance);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Teacher")]
        public async Task<ActionResult<AttendanceResponseDto>> Update(
            int id,
            UpdateAttendanceRequestDto request)
        {
            var result = await _attendanceService.UpdateAsync(
                id,
                request,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Attendance);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator,Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _attendanceService.DeleteAsync(
                id,
                GetCurrentUserId(),
                GetCurrentUserRole());

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