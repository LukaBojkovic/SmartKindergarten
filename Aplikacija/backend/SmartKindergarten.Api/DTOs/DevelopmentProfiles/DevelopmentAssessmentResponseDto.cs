namespace SmartKindergarten.Api.DTOs.DevelopmentProfiles
{
    public class DevelopmentAssessmentResponseDto
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required string ChildFullName { get; set; }
        public int TeacherId { get; set; }
        public required string TeacherFullName { get; set; }
        public required string Area { get; set; }
        public int Score { get; set; }
        public string? Comment { get; set; }
        public DateTime AssessmentDate { get; set; }
    }
}