using System.Collections.Generic;
using System.Net;
using System.Reflection;

namespace Services.NetworkService.Network.Models.Settings
{
    public class AuthBase
    {
        public void SetHeader(HttpWebRequest request, string header, string value)
        {
            PropertyInfo propertyInfo = request.GetType().GetProperty(header.Replace("-", string.Empty));

            if (propertyInfo != null)
            {
                propertyInfo.SetValue(request, value, null);
            }
            else
            {
                request.Headers[header] = value;
            }
        }

        public void SetHeaders(HttpWebRequest request, Dictionary<string, string> headers)
        {
            if (headers != null && headers.Count > 0)
            {
                foreach (var header in headers)
                {
                    SetHeader(request, header.Key, header.Value);
                }
            }
        }
    }
}
