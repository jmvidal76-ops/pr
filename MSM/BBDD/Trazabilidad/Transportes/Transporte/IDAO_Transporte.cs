using Clients.ApiClient.Contracts;
using Common.Models;
using Common.Models.LoteUbicacion;
using Common.Models.Matricula;
using Common.Models.Operation;
using Common.Models.Transportes;
using Common.Models.Transportista;
using MSM.Mappers.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MSM.BBDD.Trazabilidad.Transporte
{
    public interface IDAO_Transporte
    {
        //Task<List<MatriculaDto>> ObtenerMatriculas();

        Task<List<TransporteDto>> GetTransports();

        Task<List<TransporteDto>> GetHistoricoTransportes(DateTime fechaInicio, DateTime fechaFin);

        Task<TransporteDto> GetUltimoTransporte(int idMatricula, int tipoOperacion);

        //Task<List<TransporteDto>> GetTransportesPendientes();

        Task<int> DeleteTransporte(int id);

        Task<bool> FinalizarTransporte(TransporteDto transporte);

        Task<bool> FinalizarDescargaByTransporte(TransporteDto transporte);

        Task<bool> AjustarLote(OperationDto transporte);
        //Task<List<TransportistaDto>> ObtenerTransportistas(string nombre);

        Task<TransporteDto> Post(TransporteDto transportista);

        Task<TransporteDto> Put(TransporteDto transportista);

        Task<bool> PutFechaOrden(TransporteDto transportesta);

        Task<DTO_RespuestaAPI<bool>> PutNombreArchivoAlbaranEntrada(DTO_ClaveValor transporte);

        Task<List<LoteUbicacionDto>> GetLotesByIdUbicacion(int idUbicacion);
    }
}
