namespace SmartKindergarten.Api.DTOs.Children
{
    public class ChildResponseDto
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }
        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public List<ChildParentDto> Parents { get; set; } = new List<ChildParentDto>();
    }
}