namespace SmartKindergarten.Api.DTOs.Groups
{
    public class GroupChildDto
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public bool IsActive { get; set; }
    }
}