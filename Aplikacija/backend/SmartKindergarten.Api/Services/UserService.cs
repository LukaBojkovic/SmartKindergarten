using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Users;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;
        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserResponseDto>> GetAllAsync(string? role, bool? isActive)
        {
            IQueryable<User> query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
            {
                if (Enum.TryParse(role, ignoreCase: true, out UserRole parsedRole))
                    query = query.Where(u => u.Role == parsedRole);
            }

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            return await query
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Select(u => ToDto(u))
                .ToListAsync();
        }

        public async Task<UserResponseDto?> GetByIdAsync(int id)
        {
            User? user = await _context.Users.FindAsync(id);

            if (user == null)
                return null;

            return ToDto(user);
        }

        public async Task<(bool Success, string? Error, UserResponseDto? User)> CreateAsync(CreateUserRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Role))
            {
                return (false, "Sva obavezna polja moraju biti popunjena.", null);
            }

            bool usernameExists = await _context.Users.AnyAsync(u => u.Username == request.Username);

            if (usernameExists)
                return (false, "Korisničko ime već postoji.", null);

            bool emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);

            if (emailExists)
                return (false, "Email adresa već postoji.", null);

            if (!Enum.TryParse(request.Role, ignoreCase: true, out UserRole role) ||
                !Enum.IsDefined(typeof(UserRole), role))
            {
                return (false, "Neispravna korisnička uloga.", null);
            }

            if (role == UserRole.Administrator)
                return (false, "Nije dozvoljeno kreiranje novog administratora kroz aplikaciju.", null);

            User user = new User
            {
                Username = request.Username.Trim(),
                Email = request.Email.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Role = role,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return (true, null, ToDto(user));
        }

        public async Task<(bool Success, string? Error, UserResponseDto? User)> UpdateAsync(int id, UpdateUserRequestDto request)
        {
            User? user = await _context.Users.FindAsync(id);

            if (user == null)
                return (false, "Korisnik nije pronađen.", null);


            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                bool emailExists = await _context.Users
                    .AnyAsync(u => u.Email == request.Email && u.Id != id);

                if (emailExists)
                    return (false, "Email adresa već postoji.", null);

                user.Email = request.Email.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.FirstName))
                user.FirstName = request.FirstName.Trim();

            if (!string.IsNullOrWhiteSpace(request.LastName))
                user.LastName = request.LastName.Trim();

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                if (!Enum.TryParse(request.Role, ignoreCase: true, out UserRole role) ||
                    !Enum.IsDefined(typeof(UserRole), role))
                {
                    return (false, "Neispravna korisnička uloga.", null);
                }

                if (role == UserRole.Administrator && user.Role != UserRole.Administrator)
                    return (false, "Nije dozvoljeno dodeljivanje administratorske uloge kroz aplikaciju.", null);

                if (user.Role == UserRole.Administrator && role != UserRole.Administrator)
                    return (false, "Nije dozvoljeno menjanje uloge postojećeg administratora kroz aplikaciju.", null);


                user.Role = role;
            }


            if (request.IsActive.HasValue)
            {
                if (user.Role == UserRole.Administrator && user.IsActive && request.IsActive.Value == false)
                {
                    int activeAdministratorCount = await _context.Users
                        .CountAsync(u => u.Role == UserRole.Administrator && u.IsActive);

                    if (activeAdministratorCount <= 1)
                        return (false, "Nije dozvoljeno deaktivirati jedinog aktivnog administratora.", null);
                }

                user.IsActive = request.IsActive.Value;
            }

            await _context.SaveChangesAsync();

            return (true, null, ToDto(user));
        }

        public async Task<(bool Success, string? Error)> ResetPasswordAsync(int id, ResetPasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.NewPassword))
                return (false, "Nova lozinka je obavezna.");

            if (request.NewPassword.Length < 6)
                return (false, "Nova lozinka mora imati najmanje 6 karaktera.");

            User? user = await _context.Users.FindAsync(id);

            if (user == null)
                return (false, "Korisnik nije pronađen.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            await _context.SaveChangesAsync();

            return (true, null);
        }
        public async Task<(bool Success, string? Error)> DeactivateAsync(int id)
        {
            User? user = await _context.Users.FindAsync(id);

            if (user == null)
                return (false, "Korisnik nije pronađen.");

            if (user.Role == UserRole.Administrator && user.IsActive)
            {
                int activeAdministratorCount = await _context.Users
                    .CountAsync(u => u.Role == UserRole.Administrator && u.IsActive);

                if (activeAdministratorCount <= 1)
                    return (false, "Nije dozvoljeno deaktivirati jedinog aktivnog administratora.");
            }

            user.IsActive = false;

            await _context.SaveChangesAsync();

            return (true,null);
        }

        private static UserResponseDto ToDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }
    }
}