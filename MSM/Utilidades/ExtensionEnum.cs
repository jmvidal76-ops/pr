using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Web;

namespace MSM.Utilidades
{
    /// <summary>
    /// Clase que extiende los método de la clase Enum
    /// </summary>
    public static class ExtensionEnum
    {
        private static readonly ConcurrentDictionary<Enum, MSMElement> _elementCache = new ConcurrentDictionary<Enum, MSMElement>();
        private static readonly ConcurrentDictionary<Type, string> _sectionNameCache = new ConcurrentDictionary<Type, string>();
        private static readonly ConcurrentDictionary<string, MSMSection> _sectionCache = new ConcurrentDictionary<string, MSMSection>();
        /// <summary>
        /// Método que obtiene el atributo StringValueAttribute de un Enumerado que contenta dicho atributo
        /// </summary>
        /// <param name="enumerado">Enumerado</param>
        /// <returns>retorna el string asociado al enumerado</returns>
        public static string GetStringValue(this Enum enumerado)
        {
            Type type = enumerado.GetType();

            FieldInfo fieldInfo = type.GetField(enumerado.ToString());

            StringValueAttribute[] stringValueAtributes = fieldInfo.GetCustomAttributes(typeof(StringValueAttribute), false) as StringValueAttribute[];

            return stringValueAtributes.Length > 0 ? stringValueAtributes[0].StringValue : null;
        }

        /// <summary>
        /// Clase que obtiene el valor del enumerado a través del archivo de configuración
        /// </summary>
        /// <param name="enumerado">Enumerado</param>
        /// <returns>valor del enumerado</returns>
        public static int GetValue(this Enum enumerado)
        {
            MSMElement element = FindElement(enumerado);

            return Convert.ToInt32(element.Value);
        }

        /// <summary>
        /// Clase que obtiene el valor del enumerado a través del archivo de configuración
        /// </summary>
        /// <param name="enumerado">Enumerado</param>
        /// <returns>valor del enumerado</returns>
        public static object GetProperty(this Enum enumerado, string property)
        {
            MSMElement element = FindElement(enumerado);

            return element == null ? null : element.getProperty(property);
        }

        ///// <summary>
        ///// Clase que obtiene el valor del enumerado a través del archivo de configuración
        ///// </summary>
        ///// <param name="enumerado">Enumerado</param>
        ///// <returns>valor del enumerado</returns>
        //public static string GetOrdenMES(this Enum enumerado)
        //{
        //    MSMElement element = FindElement(enumerado);

        //    return element.keySIT;
        //}

        //public static T GetCambio<T>(this Enum enumerado)
        //{
        //    Type type = enumerado.GetType();

        //    MSMElement element = FindElement(enumerado);

        //    return (T)Enum.Parse(typeof(T), element.Key);
        //}

        /// <summary>
        /// Método que obtiene una seccion del web.config a través de un enumerado
        /// </summary>
        /// <param name="enumerado">Enumerado</param>
        /// <returns>Retorna la seccion del archivo de configuracion asociada al enumerdo</returns>
        private static MSMElement FindElement(Enum enumerado)
        {
            return _elementCache.GetOrAdd(enumerado, key =>
            {
                Type type = key.GetType();
                string sectionName = _sectionNameCache.GetOrAdd(type, t =>
                {
                    string name = t.Name;
                    var catgAtt = (CategoryAttribute)t.GetCustomAttribute(typeof(CategoryAttribute), false);
                    return catgAtt != null ? $"{catgAtt.Category}/{name}" : name;
                });

                MSMSection section = _sectionCache.GetOrAdd(sectionName, name =>
                    (MSMSection)ConfigurationManager.GetSection(name)
                );

                if (section == null) return null;

                return section.Add.OfType<MSMElement>().FirstOrDefault(s => s.Key == key.ToString());
            });
        }

    }
}