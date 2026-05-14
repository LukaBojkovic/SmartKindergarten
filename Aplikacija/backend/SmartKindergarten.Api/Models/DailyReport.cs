namespace SmartKindergarten.Api.Models
{
    public class DailyReport
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public required KindergartenGroup Group { get; set; }
        public int TeacherId { get; set; }
        public required User Teacher { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime ReportDate { get; set; } = DateTime.UtcNow;
    }
}