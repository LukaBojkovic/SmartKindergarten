namespace SmartKindergarten.Api.DTOs.Groups
{
    public class CreateGroupRequestDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
    }
}