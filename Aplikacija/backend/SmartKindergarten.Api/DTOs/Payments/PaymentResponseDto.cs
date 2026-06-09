namespace SmartKindergarten.Api.DTOs.Payments
{
    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public string ChildFullName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? Description { get; set; }
        public int RecordedById { get; set; }
        public string RecordedByFullName { get; set; } = string.Empty;
    }
}