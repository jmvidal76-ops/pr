using Clients.ApiClient.Contracts;
using Common.Models.Lote;
using Common.Models.Trazabilidad.Estado;
using Common.Models.Trazabilidad.Fabricacion;
using MSM.BBDD.Trazabilidad.Fabricacion;
using MSM.Mappers.DTO.Fabricacion.Api;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Fabricaicon
{
    public class DAO_PropiedadesLotes : IDAO_PropiedadesLotes
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriPropiedadesLotes;
        private string UriAccionesPropiedadesLotes;

        private IApiClient _apiTrazabilidad;

        public DAO_PropiedadesLotes(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriPropiedadesLotes = UriBase + "api/lote/propiedades";
            UriAccionesPropiedadesLotes = UriBase + "api/lote/accionpropiedad";
        }

        public async Task<PropiedadLoteDto> ActualizarPropiedadesLotes(PropiedadLoteDto propiedadLote)
        {
            try
            {
                var ret = await _apiTrazabilidad.PutPostsAsync<PropiedadLoteDto>(UriPropiedadesLotes, propiedadLote);
                return ret;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<PropiedadLoteDto> AgregarPropiedadesLotes(PropiedadLoteDto propiedadLote)
        {
            try
            {
                var ret = await _apiTrazabilidad.PostPostsAsync<PropiedadLoteDto>(propiedadLote,UriPropiedadesLotes);
                return ret;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<PropiedadLoteDto> EliminarPropiedadesLotes(int id)
        {
            try
            {
                var ret = await _apiTrazabilidad.DeletePostsAsync<PropiedadLoteDto>(UriPropiedadesLotes+"/"+id);
                return ret;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<List<PropiedadLoteDto>> ObtenerPropiedadesLotes()
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<List<PropiedadLoteDto>>(UriPropiedadesLotes);
                return ret;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<List<AccionPropiedadLoteDto>> ObtenerAccionesPropiedadesLotes()
        {
            try
            {
                var ret = await _apiTrazabilidad.GetPostsAsync<List<AccionPropiedadLoteDto>>(UriAccionesPropiedadesLotes);
                return ret;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}