using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Models.Envasado;
using MSM.RealTime;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Security;

namespace MSM.Utilidades
{
    static class Constants
    {
        public enum TipoUbicacionEnum
        {
            Recepcion = 1,
            Almacenamiento = 2,
            AlmacenamientoConsumo = 3,
            Consumo = 4,
            Preparacion = 5,
            Virtual = 6,
            Carga = 7,
            Descarga = 8,
            ProduccionConsumo = 9,
            Produccion = 10,
        }
    }

    public class Utils
    {
        private static string SIN_FECHA = IdiomaController.GetResourceName("FECHA_NO_DISPONIBLE");

        public static Type getTypeByName(string className)
        {
            foreach (Assembly a in AppDomain.CurrentDomain.GetAssemblies())
            {
                Type[] assemblyTypes = a.GetTypes();
                for (int j = 0; j < assemblyTypes.Length; j++)
                {
                    if (assemblyTypes[j].Name == className)
                    {
                        return assemblyTypes[j];
                    }
                }
            }

            return null;
        }

        public static string getValueSection(string categoryName, string sectionName, string key, string prop)
        {
            sectionName = string.Format("{0}/{1}", categoryName, sectionName);
            MSMSection section = (MSMSection)ConfigurationManager.GetSection(sectionName);

            var element = from MSMElement s in section.Add
                          where s.Key == key
                          select s;
            return element.FirstOrDefault().getProperty(prop).ToString();
        }

        public static string getValueSection(string categoryName, string sectionName, string key)
        {
            sectionName = string.Format("{0}/{1}", categoryName, sectionName);
            MSMSection section = (MSMSection)ConfigurationManager.GetSection(sectionName);

            var element = from MSMElement s in section.Add
                          where s.Key == key
                          select s;
            return element.FirstOrDefault().Value.ToString();
        }

        /// <summary>
        /// Método por el cual establecemos la cookie de autenticación
        /// </summary>
        /// <param name="usuario">Usuario logado</param>
        /// <param name="persistentCookie">Estableciendose a false caducara cuando caduque el ticket de autenticación (establecido en el web.config-> authentication forms -> timeout)</param>
        /// <param name="ip">ip del usuario logado</param>
        internal static void SetAuthCookie(string usuario, bool persistentCookie, string ip)
        {
            HttpCookie cookie = FormsAuthentication.GetAuthCookie(usuario, persistentCookie);
            FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(cookie.Value);
            FormsAuthenticationTicket newTicket = new FormsAuthenticationTicket(
                 ticket.Version, ticket.Name, ticket.IssueDate, ticket.Expiration
                , ticket.IsPersistent, ip, ticket.CookiePath
            );

            string encTicket = FormsAuthentication.Encrypt(newTicket);
            cookie.Value = encTicket;
            System.Web.HttpContext.Current.Response.Cookies.Add(cookie);
        }

        /// <summary>
        /// Método que comprueba si la ip de la sesion del usuario es la misma que la de la cookie de autenticación del formulario
        /// </summary>
        /// <param name="sesionUsuario">Datos de la session con la que se logueo el usuario</param>
        /// <returns>True si las ips son iguales, false en caso contrario</returns>
        internal static bool checkIpUserSesion(MSM.Models.Planta.Sesion sesionUsuario)
        {
            bool equal = false;
            HttpCookie authCookie = HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];

            if (authCookie != null)
            {
                string encTicket = authCookie.Value;

                if (!String.IsNullOrEmpty(encTicket))
                {
                    // decrypt the ticket if possible.
                    FormsAuthenticationTicket ticket = FormsAuthentication.Decrypt(encTicket);
                    string ipRequest = ticket.UserData;

                    equal = sesionUsuario == null ? true : sesionUsuario.ip.Equals(ipRequest);
                }
            }

            return equal;
        }

        /// <summary>
        /// Método que convierte un diccionario en un objeto del tipo que tiene de clase genérica que pasamos.
        /// </summary>
        /// <typeparam name="T">Tipo del objecto al que vamos a convertir el diccionario</typeparam>
        /// <param name="dict">Diccionario con los valores a convertir</param>
        /// <returns>Objeto T convertido</returns>
        public static T DictionaryToObject<T>(IDictionary<string, object> dict) where T : new()
        {
            var t = new T();
            //Obtenemos todas las propiedades de la clase genérica T
            PropertyInfo[] properties = t.GetType().GetProperties();

            foreach (PropertyInfo property in properties)
            {
                //Comprobamos si existe la propiedad en la clase T
                if (dict.Any(x => x.Key.Equals(property.Name, StringComparison.InvariantCultureIgnoreCase)))
                {
                    //Buscamos la propiedad en el diccionario
                    KeyValuePair<string, object> item = dict.First(x => x.Key.Equals(property.Name, StringComparison.InvariantCultureIgnoreCase));

                    //Obtenemos el tipo de la propiedad
                    Type propertyType = t.GetType().GetProperty(property.Name).PropertyType;

                    object valorTipado = Convert.ChangeType(item.Value, propertyType);
                    t.GetType().GetProperty(property.Name).SetValue(t, valorTipado, null);
                }
            }
            return t;
        }

        public static string getDateTurno(Turno turnoActual, Orden orden)
        {
            try
            {
                if (turnoActual != null && 
                    turnoActual.linea != null && 
                    orden != null && 
                    orden.estadoActual.Estado != Tipos.EstadosOrden.Iniciando)
                {
                    return PlantaRT.fechasFinEstimadasLinea[turnoActual.linea.id];
                }
            }
            catch(Exception ex)
            {
                //DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "Utils.getDateTurno", "WEB-ENVASADO", "Sistema");
            }

            return SIN_FECHA;
        }

