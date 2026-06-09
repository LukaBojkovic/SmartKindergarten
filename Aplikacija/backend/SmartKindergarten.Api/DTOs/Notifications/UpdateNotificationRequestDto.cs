namespace SmartKindergarten.Api.DTOs.Notifications
{
    public class UpdateNotificationRequestDto
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
    }
}