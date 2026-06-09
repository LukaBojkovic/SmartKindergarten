namespace SmartKindergarten.Api.DTOs.Notifications
{
    public class CreateNotificationRequestDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public List<int> RecipientUserIds { get; set; } = new();
    }
}