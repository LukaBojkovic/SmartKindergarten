namespace SmartKindergarten.Api.DTOs.Auth
{
    public class LoginResponseDto
    {
        public required string Token { get; set; }
        public int UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string FullName { get; set; }
        public required string Role { get; set; }
    }
}