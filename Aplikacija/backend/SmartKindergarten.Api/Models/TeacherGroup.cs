namespace SmartKindergarten.Api.Models
{
    public class TeacherGroup
    {
        public int TeacherId { get; set; }
        public required User Teacher { get; set; }
        public int GroupId { get; set; }
        public required KindergartenGroup Group { get; set; }
    }
}