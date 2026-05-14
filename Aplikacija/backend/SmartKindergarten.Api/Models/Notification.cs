namespace SmartKindergarten.Api.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int SenderId { get; set; }
        public required User Sender { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<NotificationRecipient> Recipients { get; set; } = new List<NotificationRecipient>();
    }
}