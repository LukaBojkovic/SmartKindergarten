namespace SmartKindergarten.Api.DTOs.DevelopmentProfiles
{
    public class DevelopmentProgressPointDto
    {
        public DateTime Date { get; set; }
        public int Score { get; set; }
        public required string Area { get; set; }
    }
}