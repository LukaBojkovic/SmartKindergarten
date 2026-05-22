namespace SmartKindergarten.Api.DTOs.Groups
{
    public class GroupTeacherDto
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
    }
}