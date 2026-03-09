using Clients.ApiClient.Contracts;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Alt;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Alt
{
    public class DAO_Forms: IDAO_Forms
    {
        private IApiClient _api;
        private string _urlForms;
        private string UriCalidad = ConfigurationManager.AppSettings["HostApiCalidad"].ToString();

        public DAO_Forms()
        {

        }

        public DAO_Forms(IApiClient api)
        {
            _api = api;
            _urlForms = string.Concat(UriCalidad, "api/forms/");
        }

        public async Task<List<DTO_FormsAnalisis>> ObtenerFormulariosAnalisisDatos(DateTime fechaDesde, DateTime fechaHasta, string pdv, string nombreForm)
        {
            var result = await _api.GetPostsAsync<List<DTO_FormsAnalisis>>(string.Concat(_urlForms, "FormulariosAnalisisDatos?fechaDesde=", 
                fechaDesde.ToString(), "&fechaHasta=", fechaHasta.ToString(), "&pdv=", pdv, "&nombreForm=", nombreForm));

            return result;
        }

        public async Task<List<DTO_ClaveValor>> ObtenerNombreFormPorPDV(string pdv)
        {
            var result = await _api.GetPostsAsync<List<DTO_ClaveValor>>(string.Concat(_urlForms, "NombreFormPorPDV?pdv=", pdv));

            return result;
        }
    }
}