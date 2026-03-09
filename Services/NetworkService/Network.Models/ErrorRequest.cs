namespace Services.NetworkService.Network.Models
{
    public abstract class ErrorRequest
    {
        public abstract string Code { get; set; }
        public abstract string Description { get; set; }
    }
}
