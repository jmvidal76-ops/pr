using System;
using System.Collections.Generic;
using System.Net;

namespace Services.NetworkService.Network.Models.Settings
{
    public sealed class AuthByHeader : AuthBase, IApiSettings
    {
        public HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, AuthInfo authInfo, Dictionary<string, string> customHeaders)
        {
            HttpWebRequest request = WebRequest.CreateHttp(uri);
            request.Method = methodType;
            request.ContentType = contentType;

            if ((!string.IsNullOrWhiteSpace(authInfo.AuthKey)) && (!string.IsNullOrWhiteSpace(authInfo.AuthValue)))
            {
                request.Headers[authInfo.AuthKey] = authInfo.AuthValue;
            }

            SetHeaders(request, customHeaders);

            return request;
        }

        public HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType)
        {
            return CreateWebRequest(uri, methodType, contentType, null, null);
        }

        public HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, Dictionary<string, string> customHeaders)
        {
            return CreateWebRequest(uri, methodType, contentType, null, customHeaders);
        }

        public HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, AuthInfo authInfo)
        {
            return CreateWebRequest(uri, methodType, contentType, authInfo, null);
        }
    }
}
