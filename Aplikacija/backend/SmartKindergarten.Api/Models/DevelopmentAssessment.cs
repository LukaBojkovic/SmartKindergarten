namespace SmartKindergarten.Api.Models
{
    public class DevelopmentAssessment
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required Child Child { get; set; }
        public int TeacherId { get; set; }
        public required User Teacher { get; set; }
        public required DevelopmentArea Area { get; set; }
        public int Score { get; set; }
        public string? Comment { get; set; }
        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;
    }
}