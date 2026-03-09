using Siemens.Brewing.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace MSM.Utilidades
{
    public static class MensajesFabricacion
    {
        public static string GetMessage(string messageId, Params parameters)
        {
            string message = string.Empty;

            message = Idioma.GetResourceNameSitMessages(messageId);

            if (message != null)
            {
                message = ApplyParamsSubst(message, parameters);
            }

            return message;
        }


        private static string ApplyParamsSubst(string message, Params parameters)
        {
            if (!string.IsNullOrEmpty(message) && message.Contains("§§"))
            {
                message = Regex.Split(message, "§§")[0];

            }
            if (parameters != null)
            {
                foreach (string key in parameters.Keys)
                {
                    message = message.Replace('%' + key + '%', parameters[key]);
                }
            }
            return message;
        }
    }
}