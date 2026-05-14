namespace SmartKindergarten.Api.Models
{
    public class Child
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public int? GroupId { get; set; }
        public KindergartenGroup? Group { get; set; }
        public ICollection<ParentChild> ParentChildren { get; set; } = new List<ParentChild>();
        public ICollection<DevelopmentNote> DevelopmentNotes { get; set; } = new List<DevelopmentNote>();
        public ICollection<DevelopmentAssessment> DevelopmentAssessments { get; set; } = new List<DevelopmentAssessment>();
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}