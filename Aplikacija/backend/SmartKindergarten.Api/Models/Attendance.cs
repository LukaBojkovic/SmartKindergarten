namespace SmartKindergarten.Api.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required Child Child { get; set; }
        public DateTime Date { get; set; }
        public bool IsPresent { get; set; }
        public int RecordedById { get; set; }
        public required User RecordedBy { get; set; }
    }
}