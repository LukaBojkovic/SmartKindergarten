namespace SmartKindergarten.Api.DTOs.DailyReports
{
    public class UpdateDailyReportRequestDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime? ReportDate { get; set; }
    }
}