using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MSM.Utilidades;
using System.Collections.Specialized;
using System.Configuration;
using System.ComponentModel;
using System.Reflection;

namespace MSM.Utilidades
{
    /// <summary>
    /// Clase que extiende los medodos del tipo string
    /// </summary>
    public static class ExtensionString
    {
        /// <summary>
        /// Método que obtiene el enumerado correspondiente al valor del string.
        /// </summary>
        /// <typeparam name="T">Tipo del enumerado</typeparam>
        /// <param name="value">valor del enumerado</param>
        /// <returns>retorna el enumerado correspondiente al valor del string</returns>
        public static T ToEnum<T>(this string value)
        {

            Type type = typeof(T);

            string sectionName = type.Name;

            CategoryAttribute catgAtt = (CategoryAttribute)type.GetCustomAttribute(typeof(CategoryAttribute), false);
            if (catgAtt != null)
            {
                sectionName = string.Format("{0}/{1}", catgAtt.Category, sectionName);
            }

            MSMSection sectionColl = (MSMSection)ConfigurationManager.GetSection(sectionName);

            if (sectionColl != null)
            {
                MSMElement element = (from MSMElement e in sectionColl.Add
                                      where e.Value == value
                                      select e).FirstOrDefault();
                if (element == null)
                {
                    DefaultValueAttribute[] attributes = (DefaultValueAttribute[])typeof(T).GetCustomAttributes(typeof(DefaultValueAttribute), false);
                    return (T)attributes[0].Value;
                }
                else return (T)Enum.Parse(typeof(T), element.Key);
            }
            else
            {
                return (T)Enum.Parse(typeof(T), value);
            }
        }

        public static int CountSequence(this string value, string sequence)
        {
            int contador = 0;
            int indice = value.IndexOf(sequence);

            while (indice != -1)
            {
                contador++;
                indice = value.IndexOf(sequence, indice + sequence.Length);
            }

            return contador;
        }
    }
}