using Common.Models.Almacen.Proveedor;
using Common.Models.Envasado;
using MSM.BBDD.Model;
using MSM.Mappers.DTO;
using MSM.Mappers.DTO.Envasado;
using MSM.Mappers.DTO.Mermas;
using MSM.Models.Envasado;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace MSM.BBDD.Mermas
{
    public interface IDAO_Mermas
    {
        List<MermasContadorGlobal> ObtenerContadoresGlobalesMermas();
        bool CrearContadorGlobalMermas(string nombre);
        List<DTO_ClaveValorInfo> ObtenerMaquinasMermas(string idLinea);
        List<DTO_ClaveValorInfo> ObtenerMaquinasSinUsarMermas(string idLinea);
        List<ProveedorEANDto> ObtenerProveedoresMermas();
        List<DTO_MermasGrid> ObtenerMermas(string linea, DateTime desde, DateTime hasta);
        Task<string> CrearMerma(MermaModel mermaModel);
        List<DTO_MermasRegistro> ObtenerRegistrosMermas(int idMerma);
        bool EditarRegistroMermas(DTO_MermasRegistro registro, out Exception ex);
        bool EliminarRegistroMermas(int id, MESEntities externalContext = null);
        List<DTO_MermasContador> ObtenerContadoresMermas(int idRegistro);
        bool EditarContadorMermas(int id, DTO_MermasContador contador);
        List<DTO_MermasMaquinaContador> ObtenerMaquinasContadoresMermas(string linea);
        bool CrearMaquinasContadorMermas(DTO_MermasMaquinaContador maquinaContador);
        bool EditarMaquinasContadorMermas(DTO_MermasConfiguracionContador contador);
        bool EliminarMaquinasContadorMermas(DTO_MermasMaquinaContador contador);
        List<DTO_MermasConfiguracionContador> ObtenerContadoresClaseMaquina(TipoEnumMaquinasClases clase);
        List<DTO_MermasConfiguracionContador> ObtenerConfiguracionContadoresMermas();        
        bool CrearConfiguracionContadorMermas(DTO_MermasConfiguracionContador contador);
        void EditarConfiguracionContadorMermas(List<DTO_MermasConfiguracionContador> contadores, out Exception outEx);
        bool EliminarConfiguracionContadorMermas(string maquinaClase);
        List<DTO_MermasRegistro> ObtenerMermasTerminal(long idTurno, string claseMaquina);
        bool EditarObservacionesRegistroMermas(DTO_MermasRegistro registro);
        Task<DTO_RespuestaAPI<DTO_MermasExcel>> ObtenerMermasExcel(string idLinea, DateTime fechaInicio, DateTime fechaFin);

        //Calculo Mermas
        Task<DTO_RespuestaAPI<List<DTO_DatosMermas>>> ObtenerDatosCalculoMermas(DateTime fechaDesde, DateTime fechaHasta, string zona, string tipo);
        Task<DTO_RespuestaAPI<bool>> ActualizarDatosCalculoMermas(string zona, dynamic dto);
        Task<DTO_RespuestaAPI<bool>> BorradoLogicoDatosCalculoMermas(string zona, int id, string usuario);
        Task<DTO_RespuestaAPI<List<DTO_ConfExtrDatosMermas>>> ObtenerConfiguracionExtraccionDatosMermas(int zona, string tipo);
        Task<DTO_RespuestaAPI<bool>> CrearConfiguracionExtraccionDatosMermas(DTO_ConfExtrDatosMermas dto);
        Task<DTO_RespuestaAPI<bool>> ActualizarConfiguracionExtraccionDatosMermas(dynamic dto);
        Task<DTO_RespuestaAPI<bool>> EliminarConfiguracionExtraccionDatosMermas(int id);
        Task<DTO_RespuestaAPI<List<DTO_FormulasCalculo>>> ObtenerFormulasCalculo(int id);
        Task<DTO_RespuestaAPI<List<DTO_ZonasCalculoMermas>>> ObtenerZonasCalculoExtracto(int id);
        Task<DTO_RespuestaAPI<List<DTO_ZonasCalculoMermas>>> ObtenerZonasCalculoExistencias(int id);
        Task<DTO_RespuestaAPI<List<DTO_MermasExistencias>>> ObtenerExistenciasCalculoMermas(DateTime fechaDesde, DateTime fechaHasta, int zona);
        Task<DTO_RespuestaAPI<List<DTO_ConfExistenciasMermas>>> ObtenerConfiguracionCalculoExistencias(int zona);
        Task<DTO_RespuestaAPI<bool>> CrearConfiguracionCalculoExistencias(DTO_ConfExistenciasMermas dto);
        Task<DTO_RespuestaAPI<bool>> ActualizarConfiguracionCalculoExistencias(dynamic dto);
        Task<DTO_RespuestaAPI<bool>> EliminarConfiguracionCalculoExistencias(int id);
        Task<DTO_RespuestaAPI<List<DTO_MermasConfigVariable>>> ObtenerParametrosGenerales();
        Task<DTO_RespuestaAPI<bool>> CrearParametroGeneral(DTO_MermasConfigVariable dto);
        Task<DTO_RespuestaAPI<bool>> ActualizarParametroGeneral(dynamic dto);
        Task<DTO_RespuestaAPI<bool>> EliminarParametroGeneral(int id);
    }
}