using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.DailyReports;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DailyReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DailyReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<List<DailyReportResponseDto>>> GetAll()
        {
            var reports = await _context.DailyReports
                .OrderByDescending(r => r.ReportDate)
                .Select(r => new DailyReportResponseDto
                {
                    Id = r.Id,
                    GroupId = r.GroupId,
                    TeacherId = r.TeacherId,
                    Title = r.Title,
                    Content = r.Content,
                    ImageUrl = r.ImageUrl,
                    ReportDate = r.ReportDate
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<DailyReportResponseDto>> GetById(int id)
        {
            var report = await _context.DailyReports
                .Where(r => r.Id == id)
                .Select(r => new DailyReportResponseDto
                {
                    Id = r.Id,
                    GroupId = r.GroupId,
                    TeacherId = r.TeacherId,
                    Title = r.Title,
                    Content = r.Content,
                    ImageUrl = r.ImageUrl,
                    ReportDate = r.ReportDate
                })
                .FirstOrDefaultAsync();

            if (report == null)
                return NotFound("Dnevni izveštaj nije pronađen.");

            return Ok(report);
        }

        [HttpGet("group/{groupId}")]
        [Authorize(Roles = "Administrator,Teacher,AdministrativeStaff")]
        public async Task<ActionResult<List<DailyReportResponseDto>>> GetByGroup(int groupId)
        {
            var reports = await _context.DailyReports
                .Where(r => r.GroupId == groupId)
                .OrderByDescending(r => r.ReportDate)
                .Select(r => new DailyReportResponseDto
                {
                    Id = r.Id,
                    GroupId = r.GroupId,
                    TeacherId = r.TeacherId,
                    Title = r.Title,
                    Content = r.Content,
                    ImageUrl = r.ImageUrl,
                    ReportDate = r.ReportDate
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,Teacher")]
        public async Task<ActionResult<DailyReportResponseDto>> Create(CreateDailyReportRequestDto request)
        {
            var teacherId = GetCurrentUserId();

            var group = await _context.KindergartenGroups.FindAsync(request.GroupId);
            if (group == null)
                return BadRequest("Grupa nije pronađena.");

            var teacher = await _context.Users.FindAsync(teacherId);
            if (teacher == null)
                return BadRequest("Korisnik nije pronađen.");

            var report = new DailyReport
            {
                GroupId = request.GroupId,
                Group = group,
                TeacherId = teacherId,
                Teacher = teacher,
                Title = request.Title,
                Content = request.Content,
                ImageUrl = request.ImageUrl,
                ReportDate = request.ReportDate ?? DateTime.UtcNow
            };

            _context.DailyReports.Add(report);
            await _context.SaveChangesAsync();

            var response = new DailyReportResponseDto
            {
                Id = report.Id,
                GroupId = report.GroupId,
                TeacherId = report.TeacherId,
                Title = report.Title,
                Content = report.Content,
                ImageUrl = report.ImageUrl,
                ReportDate = report.ReportDate
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Teacher")]
        public async Task<ActionResult<DailyReportResponseDto>> Update(
            int id,
            UpdateDailyReportRequestDto request)
        {
            var report = await _context.DailyReports.FindAsync(id);

            if (report == null)
                return NotFound("Dnevni izveštaj nije pronađen.");

            report.Title = request.Title;
            report.Content = request.Content;
            report.ImageUrl = request.ImageUrl;

            if (request.ReportDate.HasValue)
                report.ReportDate = request.ReportDate.Value;

            await _context.SaveChangesAsync();

            var response = new DailyReportResponseDto
            {
                Id = report.Id,
                GroupId = report.GroupId,
                TeacherId = report.TeacherId,
                Title = report.Title,
                Content = report.Content,
                ImageUrl = report.ImageUrl,
                ReportDate = report.ReportDate
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator,Teacher")]
        public async Task<IActionResult> Delete(int id)
        {
            var report = await _context.DailyReports.FindAsync(id);

            if (report == null)
                return NotFound("Dnevni izveštaj nije pronađen.");

            _context.DailyReports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetCurrentUserId()
        {
            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                throw new InvalidOperationException("User ID nije pronađen u tokenu.");

            return int.Parse(userId);
        }
    }
}