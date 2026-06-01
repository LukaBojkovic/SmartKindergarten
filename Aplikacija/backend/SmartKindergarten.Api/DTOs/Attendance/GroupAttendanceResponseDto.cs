namespace SmartKindergarten.Api.DTOs.Attendance
{
    public class GroupAttendanceResponseDto
    {
        public int GroupId { get; set; }
        public required string GroupName { get; set; }
        public DateTime Date { get; set; }
        public List<GroupAttendanceItemDto> Children { get; set; } = new List<GroupAttendanceItemDto>();
    }
}