using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SmartKindergarten.Api.Data;
using SmartKindergarten.Api.DTOs.Auth;
using SmartKindergarten.Api.Models;

namespace SmartKindergarten.Api.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

            if (user == null)
                return null;

            bool passswordIsValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passswordIsValid)
                return null;

            string token = GenerateJwtToken(user);
            return new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Username = user.Username,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role.ToString()
            };
        }

        private string GenerateJwtToken(User user)
        {
            string? jwtKey = _configuration["Jwt:Key"];
            string? issuer = _configuration["Jwt:Issuer"];
            string? audience = _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException("JWT key nije podešen u konfiguraciji.");
            }

            Claim[] claims =
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("fullName", $"{user.FirstName} {user.LastName}")
            ];

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int expiresInMinutes = int.Parse(_configuration["Jwt:ExpiresInMinutes"] ?? "120");

            JwtSecurityToken token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
