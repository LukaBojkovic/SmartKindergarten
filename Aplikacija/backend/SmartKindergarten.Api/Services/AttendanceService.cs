using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Attendance;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class AttendanceService
    {
        private readonly AppDbContext _context;

        public AttendanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? Error, GroupAttendanceResponseDto? Attendance)>
            GetByGroupAndDateAsync(int groupId, DateTime date, int currentUserId, string currentUserRole)
        {
            bool canView = await CanViewGroupAttendanceAsync(groupId, currentUserId, currentUserRole);

            if (!canView)
                return (false, "Grupa nije pronađena ili nemate pravo pristupa.", null);

            DateTime targetDate = NormalizeDate(date);
            DateTime nextDate = targetDate.AddDays(1);

            KindergartenGroup? group = await _context.KindergartenGroups
                .Include(g => g.Children)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                return (false, "Grupa nije pronađena.", null);

            List<int> childIds = group.Children
                .Where(c => c.IsActive)
                .Select(c => c.Id)
                .ToList();

            List<Attendance> attendances = await _context.Attendances
                .Include(a => a.RecordedBy)
                .Where(a =>
                    childIds.Contains(a.ChildId) &&
                    a.Date >= targetDate &&
                    a.Date < nextDate)
                .ToListAsync();

            GroupAttendanceResponseDto response = new GroupAttendanceResponseDto
            {
                GroupId = group.Id,
                GroupName = group.Name,
                Date = targetDate,
                Children = group.Children
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.LastName)
                    .ThenBy(c => c.FirstName)
                    .Select(c =>
                    {
                        Attendance? attendance = attendances.FirstOrDefault(a => a.ChildId == c.Id);

                        return new GroupAttendanceItemDto
                        {
                            AttendanceId = attendance?.Id,
                            ChildId = c.Id,
                            ChildFullName = $"{c.FirstName} {c.LastName}",
                            Date = targetDate,
                            IsPresent = attendance?.IsPresent ?? false,
                            IsRecorded = attendance != null,
                            RecordedByFullName = attendance == null
                                ? null
                                : $"{attendance.RecordedBy.FirstName} {attendance.RecordedBy.LastName}"
                        };
                    })
                    .ToList()
            };

            return (true, null, response);
        }

        public async Task<(bool Success, string? Error, List<AttendanceResponseDto> Attendances)>
            GetByChildAsync(
                int childId,
                int currentUserId,
                string currentUserRole,
                DateTime? fromDate,
                DateTime? toDate)
        {
            bool canView = await CanViewChildAttendanceAsync(childId, currentUserId, currentUserRole);

            if (!canView)
                return (false, "Dete nije pronađeno ili nemate pravo pristupa.", new List<AttendanceResponseDto>());

            IQueryable<Attendance> query = _context.Attendances
                .Include(a => a.Child)
                    .ThenInclude(c => c.Group)
                .Include(a => a.RecordedBy)
                .Where(a => a.ChildId == childId);

            if (fromDate.HasValue)
            {
                DateTime from = NormalizeDate(fromDate.Value);
                query = query.Where(a => a.Date >= from);
            }

            if (toDate.HasValue)
            {
                DateTime to = NormalizeDate(toDate.Value).AddDays(1);
                query = query.Where(a => a.Date < to);
            }

            List<AttendanceResponseDto> attendances = await query
                .OrderByDescending(a => a.Date)
                .Select(a => ToDto(a))
                .ToListAsync();

            return (true, null, attendances);
        }

        public async Task<(bool Success, string? Error, AttendanceResponseDto? Attendance)>
            CreateAsync(CreateAttendanceRequestDto request, int recordedById, string currentUserRole)
        {
            Child? child = await _context.Children
                .Include(c => c.Group)
                .FirstOrDefaultAsync(c => c.Id == request.ChildId);

            if (child == null)
                return (false, "Dete nije pronađeno.", null);

            bool canManage = await CanManageChildAttendanceAsync(request.ChildId, recordedById, currentUserRole);

            if (!canManage)
                return (false, "Nemate pravo da evidentirate prisustvo za ovo dete.", null);

            User? recordedBy = await _context.Users.FindAsync(recordedById);

            if (recordedBy == null)
                return (false, "Korisnik koji evidentira prisustvo nije pronađen.", null);

            DateTime attendanceDate = NormalizeDate(request.Date);

            bool alreadyExists = await AttendanceExistsForDateAsync(request.ChildId, attendanceDate, null);

            if (alreadyExists)
                return (false, "Prisustvo za ovo dete i ovaj datum je već evidentirano.", null);

            Attendance attendance = new Attendance
            {
                ChildId = request.ChildId,
                Child = child,
                Date = attendanceDate,
                IsPresent = request.IsPresent,
                RecordedById = recordedById,
                RecordedBy = recordedBy
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            AttendanceResponseDto? createdAttendance = await GetByIdInternalAsync(attendance.Id);

            return (true, null, createdAttendance);
        }

        public async Task<(bool Success, string? Error, AttendanceResponseDto? Attendance)>
            UpdateAsync(int id, UpdateAttendanceRequestDto request, int currentUserId, string currentUserRole)
        {
            Attendance? attendance = await _context.Attendances
                .Include(a => a.Child)
                    .ThenInclude(c => c.Group)
                .Include(a => a.RecordedBy)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null)
                return (false, "Evidencija prisustva nije pronađena.", null);

            bool canManage = await CanManageChildAttendanceAsync(attendance.ChildId, currentUserId, currentUserRole);

            if (!canManage)
                return (false, "Nemate pravo da menjate ovu evidenciju prisustva.", null);

            if (request.Date.HasValue)
            {
                DateTime newDate = NormalizeDate(request.Date.Value);

                bool alreadyExists = await AttendanceExistsForDateAsync(attendance.ChildId, newDate, attendance.Id);

                if (alreadyExists)
                    return (false, "Već postoji evidencija prisustva za ovo dete i ovaj datum.", null);

                attendance.Date = newDate;
            }

            if (request.IsPresent.HasValue)
                attendance.IsPresent = request.IsPresent.Value;

            await _context.SaveChangesAsync();

            AttendanceResponseDto? updatedAttendance = await GetByIdInternalAsync(attendance.Id);

            return (true, null, updatedAttendance);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id, int currentUserId, string currentUserRole)
        {
            Attendance? attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null)
                return (false, "Evidencija prisustva nije pronađena.");

            bool canManage = await CanManageChildAttendanceAsync(attendance.ChildId, currentUserId, currentUserRole);

            if (!canManage)
                return (false, "Nemate pravo da obrišete ovu evidenciju prisustva.");

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        private async Task<bool> CanViewGroupAttendanceAsync(int groupId, int currentUserId, string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString() ||
                currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return await _context.KindergartenGroups.AnyAsync(g => g.Id == groupId);
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return await _context.TeacherGroups.AnyAsync(tg =>
                    tg.GroupId == groupId &&
                    tg.TeacherId == currentUserId);
            }

            return false;
        }

        private async Task<bool> CanViewChildAttendanceAsync(int childId, int currentUserId, string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString() ||
                currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return await _context.Children.AnyAsync(c => c.Id == childId);
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return await _context.Children.AnyAsync(c =>
                    c.Id == childId &&
                    c.GroupId.HasValue &&
                    _context.TeacherGroups.Any(tg =>
                        tg.TeacherId == currentUserId &&
                        tg.GroupId == c.GroupId.Value));
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return await _context.ParentChildren.AnyAsync(pc =>
                    pc.ChildId == childId &&
                    pc.ParentId == currentUserId);
            }

            return false;
        }

        private async Task<bool> CanManageChildAttendanceAsync(int childId, int currentUserId, string currentUserRole)
        {
            if (currentUserRole == UserRole.Administrator.ToString())
            {
                return await _context.Children.AnyAsync(c => c.Id == childId);
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return await _context.Children.AnyAsync(c =>
                    c.Id == childId &&
                    c.GroupId.HasValue &&
                    _context.TeacherGroups.Any(tg =>
                        tg.TeacherId == currentUserId &&
                        tg.GroupId == c.GroupId.Value));
            }

            return false;
        }

        private async Task<bool> AttendanceExistsForDateAsync(int childId, DateTime date, int? excludedAttendanceId)
        {
            DateTime targetDate = NormalizeDate(date);
            DateTime nextDate = targetDate.AddDays(1);

            IQueryable<Attendance> query = _context.Attendances
                .Where(a =>
                    a.ChildId == childId &&
                    a.Date >= targetDate &&
                    a.Date < nextDate);

            if (excludedAttendanceId.HasValue)
                query = query.Where(a => a.Id != excludedAttendanceId.Value);

            return await query.AnyAsync();
        }

        private async Task<AttendanceResponseDto?> GetByIdInternalAsync(int id)
        {
            Attendance? attendance = await _context.Attendances
                .Include(a => a.Child)
                    .ThenInclude(c => c.Group)
                .Include(a => a.RecordedBy)
                .FirstOrDefaultAsync(a => a.Id == id);

            return attendance == null ? null : ToDto(attendance);
        }

        private static AttendanceResponseDto ToDto(Attendance attendance)
        {
            return new AttendanceResponseDto
            {
                Id = attendance.Id,
                ChildId = attendance.ChildId,
                ChildFullName = $"{attendance.Child.FirstName} {attendance.Child.LastName}",
                GroupId = attendance.Child.GroupId,
                GroupName = attendance.Child.Group != null ? attendance.Child.Group.Name : null,
                Date = attendance.Date,
                IsPresent = attendance.IsPresent,
                RecordedById = attendance.RecordedById,
                RecordedByFullName = $"{attendance.RecordedBy.FirstName} {attendance.RecordedBy.LastName}"
            };
        }

        private static DateTime NormalizeDate(DateTime date)
        {
            return DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        }
    }
}