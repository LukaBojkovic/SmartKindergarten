namespace SmartKindergarten.Api.DTOs.Notifications
{
    public class NotificationRecipientResponseDto
    {
        public int UserId { get; set; }
        public string RecipientFullName { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}