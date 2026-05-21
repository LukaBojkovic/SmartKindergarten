namespace SmartKindergarten.Api.DTOs.Children
{
    public class CreateChildRequestDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string? Notes { get; set; }
        public int? GroupId { get; set; }
    }
}