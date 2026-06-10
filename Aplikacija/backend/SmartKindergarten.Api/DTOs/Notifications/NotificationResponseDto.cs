namespace SmartKindergarten.Api.DTOs.Notifications
{
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public string SenderFullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<NotificationRecipientResponseDto> Recipients { get; set; } = new();
    }
}