using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web.Http;

namespace MSM.Controllers.Envasado
{
    public class FicherosPlanificacionController: ApiController
    {

        // DAJ - 25/11/2024: Se deja de usar en la ventana de Programa de Envasado. Se descargan los informes directamente, desde el PlanificadorController
        [Route("api/obtenerUltimoFicheroPlanificacion/{tipo}/")]
        [HttpGet]
        public List<string> obtenerUltimoFicheroPlanificacion(string tipo)
        {
            try
            {
                var datosFichero = new List<string>();

                var ruta = new DirectoryInfo(DAO_Administracion.ObtenerEnlaceExterno(5));
                var fichero = ruta.GetFiles().Where(x => x.Name.Contains(tipo)).OrderByDescending(f => f.LastWriteTime).First();
                var rutaCompleta = Path.Combine(ruta.FullName, fichero.Name);
                var bytes = File.ReadAllBytes(rutaCompleta);
                var base64 = Convert.ToBase64String(bytes);

                datosFichero.Add(base64);
                datosFichero.Add(fichero.Name);

                return datosFichero;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "FicherosPlanificacionController.obtenerUltimoFicheroPlanificacion", "WEB-ENVASADO", "Sistema");
                throw new Exception(IdiomaController.GetResourceName("ALT_ERROR_DOWNLOADING_FILE"));
            }
        }
    }
}