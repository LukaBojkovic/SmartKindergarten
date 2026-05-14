namespace SmartKindergarten.Api.Models
{
    public class KindergartenGroup
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public ICollection<Child> Children { get; set; } = new List<Child>();
        public ICollection<TeacherGroup> TeacherGroups { get; set; } = new List<TeacherGroup>();
        public ICollection<DailyReport> DailyReports { get; set; } = new List<DailyReport>();
    }
}