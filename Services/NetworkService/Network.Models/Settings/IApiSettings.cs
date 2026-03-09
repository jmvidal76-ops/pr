using System;
using System.Collections.Generic;
using System.Net;

namespace Services.NetworkService.Network.Models.Settings
{
    public interface IApiSettings
    {
        HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType);

        HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, AuthInfo authInfo);

        HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, Dictionary<string, string> customHeaders);

        HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, AuthInfo authInfo, Dictionary<string, string> customHeaders);
    }
}
