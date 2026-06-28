using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartKindergarten.Api.DTOs.DailyReports;
using SmartKindergarten.Api.Services;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DailyReportsController : ControllerBase
    {
        private readonly DailyReportService _dailyReportService;

        public DailyReportsController(DailyReportService dailyReportService)
        {
            _dailyReportService = dailyReportService;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator,Teacher,Parent")]
        public async Task<ActionResult<List<DailyReportResponseDto>>> GetAll()
        {
            var result = await _dailyReportService.GetAllAsync(
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Reports);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator,Teacher,Parent")]
        public async Task<ActionResult<DailyReportResponseDto>> GetById(int id)
        {
            var result = await _dailyReportService.GetByIdAsync(
                id,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return NotFound(result.Error);

            return Ok(result.Report);
        }

        [HttpGet("group/{groupId}")]
        [Authorize(Roles = "Administrator,Teacher,Parent")]
        public async Task<ActionResult<List<DailyReportResponseDto>>> GetByGroup(int groupId)
        {
            var result = await _dailyReportService.GetByGroupAsync(
                groupId,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Reports);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DailyReportResponseDto>> Create(CreateDailyReportRequestDto request)
        {
            var result = await _dailyReportService.CreateAsync(
                request,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Report);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<DailyReportResponseDto>> Update(
            int id,
            UpdateDailyReportRequestDto request)
        {
            var result = await _dailyReportService.UpdateAsync(
                id,
                request,
                GetCurrentUserId(),
                GetCurrentUserRole());

            if (!result.Success)
                return BadRequest(result.Error);

            return Ok(result.Report);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _dailyReportService.DeleteAsync(
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