namespace SmartKindergarten.Api.DTOs.DevelopmentProfiles
{
    public class UpdateDevelopmentAssessmentRequestDto
    {
        public string? Area { get; set; }
        public int? Score { get; set; }
        public string? Comment { get; set; }
        public DateTime? AssessmentDate { get; set; }
    }
}