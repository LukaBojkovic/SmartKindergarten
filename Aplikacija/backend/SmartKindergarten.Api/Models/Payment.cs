namespace SmartKindergarten.Api.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int ChildId { get; set; }
        public required Child Child { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
        public int RecordedById { get; set; }
        public required User RecordedBy { get; set; }
    }
}