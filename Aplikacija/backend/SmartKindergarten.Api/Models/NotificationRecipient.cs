namespace SmartKindergarten.Api.Models
{
    public class NotificationRecipient
    {
        public int NotificationId { get; set; }
        public required Notification Notification { get; set; }
        public int UserId { get; set; }
        public required User User { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
    }
}