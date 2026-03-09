using Clients.ApiClient.Contracts;
using Common.Models.Operation;
using MSM.BBDD.Envasado;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Trazabilidad.Producciones
{
    public class DAO_Producciones : IDAO_Producciones
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriProduccion;

        private string UriProduccionOfssets;

        private IApiClient _apiTrazabilidad;

        public DAO_Producciones(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;

            UriProduccionOfssets = UriBase + "api/ProduccionOffsets";

            //_apiTrazabilidad.UrlBaseTrazabilidad = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        }
        public async Task<List<dynamic>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/Produccion");
            return ret;
        }
        public async Task<List<dynamic>> GetProduccionesParticion(string particion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/ProduccionInfo/" + particion);
            return ret;
        }

        public async Task<List<dynamic>> GetParticiones(string linea, string producto)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/Produccion");
            return ret;
        }
        public async Task<List<dynamic>> GetByDates(string fechaInicio, string fechaFin)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/ProduccionFechas?startime=" + fechaInicio + "&endtime=" + fechaFin);
            return ret;
        }

        public async Task<List<dynamic>> GetByOrder(string idOrden)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/ProduccionInfo/" + idOrden + "/");
            return ret;
        }

        public async Task<dynamic> DeleteConsum(ConsumDto consumo)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/ConsumDelete/", consumo);
            return ret;
        }

        public async Task<List<dynamic>> GetBomMaterialByProduct(string idProducto)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/material/bom/" + idProducto);
            return ret;
        }

        public async Task<List<dynamic>> GetUbicacionesByIdLinea(string numLinea)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/ubicacion/UbicacionesLinea/" + numLinea);
            return ret;
        }

        public async Task<List<dynamic>> GetUbicacionLoteByRefMaterial(string refMaterial)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/ubicacion/Lote/" + refMaterial);
            return ret;
        }

        public async Task<dynamic> AddConsum(ConsumDto consumo)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/Consum", consumo);
            return ret;
        }

        public async Task<dynamic> UpdateConsum(ConsumDto consumo)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/ConsumUPD", consumo);
            return ret;
        }

        public async Task<List<dynamic>> GetPartitionsByIDAndLinea(string numLinea, string referencia)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/PartitionByIDLinea/" + numLinea + "/" + referencia);
            return ret;
        }

        public async Task<List<dynamic>> GetProductionsOffsetById(string idProduccion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/ProduccionOffset/" + idProduccion);
            return ret;
        }

        public async Task<List<dynamic>> GetProduccionCosumByIdAndLocation(string idProduccion, string ubicacion)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<dynamic>>(UriBase + "api/Consumo/Produccion/" + idProduccion + "/" + ubicacion);
            return ret;
        }

        public async Task<dynamic> UpdateOffset(ProductionOffSetsDto production)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/UpdProduccionOffset", production);
            return ret;
        }

        public async Task<dynamic> UpdateQuarantine(UpdProduccionDto upd)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/UpdProduccionQuarantine", upd);
            return ret;
        }

        public async Task<dynamic> UpdProduccionBlocking(UpdProduccionDto upd)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/UpdProduccionBlocking", upd);
            return ret;
        }

        public async Task<bool> UpdProductionPartition(ProduccionesDto produccionesDto)
        {
            UpdPartitionDTO upd = new UpdPartitionDTO();
            upd.IdProduccion = produccionesDto.Producciones.Select(x => x.IdProduccion).ToList();
            upd.ParticionWO = produccionesDto.ParticionWO;
            upd.ActualizadoPor = HttpContext.Current.User.Identity.Name;

            bool ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/UpdProductionPartition", upd);

            if (!ret)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Asignar WO. Error al hacer update en la tabla tProduccion", "Api Trazabilidad",
                    "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            foreach (var prod in produccionesDto.Producciones)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Producciones.UpdProductionPartition", "Se ha asignado la WO: " + upd.ParticionWO +
                    ", con Fecha de producción: " + prod.EtiquetaProducedAt.ToString("dd/MM/yyyy HH:mm:ss") + ", Fecha de creación: " +
                    prod.EtiquetaCreatedAt.ToString("dd/MM/yyyy HH:mm:ss") + ", SSCC: " + prod.SSCC + ", Linea: " + prod.Linea + ", Producto: " +
                    prod.Referencia, HttpContext.Current.User.Identity.Name);
            }

            return ret;
        }

        public async Task<dynamic> UpdProducctionLabel(UpdProduccionDto upd)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/UpdProduccionLabel", upd);
            return ret;
        }

        public async Task<bool> AnularHabilitarEtiquetas(ProduccionesDto produccionesDto)
        {
            bool accionOK;
            AnularHabilitarEtiquetasDto dto = new AnularHabilitarEtiquetasDto();
            dto.IdsProduccion = produccionesDto.Producciones.Select(x => x.IdProduccion).ToList();
            dto.EsAnular = produccionesDto.EsAnular;
            dto.ActualizadoPor = HttpContext.Current.User.Identity.Name;

            accionOK = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/ProdAnularHabilitarEtiquetas", dto);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Anular-habilitar. Error al hacer update en la tabla tProduccion", "Api Trazabilidad",
                    "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Orden.ActualizarDatosWOCerradas(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Anular-habilitar. Error al actualizar las WO cerradas", "DAO_Orden.ActualizarDatosWOCerradas",
                    "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Produccion.ActualizarContadorConsolidado(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Anular-habilitar. Error al actualizar el contador de consolidado de las etiquetas de palets de más de 1 día",
                    "DAO_Produccion.ActualizarContadorConsolidado", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Picos.ActualizarPicosEnvasado(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Anular-habilitar. Actualizar Picos de Envasado al Anular o Habilitar etiquetas.",
                    "DAO_Picos.ActualizarPicosEnvasado", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            foreach (var prod in produccionesDto.Producciones)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Producciones.AnularHabilitarEtiquetas", "Se ha " +
                    (produccionesDto.EsAnular ? "anulado" : "habilitado") + " la etiqueta con Fecha de producción: " +
                    prod.EtiquetaProducedAt.ToString("dd/MM/yyyy HH:mm:ss") + ", Fecha de creación: " + prod.EtiquetaCreatedAt.ToString("dd/MM/yyyy HH:mm:ss") +
                    ", SSCC: " + prod.SSCC + ", Linea: " + prod.Linea + ", Producto: " + prod.Referencia + ", WO: " + prod.ParticionWO, HttpContext.Current.User.Identity.Name);
            }

            return accionOK;
        }

        public async Task<bool> ModificarFechaProduccion(ProduccionesDto produccionesDto)
        {
            bool accionOK;
            FechaProduccionDto dto = new FechaProduccionDto();
            dto.IdsProduccion = produccionesDto.Producciones.Select(x => x.IdProduccion).ToList();
            dto.FechaProduccion = produccionesDto.FechaProduccion;
            dto.ActualizadoPor = HttpContext.Current.User.Identity.Name;

            accionOK = await _apiTrazabilidad.PutPostsAsync<dynamic>(UriBase + "api/ProdModificarFechaProduccion", dto);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Modificar fecha. Error al hacer update en la tabla tProduccion", "Api Trazabilidad", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Orden.ActualizarDatosWOCerradas(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Modificar fecha. Error al actualizar las WO cerradas", "DAO_Orden.ActualizarDatosWOCerradas", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Produccion.ActualizarInfoMEStProduccion(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Modificar fecha. Error al actualizar la info de MES a tProduccion de las etiquetas de palets de más de 1 día",
                    "DAO_Produccion.ActualizarInfoMEStProduccion", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Produccion.ActualizarContadorConsolidado(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Modificar fecha. Error al actualizar el contador de consolidado de las etiquetas de palets de más de 1 día",
                    "DAO_Produccion.ActualizarContadorConsolidado", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            accionOK = DAO_Picos.ActualizarPicosEnvasado(produccionesDto.Producciones);

            if (!accionOK)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, "Modificar fecha. Actualizar Picos de Envasado al Anular o Habilitar etiquetas.",
                    "DAO_Picos.ActualizarPicosEnvasado", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
                return false;
            }

            foreach (var prod in produccionesDto.Producciones)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Producciones.ModificarFechaProduccion", "Se ha modificado el registro con Fecha de producción: " +
                    dto.FechaProduccion.ToString("dd/MM/yyyy HH:mm:ss") + ", Fecha de creación: " + prod.EtiquetaCreatedAt.ToString("dd/MM/yyyy HH:mm:ss") +
                    ", SSCC: " + prod.SSCC + ", Linea: " + prod.Linea + ", Producto: " + prod.Referencia + ", WO: " + prod.ParticionWO, HttpContext.Current.User.Identity.Name);
            }

            return accionOK;
        }

        public async Task<bool> GuardarSSCCMuestraTomada(PaletsProductoAcabadoMuestrasDto dto)
        {
            bool ret = await _apiTrazabilidad.PostPostsAsync<dynamic>(dto, UriBase + "api/ProdGuardarSSCCMuestraTomada");

            if (ret)
            {
                DAO_Log.RegistrarLogUsuarios(DateTime.Now, "DAO_Producciones.GuardarSSCCMuestraTomada", 
                    IdiomaController.GetResourceName("GUARDADO_CORRECTAMENTE") + " SSCC: " + dto.SSCC, HttpContext.Current.User.Identity.Name);
            }
            else 
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, IdiomaController.GetResourceName("ERROR_GUARDAR") + " el SSCC: " + dto.SSCC, 
                    "DAO_Producciones.GuardarSSCCMuestraTomada", "WEB-ENVASADO", HttpContext.Current.User.Identity.Name);
            }

            return ret;
        }
    }
}


