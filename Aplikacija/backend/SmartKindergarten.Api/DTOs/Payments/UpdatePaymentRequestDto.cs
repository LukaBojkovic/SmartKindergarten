namespace SmartKindergarten.Api.DTOs.Payments
{
    public class UpdatePaymentRequestDto
    {
        public decimal? Amount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? Description { get; set; }
    }
}