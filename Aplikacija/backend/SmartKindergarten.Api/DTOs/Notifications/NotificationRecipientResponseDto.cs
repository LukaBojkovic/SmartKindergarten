namespace SmartKindergarten.Api.DTOs.Notifications
{
    public class NotificationRecipientResponseDto
    {
        public int UserId { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}