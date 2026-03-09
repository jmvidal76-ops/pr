namespace Services.NetworkService.Network.Models.Settings
{
    public class AuthInfo
    {
        public string AuthKey { get; private set; }
        public string AuthValue { get; private set; }

        public AuthInfo(string authKey, string authValue)
        {
            AuthKey = authKey;
            AuthValue = authValue;
        }
    }
}
