using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Children;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class ChildService
    {
        private readonly AppDbContext _context;
        public ChildService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChildResponseDto>> GetAllAsync(
            int currentUserId,
            string currentUserRole,
            string? search,
            int? groupId,
            bool? isActive)
        {
            IQueryable<Child> query = BuildVisibleChildrenQuery(currentUserId, currentUserRole);

            if (!string.IsNullOrWhiteSpace(search))
            {
                string normalizedSearch = search.Trim().ToLower();

                query = query.Where(c =>
                    c.FirstName.ToLower().Contains(normalizedSearch) ||
                    c.LastName.ToLower().Contains(normalizedSearch));
            }

            if (groupId.HasValue)
                query = query.Where(c => c.GroupId == groupId.Value);

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);

            return await query
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.FirstName)
                .Select(c => ToDto(c))
                .ToListAsync();
        }

        public async Task<ChildResponseDto?> GetByIdAsync(int id, int currentUserId, string currentUserRole)
        {
            Child? child = await BuildVisibleChildrenQuery(currentUserId, currentUserRole)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (child == null)
                return null;

            return ToDto(child);
        }

        public async Task<(bool Success, string? Error, ChildResponseDto? Child)> CreateAsync(CreateChildRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName))
            {
                return (false, "Ime i prezime deteta su obavezni.", null);
            }

            if (request.GroupId.HasValue)
            {
                bool groupExists = await _context.KindergartenGroups
                    .AnyAsync(g => g.Id == request.GroupId.Value);

                if (!groupExists)
                    return (false, "Izabrana grupa ne postoji.", null);
            }

            Child child = new Child
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth, DateTimeKind.Utc),
                Notes = request.Notes,
                GroupId = request.GroupId,
                IsActive = true
            };

            _context.Children.Add(child);
            await _context.SaveChangesAsync();

            ChildResponseDto? createdChild = await GetByIdForAdminAsync(child.Id);

            return (true, null, createdChild);
        }

        public async Task<(bool Success, string? Error, ChildResponseDto? Child)> UpdateAsync(int id, UpdateChildRequestDto request)
        {
            Child? child = await _context.Children.FindAsync(id);

            if (child == null)
                return (false, "Dete nije pronađeno.", null);

            if (request.FirstName != null)
            {
                if (string.IsNullOrWhiteSpace(request.FirstName))
                    return (false, "Ime deteta ne sme biti prazno.", null);

                child.FirstName = request.FirstName.Trim();
            }

            if (request.LastName != null)
            {
                if (string.IsNullOrWhiteSpace(request.LastName))
                    return (false, "Prezime deteta ne sme biti prazno.", null);

                child.LastName = request.LastName.Trim();
            }

            if (request.DateOfBirth.HasValue)
                child.DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc);

            if (request.Notes != null)
                child.Notes = request.Notes;

            if (request.GroupId.HasValue)
            {
                bool groupExists = await _context.KindergartenGroups
                    .AnyAsync(g => g.Id == request.GroupId.Value);

                if (!groupExists)
                    return (false, "Izabrana grupa ne postoji.", null);

                child.GroupId = request.GroupId.Value;
            }

            if (request.IsActive.HasValue)
                child.IsActive = request.IsActive.Value;

            await _context.SaveChangesAsync();

            ChildResponseDto? updatedChild = await GetByIdForAdminAsync(child.Id);

            return (true, null, updatedChild);
        }

        public async Task<bool> DeactivateAsync(int id)
        {
            Child? child = await _context.Children.FindAsync(id);

            if (child == null)
                return false;

            child.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        private IQueryable<Child> BuildVisibleChildrenQuery(int currentUserId, string currentUserRole)
        {
            IQueryable<Child> query = _context.Children
                .Include(c => c.Group)
                .Include(c => c.ParentChildren)
                .ThenInclude(pc => pc.Parent)
                .AsQueryable();

            if (currentUserRole == UserRole.Administrator.ToString() ||
                currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return query;
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return query.Where(c =>
                    c.GroupId.HasValue &&
                    _context.TeacherGroups.Any(tg =>
                        tg.TeacherId == currentUserId &&
                        tg.GroupId == c.GroupId.Value));
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return query.Where(c =>
                    c.ParentChildren.Any(pc => pc.ParentId == currentUserId));
            }

            return query.Where(c => false);
        }

        private async Task<ChildResponseDto?> GetByIdForAdminAsync(int id)
        {
            Child? child = await _context.Children
                .Include(c => c.Group)
                .Include(c => c.ParentChildren)
                    .ThenInclude(pc => pc.Parent)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (child == null)
                return null;

            return ToDto(child);
        }

        private static ChildResponseDto ToDto(Child child)
        {
            return new ChildResponseDto
            {
                Id = child.Id,
                FirstName = child.FirstName,
                LastName = child.LastName,
                DateOfBirth = child.DateOfBirth,
                Notes = child.Notes,
                IsActive = child.IsActive,
                GroupId = child.GroupId,
                GroupName = child.Group != null ? child.Group.Name : null,
                Parents = child.ParentChildren
                    .Select(pc => new ChildParentDto
                    {
                        Id = pc.Parent.Id,
                        FullName = $"{pc.Parent.FirstName} {pc.Parent.LastName}",
                        Email = pc.Parent.Email
                    })
                    .ToList()
            };
        }
    }
}