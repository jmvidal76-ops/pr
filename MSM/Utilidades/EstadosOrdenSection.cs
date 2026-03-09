using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace MSM.Utilidades
{
    public class MSMSection : ConfigurationSection
    {
        [ConfigurationProperty("", IsDefaultCollection = true, IsKey = false, IsRequired = true)]
        [ConfigurationCollection(typeof(MSMValueCollection), AddItemName = "add")]
        public MSMValueCollection Add
        {
            get
            { return (MSMValueCollection)this[""]; }
        }
    }

    public class MSMValueCollection : ConfigurationElementCollection
    {
        protected override ConfigurationElement CreateNewElement()
        {
            return new MSMElement();
        }

        protected override object GetElementKey(ConfigurationElement element)
        {
            return ((MSMElement)element).Key;
        }

        protected override string ElementName
        {
            get
            {
                return "add";
            }
        }

        protected override bool IsElementName(string elementName)
        {
            return !String.IsNullOrEmpty(elementName) && elementName == "add";
        }

        public MSMElement this[int index]
        {
            get { return (MSMElement)BaseGet(index); }
        }

        new public MSMElement this[string key]
        {
            get { return (MSMElement)BaseGet(key); }
        }

        public bool ContainsKey(string key)
        {
            var keys = new List<object>(BaseGetAllKeys());
            return keys.Contains(key);
        }
    }

    public class MSMElement : ConfigurationElement
    {
        /// <summary>
        /// Retorna la clave del elemento
        /// </summary>
        [System.Configuration.ConfigurationProperty("key", IsRequired = true)]
        public string Key
        {
            get
            {
                return this["key"] as string;
            }
        }
        /// <summary>
        /// Retorna la clave del elemento
        /// </summary>
        [System.Configuration.ConfigurationProperty("keyReglaSIT", IsRequired = false)]
        public string keyReglaSIT
        {
            get
            {
                return this["keyReglaSIT"] as string;
            }
        }
        /// <summary>
        /// Retorna el valor del elemento
        /// </summary>
        [System.Configuration.ConfigurationProperty("value", IsRequired = true)]
        public string Value
        {
            get
            {
                return this["value"] as string;
            }
        }
        /// <summary>
        /// Retorna el nombre MES del cambio posible del elemento
        /// </summary>
        [System.Configuration.ConfigurationProperty("cambios", IsRequired = false)]
        public string Cambios
        {
            get
            {
                return this["cambios"] as string;
            }
        }

        /// <summary>
        /// Retorna el nombre MES del cambio posible del elemento
        /// </summary>
        [System.Configuration.ConfigurationProperty("color", IsRequired = false)]
        public string Color
        {
            get
            {
                return this["color"] as string;
            }
        }

        /// <summary>
        /// Retorna si la orden es activa
        /// </summary>
        [System.Configuration.ConfigurationProperty("activa", IsRequired = false)]
        public bool Activa
        {
            get
            {
                return Convert.ToBoolean((string)this["activa"]);
            }
        }

        /// <summary>
        /// Retorna si la orden es pendiente
        /// </summary>
        [System.Configuration.ConfigurationProperty("pendiente", IsRequired = false)]
        public bool Pendiente
        {
            get
            {
                return Convert.ToBoolean((string)this["pendiente"]);
            }
        }

        /// <summary>
        /// Obtiene el valor de la propiedad pasada como parámetro
        /// </summary>
        /// <param name="prop">Nombre de la propiedad</param>
        /// <returns>valor de la propiedad</returns>
        public object getProperty(string prop)
        {
            return this[prop];
        }
    }
}