using MSM.BBDD.Planta;
using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Resources;
using System.Web.Http;

namespace MSM.Controllers.Planta
{
    
    public class IdiomaController : ApiController
    {
        private static readonly ResourceManager _resourceManager = Resources.idioma.ResourceManager;
        private static readonly ConcurrentDictionary<string, string> _cache = new ConcurrentDictionary<string, string>();


        [Route("api/idioma/{culture}")]
        [HttpGet]
        public HttpResponseMessage getIdioma(string culture)
        {
            if (string.IsNullOrWhiteSpace(culture))
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "El parámetro 'culture' no puede estar vacío.");

            try
            {
                CultureInfo cultureInfo = CultureInfo.GetCultureInfo(culture);
                CultureInfo.DefaultThreadCurrentCulture = cultureInfo;

                var resourceObject = new JObject();
                var resourceSet = Resources.idioma.ResourceManager.GetResourceSet(cultureInfo, true, true);

                if (resourceSet != null)
                {
                    foreach (DictionaryEntry entry in resourceSet)
                    {
                        if (entry.Key != null && entry.Value != null)
                        {
                            resourceObject.Add(entry.Key.ToString(), entry.Value.ToString());
                        }
                    }
                }

                return Request.CreateResponse(HttpStatusCode.OK, resourceObject, Configuration.Formatters.JsonFormatter);
            }
            catch (CultureNotFoundException ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Cultura no encontrada: {culture}. Error: {ex.Message}",
                    "IdiomaController.GetIdioma", "WEB-PLANTA", "Sistema");

                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Cultura no válida.");
            }
            catch (HttpRequestException ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error de solicitud HTTP: {ex.Message}",
                    "IdiomaController.GetIdioma", "WEB-PLANTA", "Sistema");

                return Request.CreateErrorResponse(HttpStatusCode.ServiceUnavailable, "Error al procesar la solicitud.");
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, $"Error inesperado: {ex.Message} -> {ex.StackTrace}",
                    "IdiomaController.GetIdioma", "WEB-PLANTA", "Sistema");

                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError,
                    IdiomaController.GetResourceName("ERROR_OBTENIENDO_INFORMACIÓN_DEL"));
            }
        }



        public static string GetResourceName(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return string.Empty;

            // Revisa si ya está en caché
            if (_cache.TryGetValue(key, out string cachedValue))
                return cachedValue;

            // Obtiene el valor del archivo de recursos
            string value = _resourceManager.GetString(key, CultureInfo.CurrentCulture) ?? string.Empty;

            // Almacena en caché para futuras consultas
            _cache.TryAdd(key, value);

            return value;
        }

    }
}
