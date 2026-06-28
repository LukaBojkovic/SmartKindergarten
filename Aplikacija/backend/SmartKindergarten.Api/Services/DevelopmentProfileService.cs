using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.DevelopmentProfiles;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class DevelopmentProfileService
    {
        private readonly AppDbContext _context;
        public DevelopmentProfileService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? Error, List<DevelopmentNoteResponseDto> Notes)> 
            GetNotesAsync(int childId, int currentUserId, string currentUserRole)
        {
            bool canView = await CanViewChildAsync(childId, currentUserId, currentUserRole);

            if (!canView)
                return (false, "Dete nije pronađeno ili nemate pravo pristupa.", new List<DevelopmentNoteResponseDto>());

            List<DevelopmentNoteResponseDto> notes = await _context.DevelopmentNotes
                .Include(n => n.Child)
                .Include(n => n.Teacher)
                .Where(n => n.ChildId == childId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => ToNoteDto(n))
                .ToListAsync();

            return (true, null, notes);
        }

        public async Task<(bool Success, string? Error, DevelopmentNoteResponseDto? Note)> 
            CreateNoteAsync(int childId, int teacherId, CreateDevelopmentNoteRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return (false, "Tekst beleške je obavezan.", null);

            bool canManage = await CanManageChildDevelopmentAsync(childId, teacherId);

            if (!canManage)
                return (false, "Nemate pravo da vodite razvojni profil ovog deteta.", null);

            Child? child = await _context.Children.FindAsync(childId);
            User? teacher = await _context.Users.FindAsync(teacherId);

            if (child == null || teacher == null)
                return (false, "Dete ili vaspitač nisu pronađeni.", null);

            DevelopmentNote note = new DevelopmentNote
            {
                ChildId = childId,
                Child = child,
                TeacherId = teacherId,
                Teacher = teacher,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.DevelopmentNotes.Add(note);
            await _context.SaveChangesAsync();

            DevelopmentNoteResponseDto? createdNote = await GetNoteByIdAsync(note.Id);

            return (true, null, createdNote);
        }

        public async Task<(bool Success, string? Error, DevelopmentNoteResponseDto? Note)> 
            UpdateNoteAsync(int noteId, int teacherId, UpdateDevelopmentNoteRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return (false, "Tekst beleške je obavezan.", null);

            DevelopmentNote? note = await _context.DevelopmentNotes
                .FirstOrDefaultAsync(n => n.Id == noteId);

            if (note == null)
                return (false, "Beleška nije pronađena.", null);

            bool canManage = await CanManageChildDevelopmentAsync(note.ChildId, teacherId);

            if (!canManage)
                return (false, "Nemate pravo da menjate ovu belešku.", null);

            note.Content = request.Content.Trim();

            await _context.SaveChangesAsync();

            DevelopmentNoteResponseDto? updatedNote = await GetNoteByIdAsync(note.Id);

            return (true, null, updatedNote);
        }

        public async Task<(bool Success, string? Error)> DeleteNoteAsync(int noteId, int teacherId)
        {
            DevelopmentNote? note = await _context.DevelopmentNotes
                .FirstOrDefaultAsync(n => n.Id == noteId);

            if (note == null)
                return (false, "Beleška nije pronađena.");

            bool canManage = await CanManageChildDevelopmentAsync(note.ChildId, teacherId);

            if (!canManage)
                return (false, "Nemate pravo da obrišete ovu belešku.");

            _context.DevelopmentNotes.Remove(note);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error, List<DevelopmentAssessmentResponseDto> Assessments)> 
            GetAssessmentsAsync(int childId, int currentUserId, string currentUserRole, string? area)
        {
            bool canView = await CanViewChildAsync(childId, currentUserId, currentUserRole);

            if (!canView)
                return (false, "Dete nije pronađeno ili nemate pravo pristupa.", new List<DevelopmentAssessmentResponseDto>());

            IQueryable<DevelopmentAssessment> query = _context.DevelopmentAssessments
                .Include(a => a.Child)
                .Include(a => a.Teacher)
                .Where(a => a.ChildId == childId);

            if (!string.IsNullOrWhiteSpace(area))
            {
                if (!Enum.TryParse(area, ignoreCase: true, out DevelopmentArea parsedArea) ||
                    !Enum.IsDefined(typeof(DevelopmentArea), parsedArea))
                {
                    return (false, "Neispravna oblast razvoja.", new List<DevelopmentAssessmentResponseDto>());
                }

                query = query.Where(a => a.Area == parsedArea);
            }

            List<DevelopmentAssessmentResponseDto> assessments = await query
                .OrderByDescending(a => a.AssessmentDate)
                .Select(a => ToAssessmentDto(a))
                .ToListAsync();

            return (true, null, assessments);
        }

        public async Task<(bool Success, string? Error, DevelopmentAssessmentResponseDto? Assessment)> 
            CreateAssessmentAsync(int childId, int teacherId, CreateDevelopmentAssessmentRequestDto request)
        {
            bool canManage = await CanManageChildDevelopmentAsync(childId, teacherId);

            if (!canManage)
                return (false, "Nemate pravo da vodite razvojni profil ovog deteta.", null);

            if (!Enum.TryParse(request.Area, ignoreCase: true, out DevelopmentArea area) ||
                !Enum.IsDefined(typeof(DevelopmentArea), area))
            {
                return (false, "Neispravna oblast razvoja.", null);
            }

            if (request.Score < 1 || request.Score > 5)
                return (false, "Ocena razvoja mora biti u opsegu od 1 do 5.", null);

            Child? child = await _context.Children.FindAsync(childId);
            User? teacher = await _context.Users.FindAsync(teacherId);

            if (child == null || teacher == null)
                return (false, "Dete ili vaspitač nisu pronađeni.", null);

            DevelopmentAssessment assessment = new DevelopmentAssessment
            {
                ChildId = childId,
                Child = child,
                TeacherId = teacherId,
                Teacher = teacher,
                Area = area,
                Score = request.Score,
                Comment = request.Comment,
                AssessmentDate = request.AssessmentDate.HasValue
                    ? DateTime.SpecifyKind(request.AssessmentDate.Value, DateTimeKind.Utc)
                    : DateTime.UtcNow
            };

            _context.DevelopmentAssessments.Add(assessment);
            await _context.SaveChangesAsync();

            DevelopmentAssessmentResponseDto? createdAssessment = await GetAssessmentByIdAsync(assessment.Id);

            return (true, null, createdAssessment);
        }

        public async Task<(bool Success, string? Error, DevelopmentAssessmentResponseDto? Assessment)> 
            UpdateAssessmentAsync(int assessmentId, int teacherId, UpdateDevelopmentAssessmentRequestDto request)
        {
            DevelopmentAssessment? assessment = await _context.DevelopmentAssessments
                .FirstOrDefaultAsync(a => a.Id == assessmentId);

            if (assessment == null)
                return (false, "Procena razvoja nije pronađena.", null);

            bool canManage = await CanManageChildDevelopmentAsync(assessment.ChildId, teacherId);

            if (!canManage)
                return (false, "Nemate pravo da menjate ovu procenu.", null);

            if (!string.IsNullOrWhiteSpace(request.Area))
            {
                if (!Enum.TryParse(request.Area, ignoreCase: true, out DevelopmentArea area) ||
                    !Enum.IsDefined(typeof(DevelopmentArea), area))
                {
                    return (false, "Neispravna oblast razvoja.", null);
                }

                assessment.Area = area;
            }

            if (request.Score.HasValue)
            {
                if (request.Score.Value < 1 || request.Score.Value > 5)
                    return (false, "Ocena razvoja mora biti u opsegu od 1 do 5.", null);

                assessment.Score = request.Score.Value;
            }

            if (request.Comment != null)
                assessment.Comment = request.Comment;

            if (request.AssessmentDate.HasValue)
                assessment.AssessmentDate = DateTime.SpecifyKind(request.AssessmentDate.Value, DateTimeKind.Utc);

            await _context.SaveChangesAsync();

            DevelopmentAssessmentResponseDto? updatedAssessment = await GetAssessmentByIdAsync(assessment.Id);

            return (true, null, updatedAssessment);
        }

        public async Task<(bool Success, string? Error)> DeleteAssessmentAsync(int assessmentId, int teacherId)
        {
            DevelopmentAssessment? assessment = await _context.DevelopmentAssessments
                .FirstOrDefaultAsync(a => a.Id == assessmentId);

            if (assessment == null)
                return (false, "Procena razvoja nije pronađena.");

            bool canManage = await CanManageChildDevelopmentAsync(assessment.ChildId, teacherId);

            if (!canManage)
                return (false, "Nemate pravo da obrišete ovu procenu.");

            _context.DevelopmentAssessments.Remove(assessment);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error, List<DevelopmentProgressPointDto> Points)> 
            GetProgressAsync(int childId, int currentUserId, string currentUserRole, string? area)
        {
            bool canView = await CanViewChildAsync(childId, currentUserId, currentUserRole);

            if (!canView)
                return (false, "Dete nije pronađeno ili nemate pravo pristupa.", new List<DevelopmentProgressPointDto>());

            IQueryable<DevelopmentAssessment> query = _context.DevelopmentAssessments
                .Where(a => a.ChildId == childId);

            if (!string.IsNullOrWhiteSpace(area))
            {
                if (!Enum.TryParse(area, ignoreCase: true, out DevelopmentArea parsedArea) ||
                    !Enum.IsDefined(typeof(DevelopmentArea), parsedArea))
                {
                    return (false, "Neispravna oblast razvoja.", new List<DevelopmentProgressPointDto>());
                }

                query = query.Where(a => a.Area == parsedArea);
            }

            List<DevelopmentProgressPointDto> points = await query
                .OrderBy(a => a.AssessmentDate)
                .Select(a => new DevelopmentProgressPointDto
                {
                    Date = a.AssessmentDate,
                    Score = a.Score,
                    Area = a.Area.ToString()
                })
                .ToListAsync();

            return (true, null, points);
        }

        private async Task<bool> CanViewChildAsync(int childId, int currentUserId, string currentUserRole)
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

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return await _context.ParentChildren.AnyAsync(pc =>
                    pc.ChildId == childId &&
                    pc.ParentId == currentUserId);
            }

            return false;
        }

        private async Task<bool> CanManageChildDevelopmentAsync(int childId, int teacherId)
        {
            return await _context.Children.AnyAsync(c =>
                c.Id == childId &&
                c.GroupId.HasValue &&
                _context.TeacherGroups.Any(tg =>
                    tg.TeacherId == teacherId &&
                    tg.GroupId == c.GroupId.Value));
        }

        private async Task<DevelopmentNoteResponseDto?> GetNoteByIdAsync(int noteId)
        {
            DevelopmentNote? note = await _context.DevelopmentNotes
                .Include(n => n.Child)
                .Include(n => n.Teacher)
                .FirstOrDefaultAsync(n => n.Id == noteId);

            return note == null ? null : ToNoteDto(note);
        }

        private async Task<DevelopmentAssessmentResponseDto?> GetAssessmentByIdAsync(int assessmentId)
        {
            DevelopmentAssessment? assessment = await _context.DevelopmentAssessments
                .Include(a => a.Child)
                .Include(a => a.Teacher)
                .FirstOrDefaultAsync(a => a.Id == assessmentId);

            return assessment == null ? null : ToAssessmentDto(assessment);
        }

        private static DevelopmentNoteResponseDto ToNoteDto(DevelopmentNote note)
        {
            return new DevelopmentNoteResponseDto
            {
                Id = note.Id,
                ChildId = note.ChildId,
                ChildFullName = $"{note.Child.FirstName} {note.Child.LastName}",
                TeacherId = note.TeacherId,
                TeacherFullName = $"{note.Teacher.FirstName} {note.Teacher.LastName}",
                Content = note.Content,
                CreatedAt = note.CreatedAt
            };
        }

        private static DevelopmentAssessmentResponseDto ToAssessmentDto(DevelopmentAssessment assessment)
        {
            return new DevelopmentAssessmentResponseDto
            {
                Id = assessment.Id,
                ChildId = assessment.ChildId,
                ChildFullName = $"{assessment.Child.FirstName} {assessment.Child.LastName}",
                TeacherId = assessment.TeacherId,
                TeacherFullName = $"{assessment.Teacher.FirstName} {assessment.Teacher.LastName}",
                Area = assessment.Area.ToString(),
                Score = assessment.Score,
                Comment = assessment.Comment,
                AssessmentDate = assessment.AssessmentDate
            };
        }
    }
}