namespace SmartKindergarten.Api.DTOs.Attendance
{
    public class GroupAttendanceItemDto
    {
        public int? AttendanceId { get; set; }
        public int ChildId { get; set; }
        public required string ChildFullName { get; set; }
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
        public bool IsRecorded { get; set; }
        public string? RecordedByFullName { get; set; }
    }
}