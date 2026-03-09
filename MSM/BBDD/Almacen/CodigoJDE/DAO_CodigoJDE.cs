using Clients.ApiClient.Contracts;
using Common.Models.Almacen.DTO_MaestroEAN;
using MSM.DTO;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;
using MSM.BBDD.Planta;
using System;
using System.Web;
using System.Linq;

namespace MSM.BBDD.Almacen.CodigoJDE
{
    public class DAO_CodigoJDE : IDAO_CodigoJDE
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriCodigoJDE;

        private IApiClient _apiTrazabilidad;

        public DAO_CodigoJDE(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriCodigoJDE = UriBase + "api/codigoJDE";
        }


        public async Task<List<DTO_MaestroEAN>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<DTO_MaestroEAN>>(UriCodigoJDE);
            return ret;
        }

        public async Task<DTO_MaestroEAN> Post(DTO_MaestroEAN dto)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<DTO_MaestroEAN>(dto,UriCodigoJDE);

            string msg = "Se ha creado EAN/JDE: " + dto.EAN ;
            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CodigoJDEController.CreateMateriasPrimas", msg, HttpContext.Current.User.Identity.Name);

            return ret;
        }

        public async Task<DTO_MaestroEAN> Put(DTO_MaestroEAN dto)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<DTO_MaestroEAN>(UriCodigoJDE+"/"+dto.IdMaestroEAN,dto);

            string msg = "Se ha modificado EAN/JDE: " + dto.EAN;
            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CodigoJDEController.PutMateriasPrimas", msg, HttpContext.Current.User.Identity.Name);

            return ret;
        }

        public async Task<DTO_MaestroEAN> Delete(DTO_MaestroEAN dto)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<DTO_MaestroEAN>(UriCodigoJDE + "/" + dto.IdMaestroEAN);

            string msg = "Se ha eliminado EAN/JDE: " + dto.EAN;
            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CodigoJDEController.DeleteMateriasPrimas", msg, HttpContext.Current.User.Identity.Name);

            return ret;
        }

        public async Task<dynamic> CreateMultiple(IEnumerable<DTO_MaestroEAN> dto)
        {
            var ret = await _apiTrazabilidad.PostObjectAsJsonAsync(dto, UriCodigoJDE + "_multiple", true);

            string msg = "Se ha importado un Excel con " + dto.Count() + " registros";
            DAO_Log.RegistrarLogUsuarios(DateTime.Now, "CodigoJDEController.CreateMultiplesMateriasPrimas", msg, HttpContext.Current.User.Identity.Name);

            return ret;
        }

    }
}