namespace SmartKindergarten.Api.DTOs.Attendance
{
    public class AttendanceResponseDto
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required string ChildFullName { get; set; }
        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
        public int RecordedById { get; set; }
        public required string RecordedByFullName { get; set; }
    }
}