namespace SmartKindergarten.Api.DTOs.SystemSettings
{
    public class UpdateSystemSettingRequestDto
    {
        public string? Key { get; set; }
        public string? Value { get; set; }
        public string? Description { get; set; }
    }
}