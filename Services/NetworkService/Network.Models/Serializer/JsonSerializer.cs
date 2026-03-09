using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Services.NetworkService.Network.Models.Serializer
{
    public sealed class JsonSerializer : ISerializer
    {
        public JsonSerializer()
        {
            JsonConvert.DefaultSettings = () => new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                Formatting = Formatting.Indented,
                NullValueHandling = NullValueHandling.Ignore,
            };
        }

        public string Serialize<T>(T data)
        {
            try
            {
                if (data == null)
                {
                    return string.Empty;
                }

                return JsonConvert.SerializeObject(data);
            }
            catch
            {
                return string.Empty;
            }
        }

        public T Deserialize<T>(string strData)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(strData))
                {
                    return default(T);
                }

                return JsonConvert.DeserializeObject<T>(strData);
            }
            catch
            {
                return default(T);
            }
        }
    }
}
