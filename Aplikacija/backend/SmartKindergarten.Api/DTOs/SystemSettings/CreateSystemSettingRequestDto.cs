namespace SmartKindergarten.Api.DTOs.SystemSettings
{
    public class CreateSystemSettingRequestDto
    {
        public required string Key { get; set; }
        public required string Value { get; set; }
        public string? Description { get; set; }
    }
}