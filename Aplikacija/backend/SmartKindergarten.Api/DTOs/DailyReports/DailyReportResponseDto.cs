namespace SmartKindergarten.Api.DTOs.DailyReports
{
    public class DailyReportResponseDto
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int TeacherId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public DateTime ReportDate { get; set; }
    }
}