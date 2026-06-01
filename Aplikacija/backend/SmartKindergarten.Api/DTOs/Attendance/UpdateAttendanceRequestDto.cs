namespace SmartKindergarten.Api.DTOs.Attendance
{
    public class UpdateAttendanceRequestDto
    {
        public DateTime? Date { get; set; }
        public bool? IsPresent { get; set; }
    }
}