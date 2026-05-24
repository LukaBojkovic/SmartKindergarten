namespace SmartKindergarten.Api.DTOs.DevelopmentProfiles
{
    public class DevelopmentNoteResponseDto
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required string ChildFullName { get; set; }
        public int TeacherId { get; set; }
        public required string TeacherFullName { get; set; }
        public required string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}