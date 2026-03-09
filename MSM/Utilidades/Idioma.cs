using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace MSM.Utilidades
{
    public static class Idioma
    {
        /// <summary>
        /// Obtiene el recurso solicitado del archivo de recursos idioma
        /// </summary>
        /// <param name="value">nombre del recurso</param>
        /// <returns>valor del recurso</returns>
        public static string GetResourceName(string value)
        {
            var entry = Resources.idioma.ResourceManager.GetResourceSet(CultureInfo.CurrentCulture, true, true)
                                       .OfType<DictionaryEntry>()
                                       .FirstOrDefault(dictionaryEntry => dictionaryEntry.Key.ToString().Equals(value));

            return entry.Key == null ? string.Empty : entry.Value.ToString();
        }


        /// <summary>
        /// Obtiene el recurso solicitado del archivo de recursos SitMessages
        /// </summary>
        /// <param name="value">nombre del recurso</param>
        /// <returns>valor del recurso</returns>
        public static string GetResourceNameSitMessages(string value)
        {
            var entry = Resources.SitMessages.ResourceManager.GetResourceSet(CultureInfo.CurrentCulture, true, true)
                                       .OfType<DictionaryEntry>()
                                       .FirstOrDefault(dictionaryEntry => dictionaryEntry.Key.ToString().Equals(value));

            return entry.Key == null ? string.Empty : entry.Value.ToString();
        }

    }
}