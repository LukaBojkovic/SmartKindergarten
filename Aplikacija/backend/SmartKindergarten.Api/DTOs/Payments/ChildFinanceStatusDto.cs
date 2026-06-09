namespace SmartKindergarten.Api.DTOs.Payments
{
    public class ChildFinanceStatusDto
    {
        public int ChildId { get; set; }
        public string ChildFullName { get; set; } = string.Empty;
        public decimal TotalPaid { get; set; }
        public decimal? ExpectedAmount { get; set; }
        public decimal? Balance { get; set; }
        public int PaymentCount { get; set; }
        public DateTime? LastPaymentDate { get; set; }
    }
}