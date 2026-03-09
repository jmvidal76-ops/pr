namespace Services.NetworkService.Network.Models.Serializer
{
    public interface ISerializer
    {
        string Serialize<T>(T data);

        T Deserialize<T>(string strData);
    }
}
