namespace SmartKindergarten.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<ParentChild> ParentChildren { get; set; } = new List<ParentChild>();
        public ICollection<TeacherGroup> TeacherGroups { get; set; } = new List<TeacherGroup>();
        public ICollection<NotificationRecipient> NotificationRecipients { get; set; } = new List<NotificationRecipient>();
    }
}