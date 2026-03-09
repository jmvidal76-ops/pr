using BreadMES.Envasado;
using Clients.ApiClient.Contracts;
using MSM.BBDD.Planta;
using MSM.Controllers.Planta;
using MSM.Mappers.DTO.Envasado;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_NoConformidad : IDAO_NoConformidad
    {
        private IApiClient _api;
        private string _urlNoConformidad;
        private string uriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        public DAO_NoConformidad()
        {

        }

        public DAO_NoConformidad(IApiClient api)
        {
            _api = api;
            _urlNoConformidad = string.Concat(uriEnvasado, "api/noConformidad/");
        }

        public async Task<List<DTO_NoConformidad>> ObtenerNoConformidades(DateTime fechaDesde, DateTime fechaHasta)
        {
            var result = await _api.GetPostsAsync<List<DTO_NoConformidad>>(string.Concat(_urlNoConformidad, "NoConformidades?fechaDesde=", fechaDesde.ToUniversalTime().ToString("u"), "&fechaHasta=", fechaHasta.ToUniversalTime().ToString("u")));

            return result;
        }
    }
}