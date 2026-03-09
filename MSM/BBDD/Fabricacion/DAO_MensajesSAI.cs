using Clients.ApiClient.Contracts;
using MSM.BBDD.Model;
using MSM.BBDD.Planta;
using MSM.Mappers.DTO.Fabricacion;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Fabricacion
{
    public class DAO_MensajesSAI : IDAO_MensajesSAI
    {
        private string UriFabricacion = ConfigurationManager.AppSettings["HostApiFabricacion"].ToString();
        private readonly IApiClient _api;
        public DAO_MensajesSAI(IApiClient api)
        {
            _api = api;
        }

        public async Task<List<DTO_MensajeSAI>> GetMensajesSAI(DateTime fechaInicio, DateTime fechaFin)
        {
            List<OLTPMensajes> oltpMensajes = new List<OLTPMensajes> ();

            try
            {
                var ret = await _api.GetPostsAsync<List<DTO_MensajeSAI>>(UriFabricacion + $"api/MensajesSAI/ObtenerMensajesSAI?fechaInicio={fechaInicio.ToUniversalTime().ToString("u")}&fechaFin={fechaFin.ToUniversalTime().ToString("u")}");
                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_MensajesSAI.GetMensajesSAI", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                return new List<DTO_MensajeSAI>() { };
            }
        }

        public async Task<List<DTO_Transferencias>> GetTransferencias(DateTime fechaInicio, DateTime fechaFin)
        {
            try
            {
                var ret = await _api.GetPostsAsync<List<DTO_Transferencias>>(UriFabricacion + $"api/MensajesSAI/ObtenerTransferencias?fechaInicio={fechaInicio.ToUniversalTime().ToString("u")}&fechaFin={fechaFin.ToUniversalTime().ToString("u")}");
                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_MensajesSAI.GetTransferencias", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                return new List<DTO_Transferencias>() { };
            }
        }

        public async Task<List<DTO_AjusteNivel>> GetAjustesNivel(DateTime fechaInicio, DateTime fechaFin)
        {
            try
            {
                var ret = await _api.GetPostsAsync<List<DTO_AjusteNivel>>(UriFabricacion + $"api/MensajesSAI/ObtenerAjustesNivel?fechaInicio={fechaInicio.ToUniversalTime().ToString("u")}&fechaFin={fechaFin.ToUniversalTime().ToString("u")}");
                return ret;
            }
            catch (Exception ex)
            {
                DAO_Log.RegistrarLogBook("WEB-BACKEND", 1, 1, ex.Message + " -> " + ex.StackTrace, "DAO_MensajesSAI.GetAjustesNivel", "WEB-FABRICACION", HttpContext.Current.User.Identity.Name);
                return new List<DTO_AjusteNivel>() { };
            }
        }
    }
}