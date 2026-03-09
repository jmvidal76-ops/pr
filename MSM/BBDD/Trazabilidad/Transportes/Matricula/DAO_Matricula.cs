using Clients.ApiClient.Contracts;
using Common.Models.Matricula;
using Common.Models.MatriculaRemolque;
using Common.Models.MatriculaTractora;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Matricula
{
    public class DAO_Transportista : IDAO_Matricula
    {
        private string UriBase = ConfigurationManager.AppSettings["HostApiTrazabilidad"].ToString();
        private string UriMatriculas ;

        private IApiClient _apiTrazabilidad;

        public DAO_Transportista(IApiClient apiTrazabilidad)
        {
            _apiTrazabilidad = apiTrazabilidad;
            UriMatriculas = UriBase + "api/matricula";
        }


        public async Task<List<MatriculaDto>> Get()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MatriculaDto>>(UriMatriculas);
            return ret;
        }

        public async Task<List<MatriculaDto>> GetFilters(string name,string filter)
        {
            var ret = name != null ? await _apiTrazabilidad.GetPostsAsync<List<MatriculaDto>>(UriMatriculas + "/filters?"+filter+"=" + name) : null;
            return ret;
        }

        public async Task<List<MatriculaTractoraDto>> GetMatriculaTractora()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MatriculaTractoraDto>>(UriMatriculas + "/tractora");
            return ret;
        }

        public async Task<List<MatriculaTractoraDto>> GetMatriculaTractoraFilters(string name, string filter)
        {
            var ret = name != null ? await _apiTrazabilidad.GetPostsAsync<List<MatriculaTractoraDto>>(UriMatriculas + "/tractora/filters?" + filter + "=" + name) : null;
            return ret;
        }

        public async Task<MatriculaTractoraDto> GetMatriculaTractoraByID(string id)
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<MatriculaTractoraDto>(UriMatriculas + "/tractora/filters/" + id);
            return ret;
        }

        public async Task<List<MatriculaRemolqueDto>> GetMatriculaRemolque()
        {
            var ret = await _apiTrazabilidad.GetPostsAsync<List<MatriculaRemolqueDto>>(UriMatriculas + "/remolque" );
            return ret;
        }

        public async Task<List<MatriculaRemolqueDto>> GetMatriculaRemolqueFilters(string name, string filter)
        {
            var ret = name != null ? await _apiTrazabilidad.GetPostsAsync<List<MatriculaRemolqueDto>>(UriMatriculas + "/remolque/filters?" + filter + "=" + name) : null;
            return ret;
        }

        public async Task<int> Delete(int id)
        {
            var ret = await _apiTrazabilidad.DeletePostsAsync<int>(UriMatriculas + "/" + id);
            return ret;
        }

        public async Task<MatriculaDto> Post(MatriculaDto Matricula)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<MatriculaDto>(Matricula, UriMatriculas);
            return ret;
        }

        public async Task<MatriculaTractoraDto> PostMatriculaTractora(MatriculaTractoraDto Matricula)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<MatriculaTractoraDto>(Matricula, UriMatriculas+"/tractora");
            return ret;
        }

        public async Task<MatriculaRemolqueDto> PostMatriculaRemolque(MatriculaRemolqueDto Matricula)
        {
            var ret = await _apiTrazabilidad.PostPostsAsync<MatriculaRemolqueDto>(Matricula, UriMatriculas + "/remolque");
            return ret;
        }
        


        public async Task<MatriculaDto> Put(MatriculaDto Transportista)
        {
            var ret = await _apiTrazabilidad.PutPostsAsync<MatriculaDto>(UriMatriculas, Transportista);
            return ret;
        }
    }
}