        public static DateTime TrimDateToMilliseconds(DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, dt.Hour, dt.Minute, dt.Second, 0);
        }

        public static bool JObjHasProperty(dynamic d, string propertyName)
        {
            if (d is Newtonsoft.Json.Linq.JObject)
            {
                var jObj = (Newtonsoft.Json.Linq.JObject)d;
                var prop = jObj[propertyName];
                return prop != null;
            }

            return false;
        }

        public static bool JObjHasPropertyNotNull(dynamic d, string propertyName)
        {
            if (d is Newtonsoft.Json.Linq.JObject)
            {
                var jObj = (Newtonsoft.Json.Linq.JObject)d;
                var prop = jObj[propertyName];
                return (prop != null && prop.Type != Newtonsoft.Json.Linq.JTokenType.Null);
            }

            return false;
        }

        public static string getDashedStringPart(string text, int idx)
        {
            const char sep = '-';

            if (!String.IsNullOrWhiteSpace(text))
            {
                text = text.Trim();
                if (text != "---")
                {
                    var parts = text.Split(sep);
                    if (parts.Length > idx)
                    {
                        return parts[idx].Trim();
                    }
                }
            }

            return "---";
        }

        public static double getCantidad<T>(Nullable<T> cantidad) where T : struct
        {
            return (cantidad.HasValue ? Convert.ToDouble(cantidad.Value) : 0.0);
        }

        public static decimal getDecimal<T>(Nullable<T> value) where T : struct
        {
            return (value.HasValue ? Convert.ToDecimal(value.Value) : decimal.Zero);
        }

        public static string getCodigoDescripcion(string codigo, string descripcion)
        {
            return ((codigo == "---") ? codigo : string.Format("{0} - {1}", codigo, descripcion));
        }

        public static string getCodigoDescripcion(string codigo, Func<string> descFn)
        {
            return ((codigo == "---" || descFn == null) ? codigo : string.Format("{0} - {1}", codigo, descFn()));
        }

        public static Linea GetLinea(string idLinea)
        {
            try
            {
                return PlantaRT.planta.lineas.Find(l => l.id == idLinea);
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "LineasController.Get", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ERROR_OBTENIENDO_LINEA") + idLinea);
            }
        }

        public static string CambiarComaDecimal(string valor)
        {
            if (!string.IsNullOrEmpty(valor) && valor != "---")
            {
                valor = valor.Replace(",", System.Globalization.CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator);
            }
            return valor;
        }
        public static string ValidateFormatValue(string value)
        {
            try
            {
                var Dateformats = new[] { "dd/MM/yyyy HH:mm:ss", "MM/dd/yyyy HH:mm:ss", "dd/MM/yyyy H:mm:ss", "MM/dd/yyyy H:mm:ss",
                                          "dd-MM-yyyy HH:mm:ss", "MM-dd-yyyy HH:mm:ss", "dd-MM-yyyy H:mm:ss", "MM-dd-yyyy H:mm:ss",
                                          "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd H:mm:ss",  "yyyy/MM/dd HH:mm:ss", "yyyy/MM/dd H:mm:ss"};
                DateTime parsedDateThas;
                var isdate = DateTime.TryParseExact(value, Dateformats, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDateThas);
                if (isdate)
                    return parsedDateThas.ToString("yyyy-MM-dd HH:mm:ss.fff");
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Error al Validar Formato de KOP, ERROR: " + ex.Message, "Utils.ValidateFormatValue", "WEB-FABRICACION", "Sistema");
                value = null;
            }
            return value;
        }

        public static int BinarioADecimal(long binario)
        {
            int numero = 0;
            const int DIVISOR = 10;

            for (long i = binario, j = 0; i > 0; i /= DIVISOR, j++)
            {
                int digito = (int)i % DIVISOR;
                if (digito != 1 && digito != 0)
                {
                    return -1;
                }
                numero += digito * (int)Math.Pow(2, j);
            }

            return numero;
        }

        public static DataTable MapeoLongListToDataTable(List<long> listaIds)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add(new DataColumn("Item", typeof(long)));

            foreach (long id in listaIds)
            {
                dt.Rows.Add(id);
            }

            return dt;
        }

        public static string CrearLoteMES(string centro, string tipoMaterial, string claseMaterial, string idMaterial, string proceso, string ubicacion, string fecha, string SSCC)
        {
            string _result = string.Format("{0}-{1}-{2}-{3}-{4}-{5}-{6}", new object[]
                    {
                      centro.ToUpper(),
                      tipoMaterial,
                      claseMaterial,
                      idMaterial,
                      proceso,
                      EliminarCaracteresTexto(ubicacion).ToUpper(),
                      fecha
                    });

            if (!string.IsNullOrEmpty(SSCC))
            {
                _result = string.Concat(_result, "-", SSCC);

            }

            return _result;
        }

        public static string EliminarCaracteresTexto(string texto)
        {
            Regex reg = new Regex(@"[^A-Za-z0-9]");
            return reg.Replace(texto, "");
        }

        public static string Encode(string v) => HttpUtility.UrlEncode(v ?? "");

        public static T Deserialize<T>(object raw)
        {
            // La API externa devuelve un objeto (envoltura por Utils.crearApiRespuesta); lo parseamos a string y deserializamos al DTO_RespuestaAPI<T>
            var json = raw.ToString();
            return JsonConvert.DeserializeObject<T>(json);
        }

    }
}