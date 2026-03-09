using System;
using System.Collections.Generic;
using System.Net;

namespace Services.NetworkService.Network.Models.Settings
{
    public sealed class AuthByParameter : AuthBase, IApiSettings
    {
        private const string NewParamAuthFormat = "?{0}={1}";
        private const string AddParamAuthFormat = "&{0}={1}";

        public HttpWebRequest CreateWebRequest(Uri uri, string methodType, string contentType, AuthInfo authInfo, Dictionary<string, string> customHeaders)
        {
            if (authInfo != null && (!string.IsNullOrWhiteSpace(authInfo.AuthKey)) && (!string.IsNullOrWhiteSpace(authInfo.AuthValue)))
            {
                uri = GetAuthParam(uri, authInfo);
            }

            HttpWebRequest request = WebRequest.CreateHttp(uri);
            request.Method = methodType;
            request.ContentType = contentType;

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

        private Uri GetAuthParam(Uri url, AuthInfo authInfo)
        {
            Uri newUri = null;

            if (url != null)
            {
                string urlTmp = url.OriginalString;

                var param = string.Format(urlTmp.Contains("?") ? AddParamAuthFormat : NewParamAuthFormat, authInfo.AuthKey, authInfo.AuthValue);

                urlTmp = urlTmp + param;
                newUri = new Uri(urlTmp);
            }

            return newUri;
        }
    }
}
