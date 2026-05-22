namespace SmartKindergarten.Api.DTOs.Groups
{
    public class GroupResponseDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public List<GroupChildDto> Children { get; set; } = new List<GroupChildDto>();
        public List<GroupTeacherDto> Teachers { get; set; } = new List<GroupTeacherDto>();
    }
}