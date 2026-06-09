namespace SmartKindergarten.Api.DTOs.Payments
{
    public class CreatePaymentRequestDto
    {
        public int ChildId { get; set; }
        public decimal Amount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? Description { get; set; }
    }
}