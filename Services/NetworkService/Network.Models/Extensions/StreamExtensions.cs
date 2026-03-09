using System.IO;

namespace Services.NetworkService.Network.Models.Extensions
{
    public static class StreamExtension
    {
        public static string ReadString(this Stream stream)
        {
            using (StreamReader streamReader = new StreamReader(stream))
            {
                return streamReader.ReadToEnd();
            }
        }
    }
}
