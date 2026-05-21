namespace SmartKindergarten.Api.DTOs.Children
{
    public class ChildParentDto
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
    }
}