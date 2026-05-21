namespace SmartKindergarten.Api.DTOs.Children
{
    public class UpdateChildRequestDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Notes { get; set; }
        public int? GroupId { get; set; }
        public bool? IsActive { get; set; }
    }
}