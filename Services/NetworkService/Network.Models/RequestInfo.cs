using System;
using System.Collections.Generic;

namespace Services.NetworkService.Network.Models
{
    public class RequestInfo
    {
        #region Fields

        private const string DefaultContentType = "application/json";

        #endregion

        #region Properties

        public Uri Request { get; private set; }

        public MethodType MethodType { get; private set; }

        public string Content { get; private set; }

        public string ContentType { get; private set; }

        public Dictionary<string, string> CustomHeaders { get; set; }

        #endregion

        #region Constructors

        public RequestInfo(Uri request, MethodType methodType) : this(request, methodType, string.Empty, string.Empty)
        {
        }

        public RequestInfo(Uri request, MethodType methodType, string content, string contentType)
        {
            Request = request;
            MethodType = methodType;
            Content = content;
            ContentType = string.IsNullOrWhiteSpace(contentType) ? DefaultContentType : contentType;
        }

        #endregion
    }
}
