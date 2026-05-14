namespace SmartKindergarten.Api.Models
{
    public class DevelopmentNote
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required Child Child { get; set; }
        public int TeacherId { get; set; }
        public required User Teacher { get; set; }
        public required string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}