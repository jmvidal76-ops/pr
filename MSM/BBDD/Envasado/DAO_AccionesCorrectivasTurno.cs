using Clients.ApiClient.Contracts;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Envasado
{
    public class DAO_AccionesCorrectivasTurno: IDAO_AccionesCorrectivasTurno
    {
        private IApiClient _api;
        private string _urlAccionesCorrectivas;
        private string UriEnvasado = ConfigurationManager.AppSettings["HostApiEnvasado"].ToString();

        public DAO_AccionesCorrectivasTurno()
        {

        }

        public DAO_AccionesCorrectivasTurno(IApiClient api)
        {
            _api = api;
            _urlAccionesCorrectivas = string.Concat(UriEnvasado, "api/AccionCorrectivaTurno/");

        }

        public async Task<List<DTO_AccionesCorrectivasTurno>> ObtenerAccionCorrectivaTurno(int idTurno)
        {
            var result = await _api.GetPostsAsync<List<DTO_AccionesCorrectivasTurno>>(string.Concat(_urlAccionesCorrectivas, "?idTurno=", idTurno));

            return result;
        }

        public async Task<int> CrearAccionesCorrectivasTurnoAuto(int idTurno)
        {
            int resultado = await _api.GetPostsAsync<int>(string.Concat(_urlAccionesCorrectivas, "CrearAutomaticas", "?idTurno=", idTurno, "&creadoPor=", HttpContext.Current.User.Identity.Name));

            return resultado;
        }

        public async Task<List<DTO_AccionesCorrectivasTurno>> ObtenerAccionCorrectivaFiltro(DateTime inicio, DateTime fin, string idLinea)
        {
            var result = await _api.GetPostsAsync<List<DTO_AccionesCorrectivasTurno>>(string.Concat(_urlAccionesCorrectivas, "Filtro?idLinea=", idLinea, "&fechaInicio=", inicio.ToString(), "&fechaFin=", fin.ToString()));

            return result;
        }

        public async Task<bool> BorrarAccionCorrectivaTurno(int idTurno)
        {
            var result = await _api.DeletePostsAsync<bool>(string.Concat(_urlAccionesCorrectivas, "BorrarPorTurno?idTurno=", idTurno));

            return result;
        }

        public async Task<bool> BorrarAccionCorrectiva(int idAccionCorrectiva)
        {
            var result = await _api.DeletePostsAsync<bool>(string.Concat(_urlAccionesCorrectivas, "?idAccionCorrectiva=", idAccionCorrectiva));

            return result;
        }

        public async Task<bool> EditarAccionCorrectivaTurno(DTO_AccionesCorrectivasTurno datos)
        {
            var result = await _api.PutPostsAsync<dynamic>(string.Concat(_urlAccionesCorrectivas, "?actualizadoPor=", HttpContext.Current.User.Identity.Name), datos);

            return result;
        }

        public async Task<bool> PatchAccionCorrectivaTurno(List<MPatchOperation> datos)
        {           
            var result = await _api.PatchPostsAsync<dynamic>(datos, 0, string.Concat(_urlAccionesCorrectivas, "?actualizadoPor=", HttpContext.Current.User.Identity.Name));

            return result;
        }

        public async Task<int> CrearAccionCorrectivaTurno(DTO_AccionesCorrectivasTurno accion)
        {
            accion.CreadoPor = HttpContext.Current.User.Identity.Name;
            var resultado = await _api.PostPostsAsync<dynamic>(accion, _urlAccionesCorrectivas);

            return (int)resultado;
        }

        public async Task<bool> EditarAccionCorrectivaTurnoPorParo(int idParo)
        {
            var result = await _api.GetPostsAsync<bool>(string.Concat(_urlAccionesCorrectivas, "EditarPorParo/", idParo, "?actualizadoPor=", HttpContext.Current.User.Identity.Name));

            return result;
        }

        public async Task<List<DTO_AccionCorrectivaEmail>> ObtenerAccionCorrectivaEmails()
        {
            var result = await _api.GetPostsAsync<List<DTO_AccionCorrectivaEmail>>(string.Concat(_urlAccionesCorrectivas, "Emails"));

            return result;
        }
    }
}