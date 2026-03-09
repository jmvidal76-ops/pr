using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.Transportes;
using Common.Models.Matricula;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.Models.MatriculaTractora;
using Common.Models.MatriculaRemolque;

namespace MSM.BBDD.Trazabilidad.Matricula
{
    public interface IDAO_Matricula
    {

        Task<List<MatriculaDto>> Get();

        Task<List<MatriculaDto>> GetFilters(string nombre, string filter);

        Task<List<MatriculaTractoraDto>> GetMatriculaTractora();

        Task<List<MatriculaTractoraDto>> GetMatriculaTractoraFilters(string nombre, string filter);        

        Task<MatriculaTractoraDto> GetMatriculaTractoraByID(string id);

        Task<List<MatriculaRemolqueDto>> GetMatriculaRemolque();

        Task<List<MatriculaRemolqueDto>> GetMatriculaRemolqueFilters(string nombre, string filter);

        Task<int> Delete(int id);

        Task<MatriculaDto> Post(MatriculaDto Matricula);

        Task<MatriculaTractoraDto> PostMatriculaTractora(MatriculaTractoraDto Matricula);

        Task<MatriculaRemolqueDto> PostMatriculaRemolque(MatriculaRemolqueDto Matricula);

        Task<MatriculaDto> Put(MatriculaDto Matricula);

    }
}
