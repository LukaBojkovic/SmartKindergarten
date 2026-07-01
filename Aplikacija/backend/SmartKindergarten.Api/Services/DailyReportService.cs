using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.DailyReports;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class DailyReportService
    {
        private readonly AppDbContext _context;

        public DailyReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? Error, List<DailyReportResponseDto> Reports)> GetAllAsync(
            int currentUserId,
            string currentUserRole)
        {
            IQueryable<DailyReport> query = BuildVisibleReportsQuery(currentUserId, currentUserRole);

            List<DailyReportResponseDto> reports = await query
                .OrderByDescending(r => r.ReportDate)
                .Select(r => ToDto(r))
                .ToListAsync();

            return (true, null, reports);
        }

        public async Task<(bool Success, string? Error, DailyReportResponseDto? Report)> GetByIdAsync(
            int id,
            int currentUserId,
            string currentUserRole)
        {
            DailyReport? report = await BuildVisibleReportsQuery(currentUserId, currentUserRole)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
                return (false, "Dnevni izveštaj nije pronađen ili nemate pravo pristupa.", null);

            return (true, null, ToDto(report));
        }

        public async Task<(bool Success, string? Error, List<DailyReportResponseDto> Reports)> GetByGroupAsync(
            int groupId,
            int currentUserId,
            string currentUserRole)
        {
            bool canViewGroup = await CanViewGroupReportsAsync(groupId, currentUserId, currentUserRole);

            if (!canViewGroup)
                return (false, "Grupa nije pronađena ili nemate pravo pristupa dnevnim izveštajima za ovu grupu.", new List<DailyReportResponseDto>());

            List<DailyReportResponseDto> reports = await _context.DailyReports
                .Where(r => r.GroupId == groupId)
                .OrderByDescending(r => r.ReportDate)
                .Select(r => ToDto(r))
                .ToListAsync();

            return (true, null, reports);
        }

        public async Task<(bool Success, string? Error, DailyReportResponseDto? Report)> CreateAsync(
            CreateDailyReportRequestDto request,
            int teacherId,
            string currentUserRole)
        {
            if (currentUserRole != UserRole.Teacher.ToString())
                return (false, "Samo vaspitač može da kreira dnevni izveštaj.", null);

            if (string.IsNullOrWhiteSpace(request.Title))
                return (false, "Naslov dnevnog izveštaja je obavezan.", null);

            if (string.IsNullOrWhiteSpace(request.Content))
                return (false, "Sadržaj dnevnog izveštaja je obavezan.", null);

            KindergartenGroup? group = await _context.KindergartenGroups.FindAsync(request.GroupId);

            if (group == null)
                return (false, "Grupa nije pronađena.", null);

            bool teacherAssignedToGroup = await _context.TeacherGroups
                .AnyAsync(tg => tg.TeacherId == teacherId && tg.GroupId == request.GroupId);

            if (!teacherAssignedToGroup)
                return (false, "Nemate pravo da kreirate dnevni izveštaj za ovu grupu.", null);

            User? teacher = await _context.Users.FindAsync(teacherId);

            if (teacher == null)
                return (false, "Vaspitač nije pronađen.", null);

            DailyReport report = new DailyReport
            {
                GroupId = request.GroupId,
                Group = group,
                TeacherId = teacherId,
                Teacher = teacher,
                Title = request.Title.Trim(),
                Content = request.Content.Trim(),
                ImageUrl = request.ImageUrl,
                ReportDate = request.ReportDate.HasValue
                    ? DateTime.SpecifyKind(request.ReportDate.Value, DateTimeKind.Utc)
                    : DateTime.UtcNow
            };

            _context.DailyReports.Add(report);
            await _context.SaveChangesAsync();

            return (true, null, ToDto(report));
        }

        public async Task<(bool Success, string? Error, DailyReportResponseDto? Report)> UpdateAsync(
            int id,
            UpdateDailyReportRequestDto request,
            int currentUserId,
            string currentUserRole)
        {
            DailyReport? report = await _context.DailyReports
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
                return (false, "Dnevni izveštaj nije pronađen.", null);

            bool isReportTeacher =
                currentUserRole == UserRole.Teacher.ToString() &&
                report.TeacherId == currentUserId;

            if (!isReportTeacher)
                return (false, "Nemate pravo da menjate ovaj dnevni izveštaj.", null);

            if (string.IsNullOrWhiteSpace(request.Title))
                return (false, "Naslov dnevnog izveštaja je obavezan.", null);

            if (string.IsNullOrWhiteSpace(request.Content))
                return (false, "Sadržaj dnevnog izveštaja je obavezan.", null);

            report.Title = request.Title.Trim();
            report.Content = request.Content.Trim();
            report.ImageUrl = request.ImageUrl;

            if (request.ReportDate.HasValue)
                report.ReportDate = DateTime.SpecifyKind(request.ReportDate.Value, DateTimeKind.Utc);

            await _context.SaveChangesAsync();

            return (true, null, ToDto(report));
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(
            int id,
            int currentUserId,
            string currentUserRole)
        {
            DailyReport? report = await _context.DailyReports
                .FirstOrDefaultAsync(r => r.Id == id);

            if (report == null)
                return (false, "Dnevni izveštaj nije pronađen.");

            bool isReportTeacher =
                currentUserRole == UserRole.Teacher.ToString() &&
                report.TeacherId == currentUserId;

            if (!isReportTeacher)
                return (false, "Nemate pravo da obrišete ovaj dnevni izveštaj.");

            _context.DailyReports.Remove(report);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        private IQueryable<DailyReport> BuildVisibleReportsQuery(
            int currentUserId,
            string currentUserRole)
        {
            IQueryable<DailyReport> query = _context.DailyReports.AsQueryable();

            if (currentUserRole == UserRole.Administrator.ToString())
            {
                return query;
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return query.Where(r =>
                    _context.TeacherGroups.Any(tg =>
                        tg.TeacherId == currentUserId &&
                        tg.GroupId == r.GroupId));
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return query.Where(r =>
                    _context.Children.Any(c =>
                        c.GroupId == r.GroupId &&
                        c.ParentChildren.Any(pc => pc.ParentId == currentUserId)));
            }

            return query.Where(r => false);
        }

        private async Task<bool> CanViewGroupReportsAsync(
            int groupId,
            int currentUserId,
            string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString())
            {
                return await _context.KindergartenGroups.AnyAsync(g => g.Id == groupId);
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return await _context.TeacherGroups
                    .AnyAsync(tg => tg.GroupId == groupId && tg.TeacherId == currentUserId);
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return await _context.Children
                    .AnyAsync(c =>
                        c.GroupId == groupId &&
                        c.ParentChildren.Any(pc => pc.ParentId == currentUserId));
            }

            return false;
        }

        private static DailyReportResponseDto ToDto(DailyReport report)
        {
            return new DailyReportResponseDto
            {
                Id = report.Id,
                GroupId = report.GroupId,
                TeacherId = report.TeacherId,
                Title = report.Title,
                Content = report.Content,
                ImageUrl = report.ImageUrl,
                ReportDate = report.ReportDate
            };
        }
    }
}
