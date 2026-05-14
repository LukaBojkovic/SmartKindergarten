namespace SmartKindergarten.Api.Models
{
    public class ParentChild
    {
        public int ParentId { get; set; }
        public required User Parent { get; set; }
        public int ChildId { get; set; }
        public required Child Child { get; set; }
    }
}