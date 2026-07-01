using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Groups;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class GroupService
    {
        private readonly AppDbContext _context;
        public GroupService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GroupResponseDto>> GetAllAsync(int currentUserId, string currentUserRole, string? search)
        {
            IQueryable<KindergartenGroup> query = BuildVisibleGroupsQuery(currentUserId, currentUserRole);

            if (!string.IsNullOrWhiteSpace(search))
            {
                string normalizedSearch = search.Trim().ToLower();
                query = query.Where(g => g.Name.ToLower().Contains(normalizedSearch));
            }

            List<KindergartenGroup> groups = await query
                .OrderBy(g => g.Name)
                .ToListAsync();

            return groups
                .Select(g => ToDto(g, currentUserId, currentUserRole))
                .ToList();
        }

        public async Task<GroupResponseDto?> GetByIdAsync(int id, int currentUserId, string currentUserRole)
        {
            KindergartenGroup? group = await BuildVisibleGroupsQuery(currentUserId, currentUserRole)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
                return null;

            return ToDto(group, currentUserId, currentUserRole);
        }

        public async Task<(bool Success, string? Error, GroupResponseDto? Group)> CreateAsync(CreateGroupRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return (false, "Naziv grupe je obavezan.", null);

            bool groupExists = await _context.KindergartenGroups
                .AnyAsync(g => g.Name == request.Name.Trim());

            if (groupExists)
                return (false, "Grupa sa ovim nazivom već postoji.", null);

            KindergartenGroup group = new KindergartenGroup
            {
                Name = request.Name.Trim(),
                Description = request.Description
            };

            _context.KindergartenGroups.Add(group);
            await _context.SaveChangesAsync();

            GroupResponseDto? createdGroup = await GetByIdForAdminAsync(group.Id);

            return (true, null, createdGroup);
        }

        public async Task<(bool Success, string? Error, GroupResponseDto? Group)> UpdateAsync(int id, UpdateGroupRequestDto request)
        {
            KindergartenGroup? group = await _context.KindergartenGroups.FindAsync(id);

            if (group == null)
                return (false, "Grupa nije pronađena.", null);

            if (request.Name != null)
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return (false, "Naziv grupe ne sme biti prazan.", null);

                bool nameExists = await _context.KindergartenGroups
                    .AnyAsync(g => g.Name == request.Name.Trim() && g.Id != id);

                if (nameExists)
                    return (false, "Grupa sa ovim nazivom već postoji.", null);

                group.Name = request.Name.Trim();
            }

            if (request.Description != null)
                group.Description = request.Description;

            await _context.SaveChangesAsync();

            GroupResponseDto? updatedGroup = await GetByIdForAdminAsync(group.Id);

            return (true, null, updatedGroup);
        }

        public async Task<(bool Success, string? Error)> DeleteAsync(int id)
        {
            KindergartenGroup? group = await _context.KindergartenGroups
                .Include(g => g.Children)
                .Include(g => g.DailyReports)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
                return (false, "Grupa nije pronađena.");

            if (group.Children.Any())
                return (false, "Grupa ne može biti obrisana dok ima dodeljenu decu.");

            if (group.DailyReports.Any())
                return (false, "Grupa ne može biti obrisana jer postoje dnevni izveštaji za nju.");

            _context.KindergartenGroups.Remove(group);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AssignChildToGroupAsync(int groupId, int childId)
        {
            KindergartenGroup? group = await _context.KindergartenGroups.FindAsync(groupId);

            if (group == null)
                return (false, "Grupa nije pronađena.");

            Child? child = await _context.Children.FindAsync(childId);

            if (child == null)
                return (false, "Dete nije pronađeno.");

            if (child.GroupId == groupId)
                return (false, "Dete je već dodeljeno ovoj grupi.");

            if (child.GroupId.HasValue)
                return (false, "Dete je već dodeljeno drugoj grupi. Prvo ga uklonite iz trenutne grupe.");

            child.GroupId = groupId;
            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> RemoveChildFromGroupAsync(int groupId, int childId)
        {
            Child? child = await _context.Children.FindAsync(childId);

            if (child == null)
                return (false, "Dete nije pronađeno.");

            if (child.GroupId != groupId)
                return (false, "Dete nije dodeljeno ovoj grupi.");

            child.GroupId = null;
            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> AssignTeacherToGroupAsync(int groupId, int teacherId)
        {
            KindergartenGroup? group = await _context.KindergartenGroups.FindAsync(groupId);

            if (group == null)
                return (false, "Grupa nije pronađena.");

            User? teacher = await _context.Users.FindAsync(teacherId);

            if (teacher == null)
                return (false, "Korisnik nije pronađen.");

            if (teacher.Role != UserRole.Teacher)
                return (false, "Izabrani korisnik nije vaspitač.");

            bool relationExists = await _context.TeacherGroups
                .AnyAsync(tg => tg.GroupId == groupId && tg.TeacherId == teacherId);

            if (relationExists)
                return (false, "Vaspitač je već dodeljen ovoj grupi.");

            TeacherGroup teacherGroup = new TeacherGroup
            {
                GroupId = groupId,
                Group = group,
                TeacherId = teacherId,
                Teacher = teacher
            };

            _context.TeacherGroups.Add(teacherGroup);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<(bool Success, string? Error)> RemoveTeacherFromGroupAsync(int groupId, int teacherId)
        {
            TeacherGroup? teacherGroup = await _context.TeacherGroups
                .FirstOrDefaultAsync(tg => tg.GroupId == groupId && tg.TeacherId == teacherId);

            if (teacherGroup == null)
                return (false, "Vaspitač nije dodeljen ovoj grupi.");

            _context.TeacherGroups.Remove(teacherGroup);
            await _context.SaveChangesAsync();

            return (true, null);
        }

        private IQueryable<KindergartenGroup> BuildVisibleGroupsQuery(int currentUserId, string currentUserRole)
        {
            IQueryable<KindergartenGroup> query = _context.KindergartenGroups
                .Include(g => g.Children)
                    .ThenInclude(c => c.ParentChildren)
                .Include(g => g.TeacherGroups)
                    .ThenInclude(tg => tg.Teacher)
                .AsQueryable();

            if (currentUserRole == UserRole.Administrator.ToString() ||
                currentUserRole == UserRole.AdministrativeStaff.ToString())
            {
                return query;
            }

            if (currentUserRole == UserRole.Teacher.ToString())
            {
                return query.Where(g =>
                    g.TeacherGroups.Any(tg => tg.TeacherId == currentUserId));
            }

            if (currentUserRole == UserRole.Parent.ToString())
            {
                return query.Where(g =>
                    g.Children.Any(c =>
                        c.ParentChildren.Any(pc => pc.ParentId == currentUserId)));
            }

            return query.Where(g => false);
        }

        private async Task<GroupResponseDto?> GetByIdForAdminAsync(int id)
        {
            KindergartenGroup? group = await _context.KindergartenGroups
                .Include(g => g.Children)
                    .ThenInclude(c => c.ParentChildren)
                .Include(g => g.TeacherGroups)
                    .ThenInclude(tg => tg.Teacher)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
                return null;

            return ToDto(group, 0, UserRole.Administrator.ToString());
        }

        private static GroupResponseDto ToDto(KindergartenGroup group, int currentUserId, string currentUserRole)
        {
            IEnumerable<Child> visibleChildren = group.Children;

            if (currentUserRole == UserRole.Parent.ToString())
            {
                visibleChildren = group.Children
                    .Where(c => c.ParentChildren.Any(pc => pc.ParentId == currentUserId));
            }

            return new GroupResponseDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                Children = visibleChildren
                    .OrderBy(c => c.LastName)
                    .ThenBy(c => c.FirstName)
                    .Select(c => new GroupChildDto
                    {
                        Id = c.Id,
                        FullName = $"{c.FirstName} {c.LastName}",
                        IsActive = c.IsActive
                    })
                    .ToList(),
                Teachers = group.TeacherGroups
                    .OrderBy(tg => tg.Teacher.LastName)
                    .ThenBy(tg => tg.Teacher.FirstName)
                    .Select(tg => new GroupTeacherDto
                    {
                        Id = tg.Teacher.Id,
                        FullName = $"{tg.Teacher.FirstName} {tg.Teacher.LastName}",
                        Email = tg.Teacher.Email
                    })
                    .ToList()
            };
        }
    }
}
