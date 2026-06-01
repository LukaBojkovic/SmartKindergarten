namespace SmartKindergarten.Api.DTOs.Attendance
{
    public class CreateAttendanceRequestDto
    {
        public int ChildId { get; set; }
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
    }
}